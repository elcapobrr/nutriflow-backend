const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('../config/database');

const fs = require('fs');
const path = require('path');

const logFile = path.join(__dirname, '../debug.log');

function logToFile(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `${timestamp} - ${message}\n`;
    try {
        fs.appendFileSync(logFile, logMessage);
    } catch (err) {
        // Fallback to console
        console.log(message);
    }
}

// Google OAuth routes
router.get('/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
        logToFile(`Google Callback: User ${req.user.email} authenticated`);
        // Generate JWT token
        const token = jwt.sign(
            { id: req.user.id, email: req.user.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Redirect to frontend with token
        res.redirect(`${process.env.FRONTEND_URL}?token=${token}`);
    }
);

// Traditional Auth: Register
router.post('/register', async (req, res) => {
    try {
        const { username, email, password, phone } = req.body;

        // Validation
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Username, email, and password are required' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        // Check if user exists
        const [existing] = await db.query(
            'SELECT id FROM users WHERE username = ? OR email = ?',
            [username, email]
        );

        if (existing.length > 0) {
            return res.status(400).json({ error: 'Username or email already exists' });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Create user
        const [result] = await db.query(
            'INSERT INTO users (username, email, password_hash, phone, name, provider) VALUES (?, ?, ?, ?, ?, ?)',
            [username, email, passwordHash, phone || null, username, 'email']
        );

        // Generate JWT token
        const token = jwt.sign(
            { id: result.insertId, email, username },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            user: {
                id: result.insertId,
                username,
                email,
                phone,
                name: username
            },
            token
        });
    } catch (error) {
        console.error('Registration error details:', error);
        res.status(500).json({ error: 'Registration failed: ' + error.message });
    }
});

// Traditional Auth: Login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validation
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        // Find user
        const [users] = await db.query(
            'SELECT id, username, email, password_hash, phone, name FROM users WHERE username = ? OR email = ?',
            [username, username]
        );

        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = users[0];

        // Check if user registered via email (has password)
        if (!user.password_hash) {
            return res.status(401).json({ error: 'This account uses Google login' });
        }

        // Verify password
        const validPassword = await bcrypt.compare(password, user.password_hash);

        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, email: user.email, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                phone: user.phone,
                name: user.name
            },
            token
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Middleware to verify JWT
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        logToFile('VerifyToken: Failed - No token provided');
        return res.status(401).json({ error: 'No token provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            logToFile(`VerifyToken: Failed - ${err.message}`);
            return res.status(403).json({ error: 'Invalid token' });
        }
        logToFile(`VerifyToken: Success - User: ${user.username || user.email}`);
        req.user = user;
        next();
    });
};

// Get current user (Protected with JWT)
router.get('/me', verifyToken, async (req, res) => {
    try {
        console.log('Fetching user for ID:', req.user.id);

        // Fetch full user details from DB
        const [users] = await db.query(
            'SELECT id, username, email, name, avatar, provider, phone FROM users WHERE id = ?',
            [req.user.id]
        );

        if (users.length === 0) {
            logToFile(`GetMe: Failed - User not found for ID ${req.user.id}`);
            return res.status(404).json({ error: 'User not found' });
        }

        logToFile(`GetMe: Success - Found ${users[0].username}`);
        res.json({ user: users[0] });
    } catch (error) {
        logToFile(`GetMe: Error - ${error.message}`);
        console.error('Error in /me:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Logout
router.post('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).json({ error: 'Logout failed' });
        }
        res.json({ message: 'Logged out successfully' });
    });
});

module.exports = router;
