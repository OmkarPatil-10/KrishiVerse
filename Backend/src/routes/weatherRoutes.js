const express = require('express');
const router = express.Router();
const weatherController = require('../controllers/weatherController');

// GET /api/weather?city=Pune&state=Maharashtra
router.get('/', weatherController.getWeatherForecast);

module.exports = router;