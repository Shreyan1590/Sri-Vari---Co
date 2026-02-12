import { Hono } from 'hono';
import { register, login, getMe } from '../controllers/authController';
import { protect } from '../middleware/auth';

const authRoutes = new Hono();

authRoutes.post('/register', register);
authRoutes.post('/login', login);
authRoutes.get('/me', protect, getMe);

export { authRoutes };
