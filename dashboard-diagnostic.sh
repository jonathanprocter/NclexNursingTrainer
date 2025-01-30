#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Logging function
log() {
    echo -e "${2:-$GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

# Check if required tools are installed
check_requirements() {
    log "Checking required tools..." "$YELLOW"
    local tools=("node" "npm")
    local missing=0

    for tool in "${tools[@]}"; do
        if ! command -v "$tool" &> /dev/null; then
            log "Missing required tool: $tool" "$RED"
            missing=1
        fi
    done

    return $missing
}

# Check for port conflicts
check_ports() {
    log "Checking for port conflicts..." "$YELLOW"
    local ports=(4004 4005)

    for port in "${ports[@]}"; do
        if lsof -i:$port > /dev/null 2>&1; then
            log "Port $port is in use. This might cause conflicts." "$RED"
            return 1
        fi
    done

    log "No port conflicts found." "$GREEN"
    return 0
}

# Parse package.json without jq
check_dependencies() {
    log "Checking package.json dependencies..." "$YELLOW"

    if [ ! -f "package.json" ]; then
        log "package.json not found!" "$RED"
        return 1
    fi

    local required_deps=("react" "react-dom" "@types/react" "typescript" "axios")
    local missing_deps=()

    # Read package.json content
    local package_content=$(cat package.json)

    for dep in "${required_deps[@]}"; do
        if ! echo "$package_content" | grep -q "\"$dep\""; then
            missing_deps+=("$dep")
        fi
    done

    if [ ${#missing_deps[@]} -ne 0 ]; then
        log "Missing dependencies: ${missing_deps[*]}" "$RED"
        log "Installing missing dependencies..." "$YELLOW"
        npm install "${missing_deps[@]}"
    fi

    return 0
}

# Check and fix TypeScript configuration
check_tsconfig() {
    log "Checking TypeScript configuration..." "$YELLOW"

    if [ ! -f "tsconfig.json" ]; then
        log "tsconfig.json not found! Creating new configuration..." "$YELLOW"
        echo '{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src"]
}' > tsconfig.json
        log "Created new tsconfig.json with required options" "$GREEN"
        return 0
    fi

    local tsconfig_content=$(cat tsconfig.json)
    local required_options=("strict" "esModuleInterop" "jsx")
    local missing_options=()

    for option in "${required_options[@]}"; do
        if ! echo "$tsconfig_content" | grep -q "\"$option\""; then
            missing_options+=("$option")
        fi
    done

    if [ ${#missing_options[@]} -ne 0 ]; then
        log "Adding missing TypeScript options: ${missing_options[*]}" "$YELLOW"
        # Create a temporary file with updated configuration
        local temp_config=$(mktemp)
        echo "$tsconfig_content" | awk -v missing="${missing_options[*]}" '
        BEGIN { split(missing, opts) }
        /"compilerOptions".*{/ { 
            print $0
            for (i in opts) {
                print "    \"" opts[i] "\": true,"
            }
            next
        }
        { print }' > "$temp_config"

        # Replace original with updated config
        mv "$temp_config" tsconfig.json
        log "Updated tsconfig.json with missing options" "$GREEN"
    fi

    return 0
}

# Verify file structure
check_file_structure() {
    log "Checking file structure..." "$YELLOW"

    local required_files=(
        "src/pages/Dashboard.tsx"
        "src/components/dashboard/Analytics.tsx"
        "src/lib/axios.ts"
        "server/routes/analytics.ts"
    )

    local missing=0
    for file in "${required_files[@]}"; do
        if [ ! -f "$file" ]; then
            log "Missing required file: $file" "$RED"
            missing=1
        fi
    done

    return $missing
}

# Fix common issues
fix_common_issues() {
    log "Attempting to fix common issues..." "$YELLOW"

    # Fix port configuration
    if [ -f "src/lib/axios.ts" ] && grep -q "localhost:4004" src/lib/axios.ts; then
        log "Updating API base URL..." "$YELLOW"
        sed -i 's/localhost:4004/0.0.0.0:4005/g' src/lib/axios.ts
    fi

    # Check Dashboard component
    if [ -f "src/pages/Dashboard.tsx" ] && ! grep -q "ErrorBoundary" src/pages/Dashboard.tsx; then
        log "Error boundary missing in Dashboard component..." "$YELLOW"
    fi

    # Check CORS settings
    if [ -f "server/index.ts" ] && ! grep -q "cors()" server/index.ts; then
        log "CORS configuration missing..." "$YELLOW"
    fi

    return 0
}

# Clean and rebuild
clean_and_rebuild() {
    log "Cleaning and rebuilding project..." "$YELLOW"

    # Remove build artifacts
    rm -rf dist build node_modules/.cache

    # Reinstall dependencies
    npm ci || npm install

    # Rebuild project
    npm run build

    return 0
}

# Main execution
main() {
    log "Starting dashboard diagnostic..." "$YELLOW"

    # Run all checks
    check_requirements || exit 1
    check_ports || exit 1
    check_dependencies || exit 1
    check_tsconfig || exit 1
    check_file_structure || exit 1

    # Fix issues
    fix_common_issues

    # Clean and rebuild
    clean_and_rebuild

    log "Diagnostic complete. Please restart your development server." "$GREEN"
    return 0
}

# Run the script
main