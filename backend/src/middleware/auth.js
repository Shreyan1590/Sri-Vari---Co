import { verify } from 'hono/jwt';

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
        const payload = await verify(token, c.env.JWT_SECRET || 'secret');
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

    if (user && user.role === 'admin') {
        await next();
    } else {
        return c.json({
            success: false,
            message: 'Not authorized as an admin'
        }, 403);
    }
};
