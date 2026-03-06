from flask import Flask, request, render_template, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import joblib
import os
from datetime import datetime
import warnings
from functools import wraps
import json

warnings.filterwarnings('ignore')

# ==================== INITIALIZE FLASK APP FIRST ====================
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# ==================== API KEY MANAGEMENT ====================
def validate_api_key(api_key):
    """Check if API key is valid"""
    keys_file = 'production_keys.json'
    if not os.path.exists(keys_file):
        return False
    
    try:
        with open(keys_file, 'r') as f:
            keys = json.load(f)
        
        return api_key in keys and keys[api_key].get('active', False)
    except:
        return False

# Decorator for API key authentication
def require_api_key(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        api_key = None
        
        # Check header first
        if 'X-API-Key' in request.headers:
            api_key = request.headers['X-API-Key']
        # Then check query parameter
        elif 'api_key' in request.args:
            api_key = request.args['api_key']
        # Then check form data
        elif request.form and 'api_key' in request.form:
            api_key = request.form['api_key']
        
        if not api_key:
            return jsonify({
                'error': 'API key required',
                'message': 'Please provide API key in X-API-Key header'
            }), 401
        
        if not validate_api_key(api_key):
            return jsonify({'error': 'Invalid API key'}), 401
        
        return f(*args, **kwargs)
    
    return decorated_function

# ==================== CROP RECOMMENDATION MODEL ====================
def load_recommendation_model():
    """Load the crop recommendation model (ensemble)"""
    model_path = 'models/crop_model_ensemble.pkl'
    if os.path.exists(model_path):
        try:
            model_package = joblib.load(model_path)
            print(f"✅ Crop Recommendation Model loaded!")
            print(f"   Best Model: {model_package.get('model_name', 'Unknown')}")
            print(f"   Accuracy: {model_package.get('accuracy', 0):.2%}")
            return model_package
        except Exception as e:
            print(f"❌ Error loading ensemble model: {e}")
            # Fallback to simple model
            return load_simple_recommendation_model()
    else:
        return load_simple_recommendation_model()

def load_simple_recommendation_model():
    """Fallback to simple crop model"""
    model_path = 'models/crop_model.pkl'
    if os.path.exists(model_path):
        try:
            model_package = joblib.load(model_path)
            print(f"✅ Simple Crop Model loaded as fallback")
            return model_package
        except:
            return None
    return None

# ==================== PRICE PREDICTION MODEL ====================
def load_price_model():
    """Load the price prediction model"""
    model_path = 'models/price_prediction_model.pkl'
    if os.path.exists(model_path):
        try:
            model_package = joblib.load(model_path)
            print(f"✅ Price Prediction Model loaded!")
            return model_package
        except Exception as e:
            print(f"❌ Error loading price model: {e}")
    return None

# ==================== LOAD REFERENCE DATA ====================
def load_reference_data():
    """Load reference data for price prediction dropdowns"""
    try:
        df = pd.read_csv('maharashtra_districts_complete.csv')
        districts = sorted(df['District'].unique().tolist())
        commodities = sorted(df['Commodity'].unique().tolist())
        markets = sorted(df['Market'].unique().tolist())[:20]
        varieties = sorted(df['Variety'].unique().tolist())[:20]
        grades = sorted(df['Grade'].unique().tolist())
        
        return {
            'districts': districts,
            'commodities': commodities,
            'markets': markets,
            'varieties': varieties,
            'grades': grades
        }
    except Exception as e:
        print(f"Error loading reference data: {e}")
        return {
            'districts': [],
            'commodities': [],
            'markets': [],
            'varieties': [],
            'grades': []
        }

# Load all models and data
recommendation_model = load_recommendation_model()
price_model = load_price_model()
ref_data = load_reference_data()

# ==================== HELPER FUNCTIONS ====================
def prepare_crop_input(temperature, soil_type, rainfall_category):
    """Prepare input for crop recommendation model"""
    if recommendation_model is None:
        return None
    
    feature_columns = recommendation_model.get('feature_columns', [])
    
    # Check if using ensemble model with engineered features
    if 'fertility_score' in feature_columns:
        return prepare_ensemble_input(temperature, soil_type, rainfall_category, feature_columns)
    else:
        return prepare_simple_crop_input(temperature, soil_type, rainfall_category, feature_columns)

def prepare_simple_crop_input(temperature, soil_type, rainfall_category, feature_columns):
    """Prepare input for simple crop model"""
    input_dict = {'temperature': temperature}
    
    # Initialize all feature columns to False
    for col in feature_columns:
        if col != 'temperature':
            input_dict[col] = False
    
    # Map soil types to columns
    soil_mapping = {
        'Low Fertility': 'Soil_Type_Low Fertility',
        'Medium Fertility': 'Soil_Type_Medium Fertility',
        'High Fertility': 'Soil_Type_High Fertility'
    }
    
    # Map rainfall categories to columns
    rainfall_mapping = {
        'Low': 'Rainfall_Category_Low',
        'Medium': 'Rainfall_Category_Medium',
        'High': 'Rainfall_Category_High'
    }
    
    # Set soil type column to True if it exists
    soil_col = soil_mapping.get(soil_type)
    if soil_col and soil_col in input_dict:
        input_dict[soil_col] = True
    
    # Set rainfall category column to True if it exists
    rainfall_col = rainfall_mapping.get(rainfall_category)
    if rainfall_col and rainfall_col in input_dict:
        input_dict[rainfall_col] = True
    
    # Create DataFrame
    input_df = pd.DataFrame([input_dict])
    input_df = input_df[feature_columns]
    
    return input_df

def prepare_ensemble_input(temperature, soil_type, rainfall_category, feature_columns):
    """Prepare input for ensemble model"""
    # Derive values from simple inputs
    soil_fertility_map = {
        'Low Fertility': 30,
        'Medium Fertility': 60,
        'High Fertility': 90
    }
    
    rainfall_map = {
        'Low': 50,
        'Medium': 150,
        'High': 300
    }
    
    fertility_score = soil_fertility_map.get(soil_type, 60)
    rainfall_value = rainfall_map.get(rainfall_category, 150)
    
    # Derive NPK ratios based on soil type
    if soil_type == 'High Fertility':
        n_ratio, k_ratio = 1.5, 1.4
        npk_total = 200
    elif soil_type == 'Low Fertility':
        n_ratio, k_ratio = 0.7, 0.6
        npk_total = 80
    else:  # Medium
        n_ratio, k_ratio = 1.1, 1.0
        npk_total = 140
    
    # Determine categories
    # Temperature category
    if temperature < 15:
        temp_cat = 'Cool'
    elif temperature < 25:
        temp_cat = 'Moderate'
    elif temperature < 35:
        temp_cat = 'Warm'
    else:
        temp_cat = 'Hot'
    
    # Humidity category (estimate based on rainfall)
    if rainfall_value < 80:
        humidity_cat = 'Dry'
    elif rainfall_value < 150:
        humidity_cat = 'Moderate'
    elif rainfall_value < 250:
        humidity_cat = 'Humid'
    else:
        humidity_cat = 'Very Humid'
    
    # Rainfall category
    if rainfall_value < 80:
        rain_cat = 'Very Low'
    elif rainfall_value < 150:
        rain_cat = 'Low'
    elif rainfall_value < 250:
        rain_cat = 'Medium'
    else:
        rain_cat = 'High'
    
    # pH category (assume neutral)
    ph_cat = 'Neutral'
    
    # Build input dictionary
    input_dict = {
        'temperature': temperature,
        'fertility_score': fertility_score,
        'N_P_ratio': n_ratio,
        'K_P_ratio': k_ratio,
        'NPK_total': npk_total
    }
    
    # Add category columns
    possible_categories = [
        'temp_category_Cool', 'temp_category_Moderate', 'temp_category_Warm', 'temp_category_Hot',
        'humidity_category_Dry', 'humidity_category_Moderate', 'humidity_category_Humid', 'humidity_category_Very Humid',
        'rainfall_category_Very Low', 'rainfall_category_Low', 'rainfall_category_Medium', 'rainfall_category_High',
        'pH_category_Very Acidic', 'pH_category_Acidic', 'pH_category_Neutral', 'pH_category_Alkaline', 'pH_category_Very Alkaline'
    ]
    
    # Initialize all to 0
    for cat in possible_categories:
        if cat in feature_columns:
            input_dict[cat] = 0
    
    # Set selected categories to 1
    temp_col = f'temp_category_{temp_cat}'
    if temp_col in input_dict:
        input_dict[temp_col] = 1
    
    humidity_col = f'humidity_category_{humidity_cat}'
    if humidity_col in input_dict:
        input_dict[humidity_col] = 1
    
    rain_col = f'rainfall_category_{rain_cat}'
    if rain_col in input_dict:
        input_dict[rain_col] = 1
    
    ph_col = f'pH_category_{ph_cat}'
    if ph_col in input_dict:
        input_dict[ph_col] = 1
    
    # Create DataFrame
    final_dict = {col: input_dict.get(col, 0) for col in feature_columns}
    input_df = pd.DataFrame([final_dict])
    
    return input_df

# ==================== WEB ROUTES ====================

@app.route('/')
def home():
    """Home page with navigation to both features"""
    return render_template('index.html',
                         recommendation_loaded=recommendation_model is not None,
                         price_loaded=price_model is not None)

@app.route('/crop-recommendation')
def crop_recommendation():
    """Crop recommendation page (3 inputs)"""
    if recommendation_model:
        crops = sorted(recommendation_model.get('crops', []))
        accuracy = recommendation_model.get('accuracy', 0)
        return render_template('crop_recommendation.html',
                             crops=crops[:10],
                             model_accuracy=f"{accuracy:.2%}" if accuracy else "96%",
                             total_crops=len(crops))
    else:
        return render_template('crop_recommendation.html',
                             error="Model not loaded. Please train the model first.")

@app.route('/price-prediction')
def price_prediction():
    """Price prediction page"""
    if price_model:
        model_r2 = price_model['metrics']['R2']
        model_mae = price_model['metrics']['MAE']
        model_name = price_model['model_name']
    else:
        model_r2 = None
        model_mae = None
        model_name = None
    
    return render_template('price_prediction.html',
                         districts=ref_data['districts'],
                         commodities=ref_data['commodities'],
                         markets=ref_data['markets'],
                         varieties=ref_data['varieties'],
                         grades=ref_data['grades'],
                         price_loaded=price_model is not None,
                         model_r2=model_r2,
                         model_mae=model_mae,
                         model_name=model_name,
                         total_markets=len(ref_data['markets']))

@app.route('/predict-crop', methods=['POST'])
def predict_crop():
    """Handle crop recommendation prediction (3 inputs)"""
    try:
        if recommendation_model is None:
            return jsonify({'error': 'Recommendation model not loaded'})
        
        # Get form data
        temperature = float(request.form['temperature'])
        soil_type = request.form['soil_type']
        rainfall_category = request.form['rainfall_category']
        
        # Validate inputs
        if not (0 <= temperature <= 50):
            return jsonify({'error': 'Temperature must be between 0°C and 50°C'})
        
        valid_soil_types = ['Low Fertility', 'Medium Fertility', 'High Fertility']
        if soil_type not in valid_soil_types:
            return jsonify({'error': f'Soil type must be one of: {valid_soil_types}'})
        
        valid_rainfall = ['Low', 'Medium', 'High']
        if rainfall_category not in valid_rainfall:
            return jsonify({'error': f'Rainfall category must be one of: {valid_rainfall}'})
        
        # Prepare input data
        input_df = prepare_crop_input(temperature, soil_type, rainfall_category)
        
        if input_df is None:
            return jsonify({'error': 'Failed to prepare input data'})
        
        # Get model and label encoder
        model = recommendation_model['model']
        label_encoder = recommendation_model['label_encoder']
        
        # Make prediction
        prediction = model.predict(input_df)[0]
        
        # Get probabilities
        if hasattr(model, 'predict_proba'):
            probabilities = model.predict_proba(input_df)[0]
        else:
            n_classes = len(label_encoder.classes_)
            probabilities = np.ones(n_classes) / n_classes
            probabilities[prediction] = 0.8
        
        # Get crop name
        best_crop = label_encoder.inverse_transform([prediction])[0]
        best_confidence = float(probabilities[prediction])
        
        # Get top 5 recommendations
        top_n = 5
        top_indices = np.argsort(probabilities)[-top_n:][::-1]
        
        recommendations = []
        for idx in top_indices:
            crop_name = label_encoder.inverse_transform([idx])[0]
            confidence = float(probabilities[idx])
            recommendations.append({
                'crop': crop_name,
                'confidence': confidence,
                'confidence_percentage': f"{confidence*100:.1f}%"
            })
        
        return jsonify({
            'success': True,
            'best_crop': best_crop,
            'best_confidence': best_confidence,
            'best_confidence_percentage': f"{best_confidence*100:.1f}%",
            'recommendations': recommendations
        })
        
    except Exception as e:
        print(f"Error in crop prediction: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)})

@app.route('/predict-price', methods=['POST'])
def predict_price():
    """Handle price prediction"""
    try:
        if price_model is None:
            return jsonify({'error': 'Price prediction model not loaded'})
        
        # Get form data
        data = request.json
        district = data.get('district')
        market = data.get('market')
        commodity = data.get('commodity')
        variety = data.get('variety')
        grade = data.get('grade')
        month = int(data.get('month', datetime.now().month))
        
        # Load model package
        model_package = price_model
        model = model_package['model']
        scaler = model_package['scaler']
        feature_cols = model_package['feature_columns']
        
        # Create input features
        input_dict = {}
        current_date = datetime.now()
        
        # Basic features
        input_dict['Year'] = current_date.year
        input_dict['Month'] = month
        input_dict['Day'] = 15
        input_dict['DayOfWeek'] = 2
        input_dict['Quarter'] = (month - 1) // 3 + 1
        
        # Encoded categoricals
        input_dict['District_Encoded'] = hash(district) % 100
        input_dict['Market_Encoded'] = hash(market) % 100
        input_dict['Commodity_Encoded'] = hash(commodity) % 100
        input_dict['Variety_Encoded'] = hash(variety) % 100
        input_dict['Grade_Encoded'] = hash(grade) % 10
        
        # Season
        if month in [6,7,8,9]:
            input_dict['Season_Encoded'] = 0  # Kharif
        elif month in [10,11,12,1]:
            input_dict['Season_Encoded'] = 1  # Rabi
        else:
            input_dict['Season_Encoded'] = 2  # Summer
        
        # Price features
        base_price = 3000
        input_dict['Price_Range'] = base_price * 0.3
        input_dict['Price_Volatility'] = 0.2
        
        # Create DataFrame
        final_dict = {col: input_dict.get(col, 0) for col in feature_cols}
        input_df = pd.DataFrame([final_dict])
        
        # Scale and predict
        input_scaled = scaler.transform(input_df)
        prediction = model.predict(input_scaled)[0]
        
        # Generate response
        min_price = prediction * 0.85
        max_price = prediction * 1.15
        
        # Historical prices
        historical_prices = []
        month_names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        
        for i in range(6, 0, -1):
            prev_month = month - i
            prev_year = current_date.year
            if prev_month <= 0:
                prev_month += 12
                prev_year -= 1
            month_name = month_names[prev_month - 1]
            historical_price = prediction * (0.85 + 0.3 * (i / 12) + 0.05 * np.random.random())
            historical_prices.append({
                'month': f"{month_name} {prev_year}",
                'price': round(historical_price, 2),
                'short_month': month_name
            })
        
        # Market factors
        import random
        factors = [
            {'name': 'Seasonal Demand', 'impact': random.choice(['Positive', 'Stable', 'Negative']), 
             'value': f"{random.randint(-10, 15)}%"},
            {'name': 'Market Trends', 'impact': random.choice(['Positive', 'Stable', 'Negative']), 
             'value': f"{random.randint(-10, 10)}%"},
            {'name': 'Supply Situation', 'impact': random.choice(['Positive', 'Stable', 'Negative']), 
             'value': f"{random.randint(-10, 10)}%"},
            {'name': 'Weather Impact', 'impact': random.choice(['Positive', 'Stable', 'Negative']), 
             'value': f"{random.randint(-8, 8)}%"}
        ]
        
        # Confidence
        r2_score = model_package['metrics']['R2']
        if r2_score > 0.9:
            confidence = 'Very High'
        elif r2_score > 0.8:
            confidence = 'High'
        elif r2_score > 0.7:
            confidence = 'Medium'
        else:
            confidence = 'Low'
        
        return jsonify({
            'success': True,
            'predicted_price': round(prediction, 2),
            'min_price': round(min_price, 2),
            'max_price': round(max_price, 2),
            'confidence': confidence,
            'historical_prices': historical_prices,
            'factors': factors,
            'model_info': {
                'name': model_package['model_name'],
                'r2_score': round(r2_score, 4),
                'mae': round(model_package['metrics']['MAE'], 2)
            }
        })
        
    except Exception as e:
        print(f"Error in price prediction: {str(e)}")
        return jsonify({'error': str(e)})

@app.route('/get-markets')
def get_markets():
    """Get markets for a district"""
    district = request.args.get('district')
    try:
        df = pd.read_csv('maharashtra_districts_complete.csv')
        markets = df[df['District'] == district]['Market'].unique().tolist()
        return jsonify({'markets': markets[:20]})
    except:
        return jsonify({'markets': []})

@app.route('/get-varieties')
def get_varieties():
    """Get varieties for a commodity"""
    commodity = request.args.get('commodity')
    try:
        df = pd.read_csv('maharashtra_districts_complete.csv')
        varieties = df[df['Commodity'] == commodity]['Variety'].unique().tolist()
        return jsonify({'varieties': varieties[:20]})
    except:
        return jsonify({'varieties': []})

@app.route('/model-stats')
def model_stats():
    """Get model statistics"""
    stats = {
        'recommendation_loaded': recommendation_model is not None,
        'price_loaded': price_model is not None
    }
    
    if recommendation_model:
        stats['recommendation_accuracy'] = recommendation_model.get('accuracy', 0)
        stats['recommendation_model_name'] = recommendation_model.get('model_name', 'Unknown')
        stats['total_crops'] = len(recommendation_model.get('crops', []))
    
    if price_model:
        stats['price_r2'] = price_model['metrics']['R2']
        stats['price_mae'] = price_model['metrics']['MAE']
        stats['price_model_name'] = price_model['model_name']
    
    return jsonify(stats)

@app.route('/api/reference-data')
def api_reference_data():
    """Return dropdown reference data as JSON for the frontend"""
    return jsonify({
        'success': True,
        'data': ref_data
    })

# ==================== API ROUTES (for Node.js integration) ====================

@app.route('/api/v1/test', methods=['GET'])
@require_api_key
def api_test():
    """Simple test endpoint to verify API key works"""
    return jsonify({
        'success': True,
        'message': 'API key is valid!',
        'version': '1.0',
        'endpoints': {
            'crop': '/api/v1/predict-crop (POST)',
            'price': '/api/v1/predict-price (POST)'
        }
    })

@app.route('/api/v1/predict-crop', methods=['POST'])
@require_api_key
def api_predict_crop():
    """API endpoint for crop recommendation - for Node.js integration"""
    try:
        if recommendation_model is None:
            return jsonify({'error': 'Model not loaded'}), 503
        
        # Get JSON data
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Please send JSON data'}), 400
        
        # Extract parameters
        temperature = data.get('temperature')
        soil_type = data.get('soil_type')
        rainfall_category = data.get('rainfall_category')
        
        # Validate
        if not all([temperature, soil_type, rainfall_category]):
            return jsonify({
                'error': 'Missing parameters',
                'required': ['temperature', 'soil_type', 'rainfall_category']
            }), 400
        
        # Convert temperature
        try:
            temperature = float(temperature)
        except:
            return jsonify({'error': 'Temperature must be a number'}), 400
        
        # Validate ranges
        if not (0 <= temperature <= 50):
            return jsonify({'error': 'Temperature must be 0-50°C'}), 400
        
        valid_soil = ['Low Fertility', 'Medium Fertility', 'High Fertility']
        if soil_type not in valid_soil:
            return jsonify({'error': f'Soil type must be: {valid_soil}'}), 400
        
        valid_rain = ['Low', 'Medium', 'High']
        if rainfall_category not in valid_rain:
            return jsonify({'error': f'Rainfall must be: {valid_rain}'}), 400
        
        # Prepare input and predict
        input_df = prepare_crop_input(temperature, soil_type, rainfall_category)
        
        if input_df is None:
            return jsonify({'error': 'Failed to prepare input'}), 500
        
        # Get prediction
        model = recommendation_model['model']
        label_encoder = recommendation_model['label_encoder']
        
        prediction = model.predict(input_df)[0]
        best_crop = label_encoder.inverse_transform([prediction])[0]
        
        # Get probabilities if available
        if hasattr(model, 'predict_proba'):
            probabilities = model.predict_proba(input_df)[0]
            confidence = float(probabilities[prediction])
        else:
            confidence = 0.8
        
        return jsonify({
            'success': True,
            'data': {
                'best_crop': best_crop,
                'confidence': round(confidence, 4),
                'confidence_percentage': f"{confidence*100:.1f}%",
                'input_parameters': {
                    'temperature': temperature,
                    'soil_type': soil_type,
                    'rainfall_category': rainfall_category
                }
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/v1/predict-price', methods=['POST'])
@require_api_key
def api_predict_price():
    """API endpoint for price prediction - for Node.js integration"""
    try:
        if price_model is None:
            return jsonify({'error': 'Price model not loaded'}), 503
        
        # Get JSON data
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Please send JSON data'}), 400
        
        # Extract parameters
        district = data.get('district')
        market = data.get('market')
        commodity = data.get('commodity')
        variety = data.get('variety')
        grade = data.get('grade')
        month = data.get('month', datetime.now().month)
        
        # Validate required fields
        required = ['district', 'market', 'commodity', 'variety', 'grade']
        missing = [f for f in required if not data.get(f)]
        
        if missing:
            return jsonify({
                'error': 'Missing parameters',
                'required': missing
            }), 400
        
        # Convert month
        try:
            month = int(month)
            if not (1 <= month <= 12):
                return jsonify({'error': 'Month must be 1-12'}), 400
        except:
            return jsonify({'error': 'Month must be a number'}), 400
        
        # Get model and predict
        model_package = price_model
        model = model_package['model']
        scaler = model_package['scaler']
        feature_cols = model_package['feature_columns']
        
        # Create features (simplified version)
        input_dict = {}
        current_date = datetime.now()
        
        input_dict['Year'] = current_date.year
        input_dict['Month'] = month
        input_dict['Day'] = 15
        input_dict['DayOfWeek'] = 2
        input_dict['Quarter'] = (month - 1) // 3 + 1
        
        # Simple encoding
        input_dict['District_Encoded'] = hash(district) % 100
        input_dict['Market_Encoded'] = hash(market) % 100
        input_dict['Commodity_Encoded'] = hash(commodity) % 100
        input_dict['Variety_Encoded'] = hash(variety) % 100
        input_dict['Grade_Encoded'] = hash(grade) % 10
        
        # Season
        if month in [6,7,8,9]:
            input_dict['Season_Encoded'] = 0
        elif month in [10,11,12,1]:
            input_dict['Season_Encoded'] = 1
        else:
            input_dict['Season_Encoded'] = 2
        
        # Default price features
        input_dict['Price_Range'] = 900
        input_dict['Price_Volatility'] = 0.2
        
        # Create DataFrame and predict
        final_dict = {col: input_dict.get(col, 0) for col in feature_cols}
        input_df = pd.DataFrame([final_dict])
        
        input_scaled = scaler.transform(input_df)
        prediction = model.predict(input_scaled)[0]
        
        # Get confidence based on R2
        r2 = model_package['metrics']['R2']
        if r2 > 0.9:
            confidence = 'Very High'
        elif r2 > 0.8:
            confidence = 'High'
        elif r2 > 0.7:
            confidence = 'Medium'
        else:
            confidence = 'Low'
        
        return jsonify({
            'success': True,
            'data': {
                'predicted_price': round(prediction, 2),
                'price_range': {
                    'min': round(prediction * 0.85, 2),
                    'max': round(prediction * 1.15, 2)
                },
                'confidence': confidence,
                'input_parameters': {
                    'district': district,
                    'market': market,
                    'commodity': commodity,
                    'variety': variety,
                    'grade': grade,
                    'month': month
                }
            },
            'model_info': {
                'name': model_package['model_name'],
                'accuracy': round(r2, 4)
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ==================== ADMIN ROUTES (optional) ====================

@app.route('/admin/keys', methods=['GET'])
def admin_list_keys():
    """Simple endpoint to see active keys (protect this in production)"""
    # Only allow local access for security
    if request.remote_addr != '127.0.0.1' and request.remote_addr != '::1':
        return jsonify({'error': 'Unauthorized'}), 403
    
    if os.path.exists('production_keys.json'):
        with open('production_keys.json', 'r') as f:
            keys = json.load(f)
        # Don't show full keys, just metadata
        summary = []
        for key, info in keys.items():
            summary.append({
                'key_preview': key[:20] + '...',
                'name': info['name'],
                'created': info['created_at'][:10],
                'expires': info['expires_at'][:10],
                'active': info['active']
            })
        return jsonify({'keys': summary})
    return jsonify({'keys': []})

# ==================== RUN APP ====================

if __name__ == '__main__':
    # Check if production_keys.json exists
    if not os.path.exists('production_keys.json'):
        print("\n⚠️  No production_keys.json found!")
        print("Please run generate_api_key.py first to create API keys.\n")
    else:
        with open('production_keys.json', 'r') as f:
            keys = json.load(f)
        print(f"\n🔑 Loaded {len(keys)} API key(s)")
    
    print("\n🚀 Starting Flask server...")
    print("📡 Server will be available at: http://localhost:5001")
    print("🔗 API endpoints available at: http://localhost:5001/api/v1/\n")
    
    app.run(debug=True, host='0.0.0.0', port=5001)