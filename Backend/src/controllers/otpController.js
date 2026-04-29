const nodemailer = require('nodemailer');

// In-memory OTP store (in production, use Redis or DB)
const otpStore = new Map();

// OTP expiry time in milliseconds (5 minutes)
const OTP_EXPIRY = 5 * 60 * 1000;

// Generate a 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Create reusable transporter using Gmail SMTP
const createTransporter = () => {
    return nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // Use STARTTLS
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS, // Use App Password for Gmail
        },
    });
};

// Send OTP to email
exports.sendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required',
            });
        }

        // Generate OTP
        const otp = generateOTP();

        // Store OTP with expiry
        otpStore.set(email, {
            otp,
            expiresAt: Date.now() + OTP_EXPIRY,
            verified: false,
        });

        // Send email
        const transporter = createTransporter();

        const mailOptions = {
            from: `"KrishiVerse" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: '🌾 KrishiVerse - Email Verification OTP',
            html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 480px; margin: 0 auto; background: #f8fdf5; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #16a34a, #15803d); padding: 32px 24px; text-align: center;">
            <h1 style="color: #fff; margin: 0; font-size: 28px; letter-spacing: 0.5px;">🌱 KrishiVerse</h1>
            <p style="color: #dcfce7; margin: 8px 0 0; font-size: 14px;">AI-Powered Smart Farming Platform</p>
          </div>
          
          <!-- Body -->
          <div style="padding: 32px 24px;">
            <h2 style="color: #166534; margin: 0 0 8px; font-size: 20px;">Verify Your Email</h2>
            <p style="color: #4b5563; font-size: 14px; margin: 0 0 24px; line-height: 1.6;">
              Use the OTP below to verify your email address. This code is valid for <strong>5 minutes</strong>.
            </p>
            
            <!-- OTP Box -->
            <div style="background: #fff; border: 2px dashed #16a34a; border-radius: 12px; padding: 20px; text-align: center; margin: 0 0 24px;">
              <p style="color: #6b7280; font-size: 12px; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 1px;">Your Verification Code</p>
              <p style="color: #16a34a; font-size: 36px; font-weight: 700; letter-spacing: 8px; margin: 0;">${otp}</p>
            </div>
            
            <p style="color: #9ca3af; font-size: 12px; margin: 0; line-height: 1.5;">
              If you didn't request this code, you can safely ignore this email. Do not share this OTP with anyone.
            </p>
          </div>
          
          <!-- Footer -->
          <div style="background: #f1f5f9; padding: 16px 24px; text-align: center;">
            <p style="color: #9ca3af; font-size: 11px; margin: 0;">&copy; ${new Date().getFullYear()} KrishiVerse. All rights reserved.</p>
          </div>
        </div>
      `,
        };

        await transporter.sendMail(mailOptions);

        console.log(`✅ OTP sent to ${email}: ${otp}`);

        res.json({
            success: true,
            message: 'OTP sent successfully to your email',
        });
    } catch (error) {
        console.error('Send OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send OTP. Please try again.',
            error: error.message,
        });
    }
};

// Verify OTP
exports.verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: 'Email and OTP are required',
            });
        }

        const storedData = otpStore.get(email);

        if (!storedData) {
            return res.status(400).json({
                success: false,
                message: 'OTP not found. Please request a new one.',
            });
        }

        // Check if OTP has expired
        if (Date.now() > storedData.expiresAt) {
            otpStore.delete(email);
            return res.status(400).json({
                success: false,
                message: 'OTP has expired. Please request a new one.',
            });
        }

        // Check if OTP matches
        if (storedData.otp !== otp) {
            return res.status(400).json({
                success: false,
                message: 'Invalid OTP. Please try again.',
            });
        }

        // Mark as verified
        storedData.verified = true;
        otpStore.set(email, storedData);

        // Clean up after successful verification (optional: keep for a while)
        setTimeout(() => {
            otpStore.delete(email);
        }, 10 * 60 * 1000); // Clean up after 10 minutes

        console.log(`✅ Email verified: ${email}`);

        res.json({
            success: true,
            message: 'Email verified successfully!',
        });
    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Verification failed. Please try again.',
            error: error.message,
        });
    }
};

// Check if email is verified (utility - can be used by other controllers)
exports.isEmailVerified = (email) => {
    const storedData = otpStore.get(email);
    return storedData?.verified === true;
};
