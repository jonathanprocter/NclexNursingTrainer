#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}Fixing server imports...${NC}"

# Update package.json to use CommonJS
cat > package.json << 'EOL'
{
  "name": "nclex-prep",
  "version": "1.0.0",
  "type": "commonjs",
  "scripts": {
    "dev:client": "vite",
    "dev:server": "tsx watch server/index.ts",
    "dev": "concurrently \"npm run dev:client\" \"npm run dev:server\"",
    "build:client": "vite build",
    "build:server": "tsc -p tsconfig.server.json",
    "build": "npm run build:client && npm run build:server",
    "start": "node dist/server/index.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "body-parser": "^1.20.2",
    "drizzle-orm": "^0.29.3",
    "wouter": "^3.0.0",
    "recharts": "^2.10.4",
    "@radix-ui/react-toast": "^1.1.5",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-scroll-area": "^1.0.5",
    "@radix-ui/react-label": "^2.0.2",
    "@radix-ui/react-dialog": "^1.0.5",
    "@tanstack/react-query": "^5.17.15",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/cors": "^2.8.17",
    "@types/node": "^20.11.5",
    "@types/react": "^18.2.48",
    "@types/react-dom": "^18.2.18",
    "typescript": "^5.3.3",
    "ts-node": "^10.9.2",
    "tsx": "^4.7.0",
    "vite": "^5.0.12",
    "@vitejs/plugin-react": "^4.2.1",
    "concurrently": "^8.2.2"
  }
}
EOL

# Create tsconfig.server.json for server-side TypeScript config
cat > tsconfig.server.json << 'EOL'
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "CommonJS",
    "lib": ["ES2020"],
    "moduleResolution": "node",
    "outDir": "dist/server",
    "rootDir": "server",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["server/**/*"],
  "exclude": ["client", "node_modules"]
}
EOL

# Update server/index.ts to use require syntax
mkdir -p server
cat > server/index.ts << 'EOL'
require('dotenv').config();
import express from 'express';
import cors from 'cors';
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();

// Security middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false }));

// CORS configuration for development
if (process.env.NODE_ENV === 'development') {
  app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
  }));
}

// Error handling
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

const PORT = parseInt(process.env.PORT || '3001', 10);
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

# Clean install
echo -e "${BLUE}Running clean install...${NC}"
rm -rf node_modules package-lock.json
npm install

echo -e "${GREEN}Server imports fixed!${NC}"
echo -e "${BLUE}Next steps:${NC}"
echo "1. Run 'npm run dev' to start the development server"