const express = require('express');
const router = express.Router();
const {
    addMobile,
    getAllMobiles,
    getMobileById,
    updateMobile,
    sellMobile,
    deleteMobile
} = require('../controllers/mobileController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// CRUD routes
router.route('/')
    .post(addMobile)
    .get(getAllMobiles);

router.route('/:id')
    .get(getMobileById)
    .put(updateMobile)
    .delete(deleteMobile);

router.put('/:id/sell', sellMobile);

module.exports = router;
