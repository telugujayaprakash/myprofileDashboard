const express = require('express')
const jwt = require('jsonwebtoken')
const User = require('../../../models/Users/userSchema')
const OTP = require('../../../models/Users/otpSchema')
const Profile = require('../../../models/Users/profileSchema')
const { generateOTP, sendOTPEmail } = require('../../../utils/emailService')
const router = express.Router();

// User Registration Controller - Send OTP
const userRegister = async (req, res) => {
    try {
        const { username, email, phonenumber } = req.body;

        // Validate required fields
        if (!username || !email) {
            return res.status(400).json({ message: 'Username and email are required' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists with this email or username' });
        }

        // Check if there's already an active OTP for this email
        const existingOTP = await OTP.findOne({ email });
        if (existingOTP) {
            return res.status(400).json({ message: 'OTP already sent to this email. Please check your email or wait for it to expire.' });
        }

        // Generate OTP
        const otp = generateOTP();

        // Store OTP with user data temporarily
        const otpDoc = new OTP({
            email,
            otp,
            userData: {
                username,
                phonenumber: phonenumber || null
            }
        });

        await otpDoc.save();

        // Send OTP email
        const emailSent = await sendOTPEmail(email, otp);
        if (!emailSent) {
            // Clean up OTP if email failed
            await OTP.deleteOne({ email });
            return res.status(500).json({ message: 'Failed to send OTP email. Please try again.' });
        }

        res.status(200).json({
            message: 'OTP sent to your email. Please verify to complete registration.',
            email: email
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// User Login Controller - Send OTP
const userLogin = async (req, res) => {
    try {
        const { email } = req.body;

        // Validate email
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'No account found with this email' });
        }

        // Check if there's already an active OTP for this email
        const existingOTP = await OTP.findOne({ email });
        if (existingOTP) {
            return res.status(400).json({ message: 'OTP already sent to this email. Please check your email or wait for it to expire.' });
        }

        // Generate OTP
        const otp = generateOTP();

        // Store OTP for login (no userData needed for login)
        const otpDoc = new OTP({
            email,
            otp
            // userData is optional for login
        });

        await otpDoc.save();

        // Send OTP email
        const emailSent = await sendOTPEmail(email, otp);
        if (!emailSent) {
            // Clean up OTP if email failed
            await OTP.deleteOne({ email });
            return res.status(500).json({ message: 'Failed to send OTP email. Please try again.' });
        }

        res.status(200).json({
            message: 'OTP sent to your email. Please verify to login.',
            email: email
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// OTP Verification Controller (for both registration and login)
const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ message: 'Email and OTP are required' });
        }

        // Find the OTP record
        const otpRecord = await OTP.findOne({ email, otp });
        if (!otpRecord) {
            return res.status(400).json({ message: 'Invalid OTP or email' });
        }

        // Check if OTP has expired
        if (otpRecord.expiresAt < new Date()) {
            await OTP.deleteOne({ email });
            return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
        }

        // Check if this is registration (userData exists) or login (no userData)
        if (otpRecord.userData && otpRecord.userData.username) {
            // Registration flow
            const newUser = new User({
                userid: `user_${Date.now()}`,
                username: otpRecord.userData.username,
                email: otpRecord.email,
                phonenumber: otpRecord.userData.phonenumber,
                isActive: true // Activate account after OTP verification
            });

            await newUser.save();

            // Create profile document for the new user
            const newProfile = new Profile({
                userid: newUser.userid,
                username: newUser.username
            });
            await newProfile.save();

            // Generate JWT Token
            const token = jwt.sign({ userid: newUser.userid, isAdmin: newUser.isAdmin }, process.env.JWT_SECRET, { expiresIn: '7d' });

            // Delete the OTP record
            await OTP.deleteOne({ email });

            res.status(201).json({
                message: 'Account created successfully!',
                token: token,
                user: {
                    userid: newUser.userid,
                    username: newUser.username,
                    email: newUser.email
                },
                redirectUrl: `/${newUser.username}` // Redirect to user profile
            });
        } else {
            // Login flow
            const user = await User.findOne({ email: otpRecord.email });
            if (!user) {
                return res.status(400).json({ message: 'User account not found' });
            }

            // Generate JWT Token
            const token = jwt.sign({ userid: user.userid, isAdmin: user.isAdmin }, process.env.JWT_SECRET, { expiresIn: '7d' });

            // Delete the OTP record
            await OTP.deleteOne({ email });

            res.status(200).json({
                message: 'Login successful!',
                token: token,
                user: {
                    userid: user.userid,
                    username: user.username,
                    email: user.email
                },
                redirectUrl: `/${user.username}` // Redirect to user profile
            });
        }

    } catch (error) {
        console.error('OTP verification error:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = { userRegister, userLogin, verifyOTP };