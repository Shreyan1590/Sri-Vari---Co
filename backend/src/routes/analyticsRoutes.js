import { Hono } from 'hono';
import { getSummary, getMonthlyStats, getDailyStats } from '../controllers/analyticsController';
import { protect } from '../middleware/auth';

const analyticsRoutes = new Hono();

analyticsRoutes.use('*', protect);

analyticsRoutes.get('/summary', getSummary);
analyticsRoutes.get('/monthly', getMonthlyStats);
analyticsRoutes.get('/daily', getDailyStats);

export { analyticsRoutes };
