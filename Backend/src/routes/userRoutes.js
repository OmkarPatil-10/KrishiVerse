const express = require('express');
const router = express.Router();
const { getConnectedFarmers, getFarmerById } = require('../controllers/userController');

// Get all farmers who have connected their wallet
router.get('/farmers', getConnectedFarmers);

// Get a specific farmer by ID
router.get('/farmers/:id', getFarmerById);

module.exports = router;
