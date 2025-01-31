#!/bin/bash

# Create directories if they don't exist
mkdir -p src/components/ui
mkdir -p src/lib
mkdir -p src/hooks
mkdir -p src/types

# First, let's install all necessary dependencies
npm install --save \
  @radix-ui/react-navigation-menu \
  @radix-ui/react-select \
  @radix-ui/react-dialog \
  @radix-ui/react-alert-dialog \
  @radix-ui/react-radio-group \
  @radix-ui/react-label \
  @radix-ui/react-progress \
  @radix-ui/react-tabs \
  @radix-ui/react-scroll-area \
  @radix-ui/react-accordion \
  @radix-ui/react-tooltip \
  @radix-ui/react-toggle \
  @tanstack/react-query \
  lucide-react \
  class-variance-authority \
  clsx \
  tailwind-merge \
  @hookform/resolvers \
  react-hook-form \
  zod

# Install dev dependencies
npm install --save-dev \
  @types/node \
  @types/react \
  @types/react-dom \
  typescript \
  tailwindcss \
  postcss \
  autoprefixer

# Create a basic vite config with path aliases
cat > vite.config.ts << 'VITECONFIG'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
VITECONFIG

# Create tsconfig with proper path aliases
cat > tsconfig.json << 'TSCONFIG'
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
TSCONFIG

# Create util functions
cat > src/lib/utils.ts << 'UTILS'
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
UTILS

# Create database provider placeholder
cat > src/lib/db.ts << 'DB'
// This is a placeholder for your database configuration
export const db = {
  // Add your database configuration here
}
DB

# Create analytics types
cat > src/types/analytics.d.ts << 'ANALYTICS'
export interface AnalyticsData {
  performanceData: Array<{
    domain: string;
    mastery: number;
  }>;
  totalStudyTime: string;
  questionsAttempted: number;
  averageScore: number;
}
ANALYTICS

# Create the query provider
cat > src/providers/query-provider.tsx << 'QUERY'
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";

const queryClient = new QueryClient();

export const QueryProvider = ({ children }: { children: ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};
QUERY

# Create an .env file for any environment variables
cat > .env << 'ENV'
VITE_API_URL=http://localhost:3000
ENV

echo "Basic setup complete. Would you like to proceed with UI component creation?"