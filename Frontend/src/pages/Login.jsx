import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // For demo purposes, we might need a bypass if backend isn't ready
            await login(email, password);
            navigate('/dashboard');
        } catch (error) {
            alert('Login failed');
        }
    };

    const handleDevLogin = () => {
        // Development mode: Skip authentication for UI testing
        localStorage.setItem('token', 'dev-token');
        localStorage.setItem('role', 'farmer');
        navigate('/dashboard');
        window.location.reload(); // Reload to update auth context
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-green-50">
            <div className="bg-white p-8 rounded-lg shadow-md w-96">
                <h2 className="text-2xl font-bold mb-6 text-center text-primary">{t('welcome')}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                            required
                        />
                    </div>
                    <button type="submit" className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-green-700 transition duration-200">
                        Login
                    </button>
                </form>
                
                {/* Development Mode Bypass Button */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <button 
                        onClick={handleDevLogin}
                        className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 transition duration-200 text-sm"
                    >
                        🚀 Skip Login (Dev Mode - UI Testing)
                    </button>
                    <p className="text-xs text-gray-500 text-center mt-2">
                        Use this to test UI without backend connection
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
