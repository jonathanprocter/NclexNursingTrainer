#!/usr/bin/env node

const fs = require("fs").promises;
const path = require("path");
const { exec } = require("child_process");
const { promisify } = require("util");
const execAsync = promisify(exec);
const Anthropic = require("@anthropic-ai/sdk");

// Initialize Anthropic client
const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

// Configuration constants
const CONFIG = {
    expectedDirs: ["client", "server", "shared", "public"],
    routePatterns: {
        frontend: /\.(jsx?|tsx?)$/,
        backend: /\.(js|ts)$/,
    },
    componentPatterns: {
        react: /\.(jsx?|tsx?)$/,
        style: /\.(css|scss|sass)$/,
    },
};

// Auto-fix functions
async function createMissingDirectories(basePath, missingDirs) {
    console.log("📁 Creating missing directories...");
    for (const dir of missingDirs) {
        const dirPath = path.join(basePath, dir);
        await fs.mkdir(dirPath, { recursive: true });
        console.log(`✅ Created directory: ${dir}`);

        // Add necessary base files
        if (dir === "shared") {
            await fs.writeFile(
                path.join(dirPath, "types.ts"),
                "export {}; // Shared type definitions",
            );
        }
    }
}

async function fixCircularDependencies(components) {
    console.log("🔄 Fixing circular dependencies...");
    const graph = buildDependencyGraph(components);
    const cycles = findCycles(graph);

    for (const cycle of cycles) {
        const [file1, file2] = cycle;
        await breakCircularDependency(file1, file2);
    }
}

async function breakCircularDependency(file1, file2) {
    // Create an interface file in shared directory
    const interfaceName = `I${path.basename(file1, path.extname(file1))}`;
    const interfaceContent = await generateInterface(file1);
    const interfacePath = path.join(
        "shared",
        "interfaces",
        `${interfaceName}.ts`,
    );

    await fs.mkdir(path.join("shared", "interfaces"), { recursive: true });
    await fs.writeFile(interfacePath, interfaceContent);

    // Update imports in both files
    await updateFileImports(file1, file2, interfacePath);
    await updateFileImports(file2, file1, interfacePath);
}

async function fixMisplacedComponents(structure) {
    console.log("🔀 Fixing misplaced components...");
    const moves = [];

    for (const [dir, contents] of Object.entries(structure)) {
        const components = findMisplacedComponents(contents, dir);
        for (const component of components) {
            const newPath = determineCorrectPath(component);
            moves.push({ from: component.path, to: newPath });
        }
    }

    // Execute moves
    for (const move of moves) {
        await fs.mkdir(path.dirname(move.to), { recursive: true });
        await fs.rename(move.from, move.to);
        console.log(
            `✅ Moved: ${path.basename(move.from)} -> ${path.basename(move.to)}`,
        );
    }
}

async function fixImportExportIssues(components) {
    console.log("🔗 Fixing import/export issues...");

    for (const component of components) {
        const content = await fs.readFile(component.path, "utf-8");
        let updatedContent = content;

        // Fix missing exports
        if (!hasDefaultExport(content) && shouldHaveDefaultExport(component)) {
            updatedContent = addDefaultExport(updatedContent, component);
        }

        // Fix import paths
        updatedContent = fixRelativeImports(updatedContent, component.path);

        if (updatedContent !== content) {
            await fs.writeFile(component.path, updatedContent);
            console.log(
                `✅ Fixed imports/exports in: ${path.basename(component.path)}`,
            );
        }
    }
}

async function fixEnvironmentVariables(analysis) {
    console.log("🔧 Fixing environment variables...");

    // Generate .env files
    const envConfig = {
        development: generateEnvConfig("development", analysis),
        production: generateEnvConfig("production", analysis),
    };

    await fs.writeFile(
        ".env.development",
        formatEnvFile(envConfig.development),
    );
    await fs.writeFile(".env.production", formatEnvFile(envConfig.production));

    // Update environment variable references in code
    await updateEnvReferences(analysis.components);
}

// Helper functions
function buildDependencyGraph(components) {
    const graph = new Map();

    for (const component of components) {
        graph.set(component.path, new Set());
        for (const imp of component.imports) {
            const resolvedPath = resolveImportPath(imp, component.path);
            if (resolvedPath) {
                graph.get(component.path).add(resolvedPath);
            }
        }
    }

    return graph;
}

function findCycles(graph) {
    const cycles = [];
    const visited = new Set();
    const recursionStack = new Set();

    function dfs(node, parent) {
        visited.add(node);
        recursionStack.add(node);

        for (const neighbor of graph.get(node)) {
            if (!visited.has(neighbor)) {
                if (dfs(neighbor, node)) {
                    cycles.push([node, neighbor]);
                }
            } else if (recursionStack.has(neighbor) && neighbor !== parent) {
                cycles.push([node, neighbor]);
            }
        }

        recursionStack.delete(node);
        return false;
    }

    for (const node of graph.keys()) {
        if (!visited.has(node)) {
            dfs(node, null);
        }
    }

    return cycles;
}

async function generateInterface(filePath) {
    const content = await fs.readFile(filePath, "utf-8");

    // Use AI to generate appropriate interface
    const response = await anthropic.messages.create({
        model: "claude-3-sonnet-20240229",
        max_tokens: 1000,
        messages: [
            {
                role: "user",
                content: `Generate a TypeScript interface for this component:
            ${content}
            Focus on public methods and properties only.`,
            },
        ],
    });

    return response.content;
}

function determineCorrectPath(component) {
    const filename = path.basename(component.path);
    const ext = path.extname(filename);

    if (component.type === "react") {
        return path.join("client", "src", "components", filename);
    } else if (component.type === "api") {
        return path.join("server", "routes", filename);
    }

    return component.path;
}

function generateEnvConfig(env, analysis) {
    const config = {
        NODE_ENV: env,
        PORT: env === "development" ? 3000 : 8080,
    };

    // Add required variables based on analysis
    if (analysis.components.some((c) => c.type === "api")) {
        config.API_URL =
            env === "development"
                ? "http://localhost:3000"
                : "${REPL_SLUG}.${REPL_OWNER}.repl.co";
    }

    return config;
}

async function updateEnvReferences(components) {
    for (const component of components) {
        const content = await fs.readFile(component.path, "utf-8");
        let updatedContent = content;

        // Replace hardcoded values with environment variables
        updatedContent = updatedContent.replace(
            /(["'])http:\/\/localhost:\d+(['"])/g,
            "process.env.API_URL",
        );

        if (updatedContent !== content) {
            await fs.writeFile(component.path, updatedContent);
            console.log(
                `✅ Updated env references in: ${path.basename(component.path)}`,
            );
        }
    }
}

// Main execution
async function main() {
    try {
        console.log("🚀 Starting application structure analysis and repair...");

        // Get project root
        const projectRoot = process.cwd();

        // Backup project
        const backupDir = path.join(projectRoot, ".backup-" + Date.now());
        await execAsync(`cp -r ${projectRoot} ${backupDir}`);
        console.log("📦 Project backup created");

        // Validate and fix structure
        const structureAnalysis = await validateProjectStructure(projectRoot);
        if (structureAnalysis.issues.length) {
            await createMissingDirectories(
                projectRoot,
                structureAnalysis.issues
                    .filter((i) => i.startsWith("Missing directory"))
                    .map((i) => i.split(": ")[1]),
            );
        }

        // Analyze and fix components
        const componentAnalysis = await analyzeComponentLoading(
            structureAnalysis.structure,
        );
        if (componentAnalysis.issues.length) {
            await fixCircularDependencies(componentAnalysis.components);
            await fixMisplacedComponents(structureAnalysis.structure);
            await fixImportExportIssues(componentAnalysis.components);
        }

        // Fix environment configuration
        await fixEnvironmentVariables({
            structure: structureAnalysis,
            components: componentAnalysis.components,
        });

        // Generate updated Replit configuration
        const replitConfig = await generateReplitConfig({
            structure: structureAnalysis,
            components: componentAnalysis.components,
        });

        // Write configurations
        await fs.writeFile(
            path.join(projectRoot, ".replit"),
            JSON.stringify(replitConfig, null, 2),
        );

        // Get final AI review
        console.log("\n🤖 Getting final AI review...");
        const finalReview = await anthropic.messages.create({
            model: "claude-3-sonnet-20240229",
            max_tokens: 1000,
            messages: [
                {
                    role: "user",
                    content: `Review these fixes and suggest any additional improvements:
                ${JSON.stringify(
                    {
                        structure: structureAnalysis,
                        components: componentAnalysis,
                    },
                    null,
                    2,
                )}`,
                },
            ],
        });

        console.log(
            "\n✨ All fixes applied! Check the backup directory if you need to revert any changes.",
        );
        console.log("\n📝 AI Final Review:");
        console.log(finalReview.content);
    } catch (error) {
        console.error("❌ Error during repair:", error);
        process.exit(1);
    }
}

main().catch(console.error);
