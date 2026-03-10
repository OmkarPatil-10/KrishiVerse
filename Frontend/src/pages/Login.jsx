import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Sprout, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await login(email, password);
            toast.success('User logged in successfully! 👋');
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
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
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo and Title */}
                <div className="text-center mb-6">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <Sprout className="w-8 h-8 text-primary" />
                        <h1 className="text-3xl font-bold text-primary">KrishiVerse</h1>
                    </div>
                    <p className="text-sm text-gray-600">AI-Powered Smart Farming Platform</p>
                </div>

                {/* Login Card */}
                <div className="bg-white rounded-xl shadow-lg border-2 border-primary/20 p-6 md:p-8">
                    <h2 className="text-2xl font-bold text-primary mb-2">Login</h2>
                    <p className="text-gray-800 font-semibold mb-1">Welcome Back</p>
                    <p className="text-sm text-gray-500 mb-6">Sign in to continue to your account</p>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Email Address */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="omkarpatil@gmail.com"
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Forgot Password Link */}
                        <div className="flex justify-end">
                            <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                                Forgot Password?
                            </Link>
                        </div>

                        {/* Sign In Button */}
                        <button
                            type="submit"
                            className="w-full bg-primary text-white py-3 px-4 rounded-lg font-semibold text-lg hover:bg-green-700 transition duration-200"
                        >
                            Sign in
                        </button>
                    </form>

                    {/* Create Account Link */}
                    <div className="mt-6 text-center text-sm text-gray-600">
                        Don't have an account?{' '}
                        <Link to="/signup" className="text-primary font-semibold hover:underline">
                            Create Account
                        </Link>
                    </div>

                    {/* Development Mode Bypass Button
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
                    </div> */}
                </div>
            </div>
        </div>
    );
};

export default Login;
