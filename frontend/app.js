

// Main App Component with Routing
const App = () => {
    const { user, loading } = useAuth();
    const [currentPath, setCurrentPath] = useState(window.location.hash.slice(1) || '/');

    useEffect(() => {
        // Set initial path on mount
        setCurrentPath(window.location.hash.slice(1) || '/');
        
        const handleHashChange = () => {
            const path = window.location.hash.slice(1) || '/';
            setCurrentPath(path);
            console.log('Route changed to:', path);
        };

        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    // When user logs in, redirect to dashboard (but not if manually on /login)
    useEffect(() => {
        if (user && currentPath === '/') {
            window.location.hash = '#/dashboard';
        }
    }, [user, currentPath]);

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="spinner"></div>
                <p>Loading SunCool...</p>
            </div>
        );
    }

    console.log('Current path:', currentPath, 'User:', user ? 'logged in' : 'not logged in');

    // Manual routing - /login always shows login page
    if (currentPath === '/login') {
        return <Login />;
    }
    
    // Dashboard routes - show dashboard with dummy data
    if (currentPath === '/home' || currentPath === '/dashboard') {
        return <Dashboard />;
    }
    
    // Default route - show login if not authenticated, dashboard if authenticated
    return user ? <Dashboard /> : <Login />;
};

// Render App
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <AuthProvider>
        <App />
    </AuthProvider>
);
