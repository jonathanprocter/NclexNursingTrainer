#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}Starting comprehensive application analysis and restructuring...${NC}"

# Initialize error and warning logs
error_log="application_errors.log"
warning_log="application_warnings.log"
> $error_log
> $warning_log

# Create backup
timestamp=$(date +%Y%m%d_%H%M%S)
backup_dir="backup_$timestamp"
mkdir -p $backup_dir

# Function to log errors
log_error() {
    echo -e "${RED}ERROR: $1${NC}"
    echo "[ERROR] $1" >> $error_log
}

# Function to log warnings
log_warning() {
    echo -e "${YELLOW}WARNING: $1${NC}"
    echo "[WARNING] $1" >> $warning_log
}

# Function to check Node.js and required packages
check_dependencies() {
    echo -e "${BLUE}Checking and installing dependencies...${NC}"

    # Check Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed"
        exit 1
    fi

    # Install required packages if not present
    local required_packages=(
        "typescript"
        "prettier"
        "eslint"
        "@typescript-eslint/parser"
        "@typescript-eslint/eslint-plugin"
        "ts-morph"
        "axios"
    )

    for package in "${required_packages[@]}"; do
        if ! npm list $package -g &> /dev/null; then
            echo "Installing $package globally..."
            npm install -g $package
        fi
    done

    # Install project-specific dependencies
    npm install --save-dev typescript @types/node @types/react @types/react-dom eslint prettier
}

# Function to create API route completion script
create_api_completion_script() {
    cat > complete_api_routes.ts << EOF
import * as ts from 'ts-morph';
import * as path from 'path';

const project = new ts.Project({
    tsConfigFilePath: "tsconfig.json",
});

// Find all API routes in server
const serverFiles = project.getSourceFiles("server/routes/**/*.ts");
const clientFiles = project.getSourceFiles("src/**/*.ts{,x}");

// Track API endpoints and their usage
const apiEndpoints = new Map();
const clientApiCalls = new Set();

// Analyze server routes
serverFiles.forEach(file => {
    const routeDeclarations = file.getDescendants().filter(
        node => ts.Node.isCallExpression(node) &&
        node.getExpression().getText().includes('router.')
    );

    routeDeclarations.forEach(route => {
        const method = route.getExpression().getText().split('.')[1];
        const pathArg = route.getArguments()[0];
        if (pathArg) {
            const endpoint = pathArg.getText().replace(/['"]/g, '');
            apiEndpoints.set(\`\${method.toUpperCase()} \${endpoint}\`, file.getFilePath());
        }
    });
});

// Check client-side API calls
clientFiles.forEach(file => {
    const apiCalls = file.getDescendants().filter(
        node => ts.Node.isCallExpression(node) &&
        node.getText().includes('axios.')
    );

    apiCalls.forEach(call => {
        const method = call.getExpression().getText().split('.')[1];
        const config = call.getArguments()[0];
        if (config) {
            let endpoint = '';
            if (ts.Node.isStringLiteral(config)) {
                endpoint = config.getText().replace(/['"]/g, '');
            } else if (ts.Node.isObjectLiteralExpression(config)) {
                const urlProp = config.getProperty('url');
                if (urlProp && ts.Node.isPropertyAssignment(urlProp)) {
                    endpoint = urlProp.getInitializer()?.getText().replace(/['"]/g, '') || '';
                }
            }
            clientApiCalls.add(\`\${method.toUpperCase()} \${endpoint}\`);
        }
    });
});

// Generate missing API routes and clients
console.log('Generating missing API implementations...');

apiEndpoints.forEach((filePath, endpoint) => {
    if (!clientApiCalls.has(endpoint)) {
        // Generate client-side API call
        const [method, path] = endpoint.split(' ');
        const functionName = generateFunctionName(method, path);

        const clientApiCode = \`
export const \${functionName} = async (data?: any) => {
    try {
        const response = await axios.\${method.toLowerCase()}(\`\${path}\`, data);
        return response.data;
    } catch (error) {
        console.error('API call failed:', error);
        throw error;
    }
};\n\`;

        // Add to API client file
        const apiClientFile = project.createSourceFile(
            'src/services/api-client.ts',
            clientApiCode,
            { overwrite: false }
        );
    }
});

clientApiCalls.forEach(endpoint => {
    if (!apiEndpoints.has(endpoint)) {
        // Generate server-side route
        const [method, path] = endpoint.split(' ');

        const routeCode = \`
router.\${method.toLowerCase()}('\${path}', async (req, res) => {
    try {
        // TODO: Implement route logic
        res.json({ message: 'Route implementation pending' });
    } catch (error) {
        console.error('Route error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});\n\`;

        // Add to appropriate route file
        const routeFile = project.createSourceFile(
            \`server/routes/\${generateRouteFileName(path)}.ts\`,
            routeCode,
            { overwrite: false }
        );
    }
});

function generateFunctionName(method: string, path: string): string {
    const segments = path.split('/').filter(Boolean);
    return \`\${method.toLowerCase()}\${segments.map(s => 
        s.split('-').map(part => 
            part.charAt(0).toUpperCase() + part.slice(1)
        ).join('')
    ).join('')}\`;
}

function generateRouteFileName(path: string): string {
    const mainSegment = path.split('/')[1] || 'index';
    return \`\${mainSegment}.routes\`;
}

// Save all changes
project.save();

console.log('API route completion finished');
EOF
}

# Function to analyze and fix React component issues
create_component_analyzer() {
    cat > analyze_components.ts << EOF
import * as ts from 'ts-morph';
import * as path from 'path';

const project = new ts.Project({
    tsConfigFilePath: "tsconfig.json",
});

// Analyze React components
const componentFiles = project.getSourceFiles("src/**/*.tsx");

componentFiles.forEach(file => {
    // Check for proper prop types
    const componentDeclarations = file.getClasses().concat(file.getFunctions())
        .filter(node => node.getName()?.match(/[A-Z]/));

    componentDeclarations.forEach(component => {
        // Add missing prop types
        if (!component.getType().getProperties().length) {
            const sourceFile = component.getSourceFile();
            sourceFile.addInterface({
                name: \`\${component.getName()}Props\`,
                properties: []
            });
        }

        // Add proper React imports
        const hasReactImport = file.getImportDeclaration(i => i.getModuleSpecifier().getText() === "'react'");
        if (!hasReactImport) {
            file.addImportDeclaration({
                moduleSpecifier: 'react',
                defaultImport: 'React'
            });
        }
    });

    // Check and fix hooks usage
    const hookCalls = file.getDescendants().filter(
        node => ts.Node.isCallExpression(node) &&
        node.getExpression().getText().startsWith('use')
    );

    hookCalls.forEach(hook => {
        // Ensure hooks are at top level
        const parentFunction = hook.getFirstAncestor(
            ancestor => ts.Node.isFunctionDeclaration(ancestor) ||
                       ts.Node.isArrowFunction(ancestor)
        );

        if (parentFunction && !ts.Node.isFunctionDeclaration(parentFunction)) {
            // Move hook to top level
            const componentFunction = file.getFunction(f => 
                f.getName()?.match(/[A-Z]/)
            );
            if (componentFunction) {
                const hookDeclaration = \`const \${hook.getText()};\`;
                componentFunction.insertStatements(0, hookDeclaration);
            }
        }
    });
});

// Save changes
project.save();
console.log('Component analysis and fixes completed');
EOF
}

# Function to fix syntax and type issues
create_syntax_fixer() {
    cat > fix_syntax.ts << EOF
import * as ts from 'ts-morph';
import * as path from 'path';

const project = new ts.Project({
    tsConfigFilePath: "tsconfig.json",
});

// Fix common syntax issues
const sourceFiles = project.getSourceFiles();

sourceFiles.forEach(file => {
    // Fix missing type annotations
    file.getVariableDeclarations().forEach(declaration => {
        if (!declaration.getType().isAny() && !declaration.getTypeNode()) {
            const inferredType = declaration.getType().getText();
            declaration.setType(inferredType);
        }
    });

    // Fix async/await usage
    file.getDescendants().forEach(node => {
        if (ts.Node.isCallExpression(node) &&
            node.getExpression().getText().includes('axios')) {
            const parent = node.getParent();
            if (!ts.Node.isAwaitExpression(parent)) {
                node.replaceWithText(\`await \${node.getText()}\`);
                let currentNode = node;
                while (currentNode = currentNode.getParent()) {
                    if (ts.Node.isFunctionDeclaration(currentNode) ||
                        ts.Node.isArrowFunction(currentNode)) {
                        if (!currentNode.isAsync()) {
                            currentNode.setIsAsync(true);
                        }
                        break;
                    }
                }
            }
        }
    });

    // Fix error handling
    file.getDescendants().forEach(node => {
        if (ts.Node.isTryStatement(node)) {
            const catchClause = node.getCatchClause();
            if (!catchClause || !catchClause.getVariableDeclaration()) {
                node.addCatchClause(\`catch (error: unknown) {
                    console.error('An error occurred:', error);
                    throw error;
                }\`);
            }
        }
    });
});

// Save all changes
project.save();
console.log('Syntax fixes completed');
EOF
}

# Main execution
echo -e "${BLUE}Creating backup in $backup_dir...${NC}"
cp -r * $backup_dir/

# Check and install dependencies
check_dependencies

# Create new directory structure
echo -e "${BLUE}Creating new directory structure...${NC}"
mkdir -p src/{components/{ui,layout,dashboard,nclex},pages,hooks,utils,config,types,styles,lib,services}
mkdir -p server/{routes,controllers,services,utils,config,types,middleware}

# Create analysis and fix scripts
create_api_completion_script
create_component_analyzer
create_syntax_fixer

# Run TypeScript scripts
echo -e "${BLUE}Running code analysis and fixes...${NC}"
ts-node complete_api_routes.ts
ts-node analyze_components.ts
ts-node fix_syntax.ts

# Install additional required packages based on analysis
echo -e "${BLUE}Installing additional dependencies...${NC}"
npm install --save \
    @tanstack/react-query \
    @trpc/client \
    @trpc/server \
    zod \
    @hookform/resolvers \
    axios \
    date-fns

# Update tsconfig.json with proper paths and settings
echo -e "${BLUE}Updating TypeScript configuration...${NC}"
cat > tsconfig.json << EOF
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["DOM", "DOM.Iterable", "ESNext"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["src/components/*"],
      "@/pages/*": ["src/pages/*"],
      "@/hooks/*": ["src/hooks/*"],
      "@/utils/*": ["src/utils/*"],
      "@/types/*": ["src/types/*"],
      "@/lib/*": ["src/lib/*"],
      "@/styles/*": ["src/styles/*"],
      "@/server/*": ["server/*"],
      "@/api/*": ["src/services/api/*"]
    }
  },
  "include": ["src", "server"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
EOF

# Create API client setup
mkdir -p src/services/api
cat > src/services/api/client.ts << EOF
import axios from 'axios';

export const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.response.use(
    response => response,
    error => {
        console.error('API Error:', error);
        return Promise.reject(error);
    }
);
EOF

# Set up environment variables
cat > .env << EOF
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/mydb
EOF

# Create API route index
cat > server/routes/index.ts << EOF
import express from 'express';
import fs from 'fs';
import path from 'path';

const router = express.Router();
const routeFiles = fs.readdirSync(__dirname)
    .filter(file => file !== 'index.ts' && file.endsWith('.ts'));

for (const file of routeFiles) {
    const route = require(path.join(__dirname, file));
    router.use('/', route.default || route);
}

export default router;
EOF

# Set up error handling middleware
cat > server/middleware/errorHandler.ts << EOF
import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.error(err.stack);
    res.status(500).json({
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
    });
};
EOF

# Clean up temporary files
rm complete_api_routes.ts analyze_components.ts fix_syntax.ts
#!/bin/bash

# Continue from previous script...

# Function to analyze and create missing UI components
create_ui_component_analyzer() {
    cat > analyze_ui_components.ts << EOF
import * as ts from 'ts-morph';
import * as fs from 'fs';
import * as path from 'path';

const project = new ts.Project({
    tsConfigFilePath: "tsconfig.json",
});

// Function to ensure component has corresponding styles
function ensureComponentStyles(componentName: string, componentDir: string) {
    const stylePath = path.join(componentDir, `${componentName}.styles.ts`);
    if (!fs.existsSync(stylePath)) {
        fs.writeFileSync(stylePath, `
import { styled } from '@/styles/styled';

export const ${componentName}Container = styled.div\`
    // Add your styles here
\`;
`);
    }
}

// Function to ensure component has proper testing setup
function ensureComponentTests(componentName: string, componentDir: string) {
    const testPath = path.join(componentDir, `${componentName}.test.tsx`);
    if (!fs.existsSync(testPath)) {
        fs.writeFileSync(testPath, `
import { render, screen } from '@testing-library/react';
import { ${componentName} } from './${componentName}';

describe('${componentName}', () => {
    it('renders successfully', () => {
        render(<${componentName} />);
        // Add your test assertions here
    });
});
`);
    }
}

// Function to create missing backend route for component
function createBackendRoute(componentName: string) {
    const routePath = path.join('server/routes', `${componentName.toLowerCase()}.ts`);
    if (!fs.existsSync(routePath)) {
        fs.writeFileSync(routePath, `
import express from 'express';
import { ${componentName}Controller } from '../controllers/${componentName.toLowerCase()}.controller';

const router = express.Router();
const controller = new ${componentName}Controller();

router.get('/${componentName.toLowerCase()}', controller.getAll);
router.get('/${componentName.toLowerCase()}/:id', controller.getById);
router.post('/${componentName.toLowerCase()}', controller.create);
router.put('/${componentName.toLowerCase()}/:id', controller.update);
router.delete('/${componentName.toLowerCase()}/:id', controller.delete);

export default router;
`);

        // Create corresponding controller
        const controllerPath = path.join('server/controllers', `${componentName.toLowerCase()}.controller.ts`);
        fs.writeFileSync(controllerPath, `
import { Request, Response } from 'express';
import { ${componentName}Service } from '../services/${componentName.toLowerCase()}.service';

export class ${componentName}Controller {
    private service: ${componentName}Service;

    constructor() {
        this.service = new ${componentName}Service();
    }

    getAll = async (req: Request, res: Response) => {
        try {
            const items = await this.service.getAll();
            res.json(items);
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    };

    getById = async (req: Request, res: Response) => {
        try {
            const item = await this.service.getById(req.params.id);
            if (!item) {
                return res.status(404).json({ error: 'Not found' });
            }
            res.json(item);
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    };

    create = async (req: Request, res: Response) => {
        try {
            const newItem = await this.service.create(req.body);
            res.status(201).json(newItem);
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    };

    update = async (req: Request, res: Response) => {
        try {
            const updated = await this.service.update(req.params.id, req.body);
            if (!updated) {
                return res.status(404).json({ error: 'Not found' });
            }
            res.json(updated);
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    };

    delete = async (req: Request, res: Response) => {
        try {
            await this.service.delete(req.params.id);
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    };
}
`);

        // Create corresponding service
        const servicePath = path.join('server/services', `${componentName.toLowerCase()}.service.ts`);
        fs.writeFileSync(servicePath, `
import { prisma } from '../lib/prisma';

export class ${componentName}Service {
    async getAll() {
        return prisma.${componentName.toLowerCase()}.findMany();
    }

    async getById(id: string) {
        return prisma.${componentName.toLowerCase()}.findUnique({
            where: { id }
        });
    }

    async create(data: any) {
        return prisma.${componentName.toLowerCase()}.create({
            data
        });
    }

    async update(id: string, data: any) {
        return prisma.${componentName.toLowerCase()}.update({
            where: { id },
            data
        });
    }

    async delete(id: string) {
        return prisma.${componentName.toLowerCase()}.delete({
            where: { id }
        });
    }
}
`);
    }
}

// Analyze all components
const componentFiles = project.getSourceFiles("src/components/**/*.tsx");

componentFiles.forEach(file => {
    const componentName = path.basename(file.getFilePath(), '.tsx');
    const componentDir = path.dirname(file.getFilePath());

    // Ensure proper component structure
    const component = file.getClasses().concat(file.getFunctions())
        .find(node => node.getName() === componentName);

    if (component) {
        // Add proper prop types if missing
        if (!component.getType().getProperties().length) {
            file.addInterface({
                name: \`\${componentName}Props\`,
                properties: []
            });
        }

        // Ensure component has error boundaries
        const hasErrorBoundary = file.getText().includes('ErrorBoundary');
        if (!hasErrorBoundary) {
            file.addImportDeclaration({
                moduleSpecifier: '@/components/ErrorBoundary',
                namedImports: ['ErrorBoundary']
            });
        }

        // Ensure styles exist
        ensureComponentStyles(componentName, componentDir);

        // Ensure tests exist
        ensureComponentTests(componentName, componentDir);

        // Create backend route if needed
        if (file.getText().includes('fetch') || file.getText().includes('axios')) {
            createBackendRoute(componentName);
        }
    }
});

// Save all changes
project.save();
console.log('UI component analysis and generation completed');
EOF
}

# Function to set up database migrations and Prisma
setup_database() {
    echo -e "${BLUE}Setting up database and Prisma...${NC}"

    # Install Prisma
    npm install -D prisma
    npm install @prisma/client

    # Initialize Prisma
    npx prisma init

    # Create base schema
    cat > prisma/schema.prisma << EOF
generator client {
    provider = "prisma-client-js"
}

datasource db {
    provider = "postgresql"
    url      = env("DATABASE_URL")
}

// Add your models here
EOF

    # Create initial migration
    npx prisma migrate dev --name init

    # Generate Prisma client
    npx prisma generate
}

# Function to set up authentication
setup_auth() {
    echo -e "${BLUE}Setting up authentication...${NC}"

    npm install next-auth @auth/prisma-adapter

    # Create auth configuration
    mkdir -p src/lib
    cat > src/lib/auth.ts << EOF
import { PrismaAdapter } from "@auth/prisma-adapter";
import { AuthOptions } from "next-auth";
import { prisma } from "./prisma";

export const authOptions: AuthOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        // Add your providers here
    ],
    callbacks: {
        async session({ session, user }) {
            if (session.user) {
                session.user.id = user.id;
            }
            return session;
        },
    },
};
EOF
}

# Run new functions
echo -e "${BLUE}Running additional analysis and setup...${NC}"
create_ui_component_analyzer
ts-node analyze_ui_components.ts

# Set up database and auth
setup_database
setup_auth

# Create frontend API hooks
mkdir -p src/hooks
cat > src/hooks/useApi.ts << EOF
import { useState } from 'react';
import { api } from '@/services/api/client';

export function useApi<T>() {
    const [data, setData] = useState<T | null>(null);
    const [error, setError] = useState<Error | null>(null);
    const [loading, setLoading] = useState(false);

    const fetchData = async (endpoint: string) => {
        setLoading(true);
        try {
            const response = await api.get<T>(endpoint);
            setData(response.data);
            return response.data;
        } catch (err) {
            setError(err as Error);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const mutateData = async (method: 'post' | 'put' | 'delete', endpoint: string, data?: any) => {
        setLoading(true);
        try {
            const response = await api[method](endpoint, data);
            return response.data;
        } catch (err) {
            setError(err as Error);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        data,
        error,
        loading,
        fetchData,
        mutateData
    };
}
EOF

# Set up automated testing
echo -e "${BLUE}Setting up testing infrastructure...${NC}"
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom

# Create test setup
mkdir -p src/test
cat > src/test/setup.ts << EOF
import '@testing-library/jest-dom';
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers);

afterEach(() => {
    cleanup();
});
EOF

# Create Vitest configuration
cat > vitest.config.ts << EOF
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
    plugins: [react(), tsconfigPaths()],
    test: {
        environment: 'jsdom',
        setupFiles: ['./src/test/setup.ts'],
        globals: true,
    },
});
EOF

# Add test scripts to package.json
npm pkg set scripts.test="vitest"
npm pkg set scripts.test:watch="vitest watch"
npm pkg set scripts.test:coverage="vitest run --coverage"

echo -e "${GREEN}Enhanced application setup completed!${NC}"
echo -e "${BLUE}Please review the changes and run tests to verify the setup.${NC}"

# Clean up temporary files
rm analyze_ui_components.ts

exit 0