#!/usr/bin/env python3
"""
Simple script to generate API keys for your Node.js developer friend
"""

import secrets
import json
from datetime import datetime, timedelta
import os

# Simple file to store keys
KEYS_FILE = 'production_keys.json'

def generate_api_key_for_friend(name, expiry_days=365):
    """Generate a new API key"""
    
    # Generate a secure random key
    api_key = f"agri_{secrets.token_urlsafe(32)}"
    
    # Load existing keys
    keys = {}
    if os.path.exists(KEYS_FILE):
        with open(KEYS_FILE, 'r') as f:
            keys = json.load(f)
    
    # Store the key
    keys[api_key] = {
        'name': name,
        'created_at': datetime.now().isoformat(),
        'expires_at': (datetime.now() + timedelta(days=expiry_days)).isoformat(),
        'active': True
    }
    
    # Save back to file
    with open(KEYS_FILE, 'w') as f:
        json.dump(keys, f, indent=2)
    
    return api_key

if __name__ == "__main__":
    print("\n🔑 Generate API Key for Node.js Developer")
    print("=" * 50)
    
    name = input("Enter developer/project name: ").strip()
    
    # Generate the key
    api_key = generate_api_key_for_friend(name)
    
    print("\n" + "="*60)
    print("✅ API KEY GENERATED - SEND THIS TO YOUR FRIEND")
    print("="*60)
    print(f"\n🔐 API Key: {api_key}")
    print("\n📋 API Endpoints for Node.js:")
    print("-" * 40)
    print("\n1. Crop Recommendation API:")
    print("   POST http://your-server-ip:5000/api/v1/predict-crop")
    print("\n2. Price Prediction API:")
    print("   POST http://your-server-ip:5000/api/v1/predict-price")
    print("\n3. Test API:")
    print("   GET http://your-server-ip:5000/api/v1/test")
    
    print("\n📌 Node.js Usage Example:")
    print("-" * 40)
    print("""
// In your Node.js project:

const fetch = require('node-fetch'); // or use axios

const API_KEY = '""" + api_key + """';
const BASE_URL = 'http://your-server-ip:5000/api/v1';

// 1. Crop Recommendation
async function getCropRecommendation(temperature, soilType, rainfall) {
    const response = await fetch(`${BASE_URL}/predict-crop`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-API-Key': API_KEY
        },
        body: JSON.stringify({
            temperature: temperature,
            soil_type: soilType,
            rainfall_category: rainfall
        })
    });
    
    const data = await response.json();
    return data;
}

// 2. Price Prediction
async function getPricePrediction(params) {
    const response = await fetch(`${BASE_URL}/predict-price`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-API-Key': API_KEY
        },
        body: JSON.stringify({
            district: params.district,
            market: params.market,
            commodity: params.commodity,
            variety: params.variety,
            grade: params.grade,
            month: params.month
        })
    });
    
    const data = await response.json();
    return data;
}

// Usage example
getCropRecommendation(25, 'Medium Fertility', 'Medium')
    .then(data => console.log('Recommended crop:', data.data.best_crop))
    .catch(err => console.error('Error:', err));
    """)
    
    print("\n" + "="*60)
    print("⚠️  IMPORTANT: Save this key - it won't be shown again!")
    print("="*60)
    
    # Save to a text file to send
    filename = f"api_key_for_{name.lower().replace(' ', '_')}.txt"
    with open(filename, 'w') as f:
        f.write(f"API Key for {name}\n")
        f.write(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write(f"Expires: {(datetime.now() + timedelta(days=365)).strftime('%Y-%m-%d')}\n")
        f.write(f"\nAPI Key: {api_key}\n\n")
        f.write("ENDPOINTS:\n")
        f.write("- Crop: POST http://your-server-ip:5000/api/v1/predict-crop\n")
        f.write("- Price: POST http://your-server-ip:5000/api/v1/predict-price\n")
    
    print(f"\n📄 Key also saved to: {filename}")
    print("Send this file to your friend!")