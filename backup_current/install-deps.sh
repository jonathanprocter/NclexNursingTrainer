#!/bin/bash

# Create necessary directories
mkdir -p src/components/ui
mkdir -p src/lib
mkdir -p src/hooks
mkdir -p src/providers
mkdir -p src/types

# Install base dependencies first
npm install @radix-ui/react-navigation-menu @radix-ui/react-select \
  @radix-ui/react-dialog @radix-ui/react-alert-dialog \
  @radix-ui/react-radio-group @radix-ui/react-label \
  @radix-ui/react-progress @radix-ui/react-tabs \
  @radix-ui/react-scroll-area @radix-ui/react-accordion \
  @radix-ui/react-tooltip @radix-ui/react-toggle \
  @tanstack/react-query lucide-react class-variance-authority \
  clsx tailwind-merge

# Install dev dependencies
npm install -D @types/react @types/react-dom @types/node typescript @typescript-eslint/parser @typescript-eslint/eslint-plugin

# Install shadcn-ui CLI globally
npm install -g shadcn-ui

# Initialize shadcn-ui
echo 'y' | npx shadcn-ui@latest init