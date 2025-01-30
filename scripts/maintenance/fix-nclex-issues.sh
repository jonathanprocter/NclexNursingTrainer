#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}Starting NCLEX App Issue Fix...${NC}"

# Ensure we're in the workspace directory
WORKSPACE_DIR="/home/runner/workspace"
cd "$WORKSPACE_DIR" || exit

# Function to check if a file exists
check_file() {
    if [ ! -f "$1" ]; then
        echo -e "${RED}Missing file: $1${NC}"
        return 1
    fi
    return 0
}

# Function to fix import paths
fix_imports() {
    local file="$1"
    if [ -f "$file" ]; then
        echo -e "${BLUE}Fixing imports in $file...${NC}"
        sed -i 's|@/components/ui|../components/ui|g' "$file"
        sed -i 's|@/components|../components|g' "$file"
        sed -i 's|@/hooks|../hooks|g' "$file"
        sed -i 's|@/lib|../lib|g' "$file"
    fi
}

# Fix package.json if needed
fix_package_json() {
    if [ ! -f "package.json" ]; then
        echo -e "${RED}package.json not found!${NC}"
        return
    fi

    echo -e "${BLUE}Checking package.json...${NC}"
    local deps=(
        "@radix-ui/react-dialog"
        "@radix-ui/react-radio-group"
        "@radix-ui/react-label"
        "@tanstack/react-query"
        "class-variance-authority"
        "clsx"
        "lucide-react"
        "tailwind-merge"
    )

    for dep in "${deps[@]}"; do
        if ! grep -q "\"$dep\"" package.json; then
            echo -e "${BLUE}Installing missing dependency: $dep${NC}"
            npm install "$dep" --save
        fi
    done
}

# Fix build issues
fix_build_issues() {
    echo -e "${BLUE}Fixing build issues...${NC}"

    if [ -f "tsconfig.json" ]; then
        echo -e "${BLUE}Updating tsconfig.json...${NC}"
        if ! grep -q "\"baseUrl\"" tsconfig.json; then
            sed -i '/"compilerOptions": {/a\    "baseUrl": ".",\n    "paths": {\n      "@/*": ["./src/*"]\n    },' tsconfig.json
        fi
    fi

    if [ -f "vite.config.ts" ]; then
        echo -e "${BLUE}Updating vite.config.ts...${NC}"
        cat > "vite.config.ts" << 'EOL'
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
EOL
    fi
}

# Fix component issues
fix_component_issues() {
    echo -e "${BLUE}Checking and fixing components...${NC}"
    
    local components_dir="$WORKSPACE_DIR/client/src/components"
    local question_card="$components_dir/QuestionCard.tsx"
    
    if [ -f "$question_card" ]; then
        fix_imports "$question_card"
    fi

    local questions_page="$WORKSPACE_DIR/client/src/pages/Questions.tsx"
    if [ -f "$questions_page" ]; then
        fix_imports "$questions_page"
    fi

    local utils_file="$WORKSPACE_DIR/client/src/lib/utils.ts"
    if [ ! -f "$utils_file" ]; then
        echo -e "${BLUE}Creating utils.ts...${NC}"
        mkdir -p "$(dirname "$utils_file")"
        cat > "$utils_file" << 'EOL'
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
EOL
    fi
}

# Main execution
echo -e "${BLUE}Running comprehensive fix...${NC}"

fix_package_json
fix_build_issues
fix_component_issues

# Final verification
echo -e "${BLUE}Running final verification...${NC}"

critical_files=(
    "client/src/components/QuestionCard.tsx"
    "client/src/pages/Questions.tsx"
    "server/routes/questions.ts"
    "server/db/schema.ts"
)

missing_files=0
for file in "${critical_files[@]}"; do
    if ! check_file "$WORKSPACE_DIR/$file"; then
        missing_files=$((missing_files + 1))
    fi
done

if [ $missing_files -gt 0 ]; then
    echo -e "${RED}Warning: $missing_files critical files are missing. Run setup-nclex.sh first.${NC}"
else
    echo -e "${GREEN}All critical files are present.${NC}"
fi

# Clean and rebuild node_modules if needed
if [ ! -d "node_modules" ] || [ ! -f "node_modules/.package-lock.json" ]; then
    echo -e "${BLUE}Reinstalling dependencies...${NC}"
    rm -rf node_modules package-lock.json
    npm install
fi

echo -e "${GREEN}Fix complete!${NC}"
echo -e "${BLUE}Next steps:${NC}"
echo "1. Run 'npm run build' to verify the build"
echo "2. If build succeeds, run 'npm run dev'"
echo "3. If issues persist, check the error messages and run this script again"