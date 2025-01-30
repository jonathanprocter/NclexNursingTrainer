#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}Starting Build Fix...${NC}"

# Ensure we're in the workspace directory
WORKSPACE_DIR="/home/runner/workspace"
cd "$WORKSPACE_DIR" || exit

# Create client directory if it doesn't exist
mkdir -p client/src

# Create index.html if it doesn't exist
echo -e "${BLUE}Creating index.html...${NC}"
cat > client/index.html << 'EOL'
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>NCLEX Prep</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
EOL

# Create main.tsx if it doesn't exist
echo -e "${BLUE}Creating main.tsx...${NC}"
mkdir -p client/src
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

# Create App.tsx if it doesn't exist
echo -e "${BLUE}Creating App.tsx...${NC}"
cat > client/src/App.tsx << 'EOL'
import Questions from './pages/Questions'

function App() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto py-8">
        <Questions />
      </main>
    </div>
  )
}

export default App
EOL

# Create index.css if it doesn't exist
echo -e "${BLUE}Creating index.css...${NC}"
cat > client/src/index.css << 'EOL'
@tailwind base;
@tailwind components;
@tailwind utilities;
 
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
  }
}
 
@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
EOL

# Update vite.config.ts
echo -e "${BLUE}Updating vite.config.ts...${NC}"
cat > vite.config.ts << 'EOL'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  root: './client',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client/src'),
    },
  },
  build: {
    outDir: '../dist/client',
    emptyOutDir: true
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
EOL

# Update package.json scripts
echo -e "${BLUE}Updating package.json scripts...${NC}"
if [ -f "package.json" ]; then
    # Create a temporary file
    TMP_FILE=$(mktemp)
    jq '.scripts = {
        "dev:client": "vite",
        "dev:server": "tsx watch server/index.ts",
        "dev": "concurrently \"npm run dev:client\" \"npm run dev:server\"",
        "build:client": "vite build",
        "build:server": "esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
        "build": "npm run build:client && npm run build:server",
        "start": "node dist/index.js"
    }' package.json > "$TMP_FILE" && mv "$TMP_FILE" package.json

    # Install necessary dependencies
    echo -e "${BLUE}Installing necessary dependencies...${NC}"
    npm install -D vite @vitejs/plugin-react concurrently tsx esbuild @types/react @types/react-dom
fi

echo -e "${GREEN}Build fix complete!${NC}"
echo -e "${BLUE}Next steps:${NC}"
echo "1. Run 'npm install' to ensure all dependencies are installed"
echo "2. Run 'npm run build' to verify the build"
echo "3. Run 'npm run dev' to start the development server"