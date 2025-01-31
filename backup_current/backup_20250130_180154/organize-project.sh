#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}Starting advanced cleanup process...${NC}"

# 1. Create organized backup directory
echo -e "${GREEN}1. Organizing backup files...${NC}"
mkdir -p backups/config
mkdir -p backups/scripts
mkdir -p backups/env

# Move all backup files
mv *backup* backups/config/ 2>/dev/null
mv schema_backup_*.bak backups/config/ 2>/dev/null
mv tsconfig_backup.json backups/config/ 2>/dev/null

# 2. Organize configuration files
echo -e "${GREEN}2. Organizing configuration files...${NC}"
mkdir -p config

# Keep TypeScript versions, remove JavaScript versions
rm -f vite.config.js
rm -f tailwind.config.cjs

# Move configuration files to config directory
mv *.config.ts config/ 2>/dev/null
mv tsconfig*.json config/ 2>/dev/null
ln -s config/vite.config.ts ./vite.config.ts
ln -s config/tailwind.config.ts ./tailwind.config.ts
ln -s config/tsconfig.json ./tsconfig.json

# 3. Organize source files
echo -e "${GREEN}3. Organizing source files...${NC}"
mkdir -p src/{components,hooks,styles,utils,types,config,constants}

# Move components and hooks to src
mv components/* src/components/ 2>/dev/null
mv hooks/* src/hooks/ 2>/dev/null
mv client/* src/ 2>/dev/null

# Remove empty directories
rmdir components hooks client 2>/dev/null

# 4. Organize server files
echo -e "${GREEN}4. Organizing server files...${NC}"
mkdir -p server/{config,middleware,utils,types}

# Create server environment configuration
cat > server/config/env.ts << EOL
import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('4003'),
  DATABASE_URL: z.string(),
  FRONTEND_URL: z.string().default('http://0.0.0.0:3000'),
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
});

const env = envSchema.parse(process.env);

export default env;
EOL

# 5. Organize scripts
echo -e "${GREEN}5. Organizing scripts...${NC}"
mkdir -p scripts/{dev,build,maintenance}

# Move maintenance scripts
mv fix-*.sh scripts/maintenance/ 2>/dev/null
mv setup-*.sh scripts/maintenance/ 2>/dev/null

# Create development helper scripts
cat > scripts/dev/start-client.ts << EOL
import { spawn } from 'child_process';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '../..');

const client = spawn('vite', ['--port', '3000', '--host', '0.0.0.0'], {
  stdio: 'inherit',
  shell: true,
  cwd: root
});

process.on('SIGINT', () => client.kill());
process.on('SIGTERM', () => client.kill());
EOL

cat > scripts/dev/start-server.ts << EOL
import { spawn } from 'child_process';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '../..');

const server = spawn('tsx', ['watch', 'server/index.ts'], {
  stdio: 'inherit',
  shell: true,
  cwd: root
});

process.on('SIGINT', () => server.kill());
process.on('SIGTERM', () => server.kill());
EOL

# 6. Update package.json scripts
echo -e "${GREEN}6. Updating package.json scripts...${NC}"
# Create a temporary file with updated scripts
cat > temp-scripts.json << EOL
{
  "scripts": {
    "dev:client": "tsx scripts/dev/start-client.ts",
    "dev:server": "tsx scripts/dev/start-server.ts",
    "dev": "concurrently \"npm run dev:client\" \"npm run dev:server\"",
    "build:client": "vite build",
    "build:server": "tsc -p config/tsconfig.server.json",
    "build": "npm run build:client && npm run build:server",
    "start": "NODE_ENV=production tsx server/index.ts",
    "typecheck": "tsc --noEmit",
    "lint": "eslint . --ext .ts,.tsx",
    "format": "prettier --write \"**/*.{ts,tsx,css,json,md}\""
  }
}
EOL

# Use node to merge the scripts into package.json
node -e "
const fs = require('fs');
const pkg = require('./package.json');
const newScripts = require('./temp-scripts.json').scripts;
pkg.scripts = newScripts;
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
"
rm temp-scripts.json

# 7. Update environment configuration
echo -e "${GREEN}7. Updating environment configuration...${NC}"
# Create example .env file
cat > .env.example << EOL
# Server Configuration
NODE_ENV=development
PORT=4003
FRONTEND_URL=http://0.0.0.0:3000

# Database Configuration
DATABASE_URL=

# API Keys
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
EOL

# 8. Create proper .gitignore
echo -e "${GREEN}8. Updating .gitignore...${NC}"
cat > .gitignore << EOL
# Dependencies
node_modules/
.pnp/
.pnp.js

# Environment
.env
.env.local
.env.*.local
!.env.example

# Build output
dist/
build/
.next/
out/

# Development
*.log
.DS_Store
.cache/
coverage/
.vscode/
.idea/

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Temporary files
*.swp
*.swo
*~

# Backups
backups/
EOL

# 9. Update README with new structure
echo -e "${GREEN}9. Updating README...${NC}"
cat > README.md << EOL
# NCLEX Prep Application

## Project Structure
\`\`\`
├── config/               # Configuration files
├── src/                 # Frontend source code
│   ├── components/      # React components
│   ├── hooks/          # Custom React hooks
│   ├── styles/         # CSS/SCSS files
│   ├── utils/          # Utility functions
│   ├── types/          # TypeScript types
│   └── constants/      # Constants and enums
├── server/             # Backend source code
│   ├── config/         # Server configuration
│   ├── middleware/     # Express middleware
│   ├── utils/          # Server utilities
│   └── types/          # Server TypeScript types
├── scripts/            # Build and development scripts
│   ├── dev/           # Development scripts
│   ├── build/         # Build scripts
│   └── maintenance/   # Maintenance scripts
└── public/            # Static files
\`\`\`

## Getting Started

1. Copy \`.env.example\` to \`.env\` and fill in the values:
   \`\`\`bash
   cp .env.example .env
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Start development server:
   \`\`\`bash
   npm run dev
   \`\`\`

## Available Scripts

- \`npm run dev\` - Start development server
- \`npm run build\` - Build for production
- \`npm start\` - Start production server
- \`npm run typecheck\` - Check TypeScript types
- \`npm run lint\` - Lint code
- \`npm run format\` - Format code
EOL

# 10. Clean up unnecessary files
echo -e "${GREEN}10. Cleaning up unnecessary files...${NC}"
rm -rf backups_1738221974 .upm

# 11. Create essential directories if they don't exist
echo -e "${GREEN}11. Creating essential directories...${NC}"
mkdir -p public/{assets,images}
mkdir -p src/styles
mkdir -p src/types
mkdir -p src/constants

echo -e "${BLUE}Cleanup complete! The project structure has been organized.${NC}"
echo -e "${GREEN}Next steps:${NC}"
echo "1. Review the changes to ensure everything is in order"
echo "2. Update your .env file with the necessary values"
echo "3. Run 'npm install' to ensure all dependencies are up to date"
echo "4. Start the development server with 'npm run dev'"