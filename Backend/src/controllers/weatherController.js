const axios = require('axios');
const WeatherData = require('../models/WeatherData');

// Get Weather Forecast
exports.getWeatherForecast = async (req, res) => {
  try {
    const { city, state } = req.query;
    
    // Use default location if not provided
    const location = city || 'Delhi';
    
    // Check cache first (last 1 hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    let weather = await WeatherData.findOne({
      'location.city': { $regex: new RegExp(location, 'i') },
      lastUpdated: { $gte: oneHourAgo }
    });

    if (weather) {
      return res.json({
        success: true,
        source: 'cache',
        weather
      });
    }

    // If not in cache or stale, get from API
    // Note: You need to sign up at openweathermap.org for free API key
    const apiKey = process.env.WEATHER_API_KEY;
    let weatherData;

    if (apiKey && apiKey !== 'get_from_openweathermap.org') {
      try {
        const response = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=metric`
        );
        
        const forecastResponse = await axios.get(
          `https://api.openweathermap.org/data/2.5/forecast?q=${location}&appid=${apiKey}&units=metric&cnt=5`
        );

        weatherData = {
          location: {
            city: response.data.name,
            state: state || '',
            coordinates: {
              lat: response.data.coord.lat,
              lon: response.data.coord.lon
            }
          },
          temperature: {
            current: response.data.main.temp,
            min: response.data.main.temp_min,
            max: response.data.main.temp_max
          },
          humidity: response.data.main.humidity,
          precipitation: response.data.rain ? response.data.rain['1h'] || 0 : 0,
          windSpeed: response.data.wind.speed,
          description: response.data.weather[0].description,
          forecast: forecastResponse.data.list.map(item => ({
            date: new Date(item.dt * 1000),
            temp: item.main.temp,
            condition: item.weather[0].main
          })),
          agricultureAdvice: generateAgricultureAdvice(
            response.data.main.temp,
            response.data.main.humidity,
            response.data.rain
          )
        };
      } catch (apiError) {
        console.log('Weather API error, using mock data');
      }
    }

    // If API fails or no key, use mock data
    if (!weatherData) {
      weatherData = generateMockWeatherData(location);
    }

    // Save to database
    weather = new WeatherData(weatherData);
    await weather.save();

    res.json({
      success: true,
      source: apiKey ? 'api' : 'mock',
      weather
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message 
    });
  }
};

// Helper function to generate agriculture advice
function generateAgricultureAdvice(temp, humidity, rain) {
  let advice = [];
  
  if (temp > 35) {
    advice.push('🌡️ High temperature: Water crops in early morning or late evening');
  } else if (temp < 10) {
    advice.push('❄️ Low temperature: Protect sensitive crops with covers');
  }
  
  if (humidity > 80) {
    advice.push('💧 High humidity: Watch for fungal diseases, ensure proper ventilation');
  } else if (humidity < 40) {
    advice.push('🏜️ Low humidity: Increase irrigation frequency');
  }
  
  if (rain) {
    advice.push('🌧️ Rain expected: Delay pesticide application');
  } else {
    advice.push('☀️ No rain: Regular irrigation needed');
  }
  
  advice.push('✅ Check soil moisture before watering');
  
  return advice.join('. ');
}

// Mock weather data for testing
function generateMockWeatherData(location) {
  const temp = 25 + Math.random() * 10;
  return {
    location: {
      city: location,
      state: '',
      coordinates: { lat: 28.6139, lon: 77.2090 }
    },
    temperature: {
      current: temp,
      min: temp - 5,
      max: temp + 5
    },
    humidity: 60 + Math.random() * 30,
    precipitation: Math.random() * 10,
    windSpeed: 5 + Math.random() * 10,
    description: ['Clear sky', 'Partly cloudy', 'Light rain'][Math.floor(Math.random() * 3)],
    forecast: Array.from({ length: 5 }, (_, i) => ({
      date: new Date(Date.now() + i * 24 * 60 * 60 * 1000),
      temp: temp + (Math.random() * 4 - 2),
      condition: ['Sunny', 'Cloudy', 'Rain'][Math.floor(Math.random() * 3)]
    })),
    agricultureAdvice: generateAgricultureAdvice(temp, 65, false)
  };
}