#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}Starting TypeScript configuration setup...${NC}"

# Backup existing files
echo -e "${BLUE}Creating backups...${NC}"
mkdir -p backups/config
cp tsconfig*.json backups/config/ 2>/dev/null || true
cp vite.config.ts backups/config/ 2>/dev/null || true

# Remove existing files
echo -e "${BLUE}Cleaning up existing configuration files...${NC}"
rm -f tsconfig*.json
rm -f vite.config.ts
rm -f config/vite.config.ts

# Create fresh config directory
echo -e "${BLUE}Creating fresh configuration...${NC}"
mkdir -p config
# Create vite.config.ts in config directory
echo -e "${BLUE}Creating Vite configuration...${NC}"
cat > config/vite.config.ts << 'EOL'
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: [
      '28283d82-bfbd-491e-8711-8e29be387da7-00-29i5ngdyjh860.spock.replit.dev',
      '.replit.dev',
      'localhost'
    ],
    hmr: {
      host: process.env.REPL_SLUG ? `${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co` : '0.0.0.0',
      protocol: 'ws',
      clientPort: 443
    },
    watch: {
      usePolling: true,
      interval: 100,
    },
    proxy: {
      '/api': {
        target: 'http://0.0.0.0:4003',
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../src'),
    },
  },
});
EOL

# Create symbolic link for vite.config.ts
ln -s config/vite.config.ts ./vite.config.ts
# Create tsconfig.json
echo -e "${BLUE}Creating TypeScript configurations...${NC}"
cat > tsconfig.json << 'EOL'
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
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
      "@/*": ["src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
EOL

# Create tsconfig.node.json
cat > tsconfig.node.json << 'EOL'
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["config/*.ts"]
}
EOL
# Create tsconfig.server.json
cat > tsconfig.server.json << 'EOL'
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "CommonJS",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "skipLibCheck": true,
    "outDir": "dist",
    "rootDir": "server",
    "baseUrl": ".",
    "paths": {
      "@/*": ["server/*"]
    }
  },
  "include": ["server/**/*"],
  "exclude": ["node_modules"]
}
EOL

# Ensure src directory exists
mkdir -p src/components src/pages src/styles

# Create index.html if it doesn't exist
if [ ! -f "src/index.html" ]; then
    echo -e "${BLUE}Creating index.html...${NC}"
    cat > src/index.html << 'EOL'
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>NCLEX Prep</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
EOL
fi

echo -e "${GREEN}TypeScript configuration setup complete!${NC}"
echo -e "${BLUE}Next steps:${NC}"
echo "1. Run 'npm run dev' to start the development server"
echo "2. Check that all TypeScript files compile correctly"
echo "3. Verify that the development server starts without errors"
