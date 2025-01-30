#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

async function recoverProject() {
    console.log('🔄 Starting project recovery...');

    // Common React/Node.js project structure
    const structure = {
        'client': {
            'src': {
                'components': {},
                'pages': {},
                'styles': {},
                'utils': {},
                'App.tsx': '',
                'index.tsx': '',
            },
            'public': {
                'index.html': '',
            },
            'package.json': '',
            'tsconfig.json': '',
        },
        'server': {
            'src': {
                'routes': {},
                'controllers': {},
                'models': {},
                'middleware': {},
            },
            'package.json': '',
        }
    };

    try {
        // 1. First gather all files
        console.log('📊 Gathering all files...');
        const allFiles = await gatherAllFiles(process.cwd());

        // 2. Identify key files by patterns
        const filesByType = categorizeFiles(allFiles);

        // 3. Recreate basic structure
        console.log('📁 Recreating project structure...');
        await createStructure(structure);

        // 4. Move files to appropriate locations
        console.log('🔄 Moving files to correct locations...');
        await moveFiles(filesByType);

        console.log('✅ Recovery complete! Please verify your application structure.');

    } catch (error) {
        console.error('❌ Error during recovery:', error.message);
        process.exit(1);
    }
}

async function gatherAllFiles(dir, fileList = []) {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        // Skip node_modules and hidden directories
        if (entry.name === 'node_modules' || entry.name.startsWith('.')) {
            continue;
        }

        if (entry.isDirectory()) {
            await gatherAllFiles(fullPath, fileList);
        } else {
            fileList.push(fullPath);
        }
    }

    return fileList;
}

function categorizeFiles(files) {
    const categories = {
        components: [],
        pages: [],
        styles: [],
        routes: [],
        models: [],
        controllers: [],
        config: [],
        other: []
    };

    for (const file of files) {
        const ext = path.extname(file);
        const basename = path.basename(file);

        if (file.includes('component') || (ext.match(/\.(jsx|tsx)$/) && !file.includes('page'))) {
            categories.components.push(file);
        } else if (file.includes('page') || file.includes('Pages') || file.includes('/pages/')) {
            categories.pages.push(file);
        } else if (ext.match(/\.(css|scss|sass)$/)) {
            categories.styles.push(file);
        } else if (file.includes('route') || file.includes('router')) {
            categories.routes.push(file);
        } else if (file.includes('model')) {
            categories.models.push(file);
        } else if (file.includes('controller')) {
            categories.controllers.push(file);
        } else if (basename === 'package.json' || basename === 'tsconfig.json') {
            categories.config.push(file);
        } else {
            categories.other.push(file);
        }
    }

    return categories;
}

async function createStructure(structure, basePath = process.cwd()) {
    for (const [name, content] of Object.entries(structure)) {
        const fullPath = path.join(basePath, name);

        if (typeof content === 'object') {
            await fs.mkdir(fullPath, { recursive: true });
            await createStructure(content, fullPath);
        }
    }
}

async function moveFiles(filesByType) {
    const moves = {
        components: 'client/src/components',
        pages: 'client/src/pages',
        styles: 'client/src/styles',
        routes: 'server/src/routes',
        models: 'server/src/models',
        controllers: 'server/src/controllers'
    };

    for (const [type, targetDir] of Object.entries(moves)) {
        const files = filesByType[type] || [];
        for (const file of files) {
            try {
                const targetPath = path.join(process.cwd(), targetDir, path.basename(file));
                await fs.mkdir(path.dirname(targetPath), { recursive: true });
                await fs.rename(file, targetPath);
            } catch (error) {
                console.warn(`⚠️  Could not move ${file}:`, error.message);
            }
        }
    }

    // Move remaining files to appropriate root directories
    for (const file of filesByType.other) {
        try {
            const isClientFile = file.includes('client') || file.includes('frontend');
            const targetDir = isClientFile ? 'client/src' : 'server/src';
            const targetPath = path.join(process.cwd(), targetDir, path.basename(file));
            await fs.mkdir(path.dirname(targetPath), { recursive: true });
            await fs.rename(file, targetPath);
        } catch (error) {
            console.warn(`⚠️  Could not move ${file}:`, error.message);
        }
    }
}

// Run recovery
recoverProject().catch(console.error);