#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}Installing all dependencies...${NC}"

# Clean existing dependencies
rm -rf node_modules
rm -f package-lock.json

# Install core React dependencies
npm install react react-dom @types/react @types/react-dom

# Install PostCSS and Tailwind dependencies
npm install -D tailwindcss postcss autoprefixer postcss-nesting

# Update postcss.config.cjs
cat > postcss.config.cjs << 'EOL'
module.exports = {
  plugins: {
    'postcss-nesting': {},
    tailwindcss: {},
    autoprefixer: {},
  }
}
EOL

# Update package.json
cat > package.json << 'EOL'
{
  "name": "nclex-prep",
  "version": "1.0.0",
  "type": "commonjs",
  "scripts": {
    "dev:client": "./node_modules/.bin/vite --port 3000",
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

# Update vite.config.ts
cat > vite.config.ts << 'EOL'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    strictPort: true,
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

# Update server port in server/index.ts
cat > server/index.ts << 'EOL'
require('dotenv').config();
import express from 'express';
import cors from 'cors';
import { registerRoutes } from "./routes";

const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false }));

if (process.env.NODE_ENV === 'development') {
  app.use(cors({
    origin: 'http://localhost:3000',
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

const PORT = parseInt(process.env.PORT || '5001', 10);
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

# Create client/src directory
mkdir -p client/src

# Create minimal index.html
cat > client/index.html << 'EOL'
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>NCLEX Prep</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
EOL

# Create minimal client/src/main.tsx
cat > client/src/main.tsx << 'EOL'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
EOL

# Create minimal client/src/App.tsx
cat > client/src/App.tsx << 'EOL'
import React from 'react'

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <h1>NCLEX Prep</h1>
    </div>
  )
}

export default App
EOL

# Create minimal client/src/index.css
cat > client/src/index.css << 'EOL'
@tailwind base;
@tailwind components;
@tailwind utilities;
EOL

# Install dependencies
echo -e "${BLUE}Installing dependencies...${NC}"
npm install

echo -e "${GREEN}All dependencies installed and configurations updated!${NC}"
echo -e "${BLUE}Next steps:${NC}"
echo "1. Run 'npm run dev' to start the development server"