# SunCool - Backend API

Backend API server for the SunCool sensor monitoring system.

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Firebase Admin Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Project Settings > Service Accounts
4. Click "Generate New Private Key"
5. Save the downloaded JSON file as `serviceAccountKey.json` in the `backend` folder

### 3. Environment Configuration

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update `.env` with your Firebase database URL:
   ```
   FIREBASE_DATABASE_URL=https://your-project-id.firebaseio.com
   PORT=3000
   ```

### 4. Run the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will run on `http://localhost:3000`

## API Endpoints

### Public Endpoints

- `GET /api/health` - Health check endpoint
- `POST /api/temperatures` - Add new temperature reading (for sensors)

### Protected Endpoints (Require Authentication Token)

- `GET /api/temperatures` - Get temperature data (limit query parameter supported)
- `GET /api/temperatures/latest` - Get the most recent temperature reading
- `GET /api/temperatures/stats` - Get temperature statistics
- `DELETE /api/temperatures/old` - Delete old temperature records

### Authentication

Protected endpoints require a Firebase Auth token in the Authorization header:

```
Authorization: Bearer <firebase-auth-token>
```

## Example Requests

### Add Temperature Data (Sensor/Testing)

```bash
curl -X POST http://localhost:3000/api/temperatures \
  -H "Content-Type: application/json" \
  -d '{"temperature": 28.5, "humidity": 65}'
```

### Get Temperature Data (Authenticated)

```bash
curl http://localhost:3000/api/temperatures?limit=50 \
  -H "Authorization: Bearer <your-firebase-token>"
```

## Database Structure

The backend expects the following Firebase Realtime Database structure:

```
temperatures/
  ├─ {pushId1}/
  │   ├─ temperature: 28.5
  │   ├─ humidity: 65
  │   └─ timestamp: 1706400000000
  ├─ {pushId2}/
  │   ├─ temperature: 29.2
  │   ├─ humidity: 68
  │   └─ timestamp: 1706400060000
  ...
```

## Security Notes

- Keep `serviceAccountKey.json` secure and never commit it to version control
- In production, implement additional security measures for the POST endpoint
- Consider implementing rate limiting for public endpoints
- Use Firebase Security Rules to secure your database

## Development

The backend uses:
- Express.js for the web server
- Firebase Admin SDK for database and authentication
- CORS enabled for cross-origin requests
- Environment variables for configuration
