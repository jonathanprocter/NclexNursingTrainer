#!/bin/bash

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging functions
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

# Check required commands
check_requirements() {
    command -v npm >/dev/null 2>&1 || { error "npm is required but not installed"; exit 1; }
    command -v node >/dev/null 2>&1 || { error "node is required but not installed"; exit 1; }
}

# Environment setup function
setup_environment() {
    log "Setting up environment..."
    
    if [ -f .env ]; then
        cp .env .env.backup
        log "Created backup of .env file"
    fi

    cat > .env << 'EOF'
PORT=4003
API_URL=http://0.0.0.0:4003
NODE_ENV=development
VITE_DEV_SERVER_PORT=3000
VITE_DEV_SERVER_HOST=0.0.0.0
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
EOF
    
    log "Updated .env configuration"
}

# Vite configuration function
fix_vite_config() {
    log "Updating Vite configuration..."
    
    mkdir -p src
    
    cat > vite.config.ts << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    server: {
        host: '0.0.0.0',
        port: 3000,
        strictPort: true,
        proxy: {
            '/api': {
                target: 'http://localhost:4003',
                changeOrigin: true,
                secure: false,
            }
        }
    },
    build: {
        target: 'esnext',
        sourcemap: true
    }
})
EOF
    
    log "Vite configuration updated"
}

# Server configuration function
fix_server_config() {
    log "Updating server configuration..."
    
    mkdir -p server
    
    if [ -f server/index.ts ]; then
        cp server/index.ts server/index.ts.backup
        
        # Update CORS configuration
        sed -i 's/localhost:3000/0.0.0.0:3000/g' server/index.ts
        
        # Add error handling
        cat >> server/index.ts << 'EOF'

// Global error handling
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});
EOF
    else
        # Create new server/index.ts if it doesn't exist
        cat > server/index.ts << 'EOF'
import express from 'express';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 4003;

app.use(cors({
    origin: 'http://0.0.0.0:3000'
}));

app.use(express.json());

// Global error handling
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
EOF
    fi
    
    log "Server configuration updated"
}

# Database schema function
fix_database_schema() {
    log "Updating database schema..."
    
    mkdir -p server/db
    
    if [ -f server/db/schema.ts ]; then
        cp server/db/schema.ts server/db/schema.ts.backup
    fi
    
    cat > server/db/schema.ts << 'EOF'
import { z } from 'zod';
import { sql } from '@vercel/postgres';

export const UserSchema = z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    name: z.string(),
    createdAt: z.date(),
    updatedAt: z.date()
});

export const AnalyticsSchema = z.object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    eventType: z.string(),
    eventData: z.record(z.unknown()),
    timestamp: z.date()
});

export type User = z.infer<typeof UserSchema>;
export type Analytics = z.infer<typeof AnalyticsSchema>;

export async function syncSchema() {
    try {
        await sql`
            CREATE TABLE IF NOT EXISTS users (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                email TEXT UNIQUE NOT NULL,
                name TEXT NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS analytics (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                user_id UUID REFERENCES users(id),
                event_type TEXT NOT NULL,
                event_data JSONB NOT NULL DEFAULT '{}',
                timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `;
        return true;
    } catch (error) {
        console.error('Schema sync error:', error);
        return false;
    }
}
EOF
    
    log "Database schema updated"
}

# Update package.json function
update_package_json() {
    log "Updating package.json..."
    
    if [ -f package.json ]; then
        cp package.json package.json.backup
    fi
    
    cat > package.json << 'EOF'
{
  "name": "replit-workflow-fix",
  "version": "1.0.0",
  "scripts": {
    "dev": "concurrently \"npm run dev:client\" \"npm run dev:server\"",
    "dev:client": "vite",
    "dev:server": "ts-node-dev --respawn --transpile-only server/index.ts",
    "build": "tsc && vite build",
    "serve": "vite preview",
    "type-check": "tsc --noEmit",
    "lint": "eslint . --ext .ts,.tsx",
    "test": "jest"
  },
  "dependencies": {
    "@vercel/postgres": "^0.10.0",
    "cors": "^2.8.5",
    "express": "^4.18.2",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "@types/cors": "^2.8.17",
    "@types/express": "^4.17.21",
    "@types/node": "^20.11.0",
    "@types/react": "^18.2.48",
    "@types/react-dom": "^18.2.18",
    "@vitejs/plugin-react": "^4.2.1",
    "concurrently": "^8.2.2",
    "eslint": "^8.56.0",
    "jest": "^29.7.0",
    "ts-node-dev": "^2.0.0",
    "typescript": "^5.3.3",
    "vite": "^5.0.12"
  }
}
EOF
    
    log "Running npm install..."
    if ! npm install; then
        error "Failed to install dependencies"
        return 1
    fi
    
    log "Package.json updated and dependencies installed"
}

# Create basic TypeScript configuration
create_tsconfig() {
    log "Creating TypeScript configuration..."
    
    cat > tsconfig.json << 'EOF'
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
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src", "server"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
EOF

    cat > tsconfig.node.json << 'EOF'
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
EOF
    
    log "TypeScript configuration created"
}

# Main function
main() {
    log "Starting workflow fix script..."
    
    # Create backup directory
    mkdir -p backups/$(date +%Y%m%d_%H%M%S)
    
    # Check requirements first
    check_requirements
    
    # Run all fixes
    setup_environment || exit 1
    fix_vite_config || exit 1
    fix_server_config || exit 1
    fix_database_schema || exit 1
    create_tsconfig || exit 1
    update_package_json || exit 1
    
    log "All fixes have been applied successfully"
    log "Please review the changes and test the application"
}

# Execute main function
main