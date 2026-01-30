const mongoose = require('mongoose');

const ContractSchema = new mongoose.Schema({
  buyerId: {
    type: String,
    required: true
  },
  buyerName: {
    type: String,
    required: true
  },
  cropName: {
    type: String,
    required: true
  },
  cropType: {
    type: String,
    default: 'vegetable'
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  quantityUnit: {
    type: String,
    default: 'kg'
  },
  qualityRequirements: {
    type: String,
    default: 'Good quality, fresh produce'
  },
  expectedDeliveryDate: {
    type: Date,
    default: () => new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // Default: 14 days from now
  },
  budgetPerUnit: {
    type: Number,
    required: true
  },
  totalBudget: {
    type: Number
  },
  location: {
    city: {
      type: String,
      default: 'Not specified'
    },
    state: {
      type: String,
      default: 'Not specified'
    },
    pincode: String
  },
  contactPhone: {
    type: String,
    default: 'Not provided'
  },
  status: {
    type: String,
    enum: ['open', 'accepted', 'completed', 'cancelled'],
    default: 'open'
  },
  acceptedBy: {
    farmerId: String,
    farmerName: String,
    farmerPhone: String,
    acceptedAt: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// FIXED: Simple pre-save middleware WITHOUT next parameter issues
ContractSchema.pre('save', function() {
  // Calculate total budget if we have both values
  if (this.quantity && this.budgetPerUnit) {
    this.totalBudget = this.quantity * this.budgetPerUnit;
  }
  // Always update the timestamp
  this.updatedAt = new Date();
});

module.exports = mongoose.model('Contract', ContractSchema);