const Contract = require('../models/Contract');
const Message = require('../models/Message');
const Notification = require('../models/Notification');

// Create contract (Buyer)
const createContract = async (req, res) => {
  try {
    console.log('Creating contract with data:', req.body);

    const {
      buyerId,
      buyerName,
      cropName,
      quantity,
      budgetPerUnit
    } = req.body;

    // Validate minimum required fields
    if (!buyerId || !buyerName || !cropName || !quantity || !budgetPerUnit) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: buyerId, buyerName, cropName, quantity, budgetPerUnit'
      });
    }

    // Prepare contract data with defaults
    const contractData = {
      buyerId,
      buyerName,
      cropName,
      cropType: req.body.cropType || 'vegetable',
      quantity: Number(quantity),
      quantityUnit: req.body.quantityUnit || 'kg',
      qualityRequirements: req.body.qualityRequirements || 'Good quality, fresh produce',
      budgetPerUnit: Number(budgetPerUnit),
      location: {
        city: req.body.location?.city || 'Not specified',
        state: req.body.location?.state || 'Not specified',
        pincode: req.body.location?.pincode || ''
      },
      contactPhone: req.body.contactPhone || 'Not provided',
      farmingMethod: req.body.farmingMethod || 'Certified Organic Farm',
      status: 'open'
    };

    // Save farmer reference if provided
    if (req.body.acceptedBy) {
      contractData.acceptedBy = {
        farmerId: req.body.acceptedBy.farmerId,
        farmerName: req.body.acceptedBy.farmerName,
      };
    }

    // Save blockchain transaction hash if provided
    if (req.body.transactionHash) {
      contractData.transactionHash = req.body.transactionHash;
    }

    // Save blockchain contract ID (on-chain index) if provided
    if (req.body.blockchainContractId !== undefined && req.body.blockchainContractId >= 0) {
      contractData.blockchainContractId = req.body.blockchainContractId;
    }

    // Handle expected delivery date
    if (req.body.expectedDeliveryDate) {
      contractData.expectedDeliveryDate = new Date(req.body.expectedDeliveryDate);
    }
    // If not provided, model will use default (14 days from now)

    const contract = new Contract(contractData);
    await contract.save();

    // Create notification for the farmer (if assigned)
    if (contract.acceptedBy?.farmerId) {
      await Notification.create({
        userId: contract.acceptedBy.farmerId,
        message: `New contract offer #${contract._id.toString().slice(-6).toUpperCase()} from ${contract.buyerName}`,
        type: 'info',
        metadata: { contractId: contract._id, link: `/contracts/${contract._id}` }
      });
    }

    res.status(201).json({
      success: true,
      message: '✅ Contract created successfully!',
      contract: {
        id: contract._id,
        contractNumber: `CON-${contract._id.toString().slice(-6).toUpperCase()}`,
        buyerName: contract.buyerName,
        cropName: contract.cropName,
        quantity: contract.quantity + ' ' + contract.quantityUnit,
        budget: `₹${contract.totalBudget}`,
        location: `${contract.location.city}, ${contract.location.state}`,
        deliveryDate: contract.expectedDeliveryDate.toDateString(),
        status: contract.status,
        createdAt: contract.createdAt
      }
    });
  } catch (error) {
    console.error('Contract creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create contract',
      error: error.message
    });
  }
};

// Get all contracts
const getAllContracts = async (req, res) => {
  try {
    const filter = {};

    // If farmerId query param is provided, filter by it
    if (req.query.farmerId) {
      filter['acceptedBy.farmerId'] = req.query.farmerId;
    }

    // If buyerId query param is provided, filter by it (for Contractor Dashboard)
    if (req.query.buyerId) {
      filter.buyerId = req.query.buyerId;
    }

    const contracts = await Contract.find(filter).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: contracts.length,
      contracts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contracts',
      error: error.message
    });
  }
};

// Get single contract by ID
const getContractById = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Contract not found'
      });
    }

    res.json({
      success: true,
      contract
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contract',
      error: error.message
    });
  }
};

// Accept contract (Farmer)
const acceptContract = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Contract not found'
      });
    }

    contract.status = 'accepted';
    await contract.save();

    // Notify Contractor
    await Notification.create({
      userId: contract.buyerId,
      message: `${contract.acceptedBy?.farmerName || 'A farmer'} has accepted your contract #${contract._id.toString().slice(-6).toUpperCase()}`,
      type: 'success',
      metadata: { contractId: contract._id, link: `/contracts/${contract._id}` }
    });

    res.json({
      success: true,
      message: 'Contract accepted successfully',
      contract
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to accept contract',
      error: error.message
    });
  }
};

// Reject contract (Farmer) → refund on blockchain
const rejectContract = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Contract not found'
      });
    }

    contract.status = 'cancelled';
    await contract.save();

    // Notify Contractor
    await Notification.create({
      userId: contract.buyerId,
      message: `${contract.acceptedBy?.farmerName || 'A farmer'} has rejected your contract #${contract._id.toString().slice(-6).toUpperCase()}`,
      type: 'error',
      metadata: { contractId: contract._id, link: `/contracts/${contract._id}` }
    });

    res.json({
      success: true,
      message: 'Contract rejected. Funds returned to contractor.',
      contract
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to reject contract',
      error: error.message
    });
  }
};

// Farmer marks Out for Delivery
const outForDeliveryContract = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Contract not found'
      });
    }

    contract.status = 'outForDelivery';
    await contract.save();

    // Notify Contractor
    await Notification.create({
      userId: contract.buyerId,
      message: `Contract #${contract._id.toString().slice(-6).toUpperCase()} is out for delivery!`,
      type: 'info',
      metadata: { contractId: contract._id, link: `/contracts/${contract._id}` }
    });

    res.json({
      success: true,
      message: 'Contract marked as out for delivery',
      contract
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to mark out for delivery',
      error: error.message
    });
  }
};

// Deliver contract (Contractor confirms delivery → completed, payment released)
const deliverContract = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Contract not found'
      });
    }

    contract.status = 'completed';
    await contract.save();

    // Notify Farmer if known
    if (contract.acceptedBy?.farmerId) {
      await Notification.create({
        userId: contract.acceptedBy.farmerId,
        message: `Delivery confirmed for contract #${contract._id.toString().slice(-6).toUpperCase()}. Payment released.`,
        type: 'success',
        metadata: { contractId: contract._id, link: `/contracts/${contract._id}` }
      });
    }

    res.json({
      success: true,
      message: 'Contract completed. Payment released to farmer.',
      contract
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to deliver contract',
      error: error.message
    });
  }
};

// Edit contract (Contractor)
const updateContract = async (req, res) => {
  try {
    const { quantity, budgetPerUnit, expectedDeliveryDate } = req.body;
    const contract = await Contract.findById(req.params.id);

    if (!contract) {
      return res.status(404).json({ success: false, message: 'Contract not found' });
    }

    // Update only allowed fields
    if (quantity) contract.quantity = Number(quantity);
    if (budgetPerUnit) contract.budgetPerUnit = Number(budgetPerUnit);
    if (expectedDeliveryDate) contract.expectedDeliveryDate = new Date(expectedDeliveryDate);

    // Re-calculate totalBudget
    if (contract.quantity && contract.budgetPerUnit) {
      contract.totalBudget = contract.quantity * contract.budgetPerUnit;
    }

    await contract.save();

    // Notify Farmer that contract was edited
    if (contract.acceptedBy?.farmerId) {
      await Notification.create({
        userId: contract.acceptedBy.farmerId,
        message: `Contract #${contract._id.toString().slice(-6).toUpperCase()} has been updated by the contractor.`,
        type: 'warning',
        metadata: { contractId: contract._id, link: `/contracts/${contract._id}` }
      });
    }

    res.json({
      success: true,
      message: 'Contract updated successfully',
      contract
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update contract', error: error.message });
  }
};

// Get contract messages
const getContractMessages = async (req, res) => {
  try {
    const messages = await Message.find({ contractId: req.params.id }).sort({ createdAt: 1 });
    res.json({
      success: true,
      messages
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch messages', error: error.message });
  }
};

// EXPORT ALL FUNCTIONS
module.exports = {
  createContract,
  getAllContracts,
  getContractById,
  acceptContract,
  rejectContract,
  outForDeliveryContract,
  deliverContract,
  updateContract,
  getContractMessages
};