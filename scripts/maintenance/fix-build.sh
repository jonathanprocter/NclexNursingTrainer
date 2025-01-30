#!/bin/bash

echo "🚀 Starting Build Fix & Enhancement Process..."

# Step 1: Backup tsconfig.json
if [[ -s tsconfig.json ]]; then
    echo "📋 Creating backup of tsconfig.json..."
    cp tsconfig.json tsconfig_backup.json
    echo "✅ Backup created."
else
    echo "⚠️ tsconfig.json is empty or missing. Regenerating..."
    cat > tsconfig.json <<EOF
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "skipLibCheck": true,
    "esModuleInterop": true
  },
  "include": ["server", "client"]
}
EOF
    echo "✅ tsconfig.json regenerated."
fi

# Step 2: Check if vite.config.js is valid
if [[ ! -f vite.config.js ]]; then
    echo "⚠️ vite.config.js is missing! Creating a basic one..."
    cat > vite.config.js <<EOF
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  }
});
EOF
    echo "✅ vite.config.js regenerated."
fi

# Step 3: Clean old dependencies and build files
echo "🧹 Cleaning project..."
rm -rf node_modules package-lock.json dist
echo "✅ Cleaned old dependencies and build files."

# Step 4: Reinstall dependencies
echo "🔄 Reinstalling dependencies..."
npm install
echo "✅ Dependencies reinstalled."

# Step 5: Rebuild the project
echo "🏗️ Running build process..."
npm run build
if [[ $? -ne 0 ]]; then
    echo "❌ Build failed. Checking for additional issues..."
    echo "🔄 Attempting to clean cache and rebuild..."
    npm cache clean --force
    rm -rf node_modules package-lock.json
    npm install
    npm run build
fi

if [[ $? -eq 0 ]]; then
    echo "✅ Build complete."
    echo "🎉 Fix & Enhancement process completed! Try running the project now."
else
    echo "❌ Build failed after multiple attempts. Check error logs."
fi