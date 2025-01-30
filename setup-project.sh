#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}Starting NCLEX App Setup...${NC}"

# Ensure we're in the workspace directory
WORKSPACE_DIR="/home/runner/workspace"
cd "$WORKSPACE_DIR"

# Function to create directory if it doesn't exist
create_dir() {
    if [ ! -d "$1" ]; then
        mkdir -p "$1"
        echo -e "${GREEN}Created directory: $1${NC}"
    fi
}

# Function to create file with content
create_file() {
    local dir=$(dirname "$1")
    create_dir "$dir"
    if [ ! -f "$1" ]; then
        touch "$1"
        echo -e "${GREEN}Created file: $1${NC}"
    fi
}

# Create directory structure
echo -e "${BLUE}Creating directory structure...${NC}"
create_dir "$WORKSPACE_DIR/client/src/components"
create_dir "$WORKSPACE_DIR/client/src/components/ui"
create_dir "$WORKSPACE_DIR/client/src/pages"
create_dir "$WORKSPACE_DIR/client/src/hooks"
create_dir "$WORKSPACE_DIR/client/src/lib"
create_dir "$WORKSPACE_DIR/server/routes"
create_dir "$WORKSPACE_DIR/server/db"

# Check and create necessary files
echo -e "${BLUE}Checking required files...${NC}"

# List of required files to check
FILES_TO_CHECK=(
    "client/src/components/QuestionCard.tsx"
    "client/src/pages/Questions.tsx"
    "client/src/lib/utils.ts"
    "server/routes/questions.ts"
    "server/db/schema.ts"
)

for file in "${FILES_TO_CHECK[@]}"; do
    create_file "$WORKSPACE_DIR/$file"
done

# Verify dependencies in package.json
echo -e "${BLUE}Verifying package.json dependencies...${NC}"
if [ -f "package.json" ]; then
    # Add any missing dependencies
    required_deps=(
        "@radix-ui/react-dialog"
        "@radix-ui/react-radio-group"
        "@radix-ui/react-label"
        "@tanstack/react-query"
        "class-variance-authority"
        "clsx"
        "lucide-react"
        "tailwind-merge"
    )
    
    for dep in "${required_deps[@]}"; do
        if ! grep -q "\"$dep\"" package.json; then
            echo -e "${RED}Missing dependency: $dep${NC}"
            npm install "$dep" --save
        fi
    done
else
    echo -e "${RED}package.json not found${NC}"
fi

# Verify imports and paths
echo -e "${BLUE}Verifying imports and paths...${NC}"
files_to_check=(
    $(find "$WORKSPACE_DIR/client/src" -type f -name "*.tsx" -o -name "*.ts")
)

for file in "${files_to_check[@]}"; do
    # Check for incorrect import paths
    if grep -q "@/components/QuestionCard" "$file"; then
        echo -e "${RED}Found absolute import in $file. Consider using relative imports.${NC}"
    fi
done

# Set up git ignore if needed
if [ ! -f ".gitignore" ]; then
    echo -e "${BLUE}Creating .gitignore...${NC}"
    cat > .gitignore << EOL
node_modules/
.env
dist/
build/
*.log
.DS_Store
EOL
fi

echo -e "${BLUE}Setup complete!${NC}"
echo -e "${GREEN}Next steps:${NC}"
echo "1. Run 'npm install' if you haven't already"
echo "2. Check that all import paths are correct"
echo "3. Run 'npm run dev' to start the development server"