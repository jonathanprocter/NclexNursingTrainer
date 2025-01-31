#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}Installing missing dependencies...${NC}"

# Install backend dependencies
echo -e "${BLUE}Installing backend dependencies...${NC}"
npm install express cors body-parser drizzle-orm dotenv

# Install frontend dependencies
echo -e "${BLUE}Installing frontend dependencies...${NC}"
npm install wouter recharts @radix-ui/react-toast @radix-ui/react-select @radix-ui/react-scroll-area @radix-ui/react-label @radix-ui/react-dialog @tanstack/react-query

# Install development dependencies
echo -e "${BLUE}Installing development dependencies...${NC}"
npm install -D @types/express @types/cors typescript ts-node tsx

# Create package.json if it doesn't exist
if [ ! -f "package.json" ]; then
    echo -e "${BLUE}Creating package.json...${NC}"
    cat > package.json << 'EOL'
{
  "name": "nclex-prep",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev:client": "vite",
    "dev:server": "tsx watch server/index.ts",
    "dev": "concurrently \"npm run dev:client\" \"npm run dev:server\"",
    "build:client": "vite build",
    "build:server": "esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist/server",
    "build": "npm run build:client && npm run build:server",
    "start": "node dist/server/index.js"
  }
}
EOL
fi

# Update tsconfig.json to handle all packages
echo -e "${BLUE}Updating tsconfig.json...${NC}"
cat > tsconfig.json << 'EOL'
{
  "compilerOptions": {
    "target": "ESNext",
    "useDefineForClassFields": true,
    "lib": ["DOM", "DOM.Iterable", "ESNext"],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "baseUrl": ".",
    "paths": {
      "@/*": ["./client/src/*"]
    }
  },
  "include": ["client/src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
EOL

# Create tsconfig.node.json
echo -e "${BLUE}Creating tsconfig.node.json...${NC}"
cat > tsconfig.node.json << 'EOL'
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
EOL

# Clean install
echo -e "${BLUE}Running clean install...${NC}"
rm -rf node_modules package-lock.json
npm install

echo -e "${GREEN}Dependencies installed successfully!${NC}"
echo -e "${BLUE}Next steps:${NC}"
echo "1. Run 'npm run dev' to start the development server"