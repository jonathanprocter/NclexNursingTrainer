
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  root: './client',
  build: {
    outDir: '../dist/client',
    emptyOutDir: true
  },
  server: {
    host: "0.0.0.0",
    port: 3000,
    hmr: {
      host: process.env.REPL_SLUG ? `${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co` : '0.0.0.0',
      protocol: 'ws',
      clientPort: 443
    },
    watch: {
      usePolling: true,
      interval: 100,
    },
    proxy: {
      '/api': {
        target: 'http://0.0.0.0:4002',
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
