#!/bin/bash

# Color codes for output
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

# Update Vite configuration
update_vite_config() {
    log "Updating Vite configuration..."

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
        },
        // Allow all Replit domains and local development
        allowedHosts: [
            'localhost',
            '0.0.0.0',
            '.replit.dev',
            '.repl.co'
        ]
    },
    build: {
        target: 'esnext',
        sourcemap: true
    }
})
EOF

    log "Vite configuration updated with Replit domains"
}

# Update server CORS configuration
update_server_cors() {
    log "Updating server CORS configuration..."

    cat > server/index.ts << 'EOF'
import express from 'express';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 4003;

// Configure CORS to allow Replit domains
app.use(cors({
    origin: [
        'http://localhost:3000',
        'http://0.0.0.0:3000',
        /\.replit\.dev$/,
        /\.repl\.co$/
    ],
    credentials: true
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

app.get('/', (req, res) => {
    res.json({ message: 'Server is running' });
});

app.listen(port, '0.0.0.0', () => {
    console.log('=================================');
    console.log('Server started successfully');
    console.log(`Server is running on port ${port}`);
    console.log('Frontend URL: http://0.0.0.0:3000');
    console.log('Access URL: http://0.0.0.0:4003');
    console.log('=================================');
});

export default app;
EOF

    log "Server CORS configuration updated"
}

# Main execution
main() {
    log "Starting Replit configuration fix..."

    # Create backups
    if [ -f vite.config.ts ]; then
        cp vite.config.ts vite.config.ts.backup
    fi

    if [ -f server/index.ts ]; then
        cp server/index.ts server/index.ts.backup
    fi

    # Apply updates
    update_vite_config
    update_server_cors

    log "Configuration updates complete"
    log "Please restart your development server using: npm run dev"
}

# Execute main function
main