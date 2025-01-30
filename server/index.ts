import express from 'express';
import cors from 'cors';
import { registerRoutes } from './routes.js';

const app = express();
const port = parseInt(process.env.PORT || '4005'); // Changed default port to 4005
const HOSTNAME = '0.0.0.0';

// Configure CORS to allow Replit domains
app.use(cors({
    origin: [
        'http://localhost:3000',
        'http://0.0.0.0:3000',
        /\.replit\.dev$/,
        /\.repl\.co$/
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Global error handling
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

interface SystemError extends Error {
    code?: string;
}

process.on('uncaughtException', (error: SystemError) => {
    console.error('Uncaught Exception:', error);
    // Don't exit the process on EADDRINUSE, try a different port
    if (error.code === 'EADDRINUSE') {
        console.log(`Port ${port} is in use, trying ${port + 1}`);
        startServer(port + 1);
    } else {
        process.exit(1);
    }
});

// Register all routes
function startServer(port: number) {
    const httpServer = registerRoutes(app);

    // Start the server with proper error handling
    httpServer.listen(port, HOSTNAME, () => { // Added HOSTNAME
        console.log('=================================');
        console.log('Server started successfully');
        console.log(`Server is running on port ${port}`);
        console.log(`Frontend URL: http://${HOSTNAME}:3000`); // Updated URL
        console.log(`Backend URL: http://${HOSTNAME}:${port}`); // Updated URL
        console.log('=================================');
    }).on('error', (error: SystemError) => {
        if (error.code === 'EADDRINUSE') {
            console.log(`Port ${port} is in use, trying ${port + 1}`);
            startServer(port + 1);
        } else {
            console.error('Server error:', error);
            process.exit(1);
        }
    });
}

startServer(port);

export default app;