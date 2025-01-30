#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}Starting port cleanup...${NC}"

# Kill all Node.js processes
pkill -f "node" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true

# Wait for processes to close
sleep 2

# Update package.json scripts
echo -e "${BLUE}Updating package.json scripts...${NC}"

# Use node to update package.json
node -e '
const fs = require("fs");
const pkg = JSON.parse(fs.readFileSync("package.json"));
pkg.scripts = {
  ...pkg.scripts,
  "predev": "./scripts/port-manager.sh",
  "dev:client": "vite --port 3000 --host 0.0.0.0",
  "dev:server": "tsx server/index.ts",
  "dev": "concurrently \"npm run dev:client\" \"npm run dev:server\"",
  "build:client": "vite build",
  "build:server": "tsc -p tsconfig.server.json",
  "build": "npm run build:client && npm run build:server",
  "start": "NODE_ENV=production tsx server/index.ts"
};
fs.writeFileSync("package.json", JSON.stringify(pkg, null, 2) + "\n");
'

echo -e "${GREEN}Port cleanup complete! All Node.js processes have been terminated.${NC}"
