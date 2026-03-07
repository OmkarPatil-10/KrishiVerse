import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import GoogleTranslate from '../GoogleTranslate';
const Navbar = () => {
    const { i18n, t } = useTranslation();
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
        localStorage.setItem('language', lng);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <span className="text-2xl font-bold text-primary">KrishiVerse</span>
                    </div>
                    <div className="flex items-center space-x-4">
                        {/* <select
                            onChange={(e) => changeLanguage(e.target.value)}
                            defaultValue={i18n.language}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block p-2"
                        >
                            <option value="en">English</option>
                            <option value="hi">हिंदी</option>
                            <option value="mr">मराठी</option>
                        </select> */}
                        <GoogleTranslate />

                        {user && (
                            <button onClick={handleLogout} className="text-gray-600 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium">
                                Logout
                            </button>
                        )}

                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
