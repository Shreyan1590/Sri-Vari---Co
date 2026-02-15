import { Hono } from 'hono';
import { addMobile, getAllMobiles, getMobileById, updateMobile, sellMobile, deleteMobile, moveToStock, returnToSeller } from '../controllers/mobileController';
import { protect } from '../middleware/auth';

const mobileRoutes = new Hono();

mobileRoutes.use('*', protect);

mobileRoutes.get('/', getAllMobiles);
mobileRoutes.post('/', addMobile);
mobileRoutes.get('/:id', getMobileById);
mobileRoutes.put('/:id', updateMobile);
mobileRoutes.delete('/:id', deleteMobile);
mobileRoutes.put('/:id/sell', sellMobile);
mobileRoutes.put('/:id/move-to-stock', moveToStock);
mobileRoutes.put('/:id/return-to-seller', returnToSeller);

export { mobileRoutes };
