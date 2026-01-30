const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    success: true,
    weather: {
      temperature: 28,
      condition: 'Sunny',
      humidity: 65,
      advice: 'Good day for farming activities'
    }
  });
});

module.exports = router;