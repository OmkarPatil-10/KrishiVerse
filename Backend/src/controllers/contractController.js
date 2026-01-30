const Contract = require('../models/Contract');

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
      status: 'open'
    };

    // Handle expected delivery date
    if (req.body.expectedDeliveryDate) {
      contractData.expectedDeliveryDate = new Date(req.body.expectedDeliveryDate);
    }
    // If not provided, model will use default (14 days from now)

    const contract = new Contract(contractData);
    await contract.save();

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
    const contracts = await Contract.find();
    
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

// Accept contract
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

// EXPORT ALL FUNCTIONS
module.exports = {
  createContract,
  getAllContracts,
  acceptContract
};