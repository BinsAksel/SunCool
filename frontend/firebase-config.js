// Firebase Configuration
// DEMO MODE: Set to false and add your Firebase config for production
const DEMO_MODE = true;

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    databaseURL: "YOUR_DATABASE_URL",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
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
            window.location.reload();
        }
    };
    
    // Mock database
    database = {
        ref: (path) => ({
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
                    setInterval(generateDemoData, 5000);
                    return () => {}; // unsubscribe
                },
                off: () => {}
            })
        })
    };
    
    googleProvider = null;
}
