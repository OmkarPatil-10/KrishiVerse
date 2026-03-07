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

// Add a farmer to contractor's network
const addToNetwork = async (req, res) => {
    try {
        const contractorId = req.userId;
        const { farmerId } = req.body;

        if (!farmerId) {
            return res.status(400).json({ success: false, message: 'Farmer ID is required' });
        }

        const contractor = await User.findById(contractorId);
        if (!contractor) {
            return res.status(404).json({ success: false, message: 'Contractor not found' });
        }

        if (contractor.myNetwork.includes(farmerId)) {
            return res.status(200).json({ success: true, message: 'Farmer already in network' });
        }

        contractor.myNetwork.push(farmerId);
        await contractor.save();

        res.status(200).json({ success: true, message: 'Farmer added to network' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get contractor's network
const getMyNetwork = async (req, res) => {
    try {
        const contractorId = req.userId;
        const contractor = await User.findById(contractorId).populate({
            path: 'myNetwork',
            select: '-password'
        });

        if (!contractor) {
            return res.status(404).json({ success: false, message: 'Contractor not found' });
        }

        res.status(200).json({ success: true, data: contractor.myNetwork });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Remove a farmer from contractor's network (permanent)
const removeFromNetwork = async (req, res) => {
    try {
        const contractorId = req.userId;
        const { farmerId } = req.body;

        if (!farmerId) {
            return res.status(400).json({ success: false, message: 'Farmer ID is required' });
        }

        const contractor = await User.findById(contractorId);
        if (!contractor) {
            return res.status(404).json({ success: false, message: 'Contractor not found' });
        }

        if (!contractor.myNetwork.includes(farmerId)) {
            return res.status(400).json({ success: false, message: 'Farmer is not in your network' });
        }

        // Permanently remove the farmer from the network using $pull
        await User.findByIdAndUpdate(contractorId, {
            $pull: { myNetwork: farmerId }
        });

        res.status(200).json({ success: true, message: 'Farmer removed from network permanently' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getConnectedFarmers, getFarmerById, addToNetwork, getMyNetwork, removeFromNetwork };
