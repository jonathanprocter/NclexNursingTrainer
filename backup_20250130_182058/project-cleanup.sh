#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Starting cleanup process...${NC}"

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check if jq is installed (needed for package.json processing)
if ! command_exists jq; then
    echo -e "${RED}jq is required but not installed. Installing...${NC}"
    if command_exists apt-get; then
        sudo apt-get update && sudo apt-get install -y jq
    elif command_exists brew; then
        brew install jq
    else
        echo -e "${RED}Could not install jq. Please install it manually.${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}1. Cleaning up node_modules and lock files...${NC}"
# Clean up node_modules and lock files
rm -rf node_modules
rm -f package-lock.json
rm -f yarn.lock
rm -f pnpm-lock.yaml

echo -e "${GREEN}2. Removing unnecessary files...${NC}"
# Remove unnecessary files
find . -name "*.map" -type f -delete
find . -name "*.d.ts" -type f -delete
find . -name ".DS_Store" -type f -delete
find . -name "*.log" -type f -delete

echo -e "${GREEN}3. Cleaning up build artifacts...${NC}"
# Clean up build artifacts
rm -rf dist
rm -rf build
rm -rf .cache
rm -rf .next
rm -rf out

echo -e "${GREEN}4. Creating standard directory structure...${NC}"
# Create standard directory structure
mkdir -p src/{components,pages,services,utils,styles,types,hooks}
mkdir -p server/{routes,services,db,middleware,config}
mkdir -p public/{assets,images}
mkdir -p scripts

echo -e "${GREEN}5. Moving files to appropriate directories...${NC}"
# Move files to appropriate directories
mv pages/* src/pages/ 2>/dev/null || true
mv routes/* server/routes/ 2>/dev/null || true
mv services/* src/services/ 2>/dev/null || true
mv providers/* src/components/ 2>/dev/null || true
mv types/* src/types/ 2>/dev/null || true

echo -e "${GREEN}6. Optimizing package.json...${NC}"
# Create a backup of package.json
cp package.json package.json.backup

# Remove duplicate dependencies and sort them
if [ -f package.json ]; then
    # Function to process dependencies
    process_deps() {
        echo "$1" | jq -r 'to_entries | sort_by(.key) | from_entries'
    }

    # Process both dependencies and devDependencies
    cat package.json | jq --arg time "$(date -u +"%Y-%m-%dT%H:%M:%SZ")" '
        .dependencies = (.dependencies | if . then
            to_entries | sort_by(.key) | unique_by(.key) | from_entries
        else . end) |
        .devDependencies = (.devDependencies | if . then
            to_entries | sort_by(.key) | unique_by(.key) | from_entries
        else . end) |
        .lastCleanup = $time
    ' > package.json.tmp && mv package.json.tmp package.json
fi

echo -e "${GREEN}7. Cleaning up empty directories...${NC}"
# Clean up empty directories
find . -type d -empty -delete

echo -e "${GREEN}8. Reinstalling dependencies...${NC}"
# Reinstall dependencies
if command_exists npm; then
    npm install
elif command_exists yarn; then
    yarn install
elif command_exists pnpm; then
    pnpm install
else
    echo -e "${RED}No package manager found. Please install dependencies manually.${NC}"
fi

echo -e "${GREEN}9. Creating/updating .gitignore...${NC}"
# Create or update .gitignore
cat > .gitignore << EOL
# Dependencies
node_modules/
.pnp/
.pnp.js

# Testing
/coverage/

# Production
/build/
/dist/
/.next/
/out/

# Misc
.DS_Store
*.pem
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# IDE
.idea/
.vscode/
*.swp
*.swo

# Temp files
*.log
.cache/
EOL

echo -e "${GREEN}10. Creating/updating README.md if it doesn't exist...${NC}"
# Create README.md if it doesn't exist
if [ ! -f README.md ]; then
    cat > README.md << EOL
# Project Name

## Description
Add your project description here.

## Setup
\`\`\`bash
npm install
npm run dev
\`\`\`

## Directory Structure
- \`/src\` - Source code
  - \`/components\` - React components
  - \`/pages\` - Page components
  - \`/services\` - Service logic
  - \`/utils\` - Utility functions
  - \`/styles\` - CSS/SCSS files
  - \`/types\` - TypeScript types
  - \`/hooks\` - React hooks
- \`/server\` - Server-side code
  - \`/routes\` - API routes
  - \`/services\` - Server services
  - \`/db\` - Database configuration
  - \`/middleware\` - Custom middleware
  - \`/config\` - Server configuration
- \`/public\` - Static files
  - \`/assets\` - General assets
  - \`/images\` - Image files
- \`/scripts\` - Build and utility scripts

## Available Scripts
- \`npm run dev\` - Run development server
- \`npm run build\` - Build for production
- \`npm start\` - Start production server
- \`npm test\` - Run tests
EOL
fi

echo -e "${BLUE}Cleanup complete! Your project structure has been optimized.${NC}"
echo -e "${BLUE}A backup of your original package.json has been saved as package.json.backup${NC}"
echo -e "${GREEN}Next steps:${NC}"
echo "1. Review the changes and make sure everything is in order"
echo "2. Run your application to ensure it works correctly"
echo "3. Commit the changes to version control"