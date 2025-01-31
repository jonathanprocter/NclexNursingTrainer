#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}Enhancing server port configuration...${NC}"

# Create server utilities directory
mkdir -p server/utils

# Create port management utility
cat > server/utils/portManager.ts << EOF
import { createServer } from 'net';
import fs from 'fs/promises';
import path from 'path';

export class PortManager {
  private static readonly MIN_PORT = 3000;
  private static readonly MAX_PORT = 9000;
  private static readonly PORT_FILE = path.join(process.cwd(), '.port-lock');

  static async findAvailablePort(startPort: number = this.MIN_PORT): Promise<number> {
    const isPortAvailable = (port: number): Promise<boolean> => {
      return new Promise((resolve) => {
        const server = createServer();
        server.once('error', () => {
          resolve(false);
        });
        server.once('listening', () => {
          server.close();
          resolve(true);
        });
        server.listen(port);
      });
    };

    for (let port = startPort; port <= this.MAX_PORT; port++) {
      if (await isPortAvailable(port)) {
        await this.lockPort(port);
        return port;
      }
    }
    
    throw new Error('No available ports found');
  }

  static async lockPort(port: number): Promise<void> {
    try {
      await fs.writeFile(this.PORT_FILE, port.toString());
    } catch (error) {
      console.warn('Could not write port lock file:', error);
    }
  }

  static async getLockedPort(): Promise<number | null> {
    try {
      const port = await fs.readFile(this.PORT_FILE, 'utf-8');
      return parseInt(port, 10);
    } catch {
      return null;
    }
  }

  static async releasePort(): Promise<void> {
    try {
      await fs.unlink(this.PORT_FILE);
    } catch {
      // Ignore if file doesn't exist
    }
  }
}
EOF

# Create enhanced server configuration
cat > server/config/server.ts << EOF
import express from 'express';
import { PortManager } from '../utils/portManager';
import { errorHandler } from '../middleware/errorHandler';
import { healthCheck } from '../routes/health';

export class Server {
  private app = express();
  private port: number = 3000;

  constructor() {
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    
    // Add CORS handling for Replit environment
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
      if (req.method === 'OPTIONS') {
        return res.status(200).end();
      }
      next();
    });
  }

  private setupRoutes(): void {
    // Health check endpoint
    this.app.use('/health', healthCheck);

    // Add your routes here
    this.app.use('/api', require('../routes').default);

    // Error handling should be last
    this.app.use(errorHandler);
  }

  public async start(): Promise<void> {
    try {
      // Try to get locked port first
      const lockedPort = await PortManager.getLockedPort();
      this.port = lockedPort || await PortManager.findAvailablePort();

      const server = this.app.listen(this.port, () => {
        console.log(\`Server running on port \${this.port}\`);
      });

      // Handle graceful shutdown
      process.on('SIGTERM', () => this.shutdown(server));
      process.on('SIGINT', () => this.shutdown(server));
    } catch (error) {
      console.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  private async shutdown(server: any): Promise<void> {
    console.log('Shutting down server...');
    await PortManager.releasePort();
    server.close(() => {
      console.log('Server shut down');
      process.exit(0);
    });
  }
}
EOF

# Create health check route
cat > server/routes/health.ts << EOF
import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

export const healthCheck = router;
EOF

# Create error handler middleware
cat > server/middleware/errorHandler.ts << EOF
import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err.stack);
  
  // Handle specific types of errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      details: err.message
    });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: 'Unauthorized',
      details: 'Invalid or missing authentication'
    });
  }

  // Default error response
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred'
  });
};
EOF

# Update main server entry point
cat > server/index.ts << EOF
import { Server } from './config/server';

async function bootstrap() {
  try {
    const server = new Server();
    await server.start();
  } catch (error) {
    console.error('Failed to start application:', error);
    process.exit(1);
  }
}

bootstrap();
EOF

# Create environment variable handling
cat > server/config/env.ts << EOF
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env') });

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '0', 10),
  DATABASE_URL: process.env.DATABASE_URL,
  
  // Add your other environment variables here
  
  validate() {
    const requiredVars = ['DATABASE_URL'];
    for (const v of requiredVars) {
      if (!this[v]) {
        throw new Error(\`Missing required environment variable: \${v}\`);
      }
    }
  }
};
EOF

# Create script to update package.json
cat > update-scripts.js << EOF
const fs = require('fs');
const path = require('path');

const packageJsonPath = path.join(process.cwd(), 'package.json');
const packageJson = require(packageJsonPath);

// Update scripts
packageJson.scripts = {
  ...packageJson.scripts,
  "start": "ts-node server/index.ts",
  "dev": "nodemon --exec ts-node server/index.ts",
  "build": "tsc",
  "health-check": "curl http://localhost:\$(cat .port-lock)/health"
};

// Add required dependencies
const dependencies = {
  "express": "^4.18.2",
  "dotenv": "^16.3.1",
  "@types/express": "^4.17.21",
  "ts-node": "^10.9.2",
  "typescript": "^5.3.3",
  "nodemon": "^3.0.2"
};

packageJson.dependencies = {
  ...packageJson.dependencies,
  ...dependencies
};

// Write updated package.json
fs.writeFileSync(
  packageJsonPath,
  JSON.stringify(packageJson, null, 2)
);

console.log('Package.json updated successfully');
EOF

# Run the update script
node update-scripts.js

# Clean up temporary files
rm update-scripts.js

echo -e "${GREEN}Server port configuration has been enhanced!${NC}"
echo -e "The following improvements have been made:"
echo -e "1. Automatic port management with locking mechanism"
echo -e "2. Health check endpoint at /health"
echo -e "3. Graceful shutdown handling"
echo -e "4. Enhanced error handling"
echo -e "5. Environment variable validation"
echo -e "\nTo start the server:"
echo -e "1. Run ${BLUE}npm install${NC} to install dependencies"
echo -e "2. Run ${BLUE}npm run dev${NC} for development"
echo -e "3. Use ${BLUE}npm run health-check${NC} to verify the server is running"