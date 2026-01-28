const { useState, useEffect, useContext, createContext } = React;

// Auth Context
const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            setUser(user);
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const signInWithGoogle = async () => {
        try {
            await auth.signInWithPopup(googleProvider);
        } catch (error) {
            console.error("Error signing in with Google", error);
            alert("Failed to sign in: " + error.message);
        }
    };

    const signOut = async () => {
        try {
            await auth.signOut();
        } catch (error) {
            console.error("Error signing out", error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

const useAuth = () => useContext(AuthContext);
