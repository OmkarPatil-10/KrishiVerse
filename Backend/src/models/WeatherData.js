const mongoose = require('mongoose');

const WeatherDataSchema = new mongoose.Schema({
  location: {
    city: String,
    state: String,
    coordinates: {
      lat: Number,
      lon: Number
    }
  },
  temperature: {
    current: Number,
    min: Number,
    max: Number
  },
  humidity: Number,
  precipitation: Number,
  windSpeed: Number,
  description: String,
  forecast: [{
    date: Date,
    temp: Number,
    condition: String
  }],
  agricultureAdvice: String,
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('WeatherData', WeatherDataSchema);