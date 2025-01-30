#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}Starting port cleanup...${NC}"

# Function to check if a port is in use
check_port() {
    local port=$1
    # Try to create a TCP server on the port
    if ! (echo "" > /dev/tcp/127.0.0.1/$port) 2>/dev/null; then
        return 0 # Port is in use
    else
        return 1 # Port is free
    fi
}

# Function to find process using a port and kill it
kill_port() {
    local port=$1
    # Find any node processes
    for pid in $(ps aux | grep "node" | grep -v grep | awk '{print $2}'); do
        if netstat -tuln 2>/dev/null | grep ":$port " >/dev/null; then
            echo -e "${GREEN}Found process on port $port, killing it...${NC}"
            kill -9 $pid 2>/dev/null
            break
        fi
    done
}

# Function to kill all node processes
kill_all_node() {
    echo -e "${BLUE}Killing all Node.js processes...${NC}"
    pkill -f "node" 2>/dev/null
    sleep 2
}

# Function to update package.json scripts
update_package_json() {
    echo -e "${BLUE}Updating package.json scripts...${NC}"
    # Create a temporary file with the new scripts
    cat > temp-scripts.json << EOL
{
  "scripts": {
    "predev": "./scripts/port-manager.sh",
    "dev:client": "vite --port 3000 --host 0.0.0.0",
    "dev:server": "tsx server/index.ts",
    "dev": "concurrently \"npm run dev:client\" \"npm run dev:server\"",
    "build:client": "vite build",
    "build:server": "tsc -p tsconfig.server.json",
    "build": "npm run build:client && npm run build:server",
    "start": "NODE_ENV=production tsx server/index.ts"
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
}

# Main cleanup process
echo -e "${BLUE}Checking for processes on common ports...${NC}"

# Kill any processes on common development ports
for port in 3000 3001 4003 4004; do
    if check_port $port; then
        kill_port $port
    fi
done

# If ports are still in use, kill all node processes
for port in 3000 3001 4003 4004; do
    if check_port $port; then
        echo -e "${RED}Some ports still in use. Killing all Node.js processes...${NC}"
        kill_all_node
        break
    fi
done

# Wait a moment for processes to fully close
sleep 2

# Update package.json scripts
update_package_json

echo -e "${GREEN}Port cleanup complete!${NC}"