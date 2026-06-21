# KrishiVerse Backend API

This folder contains the backend service for the KrishiVerse platform. It handles user authentication, contract management, notifications, weather data, OTP/email verification, support queries, and the farming chatbot.

## Overview

The backend is built with:
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT authentication
- Socket.IO for real-time contract messaging
- Nodemailer for email services

The server starts from [server.js](server.js) and registers all API routes under the `/api` prefix.

---

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express
- **Database**: MongoDB
- **ORM/ODM**: Mongoose
- **Auth**: JSON Web Tokens (JWT)
- **Real-time**: Socket.IO
- **Email**: Nodemailer
- **Environment config**: dotenv

---

## Project Structure

- [server.js](server.js) - Main server entry point
- [src/routes](src/routes) - API route definitions
- [src/controllers](src/controllers) - Business logic for each feature
- [src/models](src/models) - MongoDB schemas/models
- [src/middleware](src/middleware) - Auth and access control logic
- [src/config](src/config) - Database configuration

---

## Installation

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file in this folder with the required variables:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/krishiverse
JWT_SECRET=your_jwt_secret
WEATHER_API_KEY=your_openweathermap_key
OPENROUTER_API_KEY=your_openrouter_key
GEMINI_API_KEY=your_gemini_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

3. Start the server:

### Development mode
```bash
npm run dev
```

### Production mode
```bash
npm start
```

The server will run on:
- `http://localhost:5000`

---

## API Base URL

All APIs are available under:

```text
http://localhost:5000/api
```

---

## Authentication

The backend uses JWT-based authentication.

### How it works
- Users log in using email and password.
- A token is returned in the response.
- The frontend sends the token in the `Authorization: Bearer <token>` header.

### Middleware
The auth middleware validates the token and attaches:
- `req.userId`
- `req.userType`

This middleware is used for protected routes.

---

## Routes and Endpoints

### 1. Auth Routes
Base path: `/api/auth`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and get JWT token |
| GET | `/api/auth/me` | Get logged-in user details |
| PUT | `/api/auth/profile` | Update user profile |
| GET | `/api/auth/test` | Health check for auth routes |

#### Register request example
```json
{
  "name": "Amit",
  "email": "amit@example.com",
  "password": "123456",
  "confirmPassword": "123456",
  "role": "farmer"
}
```

#### Login request example
```json
{
  "email": "amit@example.com",
  "password": "123456"
}
```

---

### 2. Contract Routes
Base path: `/api/contracts`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/contracts` | Create a new contract |
| GET | `/api/contracts` | Get all contracts |
| GET | `/api/contracts/:id` | Get a single contract |
| POST | `/api/contracts/:id/accept` | Farmer accepts contract |
| POST | `/api/contracts/:id/reject` | Farmer rejects contract |
| POST | `/api/contracts/:id/out-for-delivery` | Mark contract as out for delivery |
| POST | `/api/contracts/:id/deliver` | Contractor confirms delivery |
| PUT | `/api/contracts/:id` | Update contract |
| GET | `/api/contracts/:id/messages` | Get chat messages for a contract |

#### Create contract example
```json
{
  "buyerId": "64abc123",
  "buyerName": "Buyer Company",
  "cropName": "Wheat",
  "quantity": 50,
  "budgetPerUnit": 2000,
  "expectedDeliveryDate": "2026-07-10"
}
```

---

### 3. Weather Routes
Base path: `/api/weather`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/weather?city=Pune&state=Maharashtra` | Get weather and farming advice |

The controller checks cached weather data first and falls back to mocked data if the API key is missing or the API fails.

---

### 4. Crop Routes
Base path: `/api/crops`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/crops` | Get crop data |
| POST | `/api/crops` | Add a crop entry |
| POST | `/api/crops/bulk` | Add multiple crops |

---

### 5. User Routes
Base path: `/api/users`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/farmers` | Get connected farmers |
| GET | `/api/users/farmers/:id` | Get farmer details |
| POST | `/api/users/network/add` | Add user to network |
| POST | `/api/users/network/remove` | Remove user from network |
| GET | `/api/users/network/my` | Get current user's network |

---

### 6. Notification Routes
Base path: `/api/notifications`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | Get notifications |
| PATCH | `/api/notifications/read-all` | Mark all as read |
| PATCH | `/api/notifications/:id/read` | Mark one notification as read |

---

### 7. OTP Routes
Base path: `/api/otp`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/otp/send-otp` | Send OTP to email |
| POST | `/api/otp/verify-otp` | Verify OTP |
| GET | `/api/otp/test` | Test route |

---

### 8. Support Routes
Base path: `/api/support`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/support` | Send support email to admin |

---

### 9. Chatbot Routes
Base path: `/api/chatbot`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chatbot/chat` | Send a farming-related question |

Example request:
```json
{
  "message": "How can I improve wheat crop yield during dry weather?"
}
```

---

## Models

### User Model
Stores user account details and profile information.

Important fields:
- `name`
- `email`
- `password`
- `userType` (`farmer`, `contractor`, `buyer`, `admin`)
- `walletAddress`
- `businessName`, `contractorType`, etc.

### Contract Model
Stores contract details between buyer and farmer.

Important fields:
- `buyerId`, `buyerName`
- `cropName`, `quantity`, `budgetPerUnit`
- `status`
- `acceptedBy`
- `transactionHash`
- `blockchainContractId`

### WeatherData Model
Stores weather responses and agricultural advice.

### Notification Model
Stores user notifications with read/unread status.

### Message Model
Stores contract chat messages.

---

## Middleware

### `authMiddleware`
Validates the JWT token and allows access to protected routes.

### `requireUserType`
Can be used to restrict routes based on user type.

---

## Real-Time Messaging

The backend uses Socket.IO to support contract messaging.

### Events
- `join_room` - Join chat room for a specific contract
- `send_message` - Send message to contract room
- `receive_message` - Broadcast message to all users in the room

This is useful for communicating between farmers and buyers about contract progress.

---

## Health Check

The server exposes a health endpoint:

```http
GET /api/health
```

Example response:
```json
{
  "status": "✅ Krishiverse Backend is running!",
  "timestamp": "2026-06-21T00:00:00.000Z",
  "database": "Connected"
}
```

---

## Notes

- MongoDB must be running before starting the backend.
- The frontend depends on this server for authentication, contracts, and notifications.
- Weather and chatbot features may depend on external API keys.
- The app uses simple password handling in some places for development/testing, so production should improve security before deployment.

---

## Recommended Next Improvements

- Add password hashing using bcrypt in production
- Add request validation using Joi or Zod
- Add rate limiting for login and OTP endpoints
- Add role-based access control for sensitive admin routes
- Add proper logging and monitoring
