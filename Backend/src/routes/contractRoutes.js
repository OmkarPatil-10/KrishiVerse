const express = require('express');
const router = express.Router();

// Import controller functions
const contractController = require('../controllers/contractController');

// Create contract (Buyer)
router.post('/', contractController.createContract);

// Get all contracts
router.get('/', contractController.getAllContracts);

// Get single contract by ID
router.get('/:id', contractController.getContractById);

// Farmer accepts contract
router.post('/:id/accept', contractController.acceptContract);

// Farmer rejects contract → refund
router.post('/:id/reject', contractController.rejectContract);

// Farmer marks out for delivery
router.post('/:id/out-for-delivery', contractController.outForDeliveryContract);

// Contractor confirms delivery → payment released
router.post('/:id/deliver', contractController.deliverContract);

// Contractor edits contract details
router.put('/:id', contractController.updateContract);

// Fetch chat messages for a contract
router.get('/:id/messages', contractController.getContractMessages);

module.exports = router;