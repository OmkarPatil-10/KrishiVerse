const express = require('express');
const router = express.Router();
const { 
  getAllCropData, 
  addCropData, 
  addMultipleCrops 
} = require('../controllers/cropController');

router.get('/', getAllCropData);
router.post('/', addCropData);
router.post('/bulk', addMultipleCrops); // New endpoint for bulk add

module.exports = router;