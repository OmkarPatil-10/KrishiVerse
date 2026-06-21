# Crop Recommendation System

This project is a Flask-based agricultural intelligence system that helps users:
- recommend suitable crops based on temperature, soil fertility, and rainfall
- estimate market prices for agricultural commodities
- view model statistics and reference data through a web UI and API

---
### Dataset
[Click Here to Download all CSV file](https://drive.google.com/drive/folders/1G-M6lTBDESUkhNI956pmuh_LXD0y0Rvb?usp=drive_link)

## Features

### 1. Crop Recommendation
The system predicts the best crop for a given environment using machine learning models.

Inputs used by the prediction flow:
- temperature
- soil type
- rainfall category

Outputs include:
- best crop prediction
- confidence score
- top 5 recommended crops

### 2. Price Prediction
The system estimates expected commodity prices using trained regression models.

It uses inputs such as:
- district
- market
- commodity
- variety
- grade
- selected month

### 3. Web Interface
The project includes HTML templates for:
- home page
- crop recommendation page
- price prediction page

### 4. API Access
The system exposes both browser-friendly routes and JSON APIs, including API key protection for external integrations.

---

## Tech Stack

- Python
- Flask
- Flask-CORS
- Pandas
- NumPy
- Scikit-learn
- XGBoost
- LightGBM
- CatBoost
- Joblib
- HTML/CSS templates

---

## Project Structure

- [app.py](app.py) - Main Flask application and routes
- [data_preparation.py](data_preparation.py) - Dataset cleaning and feature engineering
- [model_training.py](model_training.py) - Crop recommendation model training
- [train_price_model.py](train_price_model.py) - Price prediction model training
- [generate_api_key.py](generate_api_key.py) - Creates API keys for external use
- [requirements.txt](requirements.txt) - Python dependencies
- [templates/](templates) - HTML pages
- [static/](static) - CSS/static assets
- [models/](models) - Saved ML model files
- [*.csv](.) - Dataset files used for training and reference data

---

## Setup Instructions

### 1. Create a virtual environment

```bash
python -m venv venv
venv\Scripts\activate
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Generate API keys (optional but recommended)

```bash
python generate_api_key.py
```

This creates `production_keys.json` and saves a key file for API access.

### 4. Run the application

```bash
python app.py
```

The app runs by default on:
- `http://localhost:5001`

---

## Main Routes

### Web Pages
- `/` - Home page
- `/crop-recommendation` - Crop recommendation UI
- `/price-prediction` - Price prediction UI

### Prediction Routes
- `POST /predict-crop`
- `POST /predict-price`

### Reference Routes
- `/get-markets`
- `/get-varieties`
- `/model-stats`
- `/api/reference-data`

### API Routes for External Integration
- `GET /api/v1/test`
- `POST /api/v1/predict-crop`
- `POST /api/v1/predict-price`

These API endpoints require an API key sent in either:
- `X-API-Key` header, or
- `api_key` query parameter

---

## API Example

### Crop prediction request

```http
POST /api/v1/predict-crop
X-API-Key: your_api_key
Content-Type: application/json
```

```json
{
  "temperature": 25,
  "soil_type": "Medium Fertility",
  "rainfall_category": "Medium"
}
```

### Price prediction request

```http
POST /api/v1/predict-price
X-API-Key: your_api_key
Content-Type: application/json
```

```json
{
  "district": "Pune",
  "market": "Pune",
  "commodity": "Wheat",
  "variety": "Local",
  "grade": "A",
  "month": 7
}
```

---

## Model Files

The trained models are stored in the `models` folder:
- `crop_model_ensemble.pkl`
- `crop_model.pkl`
- `price_prediction_model.pkl`

These files are loaded at startup by [app.py](app.py).

---

## Data Files

The project uses several CSV datasets such as:
- `crop_recommendation.csv`
- `crop_recommendation_data.csv`
- `maharashtra_districts_complete.csv`
- `price_prediction_cleaned.csv`

These files are used for training and for reference dropdown values in the UI.

---

## Notes

- The application expects the model files to exist before running.
- If the models are missing, the app may still start but prediction features may not work correctly.
- The API key system is intended for protecting external service access.
- Some scripts are designed to help with training and experimentation, so they should be used carefully in production.

---

## Suggested Next Improvements

- add proper validation for all inputs
- improve price prediction accuracy with richer real-world market data
- add authentication for admin routes
- containerize the application with Docker
- add automated tests for the prediction endpoints
