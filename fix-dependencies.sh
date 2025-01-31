#!/bin/bash

# Create necessary directories
mkdir -p src/components/ui
mkdir -p src/lib
mkdir -p src/hooks
mkdir -p src/providers
mkdir -p src/types

# Install required dependencies
npm install @radix-ui/react-navigation-menu @radix-ui/react-select \
  @radix-ui/react-dialog @radix-ui/react-alert-dialog \
  @radix-ui/react-radio-group @radix-ui/react-label \
  @radix-ui/react-progress @radix-ui/react-tabs \
  @radix-ui/react-scroll-area @radix-ui/react-accordion \
  @radix-ui/react-sheet @radix-ui/react-tooltip \
  @radix-ui/react-toggle @tanstack/react-query \
  lucide-react @types/node class-variance-authority \
  clsx tailwind-merge @types/react @types/react-dom

# Install shadcn/ui components
npx shadcn-ui@latest init

# Add shadcn components
npx shadcn-ui@latest add button
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add alert
npx shadcn-ui@latest add select
npx shadcn-ui@latest add navigation-menu
npx shadcn-ui@latest add progress
npx shadcn-ui@latest add radio-group
npx shadcn-ui@latest add label
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
npx shadcn-ui@latest add textarea
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add sheet
npx shadcn-ui@latest add scroll-area
npx shadcn-ui@latest add accordion
npx shadcn-ui@latest add tooltip
npx shadcn-ui@latest add toggle

# Create basic QueryProvider
cat > src/providers/query-provider.tsx << 'EOF'
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
EOF

# Create hooks directory
cat > src/hooks/use-mobile.ts << 'EOF'
import { useEffect, useState } from "react";

export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return isMobile;
};
EOF

# Create utils file
cat > src/lib/utils.ts << 'EOF'
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
EOF

# Update tsconfig.json to include path aliases
cat > tsconfig.json << 'EOF'
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

# Update vite.config.ts to include path aliases
cat > vite.config.ts << 'EOF'
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
EOF

# Fix React imports
find src -type f -name "*.tsx" -exec sed -i 's/import \* as React from "react"/import React from "react"/g' {} +

# Create types directory
mkdir -p src/types
cat > src/types/calendar.d.ts << 'EOF'
export interface DateRange {
  from: Date;
  to: Date;
}
EOF

cat > src/types/analytics.d.ts << 'EOF'
export interface AnalyticsData {
  performanceData: Array<{
    domain: string;
    mastery: number;
  }>;
  totalStudyTime: string;
  questionsAttempted: number;
  averageScore: number;
}
EOF

# Install additional dev dependencies
npm install -D @types/react @types/react-dom typescript @typescript-eslint/parser @typescript-eslint/eslint-plugin

# Run type checking
npm run typecheck

echo "Setup complete. Please check remaining type errors and fix them manually."