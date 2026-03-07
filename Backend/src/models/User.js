const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  userType: {
    type: String,
    enum: ['farmer', 'contractor', 'buyer', 'admin'], // buyer and contractor are the same
    required: true
  },
  phone: {
    type: String
  },
  location: {
    type: String, // Store as string for simplicity
    default: ''
  },
  farmSize: {
    type: Number, // In acres
    default: null
  },
  farmingExperience: {
    type: Number, // In years
    default: null
  },
  farmDetails: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  companyDetails: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  // Contractor specific fields
  businessName: {
    type: String,
    default: ''
  },
  contractorType: {
    type: String,
    enum: ['Trader', 'Wholesaler', 'Retailer', 'Processor', 'Exporter'],
    default: null
  },
  contractorExperience: {
    type: Number, // In years
    default: null
  },
  state: {
    type: String,
    default: ''
  },
  district: {
    type: String,
    default: ''
  },
  city: {
    type: String,
    default: ''
  },
  fullAddress: {
    type: String,
    default: ''
  },
  // Contractor profile fields (optional, added after registration)
  cropsInterested: {
    type: [String],
    default: []
  },
  minQuantityRequired: {
    type: Number,
    default: null
  },
  maxQuantityCapacity: {
    type: Number,
    default: null
  },
  preferredQualityGrade: {
    type: String,
    enum: ['A', 'B', 'C', 'Any'],
    default: null
  },
  gstNumber: {
    type: String,
    default: ''
  },
  panNumber: {
    type: String,
    default: ''
  },
  businessLicense: {
    type: String, // URL or file path
    default: ''
  },
  walletAddress: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Export the model
module.exports = mongoose.model('User', UserSchema);