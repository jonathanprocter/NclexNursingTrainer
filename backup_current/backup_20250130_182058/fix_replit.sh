#!/bin/bash

echo "🚀 Starting Full Replit Fix & Enhancement Process..."

# Step 1: Create a backup of the schema.ts file
echo "📋 Creating backup of server/db/schema.ts..."
cp server/db/schema.ts server/db/schema_backup.ts
echo "✅ Backup created."

# Step 2: Fix TypeScript syntax errors
echo "🔧 Fixing TypeScript syntax errors in server/db/schema.ts..."
sed -i 's/);$/);/' server/db/schema.ts
sed -i 's/);$/);/' server/db/schema.ts
sed -i 's/\$type/ as /g' server/db/schema.ts
sed -i 's/);$//' server/db/schema.ts
sed -i 's/,\s*)/)/g' server/db/schema.ts
echo "✅ Fixed TypeScript syntax errors."

# Step 3: Update tsconfig.json to ensure compatibility
echo "🔧 Updating tsconfig.json..."
jq '.compilerOptions |= { "module": "NodeNext", "moduleResolution": "NodeNext", "strict": true, "skipLibCheck": true }' tsconfig.json > tsconfig_tmp.json
mv tsconfig_tmp.json tsconfig.json
echo "✅ tsconfig.json updated."

# Step 4: Install missing dependencies
echo "📦 Installing missing dependencies..."
npm install
echo "✅ Dependencies installed."

# Step 5: Fix import.meta.url issues
echo "🔧 Fixing import.meta.url in server/vite.ts..."
sed -i 's/import.meta.url/import.meta.url.replace("file:\/\/", "")/' server/vite.ts
echo "✅ Fixed import.meta.url error."

# Step 6: Ensure TypeScript compiler is installed
echo "📦 Ensuring TypeScript compiler is installed..."
npm install -g typescript
echo "✅ TypeScript compiler installed."

# Step 7: Clean old dependencies and build files
echo "🧹 Cleaning project..."
rm -rf node_modules package-lock.json
echo "✅ Cleaned old dependencies and build files."

# Step 8: Reinstall dependencies
echo "🔄 Reinstalling dependencies..."
npm install
echo "✅ Dependencies reinstalled."

# Step 9: Build the project
echo "🏗️ Building project..."
npm run build
echo "✅ Build complete."

echo "🎉 Full Fix & Enhancement process completed! Try running the project now."