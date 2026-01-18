const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

// Create transporter
const createTransporter = () => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.error('❌ Email credentials not configured. Please set EMAIL_USER and EMAIL_PASS in .env file');
        return null;
    }

    return nodemailer.createTransport({
        service: 'gmail', // You can change this to your email service
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS // Use app password for Gmail
        }
    });
};

const transporter = createTransporter();

// Generate 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email
const sendOTPEmail = async (email, otp) => {
    try {
        if (!transporter) {
            console.error('❌ Email transporter not configured. Please set EMAIL_USER and EMAIL_PASS in .env file');
            return false;
        }

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your OTP for Registration - MyDashboard',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Welcome to MyDashboard!</h2>
                    <p>Your One-Time Password (OTP) for registration is:</p>
                    <div style="background-color: #f8f9fa; padding: 20px; text-align: center; margin: 20px 0;">
                        <h1 style="color: #007bff; font-size: 32px; margin: 0; letter-spacing: 5px;">${otp}</h1>
                    </div>
                    <p>This OTP will expire in <strong>10 minutes</strong>.</p>
                    <p>If you didn't request this, please ignore this email.</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="color: #666; font-size: 12px;">This is an automated message, please do not reply.</p>
                </div>
            `
        };

        const result = await transporter.sendMail(mailOptions);
        console.log('✅ OTP email sent successfully:', result.messageId);
        return true;
    } catch (error) {
        console.error('❌ Error sending OTP email:', error);
        return false;
    }
};

module.exports = { generateOTP, sendOTPEmail };