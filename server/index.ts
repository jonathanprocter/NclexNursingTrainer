import express from 'express';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 4003;

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

app.get('/', (req, res) => {
    res.json({ message: 'Server is running' });
});

app.listen(port, '0.0.0.0', () => {
    console.log('=================================');
    console.log('Server started successfully');
    console.log(`Server is running on port ${port}`);
    console.log('Frontend URL: http://0.0.0.0:3000');
    console.log('Access URL: http://0.0.0.0:4003');
    console.log('=================================');
});

export default app;
