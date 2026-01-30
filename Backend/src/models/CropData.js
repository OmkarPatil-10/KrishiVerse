const mongoose = require('mongoose');

const CropDataSchema = new mongoose.Schema({
  cropName: {
    type: String,
    required: true
  },
  cropType: {
    type: String,
    enum: ['vegetable', 'fruit', 'grain', 'pulses', 'spices', 'other'],
    default: 'vegetable'
  },
  currentPrice: {
    type: Number,
    required: true,
    min: 0
  },
  predictedPrice: {
    type: Number,
    min: 0
  },
  demandLevel: {
    type: String,
    enum: ['very-low', 'low', 'medium', 'high', 'very-high'],
    default: 'medium'
  },
  profitMargin: {
    type: Number,
    default: 0,
    min: -100,
    max: 1000
  },
  season: {
    type: String,
    enum: ['summer', 'winter', 'monsoon', 'all', 'rabi', 'kharif', 'zaid'],
    default: 'all'
  },
  location: {
    state: {
      type: String,
      default: 'All India'
    },
    district: {
      type: String,
      default: 'All Districts'
    }
  },
  description: {
    type: String,
    default: ''
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('CropData', CropDataSchema);