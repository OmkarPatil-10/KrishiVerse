const CropData = require('../models/CropData');

// Get all crop data
exports.getAllCropData = async (req, res) => {
  try {
    const { cropName, state, sortBy = 'demandLevel' } = req.query;
    
    let query = {};
    
    if (cropName) {
      query.cropName = { $regex: cropName, $options: 'i' };
    }
    
    if (state && state !== 'all') {
      query['location.state'] = { $regex: state, $options: 'i' };
    }

    let sortOptions = {};
    if (sortBy === 'price') {
      sortOptions.currentPrice = -1;
    } else if (sortBy === 'profit') {
      sortOptions.profitMargin = -1;
    } else if (sortBy === 'demand') {
      // Custom sorting for demand levels
      sortOptions.demandLevel = -1;
    } else {
      sortOptions.lastUpdated = -1;
    }

    const crops = await CropData.find(query).sort(sortOptions);
    
    // Add prediction if not present
    const enhancedCrops = crops.map(crop => {
      const cropObj = crop.toObject();
      
      // Generate prediction if not exists
      if (!cropObj.predictedPrice) {
        const basePrice = cropObj.currentPrice;
        let multiplier = 1;
        
        switch(cropObj.demandLevel) {
          case 'very-high': multiplier = 1.25; break;
          case 'high': multiplier = 1.15; break;
          case 'medium': multiplier = 1.05; break;
          case 'low': multiplier = 0.95; break;
          case 'very-low': multiplier = 0.85; break;
        }
        
        cropObj.predictedPrice = Math.round(basePrice * multiplier);
      }
      
      // Add suggestion
      if (cropObj.demandLevel === 'very-high' || cropObj.demandLevel === 'high') {
        cropObj.suggestion = '✅ High demand - Good for farming';
        cropObj.color = 'green';
      } else if (cropObj.demandLevel === 'medium') {
        cropObj.suggestion = '🟡 Moderate demand - Check local market';
        cropObj.color = 'yellow';
      } else {
        cropObj.suggestion = '🔴 Low demand - Consider alternatives';
        cropObj.color = 'red';
      }
      
      return cropObj;
    });

    res.json({
      success: true,
      count: enhancedCrops.length,
      crops: enhancedCrops
    });
  } catch (error) {
    console.error('Error fetching crop data:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Add crop data
exports.addCropData = async (req, res) => {
  try {
    // Validate required fields
    const { cropName, currentPrice } = req.body;
    
    if (!cropName || !currentPrice) {
      return res.status(400).json({
        success: false,
        message: 'Crop name and current price are required'
      });
    }

    const cropData = {
      cropName,
      currentPrice: Number(currentPrice),
      cropType: req.body.cropType || 'vegetable',
      demandLevel: req.body.demandLevel || 'medium',
      profitMargin: Number(req.body.profitMargin) || 0,
      season: req.body.season || 'all',
      location: req.body.location || {
        state: 'All India',
        district: 'All Districts'
      },
      description: req.body.description || ''
    };

    // Calculate predicted price
    let predictedMultiplier = 1;
    switch(cropData.demandLevel) {
      case 'very-high': predictedMultiplier = 1.25; break;
      case 'high': predictedMultiplier = 1.15; break;
      case 'medium': predictedMultiplier = 1.05; break;
      case 'low': predictedMultiplier = 0.95; break;
      case 'very-low': predictedMultiplier = 0.85; break;
    }
    cropData.predictedPrice = Math.round(cropData.currentPrice * predictedMultiplier);

    const crop = new CropData(cropData);
    await crop.save();
    
    res.status(201).json({
      success: true,
      message: 'Crop data added successfully',
      crop
    });
  } catch (error) {
    console.error('Error adding crop data:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Add multiple crops at once
exports.addMultipleCrops = async (req, res) => {
  try {
    const crops = req.body;
    
    if (!Array.isArray(crops)) {
      return res.status(400).json({
        success: false,
        message: 'Request body should be an array of crops'
      });
    }

    const savedCrops = [];
    for (const cropData of crops) {
      if (cropData.cropName && cropData.currentPrice) {
        const crop = new CropData(cropData);
        await crop.save();
        savedCrops.push(crop);
      }
    }

    res.status(201).json({
      success: true,
      message: `${savedCrops.length} crops added successfully`,
      count: savedCrops.length,
      crops: savedCrops
    });
  } catch (error) {
    console.error('Error adding multiple crops:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};