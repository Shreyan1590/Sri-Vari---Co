import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { authRoutes } from './routes/authRoutes';
import { mobileRoutes } from './routes/mobileRoutes';
import { analyticsRoutes } from './routes/analyticsRoutes';

const app = new Hono().basePath('/api');

// CORS Middleware — allow Vercel frontend + localhost dev
app.use('*', cors({
    origin: [
        'https://sri-vari-co.vercel.app',
        'http://localhost:3000',
        'http://localhost:5173'
    ],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    maxAge: 86400, // Cache preflight for 24 hours
}));

// Global error handler — prevents 503 crashes
app.onError((err, c) => {
    console.error('Unhandled error:', err.message, err.stack);
    return c.json({
        success: false,
        message: 'Internal server error',
        error: err.message
    }, 500);
});

// Routes
app.route('/auth', authRoutes);
app.route('/mobiles', mobileRoutes);
app.route('/analytics', analyticsRoutes);

// Health check
app.get('/health', (c) => {
    return c.json({
        success: true,
        message: 'Sri Vari & Co API is running on Cloudflare Workers',
        timestamp: new Date().toISOString()
    });
});

// Root
app.get('/', (c) => {
    return c.json({
        success: true,
        message: 'Welcome to Sri Vari & Co Mobile Shop Management API',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            mobiles: '/api/mobiles',
            analytics: '/api/analytics'
        }
    });
});

export default app;
