// Dashboard Component (Home Page)
const Dashboard = () => {
    const { user, signOut } = useAuth();
    const [temperatureData, setTemperatureData] = useState([]);
    const [currentTemp, setCurrentTemp] = useState(null);
    const [stats, setStats] = useState({
        average: null,
        highest: null,
        lowest: null,
        humidity: null
    });

    useEffect(() => {
        // Listen to temperature data from Firebase
        const tempRef = database.ref('temperatures');
        
        tempRef.limitToLast(50).on('value', (snapshot) => {
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

        return () => tempRef.off();
    }, []);

    return (
        <div className="dashboard">
            <header className="dashboard-header">
                <div className="header-content">
                    <h1>🌡️ SunCool Dashboard</h1>
                    <div className="user-info">
                        <span className="user-name">{user.displayName}</span>
                        <button onClick={signOut} className="sign-out-btn">Sign Out</button>
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
