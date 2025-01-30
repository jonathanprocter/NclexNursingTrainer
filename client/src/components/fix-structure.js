#!/usr/bin/env node

const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const { promisify } = require('util');
const Anthropic = require('@anthropic-ai/sdk');

// Initialize Anthropic client
const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

// Configuration constants
const CONFIG = {
    expectedDirs: ['client', 'server', 'shared', 'public'],
    componentStructure: {
        'client/src': ['components', 'pages', 'hooks', 'utils', 'styles', 'context', 'types'],
        'server': ['routes', 'controllers', 'models', 'middleware', 'utils', 'config'],
        'shared': ['types', 'utils', 'constants']
    },
    filePatterns: {
        component: /\.(jsx?|tsx?)$/,
        style: /\.(css|scss|sass)$/,
        route: /\.(route|router)\.(js|ts)$/,
        controller: /\.controller\.(js|ts)$/
    }
};

async function analyzeAndFix() {
    const fixes = {
        directoriesCreated: [],
        componentsMoved: [],
        importsFixed: [],
        routesFixed: [],
        stylesFixed: []
    };

    // 1. Create and organize directory structure
    await createDirectoryStructure(fixes);

    // 2. Analyze and fix components
    await fixComponents(fixes);

    // 3. Fix routes
    await fixRoutes(fixes);

    // 4. Fix styles
    await fixStyles(fixes);

    return fixes;
}

async function createDirectoryStructure(fixes) {
    console.log('\n📁 Creating directory structure...');

    for (const [baseDir, subDirs] of Object.entries(CONFIG.componentStructure)) {
        for (const subDir of subDirs) {
            const fullPath = path.join(process.cwd(), baseDir, subDir);
            try {
                await fs.mkdir(fullPath, { recursive: true });
                fixes.directoriesCreated.push(fullPath);
                console.log(`✅ Created directory: ${path.relative(process.cwd(), fullPath)}`);
            } catch (error) {
                if (error.code !== 'EEXIST') {
                    console.warn(`⚠️  Could not create directory ${subDir}:`, error.message);
                }
            }
        }
    }
}

async function fixComponents(fixes) {
    console.log('\n🔧 Fixing components...');

    // Find all component files
    const components = await findFiles(CONFIG.filePatterns.component);

    for (const component of components) {
        try {
            const content = await fs.readFile(component, 'utf-8');
            let updated = content;
            let needsUpdate = false;

            // 1. Check and fix exports
            if (!hasDefaultExport(content) && isReactComponent(content)) {
                updated = addDefaultExport(updated, component);
                needsUpdate = true;
            }

            // 2. Check and fix imports
            const importFixes = fixImportPaths(updated, component);
            if (importFixes.fixed) {
                updated = importFixes.content;
                needsUpdate = true;
            }

            // 3. Move to correct directory if needed
            const correctPath = getCorrectComponentPath(component);
            if (correctPath !== component) {
                await ensureDirectoryExists(path.dirname(correctPath));
                await fs.rename(component, correctPath);
                fixes.componentsMoved.push({
                    from: component,
                    to: correctPath
                });
                console.log(`✅ Moved component: ${path.relative(process.cwd(), component)} → ${path.relative(process.cwd(), correctPath)}`);
            }

            // Save changes if needed
            if (needsUpdate) {
                await fs.writeFile(correctPath || component, updated);
                fixes.importsFixed.push(correctPath || component);
                console.log(`✅ Fixed imports/exports in: ${path.relative(process.cwd(), correctPath || component)}`);
            }
        } catch (error) {
            console.warn(`⚠️  Could not fix component ${component}:`, error.message);
        }
    }
}

async function fixRoutes(fixes) {
    console.log('\n🛣️  Fixing routes...');

    // Find all route files
    const routes = await findFiles(CONFIG.filePatterns.route);

    for (const route of routes) {
        try {
            const content = await fs.readFile(route, 'utf-8');
            let updated = content;
            let needsUpdate = false;

            // 1. Fix route handlers
            const routeFixes = fixRouteHandlers(updated);
            if (routeFixes.fixed) {
                updated = routeFixes.content;
                needsUpdate = true;
            }

            // 2. Move to correct directory if needed
            const correctPath = path.join('server', 'routes', path.basename(route));
            if (correctPath !== route) {
                await ensureDirectoryExists(path.dirname(correctPath));
                await fs.rename(route, correctPath);
                fixes.routesFixed.push({
                    from: route,
                    to: correctPath
                });
                console.log(`✅ Moved route: ${path.relative(process.cwd(), route)} → ${path.relative(process.cwd(), correctPath)}`);
            }

            // Save changes if needed
            if (needsUpdate) {
                await fs.writeFile(correctPath || route, updated);
                console.log(`✅ Fixed route handlers in: ${path.relative(process.cwd(), correctPath || route)}`);
            }
        } catch (error) {
            console.warn(`⚠️  Could not fix route ${route}:`, error.message);
        }
    }
}

async function fixStyles(fixes) {
    console.log('\n🎨 Fixing styles...');

    // Find all style files
    const styles = await findFiles(CONFIG.filePatterns.style);

    for (const style of styles) {
        try {
            // Move to correct directory if needed
            const correctPath = path.join('client', 'src', 'styles', path.basename(style));
            if (correctPath !== style) {
                await ensureDirectoryExists(path.dirname(correctPath));
                await fs.rename(style, correctPath);
                fixes.stylesFixed.push({
                    from: style,
                    to: correctPath
                });
                console.log(`✅ Moved style: ${path.relative(process.cwd(), style)} → ${path.relative(process.cwd(), correctPath)}`);
            }
        } catch (error) {
            console.warn(`⚠️  Could not fix style ${style}:`, error.message);
        }
    }
}

// Utility functions
async function findFiles(pattern) {
    const results = [];

    async function search(dir) {
        const entries = await fs.readdir(dir, { withFileTypes: true });

        for (const entry of entries) {
            if (entry.name.startsWith('.')) continue;

            const fullPath = path.join(dir, entry.name);

            if (entry.isDirectory()) {
                await search(fullPath);
            } else if (pattern.test(entry.name)) {
                results.push(fullPath);
            }
        }
    }

    await search(process.cwd());
    return results;
}

function hasDefaultExport(content) {
    return /export\s+default/.test(content);
}

function isReactComponent(content) {
    return /import.*?React/.test(content) || 
           /React\.Component/.test(content) ||
           /<.*?>/.test(content);
}

function addDefaultExport(content, filePath) {
    const componentName = path.basename(filePath, path.extname(filePath));
    if (!content.includes(`function ${componentName}`)) {
        content = `function ${componentName}() {\n  return null;\n}\n\n${content}`;
    }
    return `${content}\n\nexport default ${componentName};\n`;
}

function fixImportPaths(content, filePath) {
    let fixed = false;
    let updatedContent = content;

    // Fix relative imports
    updatedContent = updatedContent.replace(
        /from\s+['"]\.{1,2}\/(.*?)['"]/g,
        (match, importPath) => {
            fixed = true;
            return `from '@/${importPath}'`;
        }
    );

    return { content: updatedContent, fixed };
}

function getCorrectComponentPath(filePath) {
    const filename = path.basename(filePath);

    // Determine component type from content and name
    if (filename.includes('.component.')) {
        return path.join('client', 'src', 'components', filename);
    } else if (filename.includes('.page.')) {
        return path.join('client', 'src', 'pages', filename);
    } else if (filename.includes('.hook.')) {
        return path.join('client', 'src', 'hooks', filename);
    } else {
        return path.join('client', 'src', 'components', filename);
    }
}

function fixRouteHandlers(content) {
    let fixed = false;
    let updatedContent = content;

    // Add error handling to route handlers
    updatedContent = updatedContent.replace(
        /async\s+\(req,\s*res\)\s*=>\s*{([^}]*)}/g,
        (match, handlerBody) => {
            if (!handlerBody.includes('try')) {
                fixed = true;
                return `async (req, res) => {
  try {${handlerBody}
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}`;
            }
            return match;
        }
    );

    return { content: updatedContent, fixed };
}

async function ensureDirectoryExists(dir) {
    try {
        await fs.mkdir(dir, { recursive: true });
    } catch (error) {
        if (error.code !== 'EEXIST') {
            throw error;
        }
    }
}

// Main execution
async function main() {
    try {
        console.log('🚀 Starting project structure optimization...');

        // Perform fixes
        const fixes = await analyzeAndFix();

        // Generate report
        const report = {
            directoriesCreated: fixes.directoriesCreated.length,
            componentsMoved: fixes.componentsMoved.length,
            importsFixed: fixes.importsFixed.length,
            routesFixed: fixes.routesFixed.length,
            stylesFixed: fixes.stylesFixed.length
        };

        // Save detailed report
        await fs.writeFile(
            'structure-fixes-report.json',
            JSON.stringify({
                timestamp: new Date().toISOString(),
                summary: report,
                details: fixes
            }, null, 2)
        );

        console.log('\n📊 Fix Summary:');
        console.log('- Directories created:', report.directoriesCreated);
        console.log('- Components moved:', report.componentsMoved);
        console.log('- Imports fixed:', report.importsFixed);
        console.log('- Routes fixed:', report.routesFixed);
        console.log('- Styles fixed:', report.stylesFixed);

        console.log('\n✨ All fixes applied! Check structure-fixes-report.json for details.');

    } catch (error) {
        console.error('❌ Error during fixes:', error.message);
        process.exit(1);
    }
}

main().catch(console.error);