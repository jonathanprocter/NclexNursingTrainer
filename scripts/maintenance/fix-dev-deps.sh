#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}Installing development dependencies...${NC}"

# Clean existing dependencies
rm -rf node_modules
rm -f package-lock.json

# Install all required dependencies
npm install --save express cors dotenv body-parser
npm install --save-dev typescript tsx vite @vitejs/plugin-react concurrently @types/express @types/cors @types/node

# Update package.json
cat > package.json << 'EOL'
{
  "name": "nclex-prep",
  "version": "1.0.0",
  "type": "commonjs",
  "scripts": {
    "dev:client": "./node_modules/.bin/vite --port 3000",
    "dev:server": "./node_modules/.bin/tsx watch server/index.ts",
    "dev": "./node_modules/.bin/concurrently \"npm run dev:client\" \"npm run dev:server\"",
    "build:client": "./node_modules/.bin/vite build",
    "build:server": "./node_modules/.bin/tsc -p tsconfig.server.json",
    "build": "npm run build:client && npm run build:server",
    "start": "node dist/server/index.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "body-parser": "^1.20.2"
  },
  "devDependencies": {
    "@types/cors": "^2.8.17",
    "@types/express": "^4.17.21",
    "@types/node": "^20.11.5",
    "@vitejs/plugin-react": "^4.2.1",
    "concurrently": "^8.2.2",
    "typescript": "^5.3.3",
    "tsx": "^4.7.0",
    "vite": "^5.0.12"
  }
}
EOL

# Create basic vite.config.ts if it doesn't exist
cat > vite.config.ts << 'EOL'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000
  }
})
EOL

# Create tsconfig.json if it doesn't exist
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
    "esModuleInterop": true
  },
  "include": ["client/src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
EOL

# Install dependencies
echo -e "${BLUE}Installing dependencies...${NC}"
npm install

echo -e "${GREEN}Development dependencies installed!${NC}"
echo -e "${BLUE}Next steps:${NC}"
echo "1. Run 'npm run dev' to start the development server"