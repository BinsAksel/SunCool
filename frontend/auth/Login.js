// Login Component
const Login = () => {
    const { signInWithGoogle } = useAuth();

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="logo-section">
                    <h1 className="logo">🌡️ SunCool</h1>
                    <p className="tagline">Sensor-Based Cooling System</p>
                </div>
                <div className="auth-content">
                    <h2>Welcome to SunCool</h2>
                    <p>Monitor your cooling system in high-temperature environments</p>
                    <button onClick={signInWithGoogle} className="google-btn">
                        <span className="google-icon">G</span>
                        Sign in with Google
                    </button>
                </div>
            </div>
        </div>
    );
};
