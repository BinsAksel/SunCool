# Firebase Realtime Database Setup Guide

## Step 1: Create the Database

1. Go to [Firebase Console](https://console.firebase.google.com/project/suncool-666d8/database)
2. Click on **"Realtime Database"** in the left menu
3. Click **"Create Database"**
4. Choose location: **United States (us-central1)** (or closest to you)
5. Start in **"Test Mode"** for now (we'll secure it later)

## Step 2: Set Security Rules

Once created, go to the **"Rules"** tab and paste this:

```json
{
  "rules": {
    ".read": true,
    ".write": "auth != null",
    "device": {
      "status": {
        ".read": true,
        ".write": "auth != null"
      }
    },
    "temperatures": {
      ".read": true,
      ".write": true
    },
    "users": {
      "$uid": {
        ".read": "auth != null && auth.uid == $uid",
        ".write": "auth != null && auth.uid == $uid"
      }
    }
  }
}
```

**Click "Publish"**

## Step 3: Initialize Database Structure

After creating the database, add this initial data:

1. In Firebase Console, go to **"Data"** tab
2. Click the **"+"** icon next to the database name
3. Add these nodes:

```
Root
├── device
│   └── status: false
├── temperatures
│   └── (empty for now)
└── users
    └── (empty for now)
```

### Manual Setup in Firebase Console:
- Click **"+"** → Name: `device` → Click **"+"** next to device
- Name: `status` → Value: `false` (boolean)
- Click **"Add"**

## Step 4: Verify Connection

Open your app and check browser console for:
- ✅ `Database object: go {_delegate: Xs, ...}` (means connected)
- ❌ Any Firebase errors → Database not created yet

## What Each Path Does:

- **`device/status`**: Controls ON/OFF state (true/false)
  - Read by: ESP32 (every 3 seconds) and Web App
  - Written by: Web App (your button)

- **`temperatures`**: Stores temperature history
  - Written by: Backend server (when ESP32 sends data)
  - Read by: Web App (for charts)

- **`users/$uid`**: Per-user settings and preferences
  - Read/Write by: Logged-in user only

## Security Notes:

**Current Rules (Development):**
- ✅ Anyone can READ device status (so ESP32 can check it)
- ✅ Authenticated users can WRITE device status
- ✅ Anyone can write temperatures (so backend can save them)

**Production Rules (TODO):**
- Use API keys/secrets for ESP32 and backend
- Validate data structure
- Rate limiting

## Troubleshooting:

**Error: "Permission Denied"**
→ Rules too restrictive or user not logged in

**Error: "Timeout"**
→ Database not created or wrong URL

**Error: "Network Error"**
→ Check internet connection or Firebase project status
