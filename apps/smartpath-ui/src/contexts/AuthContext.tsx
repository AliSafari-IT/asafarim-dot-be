import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
    id: string;
    email: string;
    displayName: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: () => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const validateAndSetUser = (token: string | null) => {
        if (!token) {
            console.log('🔐 No token found');
            setUser(null);
            return false;
        }

        try {
            const parts = token.split('.');
            if (parts.length !== 3) {
                throw new Error('Invalid token structure');
            }

            const payloadPart = parts[1];
            if (!payloadPart) {
                throw new Error('Token payload is missing');
            }

            const payload = JSON.parse(atob(payloadPart));
            console.log('🔐 JWT Payload:', payload);

            // Check if token is expired
            const currentTime = Math.floor(Date.now() / 1000);
            if (payload.exp && payload.exp < currentTime) {
                console.log('🔐 Token expired, clearing storage');
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                setUser(null);
                return false;
            }

            const userId = payload.sub || payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
            const email = payload.email || payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'];
            const name = payload.name || payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'];

            console.log('🔐 Extracted user data:', { userId, email, name });

            setUser({
                id: userId,
                email: email || '',
                displayName: name || email || 'User',
            });
            return true;
        } catch (error) {
            console.error('🔐 Failed to parse token:', error);
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            setUser(null);
            return false;
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        validateAndSetUser(token);
        setIsLoading(false);
    }, []);

    // Listen for storage changes (logout in another tab/window)
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'accessToken') {
                if (!e.newValue) {
                    // Token was removed (logout)
                    setUser(null);
                } else {
                    // Token was updated (login)
                    validateAndSetUser(e.newValue);
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const login = () => {
        const identityPortalUrl = import.meta.env.VITE_IDENTITY_PORTAL_URL || 'http://identity.asafarim.local:5177';
        const returnUrl = encodeURIComponent(window.location.href);
        window.location.href = `${identityPortalUrl}/login?returnUrl=${returnUrl}`;
    };

    const logout = () => {
        const identityPortalUrl = import.meta.env.VITE_IDENTITY_PORTAL_URL || 'http://identity.asafarim.local:5177';
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setUser(null);
        window.location.href = `${identityPortalUrl}/logout`;
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}
