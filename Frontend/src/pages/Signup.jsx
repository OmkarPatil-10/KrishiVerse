import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { Button, Input, ErrorMessage } from "../components/ui";
import {
  Sprout,
  User,
  Mail,
  Phone,
  Lock,
  MapPin,
  Mountain,
  Clock,
  Eye,
  EyeOff,
  Building2,
  Briefcase,
  MapPin as MapPinIcon,
} from "lucide-react";
import { ConnectWallet, useAddress } from "@thirdweb-dev/react";



const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "farmer", // Default role
    // Farmer fields
    farmSize: "",
    location: "",
    farmingExperience: "",
    // Contractor fields
    businessName: "",
    contractorType: "",
    contractorExperience: "",
    state: "",
    district: "",
    city: "",
    fullAddress: "",
  });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();
  const address = useAddress();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    // Validate contractor fields if contractor is selected
    if (formData.role === "contractor") {
      if (
        !formData.businessName ||
        !formData.contractorType ||
        !formData.contractorExperience ||
        !formData.state ||
        !formData.district ||
        !formData.city ||
        !formData.fullAddress
      ) {
        setError("Please fill all required contractor fields");
        return;
      }
    }

    try {
      // Prepare data for backend - always use 'contractor' (buyer and contractor are the same)
      const submitData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        role: formData.role === "buyer" ? "contractor" : formData.role, // Map buyer to contractor for consistency
      };

      if (formData.role === "farmer") {
        // Add farmer fields
        if (formData.location) {
          submitData.location = formData.location;
        }
        if (formData.farmSize) {
          submitData.farmSize = formData.farmSize;
        }
        if (formData.farmingExperience) {
          submitData.farmingExperience = formData.farmingExperience;
        }
      } else if (formData.role === "contractor" || formData.role === "buyer") {
        // Add contractor mandatory fields
        submitData.businessName = formData.businessName;
        submitData.contractorType = formData.contractorType;
        submitData.contractorExperience = parseInt(
          formData.contractorExperience
        );
        submitData.state = formData.state;
        submitData.district = formData.district;
        submitData.city = formData.city;
        submitData.fullAddress = formData.fullAddress;
      }
      
      // Add wallet address if connected
      if (address) {
        submitData.walletAddress = address;
      }

      await signup(submitData);
      // Redirect to login page after successful registration
      navigate("/login");
    } catch (err) {
      setError(
        err.response?.data?.message || "Signup failed. Please try again."
      );
    }
  };

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sprout className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-primary">KrishiVerse</h1>
          </div>
          <p className="text-sm text-gray-600">
            AI-Powered Smart Farming Platform
          </p>
        </div>

        {/* Registration Card */}
        <div className="bg-white rounded-xl shadow-lg border-2 border-primary/20 p-6 md:p-8">
          <h2 className="text-2xl font-bold text-primary mb-2">Register</h2>
          <p className="text-gray-600 mb-1 font-semibold">Create Account</p>
          <p className="text-sm text-gray-500 mb-6">Sign up to get started</p>

          {error && <ErrorMessage message={error} />}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Full Name"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>

            {/* Email Address */}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email Address"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>

            {/* Phone Number */}
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Phone Number"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm Password"
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select your role
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="farmer"
                    checked={formData.role === "farmer"}
                    onChange={handleChange}
                    className="w-5 h-5 text-primary focus:ring-primary"
                  />
                  <span className="text-gray-700">Farmer</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="contractor"
                    checked={formData.role === "contractor"}
                    onChange={handleChange}
                    className="w-5 h-5 text-primary focus:ring-primary"
                  />
                  <span className="text-gray-700">Contractor</span>
                </label>
              </div>
            </div>

            {/* Contractor Mandatory Fields */}
            {formData.role === "contractor" && (
              <>
                {/* Business/Company Name */}
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleChange}
                    placeholder="Business / Company Name *"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>

                {/* Contractor Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contractor Type *
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <select
                      name="contractorType"
                      value={formData.contractorType}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent appearance-none"
                      required
                    >
                      <option value="">Select Contractor Type</option>
                      <option value="Trader">Trader</option>
                      <option value="Wholesaler">Wholesaler</option>
                      <option value="Retailer">Retailer</option>
                      <option value="Processor">Processor</option>
                      <option value="Exporter">Exporter</option>
                    </select>
                  </div>
                </div>

                {/* Years of Experience */}
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    name="contractorExperience"
                    value={formData.contractorExperience}
                    onChange={handleChange}
                    placeholder="Years of Experience *"
                    min="0"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>

                {/* State */}
                <div className="relative">
                  <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="State *"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>

                {/* District */}
                <div className="relative">
                  <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    placeholder="District *"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>

                {/* City/Taluka */}
                <div className="relative">
                  <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="City / Taluka *"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>

                {/* Full Address */}
                <div className="relative">
                  <MapPinIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <textarea
                    name="fullAddress"
                    value={formData.fullAddress}
                    onChange={handleChange}
                    placeholder="Full Address *"
                    rows="3"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                    required
                  />
                </div>
              </>
            )}

            {/* Farm Size - Only for Farmers */}
            {formData.role === "farmer" && (
              <>
                <div className="relative">
                  <Mountain className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    name="farmSize"
                    value={formData.farmSize}
                    onChange={handleChange}
                    placeholder="Farm Size (Acres)"
                    step="0.1"
                    min="0"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                {/* Location - Optional */}
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Location"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </>
            )}

            {/* Farming Experience - Only for Farmers */}
            {formData.role === "farmer" && (
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  name="farmingExperience"
                  value={formData.farmingExperience}
                  onChange={handleChange}
                  placeholder="Farming Experience (Years)"
                  min="0"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            )}
            <ConnectWallet />
            <Button
              type="submit"
              className="w-full bg-primary text-white py-3 text-lg font-semibold"
            >
              Create Account
            </Button>
            
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-primary font-semibold hover:underline"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
