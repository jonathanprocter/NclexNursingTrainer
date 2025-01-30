import express from 'express';
import cors from 'cors';
import { registerRoutes } from './routes/index.js';

const app = express();
const port = parseInt(process.env.PORT || '4005');
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

// Register all routes with /api prefix
app.use('/api', registerRoutes());

// Global error handling
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('Global Error:', err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// Start the server
app.listen(port, HOSTNAME, () => {
    console.log('=================================');
    console.log('Server started successfully');
    console.log(`Server is running on port ${port}`);
    console.log(`Frontend URL: http://${HOSTNAME}:3000`);
    console.log(`Backend URL: http://${HOSTNAME}:${port}`);
    console.log('=================================');
}).on('error', (error: any) => {
    if (error.code === 'EADDRINUSE') {
        console.log(`Port ${port} is in use, trying ${port + 1}`);
        app.listen(port + 1, HOSTNAME);
    } else {
        console.error('Server error:', error);
        process.exit(1);
    }
});

export default app;