const express = require('express');
const router = express.Router();

// Import controller functions
const contractController = require('../controllers/contractController');

// Create contract (Buyer)
router.post('/', contractController.createContract);

// Get all contracts (Farmers view)
router.get('/', contractController.getAllContracts);

// Farmer accepts contract
router.post('/:id/accept', contractController.acceptContract);

module.exports = router;