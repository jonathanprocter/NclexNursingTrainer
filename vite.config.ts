
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
      clientPort: 443,
      host: '28283d82-bfbd-491e-8711-8e29be387da7-00-29i5ngdyjh860.spock.replit.dev'
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
