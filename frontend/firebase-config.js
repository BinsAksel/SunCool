// Firebase Configuration
// DEMO MODE: Set to false and add your Firebase config for production
const DEMO_MODE = false;

const firebaseConfig = {
    apiKey: "AIzaSyD9lITWJIwcCy0SFyy8_kdadNgHsnIDcVQ",
    authDomain: "suncool-666d8.firebaseapp.com",
    databaseURL: "https://suncool-666d8-default-rtdb.firebaseio.com",
    projectId: "suncool-666d8",
    storageBucket: "suncool-666d8.firebasestorage.app",
    messagingSenderId: "945347754805",
    appId: "1:945347754805:web:0f6d215a2a62814fb86a7c",
    measurementId: "G-LJ0TERPW81"
};

let auth, database, googleProvider;

if (!DEMO_MODE) {
    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    
    // Firebase services
    auth = firebase.auth();
    database = firebase.database();
    
    // Google Auth Provider
    googleProvider = new firebase.auth.GoogleAuthProvider();
} else {
    // Demo mode - mock Firebase services
    console.log('🎭 Running in DEMO MODE - No Firebase connection');
    
    // Mock auth
    auth = {
        currentUser: null,
        onAuthStateChanged: (callback) => {
            // Simulate logged in user after 1 second
            setTimeout(() => {
                callback({
                    uid: 'demo-user-123',
                    displayName: 'Demo User',
                    email: 'demo@suncool.com'
                });
            }, 1000);
            return () => {}; // unsubscribe function
        },
        signInWithPopup: async () => {
            console.log('Demo: Sign in clicked');
            return { user: { displayName: 'Demo User' } };
        },
        signOut: async () => {
            console.log('Demo: Sign out clicked');
            // Auth context will handle the alert
            return Promise.resolve();
        }
    };
    
    // Mock database with device status storage
    const mockDeviceStatus = { value: false };
    
    database = {
        ref: (path) => {
            if (path === 'device/status') {
                // Device status reference
                return {
                    set: async (value) => {
                        mockDeviceStatus.value = value;
                        // Store in localStorage for persistence
                        localStorage.setItem('demo_device_status', JSON.stringify(value));
                        console.log('Demo: Device status set to', value);
                        return Promise.resolve();
                    },
                    on: (event, callback) => {
                        // Load from localStorage on init
                        const stored = localStorage.getItem('demo_device_status');
                        if (stored !== null) {
                            mockDeviceStatus.value = JSON.parse(stored);
                        }
                        
                        // Create snapshot-like object
                        const sendUpdate = () => {
                            const snapshot = {
                                val: () => mockDeviceStatus.value
                            };
                            callback(snapshot);
                        };
                        
                        sendUpdate();
                        
                        // Listen for storage changes
                        const storageListener = (e) => {
                            if (e.key === 'demo_device_status') {
                                mockDeviceStatus.value = JSON.parse(e.newValue || 'false');
                                sendUpdate();
                            }
                        };
                        window.addEventListener('storage', storageListener);
                        
                        return () => {
                            window.removeEventListener('storage', storageListener);
                        };
                    },
                    off: () => {}
                };
            } else {
                // Temperature data reference
                return {
                    limitToLast: (num) => ({
                        on: (event, callback) => {
                            // Generate demo temperature data
                            const generateDemoData = () => {
                                const data = [];
                                const now = Date.now();
                                for (let i = 0; i < 20; i++) {
                                    data.push({
                                        temperature: 25 + Math.random() * 10,
                                        humidity: 60 + Math.random() * 20,
                                        timestamp: now - (19 - i) * 300000 // 5 min intervals
                                    });
                                }
                                
                                // Create snapshot-like object
                                const snapshot = {
                                    forEach: (fn) => {
                                        data.forEach((item, index) => {
                                            fn({
                                                key: `demo-${index}`,
                                                val: () => item
                                            });
                                        });
                                    }
                                };
                                callback(snapshot);
                            };
                            
                            generateDemoData();
                            // Update every 5 seconds with new data
                            const interval = setInterval(generateDemoData, 5000);
                            return () => clearInterval(interval);
                        },
                        off: () => {}
                    })
                };
            }
        }
    };
    
    googleProvider = null;
}
