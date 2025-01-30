#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}Fixing port conflicts...${NC}"

# Update package.json with new ports
cat > package.json << 'EOL'
{
  "name": "nclex-prep",
  "version": "1.0.0",
  "type": "commonjs",
  "scripts": {
    "dev:client": "./node_modules/.bin/vite --port 4000",
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
    "body-parser": "^1.20.2",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/cors": "^2.8.17",
    "@types/express": "^4.17.21",
    "@types/node": "^20.11.5",
    "@types/react": "^18.2.48",
    "@types/react-dom": "^18.2.18",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.17",
    "concurrently": "^8.2.2",
    "postcss": "^8.4.33",
    "postcss-nesting": "^12.0.2",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.3.3",
    "tsx": "^4.7.0",
    "vite": "^5.0.12"
  }
}
EOL

# Update server/index.ts with new port
cat > server/index.ts << 'EOL'
require('dotenv').config();
import express from 'express';
import cors from 'cors';

const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false }));

if (process.env.NODE_ENV === 'development') {
  app.use(cors({
    origin: 'http://localhost:4000',
    credentials: true
  }));
}

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error:', err);
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ 
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = parseInt(process.env.PORT || '4001', 10);
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log('=================================');
  console.log('Server started successfully');
  console.log(`Server is running on port ${PORT}`);
  console.log(`Access URL: http://${HOST}:${PORT}`);
  console.log('=================================');
});

export default app;
EOL

# Update vite.config.ts
cat > vite.config.ts << 'EOL'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 4000,
    strictPort: false,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:4001',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom']
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client/src')
    }
  }
})
EOL

# Create .env file
cat > .env << 'EOL'
PORT=4001
FRONTEND_URL=http://localhost:4000
NODE_ENV=development
EOL

# Kill any existing processes on the ports we want to use
echo -e "${BLUE}Killing any processes using ports 4000 and 4001...${NC}"
pkill -f "node"
sleep 2

# Clean node_modules and package-lock.json
echo -e "${BLUE}Cleaning node_modules...${NC}"
rm -rf node_modules package-lock.json
npm install

echo -e "${GREEN}Port configuration updated!${NC}"
echo -e "${BLUE}Next steps:${NC}"
echo "1. Run 'npm run dev' to start the development server"