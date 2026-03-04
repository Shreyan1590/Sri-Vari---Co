import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { authRoutes } from './routes/authRoutes';
import { mobileRoutes } from './routes/mobileRoutes';
import { analyticsRoutes } from './routes/analyticsRoutes';

const app = new Hono();

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

// Route everything under /api for consistency with frontend
app.route('/api/auth', authRoutes);
app.route('/api/mobiles', mobileRoutes);
app.route('/api/analytics', analyticsRoutes);

// Health check
app.get('/api/health', (c) => {
    return c.json({
        success: true,
        message: 'Sri Vari & Co API (Hono) is running',
        timestamp: new Date().toISOString()
    });
});

// Security config
app.get('/api/security/config', (c) => {
    return c.json({
        success: true,
        data: {
            require_device_auth: true,
            auth_on_resume: true,
            auth_on_foreground: true,
            allow_biometric: true,
            allow_device_credential: true
        }
    });
});

// Root
app.get('/api', (c) => {
    return c.json({
        success: true,
        message: 'Welcome to Sri Vari & Co Mobile Shop Management API',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            mobiles: '/api/mobiles',
            analytics: '/api/analytics',
            security: '/api/security/config'
        }
    });
});

// Custom 404 Handler for debugging
app.notFound((c) => {
    return c.json({
        success: false,
        message: `Route not found: ${c.req.method} ${c.req.path}`,
        hono_debug: true
    }, 404);
});

// Global error handler — prevents 503 crashes
app.onError((err, c) => {
    console.error('Unhandled error:', err.message, err.stack);
    return c.json({
        success: false,
        message: 'Internal server error',
        error: err.message
    }, 500);
});

export default app;
