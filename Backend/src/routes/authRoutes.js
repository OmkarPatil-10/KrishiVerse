const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Auth routes working!' });
});

module.exports = router;