const express = require('express');
const router = express.Router();
const { sendOTP, verifyOTP } = require('../controllers/otpController');

// Public routes - no auth required
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);

// Test route
router.get('/test', (req, res) => {
    res.json({ message: 'OTP routes working!' });
});

module.exports = router;
