import express from 'express';
import cors from 'cors';
import { registerRoutes } from './routes.js';

const app = express();
const port = parseInt(process.env.PORT || '4004');

// Configure CORS to allow Replit domains
app.use(cors({
    origin: [
        'http://localhost:3000',
        'http://0.0.0.0:3000',
        /\.replit\.dev$/,
        /\.repl\.co$/
    ],
    credentials: true
}));

app.use(express.json());

// Global error handling
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

// Register all routes
const httpServer = registerRoutes(app);

// Start the server
httpServer.listen(port, '0.0.0.0', () => {
    console.log('=================================');
    console.log('Server started successfully');
    console.log(`Server is running on port ${port}`);
    console.log('Frontend URL: http://0.0.0.0:3000');
    console.log('Backend URL: http://0.0.0.0:4004');
    console.log('=================================');
});

export default app;