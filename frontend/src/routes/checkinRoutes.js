const express = require('express');
const router = express.Router();
const { scanQRCode, getCheckinStats } = require('../controllers/checkinController');
const auth = require('../middlewares/auth');
const checkRole = require('../middlewares/roleCheck');

router.post('/scan', auth, checkRole('admin', 'organizer'), scanQRCode);
router.get('/stats/:eventId', auth, checkRole('admin', 'organizer'), getCheckinStats);

module.exports = router;
