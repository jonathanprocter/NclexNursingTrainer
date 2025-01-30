"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vite_1 = require("vite");
const plugin_react_1 = __importDefault(require("@vitejs/plugin-react"));
const path_1 = __importDefault(require("path"));

exports.default = (0, vite_1.defineConfig)({
    plugins: [(0, plugin_react_1.default)()],
    root: './client',
    build: {
        outDir: '../dist/client',
        emptyOutDir: true
    },
    server: {
        host: "0.0.0.0",
        port: 3000,
        watch: {
            usePolling: true,
            interval: 100,
        },
        proxy: {
            '/api': {
                target: 'http://0.0.0.0:3001',
                changeOrigin: true,
            },
        },
        allowedHosts: [
            "28283d82-bfbd-491e-8711-8e29be387da7-00-29i5ngdyjh860.spock.replit.dev"
        ]
    },
    resolve: {
        alias: {
            '@': path_1.default.resolve(__dirname, './client/src'),
        },
    },
});