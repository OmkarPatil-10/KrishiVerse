const nodemailer = require('nodemailer');

// Admin email address
const ADMIN_EMAIL = 'ayushnr35@gmail.com';

// Create reusable transporter using Gmail SMTP (same as OTP controller)
const createTransporter = () => {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
};

// Send support query to admin
exports.sendSupportQuery = async (req, res) => {
    try {
        const { userName, userEmail, userRole, contractId, subject, message } = req.body;

        if (!subject || !message) {
            return res.status(400).json({
                success: false,
                message: 'Subject and message are required',
            });
        }

        const transporter = createTransporter();

        const mailOptions = {
            from: `"KrishiVerse Support" <${process.env.EMAIL_USER}>`,
            to: ADMIN_EMAIL,
            subject: `🌾 Support Query: ${subject}`,
            html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fdf5; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
          <div style="background: linear-gradient(135deg, #16a34a, #15803d); padding: 24px; text-align: center;">
            <h1 style="color: #fff; margin: 0; font-size: 24px;">🌱 KrishiVerse Support</h1>
            <p style="color: #dcfce7; margin: 8px 0 0; font-size: 13px;">New Support Query Received</p>
          </div>
          
          <div style="padding: 24px;">
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <tr>
                <td style="padding: 8px 12px; background: #e8f5e9; font-weight: 600; color: #1b5e20; border-radius: 6px 0 0 0;">User</td>
                <td style="padding: 8px 12px; background: #f1f8e9; border-radius: 0 6px 0 0;">${userName || 'Unknown'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 12px; background: #e8f5e9; font-weight: 600; color: #1b5e20;">Email</td>
                <td style="padding: 8px 12px; background: #f1f8e9;">${userEmail || 'Not provided'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 12px; background: #e8f5e9; font-weight: 600; color: #1b5e20;">Role</td>
                <td style="padding: 8px 12px; background: #f1f8e9; text-transform: capitalize;">${userRole || 'Unknown'}</td>
              </tr>
              ${contractId ? `
              <tr>
                <td style="padding: 8px 12px; background: #e8f5e9; font-weight: 600; color: #1b5e20; border-radius: 0 0 0 6px;">Contract</td>
                <td style="padding: 8px 12px; background: #f1f8e9; border-radius: 0 0 6px 0;">${contractId}</td>
              </tr>` : ''}
            </table>

            <div style="background: #fff; border: 1px solid #c8e6c9; border-radius: 12px; padding: 16px; margin-bottom: 16px;">
              <h3 style="color: #2e7d32; margin: 0 0 8px; font-size: 16px;">${subject}</h3>
              <p style="color: #4b5563; font-size: 14px; margin: 0; line-height: 1.7; white-space: pre-wrap;">${message}</p>
            </div>

            <p style="color: #9ca3af; font-size: 11px; margin: 0;">
              Sent at: ${new Date().toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short' })}
            </p>
          </div>
          
          <div style="background: #f1f5f9; padding: 12px 24px; text-align: center;">
            <p style="color: #9ca3af; font-size: 11px; margin: 0;">&copy; ${new Date().getFullYear()} KrishiVerse. All rights reserved.</p>
          </div>
        </div>
      `,
        };

        await transporter.sendMail(mailOptions);

        console.log(`✅ Support query sent from ${userEmail || 'anonymous'}: ${subject}`);

        res.json({
            success: true,
            message: 'Your query has been sent to support. We will get back to you soon!',
        });
    } catch (error) {
        console.error('Support email error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send support query. Please try again.',
            error: error.message,
        });
    }
};
