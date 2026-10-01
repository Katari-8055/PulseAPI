import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/api';
import { useQueryClient } from '@tanstack/react-query';

const AuthContext = createContext(undefined);

const DEMO_USER = {
    id: 'demo-user-guest',
    username: 'Recruiter Guest',
    name: 'Recruiter / Demo Guest',
    email: 'recruiter@pulseapi.demo',
    role: 'client_admin',
    isDemo: true,
};

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const queryClient = useQueryClient();

    const fetchProfile = useCallback(async () => {
        if (localStorage.getItem('isDemoMode') === 'true') {
            setUser(DEMO_USER);
            setIsLoading(false);
            return;
        }

        try {
            const response = await authApi.getProfile();
            setUser(response.data || response);
        } catch (error) {
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const login = (userData) => {
        localStorage.removeItem('isDemoMode');
        setUser(userData);
    };

    const enterDemoMode = () => {
        localStorage.setItem('isDemoMode', 'true');
        setUser(DEMO_USER);
    };

    const logout = useCallback(async () => {
        if (localStorage.getItem('isDemoMode') === 'true') {
            localStorage.removeItem('isDemoMode');
            queryClient.clear();
            setUser(null);
            return;
        }
        try {
            await authApi.logout();
        } catch (e) {}
        localStorage.removeItem('authToken');
        localStorage.removeItem('isDemoMode');
        queryClient.clear();
        setUser(null);
    }, [queryClient]);

    useEffect(() => {
        const handle401 = () => {
            if (localStorage.getItem('isDemoMode') === 'true') return;
            localStorage.removeItem('authToken');
            queryClient.clear();
            setUser(null);
        };
        window.addEventListener('auth:unauthorized', handle401);
        return () => window.removeEventListener('auth:unauthorized', handle401);
    }, [queryClient]);

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout, enterDemoMode }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
