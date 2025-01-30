"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vite_1 = require("vite");
const plugin_react_1 = __importDefault(require("@vitejs/plugin-react"));
const path_1 = __importDefault(require("path"));

exports.default = (0, vite_1.defineConfig)({
    root: "client", // Ensure Vite looks for index.html inside /client
    plugins: [(0, plugin_react_1.default)()],
    build: {
        outDir: "../dist/client", // Make sure it outputs to /dist/client
        emptyOutDir: true,
    },
    server: {
        port: 4000,
        host: true,
        allowedHosts: [
            '28283d82-bfbd-491e-8711-8e29be387da7-00-29i5ngdyjh860.spock.replit.dev',
            '.replit.dev'
        ],
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
            "@": path_1.default.resolve(__dirname, "client/src"),
        },
    },
});