
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  root: './client',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client/src'),
    },
  },
  build: {
    outDir: '../dist/client',
    emptyOutDir: true
  },
  server: {
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://0.0.0.0:3001',
        changeOrigin: true,
      },
    },
    allowedHosts: ['28283d82-bfbd-491e-8711-8e29be387da7-00-29i5ngdyjh860.spock.replit.dev', 'all']
  },
})
