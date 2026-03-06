import axios from 'axios';

// Separate axios instance for Flask ML server (port 5000)
const mlApi = axios.create({
    baseURL: 'http://localhost:5001',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Fetch dropdown reference data (districts, commodities, markets, varieties, grades)
export const getReferenceData = async () => {
    const response = await mlApi.get('/api/reference-data');
    return response.data;
};

// Fetch model statistics (accuracy, R2 score, etc.)
export const getModelStats = async () => {
    const response = await mlApi.get('/model-stats');
    return response.data;
};

// Fetch markets for a given district
export const getMarkets = async (district) => {
    const response = await mlApi.get('/get-markets', { params: { district } });
    return response.data;
};

// Fetch varieties for a given commodity
export const getVarieties = async (commodity) => {
    const response = await mlApi.get('/get-varieties', { params: { commodity } });
    return response.data;
};

// Price prediction — POST JSON to /predict-price
export const predictPrice = async ({ district, market, commodity, variety, grade, month }) => {
    const response = await mlApi.post('/predict-price', {
        district,
        market,
        commodity,
        variety,
        grade,
        month,
    });
    return response.data;
};

// Crop recommendation — POST form data to /predict-crop
export const predictCrop = async ({ temperature, soil_type, rainfall_category }) => {
    const formData = new FormData();
    formData.append('temperature', temperature);
    formData.append('soil_type', soil_type);
    formData.append('rainfall_category', rainfall_category);

    const response = await mlApi.post('/predict-crop', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
};

export default mlApi;
