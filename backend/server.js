const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Firebase Admin SDK
// Place your service account key JSON file in the backend folder
// and rename it to serviceAccountKey.json
try {
    const serviceAccount = require('./serviceAccountKey.json');
    
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: process.env.FIREBASE_DATABASE_URL
    });
    
    console.log('Firebase Admin initialized successfully');
} catch (error) {
    console.error('Error initializing Firebase Admin:', error.message);
    console.log('Please add your serviceAccountKey.json file to the backend folder');
}

const db = admin.database();

// Middleware to verify Firebase auth token
const verifyToken = async (req, res, next) => {
    const token = req.headers.authorization?.split('Bearer ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }
    
    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = decodedToken;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};

// Routes

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'SunCool backend is running' });
});

// Get all temperature data (protected)
app.get('/api/temperatures', verifyToken, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const snapshot = await db.ref('temperatures').limitToLast(limit).once('value');
        const data = [];
        
        snapshot.forEach((childSnapshot) => {
            data.push({
                id: childSnapshot.key,
                ...childSnapshot.val()
            });
        });
        
        res.json({ success: true, data });
    } catch (error) {
        console.error('Error fetching temperatures:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get latest temperature reading (protected)
app.get('/api/temperatures/latest', verifyToken, async (req, res) => {
    try {
        const snapshot = await db.ref('temperatures').limitToLast(1).once('value');
        let latestData = null;
        
        snapshot.forEach((childSnapshot) => {
            latestData = {
                id: childSnapshot.key,
                ...childSnapshot.val()
            };
        });
        
        if (latestData) {
            res.json({ success: true, data: latestData });
        } else {
            res.status(404).json({ success: false, error: 'No data found' });
        }
    } catch (error) {
        console.error('Error fetching latest temperature:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Add temperature data (for sensor/testing - can be protected or use API key)
app.post('/api/temperatures', async (req, res) => {
    try {
        const { temperature, humidity } = req.body;
        
        if (temperature === undefined) {
            return res.status(400).json({ success: false, error: 'Temperature is required' });
        }
        
        const newData = {
            temperature: parseFloat(temperature),
            humidity: humidity ? parseFloat(humidity) : null,
            timestamp: Date.now()
        };
        
        const ref = await db.ref('temperatures').push(newData);
        
        res.json({ 
            success: true, 
            message: 'Temperature data added successfully',
            id: ref.key,
            data: newData
        });
    } catch (error) {
        console.error('Error adding temperature:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get temperature statistics (protected)
app.get('/api/temperatures/stats', verifyToken, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 100;
        const snapshot = await db.ref('temperatures').limitToLast(limit).once('value');
        const temperatures = [];
        
        snapshot.forEach((childSnapshot) => {
            const data = childSnapshot.val();
            temperatures.push(data.temperature);
        });
        
        if (temperatures.length === 0) {
            return res.status(404).json({ success: false, error: 'No data available' });
        }
        
        const stats = {
            average: temperatures.reduce((a, b) => a + b, 0) / temperatures.length,
            highest: Math.max(...temperatures),
            lowest: Math.min(...temperatures),
            count: temperatures.length
        };
        
        res.json({ success: true, data: stats });
    } catch (error) {
        console.error('Error calculating stats:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get device status (protected)
app.get('/api/device/status', verifyToken, async (req, res) => {
    try {
        const snapshot = await db.ref('device/status').once('value');
        const status = snapshot.val();
        
        res.json({ 
            success: true, 
            data: { status: status === true || status === 'on' }
        });
    } catch (error) {
        console.error('Error fetching device status:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Set device status (protected)
app.post('/api/device/status', verifyToken, async (req, res) => {
    try {
        const { status } = req.body;
        
        if (status === undefined) {
            return res.status(400).json({ success: false, error: 'Status is required' });
        }
        
        const deviceStatus = status === true || status === 'on';
        await db.ref('device/status').set(deviceStatus);
        
        res.json({ 
            success: true, 
            message: `Device turned ${deviceStatus ? 'on' : 'off'}`,
            data: { status: deviceStatus }
        });
    } catch (error) {
        console.error('Error setting device status:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Delete old temperature data (admin only - add additional auth as needed)
app.delete('/api/temperatures/old', verifyToken, async (req, res) => {
    try {
        const daysToKeep = parseInt(req.query.days) || 7;
        const cutoffTime = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);
        
        const snapshot = await db.ref('temperatures')
            .orderByChild('timestamp')
            .endAt(cutoffTime)
            .once('value');
        
        let deleteCount = 0;
        const updates = {};
        
        snapshot.forEach((childSnapshot) => {
            updates[childSnapshot.key] = null;
            deleteCount++;
        });
        
        if (deleteCount > 0) {
            await db.ref('temperatures').update(updates);
        }
        
        res.json({ 
            success: true, 
            message: `Deleted ${deleteCount} old records`,
            deletedCount: deleteCount
        });
    } catch (error) {
        console.error('Error deleting old data:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
    console.log(`SunCool backend server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
});
