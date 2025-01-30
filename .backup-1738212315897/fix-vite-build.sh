#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}Starting Vite Build Fix...${NC}"

# Ensure we're in the workspace directory
WORKSPACE_DIR="/home/runner/workspace"
cd "$WORKSPACE_DIR" || exit

# Create client structure
mkdir -p client/src

# Move existing src files to client/src if they exist
if [ -d "src" ]; then
  mv src/* client/src/ 2>/dev/null
fi

# Create client/index.html
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

# Create client/src/main.tsx
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

# Create client/src/index.css
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

# Create tailwind.config.js
cat > tailwind.config.js << 'EOL'
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './client/src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
}
EOL

# Create postcss.config.js
cat > postcss.config.js << 'EOL'
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOL

# Update vite.config.ts
cat > vite.config.ts << 'EOL'
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  root: './client',
  build: {
    outDir: '../dist/client',
    emptyOutDir: true
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
    watch: {
      usePolling: true,
      interval: 100,
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client/src'),
    },
  },
});
EOL

# Create new package.json with updated scripts
cat > package.json << 'EOL'
{
  "name": "nclex-prep",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev:client": "vite",
    "dev:server": "tsx watch server/index.ts",
    "dev": "concurrently \"npm run dev:client\" \"npm run dev:server\"",
    "build:client": "vite build",
    "build:server": "esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist/server",
    "build": "npm run build:client && npm run build:server",
    "start": "node dist/server/index.js"
  },
  "dependencies": {
    "@radix-ui/react-dialog": "latest",
    "@radix-ui/react-radio-group": "latest",
    "@radix-ui/react-label": "latest",
    "@tanstack/react-query": "latest",
    "class-variance-authority": "latest",
    "clsx": "latest",
    "lucide-react": "latest",
    "tailwind-merge": "latest",
    "react": "latest",
    "react-dom": "latest"
  },
  "devDependencies": {
    "@types/react": "latest",
    "@types/react-dom": "latest",
    "@vitejs/plugin-react": "latest",
    "autoprefixer": "latest",
    "concurrently": "latest",
    "esbuild": "latest",
    "postcss": "latest",
    "tailwindcss": "latest",
    "tsx": "latest",
    "typescript": "latest",
    "vite": "latest"
  }
}
EOL

# Install dependencies
echo -e "${BLUE}Installing dependencies...${NC}"
npm install

echo -e "${GREEN}Vite build fix complete!${NC}"
echo -e "${BLUE}Next steps:${NC}"
echo "1. Run 'npm run dev' to start development servers"
echo "2. Or run 'npm run build' to create production build"