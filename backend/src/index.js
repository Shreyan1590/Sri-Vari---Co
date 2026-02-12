import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { authRoutes } from './routes/authRoutes';
import { mobileRoutes } from './routes/mobileRoutes';
import { analyticsRoutes } from './routes/analyticsRoutes';

const app = new Hono().basePath('/api');

// CORS Middleware
app.use('*', cors({
    origin: (origin) => {
        const allowedOrigins = [
            'https://sri-vari-co.vercel.app',
            'https://srivarico.info-skillxpress.workers.dev',
            'http://localhost:3000',
            'http://localhost:3001',
            'http://localhost:5173'
        ];
        if (!origin || allowedOrigins.includes(origin)) {
            return origin || '*';
        }
        return allowedOrigins[0]; // Fallback to main frontend
    },
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
}));

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
