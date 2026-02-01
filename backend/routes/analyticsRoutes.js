const express = require('express');
const router = express.Router();
const {
    getSummary,
    getMonthlyStats,
    getDailyStats
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

router.get('/summary', getSummary);
router.get('/monthly', getMonthlyStats);
router.get('/daily', getDailyStats);

module.exports = router;
