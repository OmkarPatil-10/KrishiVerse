const User = require('../models/User');

// Get all farmers who have connected their wallet
const getConnectedFarmers = async (req, res) => {
    try {
        const farmers = await User.find({
            userType: 'farmer',
            walletAddress: { $exists: true, $ne: '' }
        }).select('-password');

        res.status(200).json({ success: true, data: farmers });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get a specific farmer by ID
const getFarmerById = async (req, res) => {
    try {
        const farmer = await User.findById(req.params.id).select('-password');
        if (!farmer) {
            return res.status(404).json({ success: false, message: 'Farmer not found' });
        }
        res.status(200).json({ success: true, data: farmer });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getConnectedFarmers, getFarmerById };
