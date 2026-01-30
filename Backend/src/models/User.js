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
    enum: ['farmer', 'buyer', 'admin'],
    required: true
  },
  phone: {
    type: String
  },
  location: {
    city: String,
    state: String,
    pincode: String
  },
  farmDetails: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  companyDetails: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Export the model
module.exports = mongoose.model('User', UserSchema);