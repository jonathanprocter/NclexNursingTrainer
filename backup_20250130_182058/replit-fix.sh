#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}Starting application enhancement for Replit environment...${NC}"

# Create backup of current state
timestamp=$(date +%Y%m%d_%H%M%S)
backup_dir="backup_${timestamp}"
mkdir -p "$backup_dir"

# Backup current files
echo -e "${BLUE}Creating backup...${NC}"
find . -maxdepth 1 -not -name ".*" -and -not -name "backup_*" -exec cp -r {} "$backup_dir/" \;

# Install dependencies locally instead of globally
echo -e "${BLUE}Installing dependencies...${NC}"
npm init -y

# Update package.json with necessary scripts and dependencies
npm pkg set scripts.dev="vite"
npm pkg set scripts.build="tsc && vite build"
npm pkg set scripts.preview="vite preview"
npm pkg set scripts.test="vitest"
npm pkg set scripts.lint="eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0"

# Install development dependencies
echo -e "${BLUE}Installing development dependencies...${NC}"
npm install --save-dev typescript \
    @types/node \
    @types/react \
    @types/react-dom \
    @typescript-eslint/eslint-plugin \
    @typescript-eslint/parser \
    eslint \
    prettier \
    vite \
    @vitejs/plugin-react \
    vitest \
    @testing-library/react \
    @testing-library/jest-dom \
    ts-node

# Install production dependencies
echo -e "${BLUE}Installing production dependencies...${NC}"
npm install react \
    react-dom \
    @tanstack/react-query \
    axios \
    date-fns \
    zod \
    @hookform/resolvers \
    react-hook-form

# Create necessary directories
echo -e "${BLUE}Creating directory structure...${NC}"
mkdir -p src/{components/{ui,layout,dashboard,nclex},pages,hooks,utils,config,types,styles,lib,services}
mkdir -p server/{routes,controllers,services,utils,config,types,middleware}

# Create tsconfig.json
echo -e "${BLUE}Creating TypeScript configuration...${NC}"
cat > tsconfig.json << EOF
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["DOM", "DOM.Iterable", "ESNext"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
EOF

# Create vite.config.ts
echo -e "${BLUE}Creating Vite configuration...${NC}"
cat > vite.config.ts << EOF
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    host: '0.0.0.0',
    port: 3000
  }
});
EOF

# Create API client setup
echo -e "${BLUE}Setting up API client...${NC}"
mkdir -p src/lib
cat > src/lib/axios.ts << EOF
import axios from 'axios';

export const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);
EOF

# Create base React components
echo -e "${BLUE}Creating base components...${NC}"
cat > src/App.tsx << EOF
import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-background">
        {/* Your app content */}
      </div>
    </QueryClientProvider>
  );
}

export default App;
EOF

# Create QueryClient configuration
cat > src/lib/queryClient.ts << EOF
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: false,
    },
  },
});
EOF

# Set up error handling
echo -e "${BLUE}Setting up error handling...${NC}"
cat > src/components/ErrorBoundary.tsx << EOF
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 text-red-800">
          <h2>Something went wrong.</h2>
          <button
            className="mt-2 px-4 py-2 bg-red-100 hover:bg-red-200 rounded"
            onClick={() => this.setState({ hasError: false })}
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
EOF

# Initialize git if not already initialized
if [ ! -d ".git" ]; then
  echo -e "${BLUE}Initializing git repository...${NC}"
  git init
  cat > .gitignore << EOF
node_modules
dist
.env
.env.local
*.log
.DS_Store
coverage
EOF
fi

echo -e "${GREEN}Setup complete!${NC}"
echo -e "${BLUE}Next steps:${NC}"
echo -e "1. Run ${YELLOW}npm install${NC} to install dependencies"
echo -e "2. Run ${YELLOW}npm run dev${NC} to start the development server"
echo -e "3. Check ${YELLOW}backup_${timestamp}${NC} for your original files"