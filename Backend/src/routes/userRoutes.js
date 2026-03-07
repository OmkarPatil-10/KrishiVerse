const express = require('express');
const router = express.Router();
const { getConnectedFarmers, getFarmerById, addToNetwork, getMyNetwork, removeFromNetwork } = require('../controllers/userController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Get all farmers who have connected their wallet
router.get('/farmers', getConnectedFarmers);

// Get a specific farmer by ID
router.get('/farmers/:id', getFarmerById);

// Network routes
router.post('/network/add', authMiddleware, addToNetwork);
router.post('/network/remove', authMiddleware, removeFromNetwork);
router.get('/network/my', authMiddleware, getMyNetwork);

module.exports = router;
