import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import MarketPrices from './pages/MarketPrices';
import Contracts from './pages/Contracts';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import Wallet from './pages/Wallet';
import Settings from './pages/Settings';
import Admin from './pages/Admin';
import PricePrediction from './pages/PricePrediction';
import ContractDetails from './pages/ContractDetails';
import FarmersList from './pages/FarmersList';
import FarmerDetails from './pages/FarmerDetails';
import { useAuth } from './context/AuthContext';
import PropTypes from 'prop-types';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return children;
};
ProtectedRoute.propTypes = {
  children: PropTypes.node,
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
        {/* Navbar will be added inside specific layouts or globally if appropriate */}
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/market" element={<MarketPrices />} />
            <Route path="/contracts" element={<Contracts />} />
            <Route path="/contracts/:id" element={<ContractDetails />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/farmers" element={<FarmersList />} />
            <Route path="/farmers/:id" element={<FarmerDetails />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/wallet" element={<Wallet />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/prediction" element={<PricePrediction />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
