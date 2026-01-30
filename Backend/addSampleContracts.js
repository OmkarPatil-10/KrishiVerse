const mongoose = require('mongoose');
require('dotenv').config();

// Import the Contract model
const Contract = require('./src/models/Contract');

const sampleContracts = [
  {
    buyerId: '697231abf2548eebbd828b10', // Use your actual user ID
    buyerName: 'Rajesh Kumar',
    cropName: 'Potato',
    cropType: 'vegetable',
    quantity: 500,
    quantityUnit: 'kg',
    qualityRequirements: 'Fresh, Grade A, Size: 50-70mm',
    expectedDeliveryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
    budgetPerUnit: 28,
    location: {
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411001'
    },
    contactPhone: '9876543210',
    status: 'open'
  },
  {
    buyerId: '697231abf2548eebbd828b10',
    buyerName: 'Rajesh Kumar',
    cropName: 'Tomato',
    cropType: 'vegetable',
    quantity: 200,
    quantityUnit: 'kg',
    qualityRequirements: 'Organic, Fully ripe, No damage',
    expectedDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    budgetPerUnit: 45,
    location: {
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001'
    },
    contactPhone: '9876543210',
    status: 'open'
  },
  {
    buyerId: '697231abf2548eebbd828b10',
    buyerName: 'Rajesh Kumar',
    cropName: 'Onion',
    cropType: 'vegetable',
    quantity: 1000,
    quantityUnit: 'kg',
    qualityRequirements: 'Red onions, Well dried, Minimum 50mm diameter',
    expectedDeliveryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    budgetPerUnit: 38,
    location: {
      city: 'Nashik',
      state: 'Maharashtra',
      pincode: '422001'
    },
    contactPhone: '9876543210',
    status: 'open'
  }
];

async function addSampleContracts() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Clear existing contracts
    console.log('🗑️  Clearing existing contracts...');
    await Contract.deleteMany({});
    console.log('✅ Cleared existing contracts');
    
    // Add sample contracts
    console.log('📝 Adding sample contracts...');
    let count = 0;
    
    for (const contractData of sampleContracts) {
      const contract = new Contract(contractData);
      await contract.save();
      count++;
      console.log(`   ${count}. ${contract.cropName} - ${contract.quantity}${contract.quantityUnit} for ₹${contract.totalBudget}`);
    }
    
    console.log('\n🎉 SAMPLE CONTRACTS ADDED SUCCESSFULLY!');
    console.log('📊 Total contracts added:', count);
    console.log('\n🔗 Now test with: GET http://localhost:5000/api/contracts');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    console.log('\n💡 TROUBLESHOOTING:');
    console.log('   1. Make sure MongoDB is running');
    console.log('   2. Check your .env file has MONGODB_URI');
    console.log('   3. Make sure Contract model exists in src/models/');
    process.exit(1);
  }
}

// Run the function
addSampleContracts();