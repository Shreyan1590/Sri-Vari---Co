import { jwt } from 'hono/jwt';

export const protect = async (c, next) => {
    const authHeader = c.req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return c.json({
            success: false,
            message: 'Not authorized, no token'
        }, 401);
    }

    const token = authHeader.split(' ')[1];

    try {
        // Cloudflare Workers use a different JWT implementation
        // Hono's jwt middleware can be used, but for manual verification:
        const payload = await jwt.verify(token, c.env.JWT_SECRET || 'secret');
        c.set('user', payload);
        await next();
    } catch (error) {
        return c.json({
            success: false,
            message: 'Not authorized, token failed'
        }, 401);
    }
};

export const admin = async (c, next) => {
    const user = c.get('user');

    // We need to fetch the user role from DB if it's not in the token
    // For now, assuming it's in the token payload for efficiency
    if (user && user.role === 'admin') {
        await next();
    } else {
        return c.json({
            success: false,
            message: 'Not authorized as an admin'
        }, 403);
    }
};
