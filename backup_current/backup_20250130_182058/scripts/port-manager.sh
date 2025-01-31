#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}Starting port cleanup...${NC}"

# Function to check if a port is in use
check_port() {
    lsof -i :$1 >/dev/null 2>&1
}

# Function to kill process using a specific port
kill_port() {
    local port=$1
    if check_port $port; then
        echo -e "${BLUE}Killing process on port $port...${NC}"
        fuser -k $port/tcp 2>/dev/null || true
    fi
}

# Kill processes on specific ports
kill_port 3000
kill_port 4003

# Kill all Node.js processes for good measure
pkill -f "node" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true

# Wait for processes to close
sleep 2

# Verify ports are free
for port in 3000 4003; do
    if check_port $port; then
        echo -e "${RED}Failed to free port $port${NC}"
        exit 1
    fi
done

echo -e "${BLUE}Updating package.json scripts...${NC}"

# Use node to update package.json with correct port configuration
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

echo -e "${GREEN}Port cleanup complete! All ports have been freed.${NC}"