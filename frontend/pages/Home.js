// Dashboard Component (Home Page)
const Dashboard = () => {
    const { user, signOut } = useAuth();
    const [temperatureData, setTemperatureData] = useState([]);
    const [currentTemp, setCurrentTemp] = useState(null);
    const [deviceStatus, setDeviceStatus] = useState(false);
    const [isTogglingDevice, setIsTogglingDevice] = useState(false);
    const [sprayLogs, setSprayLogs] = useState([]);
    const SPRAY_THRESHOLD = 36; // Temperature threshold for auto spray
    const [stats, setStats] = useState({
        average: null,
        highest: null,
        lowest: null,
        humidity: null
    });

    const handleSignOut = async () => {
        const result = await Swal.fire({
            title: 'Sign Out?',
            text: 'Are you sure you want to sign out?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#667eea',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, sign out',
            cancelButtonText: 'Cancel'
        });

        if (result.isConfirmed) {
            await signOut();
            Swal.fire({
                title: 'Signed Out!',
                text: 'You have been successfully signed out.',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            });
            setTimeout(() => {
                window.location.hash = '#/login';
                window.location.reload();
            }, 1500);
        }
    };

    const toggleDevice = async () => {
        setIsTogglingDevice(true);
        try {
            const newStatus = !deviceStatus;
            // Update state immediately for instant feedback
            setDeviceStatus(newStatus);
            await database.ref('device/status').set(newStatus);
            
            Swal.fire({
                title: newStatus ? 'Device Turned On!' : 'Device Turned Off!',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            });
        } catch (error) {
            console.error('Error toggling device:', error);
            // Revert state on error
            setDeviceStatus(!deviceStatus);
            Swal.fire({
                title: 'Error',
                text: 'Failed to toggle device status',
                icon: 'error',
                confirmButtonColor: '#667eea'
            });
        } finally {
            setIsTogglingDevice(false);
        }
    };

    const logAutomaticSpray = (temperature) => {
        const sprayLog = {
            timestamp: Date.now(),
            temperature: temperature,
            type: 'automatic',
            id: Date.now().toString()
        };
        
        // Add to spray logs
        const updatedLogs = [sprayLog, ...sprayLogs].slice(0, 20); // Keep last 20
        setSprayLogs(updatedLogs);
        localStorage.setItem('spray_logs', JSON.stringify(updatedLogs));
    };

    useEffect(() => {
        // Load spray logs from localStorage
        const savedLogs = localStorage.getItem('spray_logs');
        if (savedLogs) {
            setSprayLogs(JSON.parse(savedLogs));
        } else {
            // Add dummy spray data if no logs exist
            const dummyLogs = [
                {
                    id: '1706500000001',
                    timestamp: Date.now() - 7200000, // 2 hours ago
                    temperature: 36.2,
                    type: 'automatic'
                },
                {
                    id: '1706500000002',
                    timestamp: Date.now() - 14400000, // 4 hours ago
                    temperature: 37.4,
                    type: 'automatic'
                },
                {
                    id: '1706500000003',
                    timestamp: Date.now() - 21600000, // 6 hours ago
                    temperature: 38.1,
                    type: 'automatic'
                },
                {
                    id: '1706500000004',
                    timestamp: Date.now() - 43200000, // 12 hours ago
                    temperature: 36.5,
                    type: 'automatic'
                },
                {
                    id: '1706500000005',
                    timestamp: Date.now() - 86400000, // 1 day ago
                    temperature: 36.8,
                    type: 'automatic'
                },
                {
                    id: '1706500000006',
                    timestamp: Date.now() - 172800000, // 2 days ago
                    temperature: 39.2,
                    type: 'automatic'
                },
                {
                    id: '1706500000007',
                    timestamp: Date.now() - 259200000, // 3 days ago
                    temperature: 37.9,
                    type: 'automatic'
                },
                {
                    id: '1706500000008',
                    timestamp: Date.now() - 345600000, // 4 days ago
                    temperature: 36.0,
                    type: 'automatic'
                }
            ];
            setSprayLogs(dummyLogs);
            localStorage.setItem('spray_logs', JSON.stringify(dummyLogs));
        }
    }, []);

    // Auto-spray when temperature exceeds threshold
    useEffect(() => {
        if (currentTemp !== null && currentTemp >= SPRAY_THRESHOLD && !deviceStatus) {
            console.log(`Auto-spray triggered at ${currentTemp}°C`);
            
            // Turn on device
            setDeviceStatus(true);
            database.ref('device/status').set(true);
            
            // Log the automatic spray
            logAutomaticSpray(currentTemp);
            
            Swal.fire({
                title: '🌡️ High Temperature Alert!',
                html: `Temperature reached <strong>${currentTemp.toFixed(1)}°C</strong><br/>Mist spray activated automatically`,
                icon: 'warning',
                timer: 3000,
                showConfirmButton: false
            });
        }
    }, [currentTemp, deviceStatus]);

    useEffect(() => {
        // Listen to temperature data from Firebase
        const tempRef = database.ref('temperatures');
        const tempListener = tempRef.limitToLast(50);
        
        const unsubscribeTemp = tempListener.on('value', (snapshot) => {
            const data = [];
            snapshot.forEach((childSnapshot) => {
                data.push({
                    id: childSnapshot.key,
                    ...childSnapshot.val()
                });
            });

            if (data.length > 0) {
                setTemperatureData(data);
                
                // Calculate statistics
                const temps = data.map(d => d.temperature);
                const avg = temps.reduce((a, b) => a + b, 0) / temps.length;
                const max = Math.max(...temps);
                const min = Math.min(...temps);
                
                // Get most recent data
                const latest = data[data.length - 1];
                setCurrentTemp(latest.temperature);
                
                setStats({
                    average: avg,
                    highest: max,
                    lowest: min,
                    humidity: latest.humidity || null
                });
            }
        });

        // Listen to device status
        const deviceRef = database.ref('device/status');
        const unsubscribeDevice = deviceRef.on('value', (snapshot) => {
            const status = snapshot.val();
            setDeviceStatus(status === true || status === 'on');
        });

        return () => {
            if (typeof unsubscribeTemp === 'function') unsubscribeTemp();
            if (typeof unsubscribeDevice === 'function') unsubscribeDevice();
            tempListener.off();
            deviceRef.off();
        };
    }, []);

    return (
        <div className="dashboard">
            <header className="dashboard-header">
                <div className="header-content">
                    <h1>🌡️ SunCool Dashboard</h1>
                    <div className="user-info">
                        <span className="user-name">{user.displayName}</span>
                        <button onClick={handleSignOut} className="sign-out-btn">Sign Out</button>
                    </div>
                </div>
            </header>

            <main className="dashboard-main">
                <div className="current-temp-section">
                    <div className="current-temp-card">
                        <h2>Current Temperature</h2>
                        <div className="temp-display">
                            {currentTemp !== null ? (
                                <>
                                    <span className="temp-value">{currentTemp.toFixed(1)}</span>
                                    <span className="temp-unit">°C</span>
                                </>
                            ) : (
                                <span className="temp-loading">Loading...</span>
                            )}
                        </div>
                        <p className="temp-status">
                            {currentTemp > 30 ? '⚠️ High Temperature' : '✓ Normal Range'}
                        </p>
                        
                        <div className="device-control">
                            <button 
                                onClick={toggleDevice} 
                                className={`device-toggle-btn ${deviceStatus ? 'device-on' : 'device-off'}`}
                                disabled={isTogglingDevice}
                            >
                                <span className="device-icon">{deviceStatus ? '🔴' : '⚪'}</span>
                                <span className="device-text">
                                    {isTogglingDevice ? 'Switching...' : deviceStatus ? 'Device ON' : 'Device OFF'}
                                </span>
                            </button>
                            <p className="device-status-text">
                                {deviceStatus ? '✓ Device is running' : '○ Device is off'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="spray-stats-section">
                    <div className="spray-stats-card">
                        <h3>💧 Mist Spray Statistics</h3>
                        <div className="spray-info">
                            <p className="spray-threshold">Auto-spray triggers at: <strong>{SPRAY_THRESHOLD}°C</strong></p>
                            <p className="total-sprays">Total sprays: <strong>{sprayLogs.length}</strong></p>
                        </div>
                        
                        {sprayLogs.length > 0 ? (
                            <div className="spray-logs-container">
                                <h4>Recent Spray Events</h4>
                                <div className="spray-logs-list">
                                    {sprayLogs.slice(0, 10).map((log) => (
                                        <div key={log.id} className="spray-log-item">
                                            <div className="spray-log-icon">🤖</div>
                                            <div className="spray-log-details">
                                                <div className="spray-log-type">Automatic Spray</div>
                                                <div className="spray-log-temp">
                                                    Temperature: <strong>{log.temperature.toFixed(1)}°C</strong>
                                                </div>
                                                <div className="spray-log-time">
                                                    {new Date(log.timestamp).toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="no-spray-logs">
                                <p>No spray events recorded yet</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="stats-grid">
                    <StatCard 
                        title="Average Temp" 
                        value={stats.average} 
                        unit="°C" 
                        icon="📊"
                    />
                    <StatCard 
                        title="Highest Temp" 
                        value={stats.highest} 
                        unit="°C" 
                        icon="🔥"
                    />
                    <StatCard 
                        title="Lowest Temp" 
                        value={stats.lowest} 
                        unit="°C" 
                        icon="❄️"
                    />
                    <StatCard 
                        title="Humidity" 
                        value={stats.humidity} 
                        unit="%" 
                        icon="💧"
                    />
                </div>

                <div className="chart-section">
                    <h2>Temperature History</h2>
                    <TemperatureChart data={temperatureData} />
                </div>

                <TemperatureLogs logs={temperatureData.slice(-10).reverse()} />
            </main>
        </div>
    );
};
