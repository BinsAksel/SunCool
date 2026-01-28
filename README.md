# SunCool

A sensor-based cooling system monitoring dashboard designed for high-temperature and high-humidity environments.

## Project Structure

```
SunCool/
├── frontend/              # React-based web application
│   ├── index.html         # Main HTML file
│   ├── app.js             # React components
│   ├── firebase-config.js # Firebase configuration
│   ├── styles.css         # Styling
│   └── README.md          # Frontend documentation
│
└── backend/               # Node.js Express API server
    ├── server.js          # Express server
    ├── package.json       # Node dependencies
    ├── .env.example       # Environment variables template
    ├── .gitignore         # Git ignore rules
    └── README.md          # Backend documentation
```

## Features

### Frontend
- 🔐 Google Authentication via Firebase
- 📊 Real-time temperature monitoring
- 📈 Interactive temperature charts with Chart.js
- 📋 Historical temperature logs
- 📱 Responsive design (mobile & desktop)
- 🎨 Clean and intuitive UI

### Backend
- 🔥 Firebase Admin SDK integration
- 🔒 Token-based authentication
- 📡 RESTful API endpoints
- 📊 Temperature data management
- 🗄️ Real-time database operations
- 🧹 Data cleanup utilities

## Quick Start

### Frontend Setup

1. Navigate to the frontend folder:
   ```bash
   cd frontend
   ```

2. Update `firebase-config.js` with your Firebase configuration

3. Run a local web server:
   ```bash
   python -m http.server 8000
   # or
   npx http-server -p 8000
   ```

4. Open `http://localhost:8000` in your browser

For detailed instructions, see [frontend/README.md](frontend/README.md)

### Backend Setup

1. Navigate to the backend folder:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment:
   - Copy `.env.example` to `.env`
   - Add your Firebase service account key as `serviceAccountKey.json`
   - Update `.env` with your Firebase database URL

4. Start the server:
   ```bash
   npm run dev
   ```

For detailed instructions, see [backend/README.md](backend/README.md)

## Firebase Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Google Analytics (optional)

### 2. Enable Authentication

1. Go to Authentication > Sign-in method
2. Enable Google provider
3. Add authorized domains if needed

### 3. Setup Realtime Database

1. Go to Realtime Database
2. Create database
3. Choose location
4. Start in test mode (update rules for production)

### 4. Get Configuration

**For Frontend:**
- Project Settings > General > Your apps
- Copy the firebaseConfig object

**For Backend:**
- Project Settings > Service Accounts
- Generate new private key
- Save as `serviceAccountKey.json` in backend folder

## API Endpoints

### Public
- `GET /api/health` - Server health check
- `POST /api/temperatures` - Add temperature reading

### Protected (Requires Auth Token)
- `GET /api/temperatures` - Get temperature data
- `GET /api/temperatures/latest` - Get latest reading
- `GET /api/temperatures/stats` - Get statistics
- `DELETE /api/temperatures/old` - Delete old records

## Database Structure

```json
{
  "temperatures": {
    "{pushId}": {
      "temperature": 28.5,
      "humidity": 65,
      "timestamp": 1706400000000
    }
  }
}
```

## Security Considerations

### Frontend
- Firebase config can be public (client-side)
- Protect data with Firebase security rules
- Use authentication for sensitive operations

### Backend
- Keep `.env` and `serviceAccountKey.json` private
- Never commit sensitive files to version control
- Implement rate limiting in production
- Use HTTPS in production

### Firebase Security Rules

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

### Frontend
- React 18 (via CDN)
- Firebase SDK
- Chart.js
- Babel Standalone
- Vanilla CSS

### Backend
- Node.js
- Express.js
- Firebase Admin SDK
- CORS
- dotenv

## Development

### Adding Temperature Data (Testing)

```bash
curl -X POST http://localhost:3000/api/temperatures \
  -H "Content-Type: application/json" \
  -d '{"temperature": 28.5, "humidity": 65}'
```

### Monitoring Real-time Updates

The frontend automatically listens to Firebase changes and updates the UI in real-time.

## Deployment

### Frontend
- Can be deployed to:
  - Firebase Hosting
  - Netlify
  - Vercel
  - GitHub Pages
  - Any static hosting service

### Backend
- Can be deployed to:
  - Heroku
  - Google Cloud Run
  - AWS EC2/Lambda
  - DigitalOcean
  - Railway

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT

## Support

For issues and questions:
- Check the README files in frontend/ and backend/ folders
- Review Firebase documentation
- Check console for error messages

---

Built for monitoring cooling systems in high-temperature, high-humidity environments 🌡️
