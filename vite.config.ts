import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  // The directory where your index.html resides
  root: "./client",

  plugins: [react()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client/src"),
    },
  },

  build: {
    outDir: "../dist/client",
    emptyOutDir: true,
  },

  server: {
    // Listen on all interfaces in Replit
    host: "0.0.0.0",

    // Ensures Vite doesn’t pick a different port if 5173 is busy,
    // though you can disable if it causes conflicts
    strictPort: true,

    /**
     * `allowedHosts` is the key to solving "host not allowed" errors.
     * - "all" allows any host, which is simplest for Replit.
     * - You could also specify your Replit domain explicitly (e.g. "my-project.username.repl.co").
     */
    allowedHosts: "all",

    // Proxy setup for your backend server
    proxy: {
      "/api": {
        target: "http://0.0.0.0:3001",
        changeOrigin: true,
      },
    },
  },
});
