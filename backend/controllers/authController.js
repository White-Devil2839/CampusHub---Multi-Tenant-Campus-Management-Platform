const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const Institution = require('../models/Institution');
const User = require('../models/User');
const { generateToken, generateRefreshToken } = require('../utils/jwt');
const sendEmail = require('../utils/sendEmail');
const logAction = require('../utils/auditLogger'); // Audit Logger

// @desc    Register new institution
// @route   POST /api/institutions/register
// @access  Public
const registerInstitution = async (req, res) => {
    const { name, emailDomain, adminName, adminEmail, adminPassword } = req.body;

    // Input validation with specific error messages
    if (!name || !name.trim()) {
        return res.status(400).json({ message: 'Institution name is required' });
    }
    if (!adminName || !adminName.trim()) {
        return res.status(400).json({ message: 'Admin name is required' });
    }
    if (!adminEmail || !adminEmail.trim()) {
        return res.status(400).json({ message: 'Admin email is required' });
    }
    if (!adminPassword) {
        return res.status(400).json({ message: 'Password is required' });
    }
    if (adminPassword.length < 8) {
        return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(adminEmail)) {
        return res.status(400).json({ message: 'Please enter a valid email address' });
    }

    try {
        // Check if admin email already exists (case-insensitive)
        const normalizedEmail = adminEmail.toLowerCase().trim();
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(400).json({ message: 'An account with this email already exists. Please use a different email or login.' });
        }
        // Auto-generate unique institution code
        let code;
        let isUnique = false;
        while (!isUnique) {
            code = crypto.randomBytes(3).toString('hex'); // Generates 6 char hex string
            const existing = await Institution.findOne({ code });
            if (!existing) isUnique = true;
        }

        const institution = await Institution.create({
            name,
            code, // Changed from institutionCode to code
            emailDomain,
        });

        // Create Super Admin for this institution
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminPassword, salt);

        const user = await User.create({
            name: adminName,
            email: normalizedEmail,
            password: hashedPassword,
            role: 'ADMIN',
            institutionId: institution._id,
        });

        // Send Email to Admin
        const loginUrl = `${process.env.FRONTEND_URL}/login`; // Point to global login
        const message = `
            <h1>Welcome to CampusHub!</h1>
            <p>Your institution <strong>${name}</strong> has been successfully registered.</p>
            <p><strong>Institution Code:</strong> ${code}</p>
            <p><strong>Login URL:</strong> <a href="${loginUrl}">${loginUrl}</a></p>
            <p>Share this code or URL with your students so they can join.</p>
        `;

        try {
            await sendEmail({
                to: adminEmail,
                subject: 'Institution Registration Successful',
                html: message,
            });
        } catch (emailError) {
            console.error('Email send failed:', emailError);
        }

        const token = generateToken(user, institution);
        const refreshToken = generateRefreshToken(user);

        // Set Refresh Token Cookie
        res.cookie('jwt', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        // Audit Log
        logAction({
            action: 'CREATE_INSTITUTION',
            performedBy: user._id,
            institutionId: institution._id,
            details: `Institution ${name} created by ${adminEmail}`,
            req
        });

        res.status(201).json({
            success: true,
            token,
            role: user.role,
            name: user.name,
            email: user.email,
            institutionCode: institution.code,
            redirect: `/${institution.code}/admin`
        });
    } catch (error) {
        console.error(error);
        // Handle specific MongoDB errors
        if (error.code === 11000) {
            if (error.keyPattern?.email) {
                return res.status(400).json({ message: 'An account with this email already exists' });
            }
            if (error.keyPattern?.code) {
                return res.status(400).json({ message: 'Institution code conflict. Please try again.' });
            }
        }
        res.status(500).json({ message: 'Registration failed. Please try again.' });
    }
};

// @desc    Global Login (Finds user & institution)
// @route   POST /api/auth/login
// @access  Public
const globalLogin = async (req, res) => {
    const { email, password } = req.body;

    // Input validation with specific error messages
    if (!email || !email.trim()) {
        return res.status(400).json({ message: 'Email is required' });
    }
    if (!password) {
        return res.status(400).json({ message: 'Password is required' });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Please enter a valid email address' });
    }

    try {
        // 1. Find a user by email (case-insensitive)
        const normalizedEmail = email.toLowerCase().trim();
        const user = await User.findOne({ email: normalizedEmail }).populate('institutionId');

        if (!user) {
            return res.status(401).json({ message: 'No account found with this email' });
        }

        // 2. Validate the password
        if (!(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Incorrect password' });
        }

        // 3. Fetch the institution using user.institutionId
        const institution = user.institutionId;

        // Generate Tokens
        const accessToken = generateToken(user, institution);
        const refreshToken = generateRefreshToken(user);

        // ... Cookie Logic ...

        // Audit Log
        logAction({
            action: 'LOGIN',
            performedBy: user._id,
            institutionId: institution._id,
            details: `User ${user.email} logged in`,
            req
        });

        // 5. Build redirect paths
        let redirectPath;
        if (user.role === 'ADMIN') {
            redirectPath = `/${institution.code}/admin`;
        } else {
            redirectPath = `/${institution.code}/dashboard`;
        }

        // 6. Return exactly this response shape
        res.json({
            success: true,
            token: accessToken,
            role: user.role,
            name: user.name,
            email: user.email,
            institutionCode: institution.code,
            redirect: redirectPath
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Refresh Access Token
// @route   POST /api/auth/refresh
// @access  Public (Cookie)
const refreshToken = async (req, res) => {
    const cookies = req.cookies;

    if (!cookies?.jwt) return res.status(401).json({ message: 'Unauthorized' });

    const refreshToken = cookies.jwt;

    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

        const user = await User.findById(decoded.userId).populate('institutionId');

        if (!user) return res.status(401).json({ message: 'Unauthorized' });

        const institution = user.institutionId;
        const accessToken = generateToken(user, institution);

        res.json({ accessToken });
    } catch (err) {
        return res.status(403).json({ message: 'Forbidden' });
    }
};

// @desc    Logout User
// @route   POST /api/auth/logout
// @access  Public
const logout = (req, res) => {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(204); // No content

    res.clearCookie('jwt', { httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production' });
    res.json({ message: 'Cookie cleared' });
};

// @desc    Register new user (Member)
// @route   POST /api/auth/register (Note: Logic updated to use 'code')
// @access  Public
const registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    // Input validation with specific error messages
    if (!name || !name.trim()) {
        return res.status(400).json({ message: 'Name is required' });
    }
    if (!email || !email.trim()) {
        return res.status(400).json({ message: 'Email is required' });
    }
    if (!password) {
        return res.status(400).json({ message: 'Password is required' });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Please enter a valid email address' });
    }

    // Password strength validation
    if (password.length < 8) {
        return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    if (!passwordRegex.test(password)) {
        return res.status(400).json({ message: 'Password must include uppercase, lowercase, and a number' });
    }

    if (!req.institutionId) {
        return res.status(400).json({ message: 'Invalid institution code. Please check and try again.' });
    }

    try {
        // Normalize email to lowercase for case-insensitive check
        const normalizedEmail = email.toLowerCase().trim();
        const userExists = await User.findOne({ email: normalizedEmail });

        if (userExists) {
            return res.status(400).json({ message: 'An account with this email already exists. Please login instead.' });
        }

        // Domain Check logic...
        if (req.institution.emailDomain) {
            const domain = req.institution.emailDomain.toLowerCase();
            const emailDomain = email.split('@')[1].toLowerCase();
            if (emailDomain !== domain) {
                return res.status(400).json({ message: `Email must belong to ${domain} domain` });
            }
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email: normalizedEmail,
            password: hashedPassword,
            role: 'MEMBER',
            institutionId: req.institutionId,
        });

        if (user) {
            const token = generateToken(user, req.institution);

            // Audit Log
            logAction({
                action: 'REGISTER',
                performedBy: user._id,
                institutionId: req.institutionId,
                details: `User ${user.email} registered`,
                req
            });

            res.status(201).json({
                success: true,
                token,
                role: user.role,
                name: user.name,
                email: user.email,
                institutionCode: req.institution.code,
                redirect: `/${req.institution.code}/dashboard`
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

// Kept for backward compatibility if needed, but Login is now Global
const loginUser = async (req, res) => {
    // Forward to global login logic or deprecate?
    // For now, let's just use global login logic but we have institution context which validates.
    return globalLogin(req, res);
};

// @desc    Request Password Reset (Secure)
// @route   POST /api/auth/request-reset
// @access  Public
const requestReset = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email }).populate('institutionId');

        // Always return generic response to prevent enumeration
        const genericResponse = { message: 'If an account with that email exists, we have sent password reset instructions.' };

        if (!user) {
            console.log(`Password reset requested for non-existent email: ${email}`);
            return res.json(genericResponse);
        }

        // Generate Secure Token (48 bytes hex)
        const resetToken = crypto.randomBytes(48).toString('hex');

        // Store Hash (Bcrypt)
        const salt = await bcrypt.genSalt(10);
        user.resetTokenHash = await bcrypt.hash(resetToken, salt);

        // Expiry (15 mins)
        user.resetTokenExpiresAt = Date.now() + 15 * 60 * 1000;
        user.resetUsed = false;
        user.resetRequestedAt = Date.now();
        user.resetAttempts = 0;

        await user.save({ validateBeforeSave: false });

        // Construct Link: Includes UserID for lookup + Token for verification
        // Format: /reset-password?token=TOKEN&id=USER_ID
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}&id=${user._id}`;

        const message = `
            <h2>Reset Your Password</h2>
            <p>You have requested a password reset for your CampusHub account at <strong>${user.institutionId.name}</strong>.</p>
            <p>Click the link below to reset your password. This link expires in 15 minutes.</p>
            <a href="${resetUrl}" style="background:#007bff;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">Reset Password</a>
            <p style="margin-top:20px;font-size:12px;color:#666;">If you did not request this, please ignore this email.</p>
        `;

        try {
            await sendEmail({
                to: user.email,
                subject: 'Reset Your Password - CampusHub',
                html: message
            });
        } catch (err) {
            console.error('Email send failed:', err);
            // Don't fail the request, just log
        }

        res.json(genericResponse);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Validate Reset Token (UI Helper)
// @route   GET /api/auth/validate-reset
// @access  Public
const validateReset = async (req, res) => {
    const { token, id } = req.query;

    if (!token || !id) {
        return res.status(400).json({ valid: false, message: 'Missing token or id' });
    }

    try {
        const user = await User.findById(id);

        if (!user || !user.resetTokenHash || !user.resetTokenExpiresAt) {
            return res.status(400).json({ valid: false, message: 'Invalid or expired token' });
        }

        if (user.resetUsed) {
            return res.status(400).json({ valid: false, message: 'Token has already been used' });
        }

        if (Date.now() > user.resetTokenExpiresAt) {
            return res.status(400).json({ valid: false, message: 'Token has expired' });
        }

        // Verify Hash
        const isMatch = await bcrypt.compare(token, user.resetTokenHash);
        if (!isMatch) {
            return res.status(400).json({ valid: false, message: 'Invalid token' });
        }

        res.json({ valid: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Reset Password (Final Step)
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
    const { token, id, password } = req.body;

    // Password Policy Check
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
        return res.status(400).json({ message: 'Password must be at least 8 characters, include uppercase, lowercase, and a number' });
    }

    try {
        const user = await User.findById(id).populate('institutionId');

        if (!user || !user.resetTokenHash || !user.resetUsed === undefined) {
            return res.status(400).json({ message: 'Invalid request' });
        }

        if (user.resetUsed) return res.status(400).json({ message: 'Token already used' });
        if (Date.now() > user.resetTokenExpiresAt) return res.status(400).json({ message: 'Token expired' });

        const isMatch = await bcrypt.compare(token, user.resetTokenHash);
        if (!isMatch) return res.status(400).json({ message: 'Invalid token' });

        // Generate New Password Hash
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        // Invalidate Sessions
        user.tokenVersion = (user.tokenVersion || 0) + 1;

        // Mark Token Used
        user.resetUsed = true;
        user.resetTokenHash = undefined; // Optional: clear it or keep for audit
        user.resetTokenExpiresAt = undefined;

        await user.save();

        // Send Success Email
        const message = `
            <h2>Password Changed</h2>
            <p>Your password was successfully changed.</p>
            <p>If you did not initiate this, please contact support immediately.</p>
        `;

        await sendEmail({
            to: user.email,
            subject: 'Your Password Was Changed - CampusHub',
            html: message
        });

        res.json({ success: true, message: 'Password reset successfully. Please login with your new password.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user._id).select('+password');

        if (!(await bcrypt.compare(currentPassword, user.password))) {
            return res.status(401).json({ message: 'Incorrect current password' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        // Manual Password Change Email
        try {
            await sendEmail({
                to: user.email,
                subject: 'Your Password Was Updated - CampusHub',
                html: `<p>Your password was updated via account settings. If this wasn't you, contact support.</p>`
            });
        } catch (e) {
            console.error('Email error', e);
        }

        res.json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Test Email Sending
// @route   GET /api/test-email
// @access  Public
const testEmail = async (req, res) => {
    try {
        const sent = await sendEmail({
            to: process.env.EMAIL_FROM || req.query.email, // Send to self or query param
            subject: 'Test Email from CampusHub',
            message: 'This is a test email to verify SendGrid integration.',
        });

        if (sent) {
            res.json({ success: true, message: 'Email sent successfully' });
        } else {
            res.status(500).json({ success: false, message: 'Failed to send email' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};


module.exports = {
    registerInstitution,
    loginUser,
    registerUser,
    globalLogin,
    refreshToken,
    logout,
    resetPassword,
    changePassword,
    requestReset,
    validateReset,
    testEmail
};
