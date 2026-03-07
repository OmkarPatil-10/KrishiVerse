const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register User
exports.register = async (req, res) => {
  try {
    console.log('Register request received:', req.body);
    
    // Map 'role' from frontend to 'userType' for backend
    const { name, email, password, role, userType, phone, location, farmSize, farmingExperience, confirmPassword,
            businessName, contractorType, contractorExperience, state, district, city, fullAddress, walletAddress } = req.body;
    const mappedUserType = userType || role; // Use userType if provided, otherwise use role
    
    // Validate password confirmation
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      });
    }

    // Map 'buyer' to 'contractor' for consistency
    const finalUserType = mappedUserType === 'buyer' ? 'contractor' : mappedUserType;

    // Validate contractor mandatory fields
    if (finalUserType === 'contractor') {
      if (!businessName || !contractorType || !contractorExperience || !state || !district || !city || !fullAddress) {
        return res.status(400).json({
          success: false,
          message: 'All contractor fields are required'
        });
      }
    }

    // Check if user exists
    const existingUser = await User.findOne({ email: email });
    console.log('Existing user check:', existingUser);
    
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'User already exists with this email' 
      });
    }

    // For now, use simple password (we'll add bcrypt later)
    // const salt = await bcrypt.genSalt(10);
    // const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const userData = {
      name,
      email,
      password: password, // Simple for testing
      userType: finalUserType,
      phone: phone || '',
      location: location || '',
      farmSize: farmSize ? parseFloat(farmSize) : null,
      farmingExperience: farmingExperience ? parseInt(farmingExperience) : null
    };

    // Add contractor fields if contractor
    if (finalUserType === 'contractor') {
      userData.businessName = businessName;
      userData.contractorType = contractorType;
      userData.contractorExperience = parseInt(contractorExperience);
      userData.state = state;
      userData.district = district;
      userData.city = city;
      userData.fullAddress = fullAddress;
      if (walletAddress) {
        userData.walletAddress = walletAddress;
      }
    }

    const user = new User(userData);

    await user.save();
    console.log('User saved successfully:', user._id);

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id, userType: user.userType },
      process.env.JWT_SECRET || 'test_secret',
      { expiresIn: '60m' }
    );

    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.userType, // Map userType to role for frontend
      userType: user.userType, // Keep userType for backward compatibility
      phone: user.phone,
      location: user.location,
      farmSize: user.farmSize,
      farmingExperience: user.farmingExperience,
      walletAddress: user.walletAddress || ''
    };

    // Add contractor fields if contractor
    if (user.userType === 'contractor') {
      userResponse.businessName = user.businessName;
      userResponse.contractorType = user.contractorType;
      userResponse.contractorExperience = user.contractorExperience;
      userResponse.state = user.state;
      userResponse.district = user.district;
      userResponse.city = user.city;
      userResponse.fullAddress = user.fullAddress;
    }

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: userResponse
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message 
    });
  }
};

// Login User
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('Login attempt for:', email);

    // Find user
    const user = await User.findOne({ email: email });
    if (!user) {
      console.log('User not found:', email);
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    console.log('User found:', user.email);

    // Check password (simple check for testing)
    if (password !== user.password) {
      console.log('Password mismatch for:', email);
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id, userType: user.userType },
      process.env.JWT_SECRET || 'test_secret',
      { expiresIn: '60m' }
    );

    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.userType, // Map userType to role for frontend
      userType: user.userType, // Keep userType for backward compatibility
      phone: user.phone,
      location: user.location,
      farmSize: user.farmSize,
      farmingExperience: user.farmingExperience,
      walletAddress: user.walletAddress || ''
    };

    // Add contractor fields if contractor
    if (user.userType === 'contractor') {
      userResponse.businessName = user.businessName;
      userResponse.contractorType = user.contractorType;
      userResponse.contractorExperience = user.contractorExperience;
      userResponse.state = user.state;
      userResponse.district = user.district;
      userResponse.city = user.city;
      userResponse.fullAddress = user.fullAddress;
      userResponse.cropsInterested = user.cropsInterested || [];
      userResponse.minQuantityRequired = user.minQuantityRequired;
      userResponse.maxQuantityCapacity = user.maxQuantityCapacity;
      userResponse.preferredQualityGrade = user.preferredQualityGrade;
      userResponse.gstNumber = user.gstNumber || '';
      userResponse.panNumber = user.panNumber || '';
    }

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: userResponse
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message 
    });
  }
};

// Get Current User
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Format user response similar to login
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.userType, // Map userType to role for frontend
      userType: user.userType, // Keep userType for backward compatibility
      phone: user.phone || '',
      location: user.location || '',
      farmSize: user.farmSize,
      farmingExperience: user.farmingExperience,
      walletAddress: user.walletAddress || ''
    };

    // Add contractor fields if contractor
    if (user.userType === 'contractor' || user.userType === 'buyer') {
      userResponse.businessName = user.businessName || '';
      userResponse.contractorType = user.contractorType || '';
      userResponse.contractorExperience = user.contractorExperience;
      userResponse.state = user.state || '';
      userResponse.district = user.district || '';
      userResponse.city = user.city || '';
      userResponse.fullAddress = user.fullAddress || '';
      userResponse.cropsInterested = user.cropsInterested || [];
      userResponse.minQuantityRequired = user.minQuantityRequired;
      userResponse.maxQuantityCapacity = user.maxQuantityCapacity;
      userResponse.preferredQualityGrade = user.preferredQualityGrade || 'Any';
      userResponse.gstNumber = user.gstNumber || '';
      userResponse.panNumber = user.panNumber || '';
      userResponse.businessLicense = user.businessLicense || '';
    }

    res.json({
      success: true,
      user: userResponse
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message
    });
  }
};

// Update User Profile
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const updateData = req.body;

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update allowed fields
    const allowedFields = [
      'name', 'phone', 'location', 'farmSize', 'farmingExperience',
      'businessName', 'contractorType', 'contractorExperience', 
      'state', 'district', 'city', 'fullAddress',
      'cropsInterested', 'minQuantityRequired', 'maxQuantityCapacity',
      'preferredQualityGrade', 'gstNumber', 'panNumber', 'businessLicense',
      'walletAddress' // Add walletAddress to allowed fields
    ];

    let walletError = null;

    // Only update allowed fields
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        if (field === 'walletAddress') {
          // If the payload contains a wallet address
          if (user.walletAddress && user.walletAddress !== updateData.walletAddress) {
            walletError = 'Wallet address cannot be changed once set';
          } else {
            user.walletAddress = updateData.walletAddress;
          }
        } else if (field === 'farmSize' || field === 'farmingExperience' || 
            field === 'contractorExperience' || field === 'minQuantityRequired' || 
            field === 'maxQuantityCapacity') {
          user[field] = updateData[field] ? parseFloat(updateData[field]) : null;
        } else if (field === 'cropsInterested' && Array.isArray(updateData[field])) {
          user[field] = updateData[field];
        } else {
          user[field] = updateData[field];
        }
      }
    });

    if (walletError) {
      return res.status(400).json({
        success: false,
        message: walletError
      });
    }

    await user.save();

    // Prepare response
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.userType, // Map userType to role for frontend
      userType: user.userType, // Keep userType for backward compatibility
      phone: user.phone || '',
      location: user.location || '',
      farmSize: user.farmSize,
      farmingExperience: user.farmingExperience,
      walletAddress: user.walletAddress || ''
    };

    // Add contractor fields if contractor
    if (user.userType === 'contractor' || user.userType === 'buyer') {
      userResponse.businessName = user.businessName || '';
      userResponse.contractorType = user.contractorType || '';
      userResponse.contractorExperience = user.contractorExperience;
      userResponse.state = user.state || '';
      userResponse.district = user.district || '';
      userResponse.city = user.city || '';
      userResponse.fullAddress = user.fullAddress || '';
      userResponse.cropsInterested = user.cropsInterested || [];
      userResponse.minQuantityRequired = user.minQuantityRequired;
      userResponse.maxQuantityCapacity = user.maxQuantityCapacity;
      userResponse.preferredQualityGrade = user.preferredQualityGrade || 'Any';
      userResponse.gstNumber = user.gstNumber || '';
      userResponse.panNumber = user.panNumber || '';
      userResponse.businessLicense = user.businessLicense || '';
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: userResponse
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};