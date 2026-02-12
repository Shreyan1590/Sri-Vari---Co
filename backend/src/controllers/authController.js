import bcrypt from 'bcryptjs';
import { sign } from 'hono/jwt';

/**
 * Generate JWT token
 */
const generateToken = async (id, role, secret) => {
    return await sign({ id, role, exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) }, secret);
};

export const register = async (c) => {
    const db = c.env.DB;
    const secret = c.env.JWT_SECRET || 'secret';

    try {
        const { username, password, role } = await c.req.json();

        if (!username || !password) {
            return c.json({ success: false, message: 'Please provide username and password' }, 400);
        }

        // Check if user exists
        const existingUser = await db.prepare('SELECT id FROM users WHERE username = ?').bind(username).first();
        if (existingUser) {
            return c.json({ success: false, message: 'Username already exists' }, 400);
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const result = await db.prepare(
            'INSERT INTO users (username, password, role) VALUES (?, ?, ?) RETURNING id, username, role'
        ).bind(username, hashedPassword, role || 'staff').first();

        const token = await generateToken(result.id, result.role, secret);

        return c.json({
            success: true,
            message: 'User registered successfully',
            data: {
                id: result.id,
                username: result.username,
                role: result.role,
                token
            }
        }, 201);
    } catch (error) {
        return c.json({ success: false, message: 'Server error during registration', error: error.message }, 500);
    }
};

export const login = async (c) => {
    const db = c.env.DB;
    const secret = c.env.JWT_SECRET || 'secret';

    try {
        const { username, password } = await c.req.json();

        if (!username || !password) {
            return c.json({ success: false, message: 'Please provide username and password' }, 400);
        }

        const user = await db.prepare('SELECT * FROM users WHERE username = ?').bind(username).first();
        if (!user) {
            return c.json({ success: false, message: 'Invalid credentials' }, 401);
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return c.json({ success: false, message: 'Invalid credentials' }, 401);
        }

        const token = await generateToken(user.id, user.role, secret);

        return c.json({
            success: true,
            message: 'Login successful',
            data: {
                id: user.id,
                username: user.username,
                role: user.role,
                token
            }
        });
    } catch (error) {
        return c.json({ success: false, message: 'Server error during login', error: error.message }, 500);
    }
};

export const getMe = async (c) => {
    const db = c.env.DB;
    const userPayload = c.get('user');

    try {
        const user = await db.prepare('SELECT id, username, role, createdAt FROM users WHERE id = ?').bind(userPayload.id).first();
        return c.json({ success: true, data: user });
    } catch (error) {
        return c.json({ success: false, message: 'Server error', error: error.message }, 500);
    }
};
