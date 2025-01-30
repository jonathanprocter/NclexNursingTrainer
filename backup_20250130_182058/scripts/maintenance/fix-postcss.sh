#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}Fixing PostCSS configuration...${NC}"

# Update postcss.config.js to use ESM syntax
cat > postcss.config.cjs << 'EOL'
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOL

# Remove old config if it exists
rm -f postcss.config.js

# Update vite.config.ts to handle PostCSS
cat > vite.config.ts << 'EOL'
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

export default defineConfig({
  plugins: [react()],
  root: './client',
  css: {
    postcss: {
      plugins: [
        tailwindcss(),
        autoprefixer(),
      ],
    },
  },
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

# Update tailwind.config.js to use .cjs extension
mv tailwind.config.js tailwind.config.cjs 2>/dev/null

echo -e "${BLUE}Installing/updating dependencies...${NC}"
npm install -D tailwindcss postcss autoprefixer

echo -e "${GREEN}PostCSS configuration fixed!${NC}"
echo -e "${BLUE}Next steps:${NC}"
echo "1. Run 'npm run build' to create production build"