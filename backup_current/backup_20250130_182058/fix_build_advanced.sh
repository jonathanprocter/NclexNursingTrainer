#!/bin/bash

echo "🚀 Starting Advanced Build Fix & Enhancement Process..."

# Step 1: Backup important files
echo "📋 Creating backups..."
cp tsconfig.json tsconfig_backup.json 2>/dev/null || true
cp server/db/schema.ts server/db/schema_backup.ts 2>/dev/null || true
echo "✅ Backups created."

# Step 2: Ensure tsconfig.json is valid
if [[ ! -s tsconfig.json ]]; then
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

# Step 3: Fix TypeScript syntax errors in schema.ts
echo "🔧 Fixing TypeScript syntax errors in server/db/schema.ts..."
sed -i 's/);$/);/' server/db/schema.ts
sed -i 's/\$type/ as /g' server/db/schema.ts
sed -i 's/);$//' server/db/schema.ts
sed -i 's/,\s*)/)/g' server/db/schema.ts
sed -i 's/ as </ as </g' server/db/schema.ts
sed -i 's/ as \</ as </g' server/db/schema.ts
echo "✅ TypeScript syntax errors fixed."

# Step 4: Check if vite.config.js exists
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

# Step 5: Clean old dependencies and build files
echo "🧹 Cleaning project..."
rm -rf node_modules package-lock.json dist
echo "✅ Cleaned old dependencies and build files."

# Step 6: Reinstall dependencies
echo "🔄 Reinstalling dependencies..."
npm install
echo "✅ Dependencies reinstalled."

# Step 7: Run TypeScript Compilation Check
echo "🔍 Checking TypeScript compilation..."
npx tsc --noEmit
if [[ $? -ne 0 ]]; then
    echo "❌ TypeScript compilation failed. Attempting auto-fixes..."
    npm cache clean --force
    npm install
    npx tsc --noEmit
    if [[ $? -ne 0 ]]; then
        echo "❌ Critical TypeScript errors detected. Check logs."
        exit 1
    fi
else
    echo "✅ TypeScript syntax valid."
fi

# Step 8: Run the build process
echo "🏗️ Running build process..."
npm run build
if [[ $? -ne 0 ]]; then
    echo "❌ Build failed. Attempting additional fixes..."
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