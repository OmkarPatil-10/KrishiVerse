import { useState, useRef, useEffect } from "react";
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
  ShieldCheck,
  Loader2,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";
import { ConnectWallet, useAddress } from "@thirdweb-dev/react";
import api from "../services/api";
import { toast } from "react-toastify";

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

  // OTP States
  const [emailVerified, setEmailVerified] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerifiedAnim, setOtpVerifiedAnim] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [otpSuccess, setOtpSuccess] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const [verifiedEmail, setVerifiedEmail] = useState(""); // track which email was verified
  const inputRefs = useRef([]);

  // Resend timer countdown
  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Reset verification if email changes after verification
  useEffect(() => {
    if (emailVerified && formData.email !== verifiedEmail) {
      setEmailVerified(false);
      setVerifiedEmail("");
    }
  }, [formData.email, emailVerified, verifiedEmail]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Check email verification
    if (!emailVerified) {
      setError("Please verify your email address before signing up.");
      return;
    }

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
      toast.success('User registered successfully! 🎉');
      
      // Redirect to login page after successful registration
      navigate("/login");
    } catch (err) {
      setError(
        err.response?.data?.message || "Signup failed. Please try again."
      );
    }
  };

  // ===== OTP Functions =====
  const openOtpModal = () => {
    if (!formData.email) {
      setError("Please enter your email address first.");
      return;
    }
    setError("");
    setShowOtpModal(true);
    setOtp(["", "", "", "", "", ""]);
    setOtpSent(false);
    setOtpVerifiedAnim(false);
    setOtpError("");
    setOtpSuccess("");
    setResendTimer(0);
  };

  const closeOtpModal = () => {
    setShowOtpModal(false);
    setOtpError("");
    setOtpSuccess("");
  };

  const handleSendOtp = async () => {
    setOtpSending(true);
    setOtpError("");
    setOtpSuccess("");

    try {
      await api.post("/otp/send-otp", { email: formData.email });
      setOtpSent(true);
      setOtpSuccess("OTP sent! Check your email inbox.");
      setResendTimer(60);
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    } catch (err) {
      setOtpError(
        err.response?.data?.message || "Failed to send OTP. Please try again."
      );
    } finally {
      setOtpSending(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) value = value.slice(-1);
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (/^\d{6}$/.test(pastedData)) {
      const newOtp = pastedData.split("");
      setOtp(newOtp);
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      setOtpError("Please enter the complete 6-digit OTP");
      return;
    }

    setOtpVerifying(true);
    setOtpError("");

    try {
      await api.post("/otp/verify-otp", {
        email: formData.email,
        otp: otpString,
      });
      setOtpVerifiedAnim(true);
      setOtpSuccess("Email verified successfully! 🎉");
      setEmailVerified(true);
      setVerifiedEmail(formData.email);
      setTimeout(() => {
        setShowOtpModal(false);
      }, 2000);
    } catch (err) {
      setOtpError(
        err.response?.data?.message || "Invalid OTP. Please try again."
      );
    } finally {
      setOtpVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    setOtp(["", "", "", "", "", ""]);
    setOtpError("");
    setOtpVerifiedAnim(false);
    await handleSendOtp();
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

            {/* Email Address with Verify Button */}
            <div>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email Address"
                  className={`w-full pl-10 pr-28 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${emailVerified
                      ? "border-emerald-400 focus:ring-emerald-500 bg-emerald-50/50"
                      : "border-gray-300 focus:ring-primary"
                    }`}
                  required
                  disabled={emailVerified}
                />
                {/* Verify / Verified badge inside input */}
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                  {emailVerified ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-md text-xs font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Verified
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={openOtpModal}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white rounded-md text-xs font-semibold hover:bg-emerald-700 transition-colors"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Verify
                    </button>
                  )}
                </div>
              </div>
              {!emailVerified && (
                <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Email verification is required to create an account
                </p>
              )}
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
                    placeholder="District, State"
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
              className={`w-full py-3 text-lg font-semibold transition-all duration-200 ${emailVerified
                  ? "bg-primary text-white hover:bg-green-700"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              disabled={!emailVerified}
            >
              {emailVerified ? "Create Account" : "Verify Email to Continue"}
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

      {/* ===== OTP Verification Modal ===== */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            style={{ animation: "modalSlideIn 0.3s ease-out" }}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-emerald-500 to-green-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <button
                  onClick={closeOtpModal}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <div className="w-5" />
              </div>
              <h3 className="text-xl font-bold mt-4 text-center">
                {otpVerifiedAnim ? "Email Verified!" : "Verify Your Email"}
              </h3>
              <p className="text-emerald-100 text-sm text-center mt-1">
                {otpVerifiedAnim
                  ? "Your email has been verified successfully"
                  : otpSent
                    ? `Enter the 6-digit code sent to ${formData.email}`
                    : `We'll send a verification code to ${formData.email}`}
              </p>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* Success state */}
              {otpVerifiedAnim ? (
                <div className="text-center py-4">
                  <div
                    className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4"
                    style={{ animation: "scaleIn 0.4s ease-out" }}
                  >
                    <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                  </div>
                  <p className="text-emerald-700 font-semibold text-lg">
                    Verification Complete!
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    You can now proceed with registration.
                  </p>
                </div>
              ) : !otpSent ? (
                /* Send OTP screen */
                <div className="space-y-4">
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <p className="text-sm text-emerald-800 text-center">
                      A 6-digit OTP will be sent to
                    </p>
                    <p className="text-emerald-700 font-semibold text-center mt-1">
                      {formData.email}
                    </p>
                  </div>

                  {otpError && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                      {otpError}
                    </div>
                  )}

                  <button
                    onClick={handleSendOtp}
                    disabled={otpSending}
                    className="w-full bg-emerald-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-emerald-700 transition duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {otpSending ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Sending OTP...
                      </>
                    ) : (
                      <>
                        <Mail className="w-5 h-5" />
                        Send OTP
                      </>
                    )}
                  </button>
                </div>
              ) : (
                /* OTP input */
                <div className="space-y-5">
                  {/* OTP Input boxes */}
                  <div
                    className="flex justify-center gap-2"
                    onPaste={handleOtpPaste}
                  >
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => (inputRefs.current[index] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        className="w-12 h-14 text-center text-xl font-bold border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                        style={{ caretColor: "#059669" }}
                      />
                    ))}
                  </div>

                  {/* Messages */}
                  {otpSuccess && !otpError && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-sm text-center">
                      {otpSuccess}
                    </div>
                  )}
                  {otpError && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm text-center">
                      {otpError}
                    </div>
                  )}

                  {/* Verify Button */}
                  <button
                    onClick={handleVerifyOtp}
                    disabled={otpVerifying || otp.join("").length !== 6}
                    className="w-full bg-emerald-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-emerald-700 transition duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {otpVerifying ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-5 h-5" />
                        Verify OTP
                      </>
                    )}
                  </button>

                  {/* Resend OTP */}
                  <div className="text-center">
                    <p className="text-sm text-gray-500">
                      Didn't receive the code?{" "}
                      {resendTimer > 0 ? (
                        <span className="text-gray-400">
                          Resend in {resendTimer}s
                        </span>
                      ) : (
                        <button
                          onClick={handleResendOtp}
                          className="text-emerald-600 font-semibold hover:underline"
                        >
                          Resend OTP
                        </button>
                      )}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.5);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default Signup;
