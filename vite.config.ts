import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  root: "client", // Ensure Vite looks for index.html inside /client
  plugins: [react()],

  build: {
    outDir: "../dist/client", // Make sure it outputs to /dist/client
    emptyOutDir: true,
  },

  server: {
    port: 4000,
    proxy: {
      "/api": {
        target: "http://localhost:4001",
        changeOrigin: true,
        secure: false,
      },
    },
  },

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client/src"),
    },
  },
});
