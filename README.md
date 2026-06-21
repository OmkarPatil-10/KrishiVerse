# KrishiVerse

KrishiVerse is a smart farming platform that connects farmers, buyers, and contractors through a web dashboard, AI-based crop and price prediction tools, and blockchain-backed contract handling.

## Project Overview

This repository contains four main parts:

- **Frontend**: React + Vite dashboard for users to manage contracts, weather, wallet, and predictions.
- **Backend**: Node.js + Express API for authentication, contracts, notifications, chatbot, and weather services.
- **Blockchain**: Solidity smart contract setup for escrow and contract flow.
- **Crop Recommendation System**: Flask-based ML service for crop recommendation and market price prediction.

## Features

- User registration/login and profile management
- Smart contract creation and tracking
- Marketplace and weather insights
- AI crop recommendation and price prediction
- Chatbot support for farming queries
- Wallet and escrow integration

## Folder Structure

- `Frontend/` - React frontend application
- `Backend/` - Express backend server and APIs
- `Blockchain/` - Smart contract files
- `crop_recommendation_system/` - ML models and Flask APIs

## Prerequisites

Make sure you have the following installed:

- Node.js and npm
- Python 3.10+
- MongoDB
- Git

## Setup Instructions

### 1. Backend

```bash
cd Backend
npm install
npm run dev
```

The backend runs on:
- http://localhost:5000

### 2. Frontend

```bash
cd Frontend
npm install
npm run dev
```

The frontend runs on:
- http://localhost:5173

### 3. Crop Recommendation System

```bash
cd crop_recommendation_system
python -m venv venv
source venv/bin/activate   # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

The ML service runs on:
- http://localhost:5001

### 4. Blockchain

```bash
cd Blockchain
npm install
```

## Environment Variables

Create a `.env` file in the Backend folder and add the required values such as:

- `MONGODB_URI`
- `JWT_SECRET`
- `PORT`
- `WEATHER_API_KEY`
- `OPENROUTER_API_KEY` or `GEMINI_API_KEY`
- email configuration variables if needed

## How the System Works

1. Users interact with the React frontend.
2. The backend handles authentication, contracts, and notifications.
3. The ML service provides crop and price recommendations.
4. Blockchain smart contracts manage secure escrow and contract execution.

## Notes

- The frontend expects the backend API base URL from the environment.
- The ML service should be running for crop and price prediction pages to work correctly.
- Make sure MongoDB is running before starting the backend.

## License

This project is for educational and demonstration purposes.
