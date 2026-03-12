const axios = require('axios');
const WeatherData = require('../models/WeatherData');

// Get Weather Forecast
exports.getWeatherForecast = async (req, res) => {
  try {
    const { city, state } = req.query;

    // Use default location if not provided
    const location = city || 'Delhi';

    // Check cache first (last 30 minutes)
    const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000);
    let weather = await WeatherData.findOne({
      'location.city': { $regex: new RegExp(`^${location}$`, 'i') },
      lastUpdated: { $gte: thirtyMinsAgo }
    });

    if (weather) {
      return res.json({
        success: true,
        source: 'cache',
        weather
      });
    }

    // Delete old cached data for this city
    await WeatherData.deleteMany({
      'location.city': { $regex: new RegExp(`^${location}$`, 'i') }
    });

    // If not in cache or stale, get from API
    const apiKey = process.env.WEATHER_API_KEY;
    let weatherData;

    if (apiKey && apiKey !== 'get_from_openweathermap.org') {
      try {
        const response = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=metric`
        );

        // Get 3-hour interval forecast — cnt=8 gives ~24 hours (8 x 3hrs)
        const forecastResponse = await axios.get(
          `https://api.openweathermap.org/data/2.5/forecast?q=${location}&appid=${apiKey}&units=metric&cnt=8`
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
        console.log('Weather API error, using mock data:', apiError.message);
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
      source: apiKey && apiKey !== 'get_from_openweathermap.org' ? 'api' : 'mock',
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

// Mock weather data — generates 3-hour intervals for today
function generateMockWeatherData(location) {
  const now = new Date();
  const baseTemp = 30 + Math.random() * 5; // Summer temps for India
  const conditions = ['Clear', 'Clouds', 'Haze'];

  return {
    location: {
      city: location,
      state: '',
      coordinates: { lat: 19.2183, lon: 72.9781 }
    },
    temperature: {
      current: baseTemp,
      min: baseTemp - 3,
      max: baseTemp + 5
    },
    humidity: 50 + Math.random() * 20,
    precipitation: 0,
    windSpeed: 5 + Math.random() * 10,
    description: 'Haze',
    forecast: Array.from({ length: 8 }, (_, i) => {
      const forecastTime = new Date(now.getTime() + (i + 1) * 3 * 60 * 60 * 1000);
      const hour = forecastTime.getHours();
      // Temperature varies by time of day
      let tempOffset = 0;
      if (hour >= 6 && hour < 12) tempOffset = -2 + (hour - 6);
      else if (hour >= 12 && hour < 16) tempOffset = 4;
      else if (hour >= 16 && hour < 20) tempOffset = 2;
      else tempOffset = -3;

      return {
        date: forecastTime,
        temp: Math.round((baseTemp + tempOffset) * 10) / 10,
        condition: conditions[Math.floor(Math.random() * conditions.length)]
      };
    }),
    agricultureAdvice: generateAgricultureAdvice(baseTemp, 55, false)
  };
}