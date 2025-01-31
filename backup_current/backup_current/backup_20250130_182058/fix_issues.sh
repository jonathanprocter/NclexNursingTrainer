#!/usr/bin/env bash
# --------------------------------------------------------------
# fix_issues.sh
# 
# This script attempts to fix the top 10 critical issues you noted:
# 1. Analytics Service Connection (port fix)
# 2. WebSocket/HMR config issues
# 3. Port conflicts
# 4. CJS build deprecation in Vite
# 5. Unhandled promise rejections
# 6. CORS configuration
# 7. Concurrency process management
# 8. Type definition issues (analytics)
# 9. State management (Simulation)
# 10. Environment config
#
# Usage: bash fix_issues.sh
#
# After running, review the changes carefully to ensure correctness.
# --------------------------------------------------------------

set -e  # Exit if any command fails

########################################
# 0. BACKUPS (Recommended for Safety)  #
########################################

echo "Creating backups of critical files ..."
timestamp=$(date +%s)
backup_dir="backups_$timestamp"
mkdir -p "$backup_dir"

# Adjust file paths as needed:
cp client/src/components/dashboard/Analytics.tsx "$backup_dir/" 2>/dev/null || true
cp vite.config.ts "$backup_dir/" 2>/dev/null || true
cp server/index.ts "$backup_dir/" 2>/dev/null || true
cp server/vite.ts "$backup_dir/" 2>/dev/null || true
cp client/src/lib/ai-services.ts "$backup_dir/" 2>/dev/null || true
cp client/src/types/analytics.ts "$backup_dir/" 2>/dev/null || true
cp client/src/pages/practice/Simulation.tsx "$backup_dir/" 2>/dev/null || true
cp package.json "$backup_dir/" 2>/dev/null || true
cp .env "$backup_dir/" 2>/dev/null || true

echo "Backups created in $backup_dir/"
echo

##########################################
# 1. ANALYTICS SERVICE PORT (4002 -> 4003)
##########################################
echo "[1] Fixing Analytics Service port reference (4002 -> 4003) ..."
if [ -f "client/src/components/dashboard/Analytics.tsx" ]; then
  sed -i 's/localhost:4002/localhost:4003/g' client/src/components/dashboard/Analytics.tsx
  echo "Updated Analytics.tsx to use port 4003."
else
  echo "File client/src/components/dashboard/Analytics.tsx not found; skipping."
fi
echo

########################################
# 2. VITE WEBSOCKET / HMR CONFIG FIXES #
########################################
echo "[2] Fixing Vite WebSocket/HMR config in vite.config.ts ..."
if [ -f "vite.config.ts" ]; then
  # Example: Ensure correct HMR config or remove forced WS port
  sed -i 's/hmr: { protocol:.*/hmr: { protocol: "ws" },/g' vite.config.ts || true
  # If you have a line referencing wsPort, fix or remove it:
  # sed -i 's/wsPort: 4002/wsPort: 4003/g' vite.config.ts || true
  echo "Ensured HMR uses proper WebSocket settings (if applicable)."
else
  echo "File vite.config.ts not found; skipping."
fi
echo

#################################
# 3. PORT CONFLICTS (SERVER)    #
#################################
echo "[3] Resolving port conflicts in server/index.ts ..."
if [ -f "server/index.ts" ]; then
  # Example: unify the port usage to 4003
  sed -i 's/const PORT.*/const PORT = process.env.PORT || 4003;/g' server/index.ts
  # Remove or comment out the “Port 4002 is in use. Retrying...” logic if it exists
  sed -i 's/Port 4002 is in use\. Retrying\.\.\.//g' server/index.ts
  echo "Unified server port to 4003 and removed retry references."
else
  echo "File server/index.ts not found; skipping."
fi
echo

###################################################
# 4. CJS BUILD DEPRECATION (REPLACE WITH ESM/ES6) #
###################################################
echo "[4] Replacing deprecated CJS references in vite.config.ts and server/vite.ts ..."
if [ -f "vite.config.ts" ]; then
  # Very naive approach: replace 'require(' with 'import(' if present
  sed -i 's/require(/import(/g' vite.config.ts || true
  echo "Attempted partial CJS-to-ESM fix in vite.config.ts."
fi

if [ -f "server/vite.ts" ]; then
  sed -i 's/require(/import(/g' server/vite.ts || true
  echo "Attempted partial CJS-to-ESM fix in server/vite.ts."
fi
echo

################################################
# 5. UNHANDLED PROMISE REJECTIONS (ai-services) #
################################################
echo "[5] Adding basic error-handling in client/src/lib/ai-services.ts ..."
if [ -f "client/src/lib/ai-services.ts" ]; then
  # Naive approach: if there's a .then((res) => res.json()), add a .catch() afterward
  sed -i '/fetch(/,/\.then((res) => res.json())/{
/\.then((res) => res.json())/a \      .catch((err) => { console.error("AI Service error:", err); })
}' client/src/lib/ai-services.ts
  echo "Added basic catch blocks for fetch calls in ai-services.ts."
else
  echo "File client/src/lib/ai-services.ts not found; skipping."
fi
echo

####################################
# 6. ENABLE CORS (server/index.ts) #
####################################
echo "[6] Enabling CORS in server/index.ts ..."
if [ -f "server/index.ts" ]; then
  # Insert a basic CORS config if not already present
  if ! grep -q "app.use(cors(" server/index.ts; then
    sed -i '/express();/a\
import cors from "cors";\
app.use(cors({\
  origin: "*",\
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],\
}));\
' server/index.ts
    echo "Added basic CORS configuration in server/index.ts."
  else
    echo "CORS configuration seems to exist already; skipping."
  fi
else
  echo "File server/index.ts not found; skipping."
fi
echo

#################################################
# 7. CONCURRENT PROCESS MANAGEMENT (package.json)
#################################################
echo "[7] Updating concurrency in package.json ..."
if [ -f "package.json" ]; then
  # Example: unify scripts to avoid conflicting concurrency
  sed -i 's/"dev-client": ".*"/"dev-client": "vite --port 3000"/g' package.json || true
  sed -i 's/"dev-server": ".*"/"dev-server": "ts-node server\/index.ts"/g' package.json || true
  # If start script is conflicting, unify it:
  sed -i 's/"start": ".*"/"start": "npm run dev-server"/g' package.json || true
  echo "Updated dev scripts to reduce concurrency issues in package.json."
else
  echo "File package.json not found; skipping."
fi
echo

##########################################
# 8. FIX TS TYPE ISSUES (analytics)      #
##########################################
echo "[8] Fixing TypeScript analytics definitions ..."
if [ -f "client/src/types/analytics.ts" ]; then
  # Example fix: replace a placeholder type with a real interface
  sed -i 's/type AnalyticsData = any;/interface AnalyticsData {\n  id: string;\n  value: number;\n}/g' client/src/types/analytics.ts
  echo "Replaced 'any' with a sample interface in analytics.ts."
else
  echo "File client/src/types/analytics.ts not found; skipping."
fi
echo

####################################################
# 9. STATE MANAGEMENT IN SIMULATION (Simulation.tsx)
####################################################
echo "[9] Adding cleanup to avoid potential memory leak in Simulation.tsx ..."
if [ -f "client/src/pages/practice/Simulation.tsx" ]; then
  # Check for a useEffect, and if there's no cleanup, add a basic one:
  # This approach tries to insert a cleanup function if it finds a `useEffect((` block
  sed -i '/useEffect(/,/^}/ {
    /return () => {/!b
  }
  /useEffect(/,/^}/ s/return () => {}/return () => {\n      console.log("Cleanup Simulation on unmount");\n    }/' client/src/pages/practice/Simulation.tsx

  echo "Attempted to insert or update cleanup function inside Simulation's useEffect."
else
  echo "File client/src/pages/practice/Simulation.tsx not found; skipping."
fi
echo

####################################################
# 10. ENVIRONMENT CONFIG (.env and server/index.ts)
####################################################
echo "[10] Updating environment config (.env, server/index.ts) ..."
# Append environment variables if they aren't present
if [ -f ".env" ]; then
  if ! grep -q "PORT=" .env; then
    echo "PORT=4003" >> .env
  fi
  if ! grep -q "ANALYTICS_PORT=" .env; then
    echo "ANALYTICS_PORT=4003" >> .env
  fi
  echo "Environment variables added to .env."
else
  echo "PORT=4003" > .env
  echo "ANALYTICS_PORT=4003" >> .env
  echo "Created a new .env with PORT and ANALYTICS_PORT."
fi

# Insert dotenv load into server/index.ts if missing
if [ -f "server/index.ts" ]; then
  if ! grep -q "dotenv" server/index.ts; then
    sed -i '1i\
import dotenv from "dotenv";\
dotenv.config();\
' server/index.ts
    echo "Inserted dotenv import/config at the top of server/index.ts."
  else
    echo "dotenv import seems to exist already; skipping."
  fi
fi
echo

##########################################
# DONE
##########################################
echo "------------------------------------------------------"
echo "All fixes attempted. Please review code changes now!"
echo "------------------------------------------------------"