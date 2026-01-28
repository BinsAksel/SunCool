// Temperature Chart Component
const TemperatureChart = ({ data }) => {
    const canvasRef = React.useRef(null);
    const chartRef = React.useRef(null);

    useEffect(() => {
        if (canvasRef.current && data.length > 0) {
            const ctx = canvasRef.current.getContext('2d');
            
            // Destroy previous chart if it exists
            if (chartRef.current) {
                chartRef.current.destroy();
            }

            const labels = data.map(item => {
                const date = new Date(item.timestamp);
                return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            });

            const temperatures = data.map(item => item.temperature);

            chartRef.current = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Temperature (°C)',
                        data: temperatures,
                        borderColor: '#ff6b6b',
                        backgroundColor: 'rgba(255, 107, 107, 0.1)',
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: true,
                            position: 'top'
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: false,
                            title: {
                                display: true,
                                text: 'Temperature (°C)'
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'Time'
                            }
                        }
                    }
                }
            });
        }

        return () => {
            if (chartRef.current) {
                chartRef.current.destroy();
            }
        };
    }, [data]);

    return (
        <div className="chart-container">
            <canvas ref={canvasRef}></canvas>
        </div>
    );
};

// Statistics Card Component
const StatCard = ({ title, value, unit, icon }) => {
    return (
        <div className="stat-card">
            <div className="stat-icon">{icon}</div>
            <div className="stat-content">
                <h3>{title}</h3>
                <p className="stat-value">
                    {value !== null && value !== undefined ? value.toFixed(1) : '--'}
                    <span className="stat-unit">{unit}</span>
                </p>
            </div>
        </div>
    );
};

// Temperature Logs Component
const TemperatureLogs = ({ logs }) => {
    return (
        <div className="logs-section">
            <h3>Recent Temperature Logs</h3>
            <div className="logs-container">
                {logs.length === 0 ? (
                    <p className="no-data">No temperature data available</p>
                ) : (
                    <table className="logs-table">
                        <thead>
                            <tr>
                                <th>Time</th>
                                <th>Temperature</th>
                                <th>Humidity</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map((log, index) => (
                                <tr key={index}>
                                    <td>{new Date(log.timestamp).toLocaleString()}</td>
                                    <td>{log.temperature.toFixed(1)}°C</td>
                                    <td>{log.humidity ? log.humidity.toFixed(1) + '%' : 'N/A'}</td>
                                    <td>
                                        <span className={`status-badge ${log.temperature > 30 ? 'status-high' : 'status-normal'}`}>
                                            {log.temperature > 30 ? 'High' : 'Normal'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};
