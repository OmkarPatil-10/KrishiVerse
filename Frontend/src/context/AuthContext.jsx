import { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            // Here you would typically validate the token or fetch user profile
            // For now, we'll verify existence. 
            // In a real app, call /api/auth/me
            const role = localStorage.getItem('role');
            setUser({ token, role });
        } else {
            // Development mode: Auto-login with mock user for UI testing
            // This allows you to test UI without backend connection
            // Set localStorage.setItem('devMode', 'false') to disable this
            const devMode = localStorage.getItem('devMode') !== 'false';
            if (devMode && import.meta.env.DEV) {
                const mockUser = {
                    token: 'dev-token',
                    role: 'farmer',
                    email: 'farmer@krishiverse.com',
                    name: 'Farmer'
                };
                localStorage.setItem('token', mockUser.token);
                localStorage.setItem('role', mockUser.role);
                setUser(mockUser);
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            const { token, user: userData } = response.data;
            localStorage.setItem('token', token);
            localStorage.setItem('role', userData.role);
            setUser({ token, role: userData.role, ...userData });
            return true;
        } catch (error) {
            console.error("Login failed", error);
            throw error;
        }
    };

    const signup = async (userData) => {
        try {
            const response = await api.post('/auth/signup', userData);
            const { token, user: newUser } = response.data;
            localStorage.setItem('token', token);
            localStorage.setItem('role', newUser.role);
            setUser({ token, role: newUser.role, ...newUser });
            return true;
        } catch (error) {
            console.error("Signup failed", error);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
