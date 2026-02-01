import { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    // Fetch user data from backend
                    const response = await api.get('/auth/me');
                    const { user: userData } = response.data;
                    // Map userType to role if role is not present
                    const role = userData.role || userData.userType;
                    localStorage.setItem('role', role);
                    // Store all user data
                    setUser({ token, role, ...userData });
                } catch (error) {
                    // Token is invalid or expired
                    console.error('Failed to fetch user data:', error);
                    localStorage.removeItem('token');
                    localStorage.removeItem('role');
                    setUser(null);
                    // Don't redirect here - let the API interceptor handle it
                }
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
        };

        fetchUserData();
    }, []);

    const login = async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            const { token, user: userData } = response.data;
            // Map userType to role if role is not present
            const role = userData.role || userData.userType;
            localStorage.setItem('token', token);
            localStorage.setItem('role', role);
            // Store all user data including name, email, phone, location, farmSize, farmingExperience
            setUser({ token, role, ...userData });
            return true;
        } catch (error) {
            console.error("Login failed", error);
            throw error;
        }
    };

    const signup = async (userData) => {
        try {
            const response = await api.post('/auth/register', userData);
            // Don't auto-login after signup, just return success
            // User will be redirected to login page
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

    const updateProfile = async (profileData) => {
        try {
            const response = await api.put('/auth/profile', profileData);
            const { user: userData } = response.data;
            // Map userType to role if role is not present
            const role = userData.role || userData.userType;
            localStorage.setItem('role', role);
            // Update user state with new data
            setUser(prev => ({ ...prev, ...userData }));
            return { success: true, user: userData };
        } catch (error) {
            console.error("Update profile failed", error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, signup, logout, updateProfile, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
