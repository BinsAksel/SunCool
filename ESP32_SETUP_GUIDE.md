# SunCool - ESP32 Setup Guide

## 📋 Prerequisites

### Required Libraries for Arduino IDE:
1. **WiFi** (Built-in with ESP32)
2. **HTTPClient** (Built-in with ESP32)
3. **OneWire** - Install via Library Manager
4. **DallasTemperature** - Install via Library Manager
5. **ArduinoJson** - Install via Library Manager (v6.x)

### How to Install Libraries:
1. Open Arduino IDE
2. Go to **Sketch** → **Include Library** → **Manage Libraries**
3. Search for each library and click **Install**

---

## 🔧 ESP32 Configuration Steps

### 1. Update WiFi Credentials
Open `ESP32_SunCool_WiFi.ino` and modify these lines:

```cpp
const char* ssid = "YOUR_WIFI_SSID";          // Your WiFi name
const char* password = "YOUR_WIFI_PASSWORD";   // Your WiFi password
```

### 2. Update Server URL
Find your computer's local IP address and update:

#### On Windows (Find your IP):
```powershell
ipconfig
```
Look for "IPv4 Address" (e.g., 192.168.1.100)

#### Update the code:
```cpp
const char* serverUrl = "http://192.168.1.100:3000/api/temperatures";
```
Replace `192.168.1.100` with YOUR actual IP address

---

## 🚀 Getting Started

### Step 1: Start the Backend Server
```bash
cd backend
npm install
node server.js
```
Server should run on `http://localhost:3000`

### Step 2: Upload Code to ESP32
1. Connect ESP32 to computer via USB
2. Open `ESP32_SunCool_WiFi.ino` in Arduino IDE
3. Select **Tools** → **Board** → **ESP32 Dev Module**
4. Select correct **Port**
5. Click **Upload**

### Step 3: Monitor Serial Output
1. Open **Serial Monitor** (Tools → Serial Monitor)
2. Set baud rate to **115200**
3. You should see:
   - WiFi connection status
   - Temperature readings
   - Data sending confirmations

### Step 4: Open the Web App
```bash
cd frontend
# Open index.html in browser or use Live Server
```

---

## 📊 Data Flow

```
ESP32 Device
    ↓ (reads temperature every 2 seconds)
    ↓ (sends HTTP POST)
Node.js Backend (port 3000)
    ↓ (saves to Firebase Realtime Database)
Firebase Database
    ↓ (real-time sync)
Web App (Frontend)
    ↓ (displays temperature)
User Dashboard
```

---

## 🧪 Testing

### Test 1: Backend Health Check
Open browser and go to:
```
http://localhost:3000/api/health
```
Should see: `{"status":"OK","message":"SunCool backend is running"}`

### Test 2: Manual Temperature Post (Optional)
Use Postman or curl:
```bash
curl -X POST http://localhost:3000/api/temperatures \
  -H "Content-Type: application/json" \
  -d '{"temperature": 36.5, "humidity": 0}'
```

### Test 3: Check Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Open your project: `suncool-666d8`
3. Go to **Realtime Database**
4. You should see temperature data under `/temperatures`

---

## 🔍 Troubleshooting

### ESP32 Won't Connect to WiFi
- ✓ Check WiFi credentials are correct
- ✓ Ensure 2.4GHz WiFi (ESP32 doesn't support 5GHz)
- ✓ Check WiFi signal strength

### Data Not Sending to Server
- ✓ Verify backend server is running (`node server.js`)
- ✓ Check server URL in ESP32 code matches your IP
- ✓ Ensure firewall isn't blocking port 3000
- ✓ Make sure ESP32 and computer are on same network

### Temperature Shows "Loading..." on Dashboard
- ✓ Check Firebase configuration in `firebase-config.js`
- ✓ Verify DEMO_MODE is set to `false`
- ✓ Check Firebase Realtime Database rules allow read/write
- ✓ Open browser console for errors (F12)

### Serial Monitor Shows Temperature but No Web Update
- ✓ Check if data reaches backend (look at server terminal logs)
- ✓ Verify Firebase Database URL in backend `.env` file
- ✓ Check Firebase Admin SDK `serviceAccountKey.json` is configured

---

## 🎯 Expected Serial Monitor Output

```
=================================
SunCool - Temperature Monitoring System
=================================

Connecting to WiFi: YourWiFiName
........
✓ WiFi Connected!
IP Address: 192.168.1.150

System Ready!
=================================

--- Temperature Reading ---
Temperature: 36.2 °C
Status: Fan & Mist OFF (Normal)

📡 Sending data to server...
✓ Data sent successfully | HTTP Response: 200
Server Response: {"success":true,"message":"Temperature data added successfully"}
```

---

## ⚙️ Customization

### Change Temperature Threshold
In ESP32 code:
```cpp
#define TEMP_THRESHOLD 38.0  // Change this value
```

### Change Data Send Interval
```cpp
#define SEND_INTERVAL 5000    // Send every 5 seconds
```

### Change Auto-Spray Threshold in Web App
In `Home.js`:
```javascript
const SPRAY_THRESHOLD = 36; // Change this value
```

---

## 📱 Firebase Realtime Database Structure

```json
{
  "temperatures": {
    "-N1x2y3z4": {
      "temperature": 36.5,
      "humidity": 0,
      "timestamp": 1706500000000
    }
  },
  "device": {
    "status": true
  }
}
```

---

## 🔐 Security Notes

- The `/api/temperatures` POST endpoint is currently **open** for ESP32 to send data
- For production, consider adding API key authentication
- Other endpoints require Firebase authentication token

---

## 📞 Support

If you encounter issues:
1. Check Serial Monitor for ESP32 errors
2. Check browser console (F12) for frontend errors
3. Check backend terminal for server errors
4. Verify Firebase console for data

---

**Happy Monitoring! 🌡️❄️**
