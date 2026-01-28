# SunCool - Frontend

Frontend web application for the SunCool sensor monitoring system.

## Overview

SunCool is a sensor-based cooling system monitoring dashboard designed for high-temperature and high-humidity environments. The frontend provides real-time visualization of temperature data and system statistics.

## Features

- 🔐 Google Authentication via Firebase
- 📊 Real-time temperature monitoring
- 📈 Interactive temperature charts
- 📋 Historical temperature logs
- 📱 Responsive design (mobile & desktop)
- 🎨 Clean and intuitive UI

## Setup Instructions

### 1. Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing one
3. Enable Google Authentication:
   - Go to Authentication > Sign-in method
   - Enable Google provider
4. Enable Realtime Database:
   - Go to Realtime Database > Create Database
   - Start in test mode (or configure security rules)
5. Get your Firebase config:
   - Go to Project Settings > General
   - Scroll to "Your apps" section
   - Copy the firebaseConfig object

### 2. Update Firebase Configuration

Edit `firebase-config.js` and replace the placeholder values with your actual Firebase configuration:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    databaseURL: "YOUR_DATABASE_URL",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

### 3. Run the Application

Since this is a plain HTML/JavaScript application, you can run it using any web server:

#### Option 1: Python HTTP Server

```bash
cd frontend
python -m http.server 8000
```

Then open `http://localhost:8000` in your browser.

#### Option 2: Node.js HTTP Server

```bash
cd frontend
npx http-server -p 8000
```

#### Option 3: VS Code Live Server

1. Install the "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"

## Firebase Database Structure

The application expects temperature data in the following format:

```
temperatures/
  ├─ {pushId}/
  │   ├─ temperature: 28.5
  │   ├─ humidity: 65 (optional)
  │   └─ timestamp: 1706400000000
```

## Security Rules (Firebase Realtime Database)

For production, update your Firebase Realtime Database rules:

```json
{
  "rules": {
    "temperatures": {
      ".read": "auth != null",
      ".write": "auth != null"
    }
  }
}
```

## Technology Stack

- **React 18** - UI library (via CDN)
- **Firebase** - Authentication and real-time database
- **Chart.js** - Data visualization
- **Babel Standalone** - JSX transformation in browser

## File Structure

```
frontend/
├── index.html          # Main HTML file
├── app.js              # React components and application logic
├── firebase-config.js  # Firebase configuration
└── styles.css          # CSS styling
```

## Components

- **AuthProvider** - Manages authentication state
- **Login** - Google sign-in interface
- **Dashboard** - Main monitoring dashboard
- **TemperatureChart** - Line chart visualization
- **StatCard** - Statistics display cards
- **TemperatureLogs** - Historical data table

## Browser Compatibility

The application works in modern browsers that support ES6+ features:
- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+

## Testing with Sample Data

To test the application, you can manually add data to Firebase:

1. Go to Firebase Console > Realtime Database
2. Add sample data under `temperatures`:

```json
{
  "temperatures": {
    "-Nabc123": {
      "temperature": 28.5,
      "humidity": 65,
      "timestamp": 1706400000000
    }
  }
}
```

Or use the backend API to add data programmatically.

## Troubleshooting

### Authentication Issues
- Verify Google Auth is enabled in Firebase Console
- Check that your domain is authorized in Firebase settings

### Data Not Loading
- Ensure Firebase Realtime Database is created
- Check database security rules
- Verify database URL in firebase-config.js

### CORS Errors
- Make sure you're running the app through a web server, not directly opening the HTML file

## License

MIT
