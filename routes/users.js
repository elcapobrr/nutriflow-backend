const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticate } = require('../middleware/auth');

// Get user profile
router.get('/profile', authenticate, async (req, res) => {
    try {
        console.log(`[DEBUG] Getting profile for user ${req.user.id}`);
        const [profiles] = await db.query(
            'SELECT * FROM user_profiles WHERE user_id = ?',
            [req.user.id]
        );
        console.log(`[DEBUG] Found profiles: ${profiles.length}`);

        if (profiles.length === 0) {
            return res.json({ profile: null });
        }

        let data = profiles[0].data;
        // Check if data is a string (needs parsing) or already an object
        if (typeof data === 'string') {
            try {
                data = JSON.parse(data);
            } catch (e) {
                console.error('[DEBUG] Failed to parse profile data string:', e);
                data = {}; // Fallback
            }
        }

        console.log('[DEBUG] Profile data type:', typeof data);
        res.json({ profile: data });
    } catch (error) {
        console.error('[DEBUG] Error getting profile:', error);
        res.status(500).json({ error: error.message });
    }
});

// Update user profile
router.post('/profile', authenticate, async (req, res) => {
    try {
        console.log(`[DEBUG] Saving profile for user ${req.user.id}`, req.body);
        const profileData = JSON.stringify(req.body);

        await db.query(
            `INSERT INTO user_profiles (user_id, data) 
       VALUES (?, ?) 
       ON DUPLICATE KEY UPDATE data = ?, updated_at = NOW()`,
            [req.user.id, profileData, profileData]
        );

        res.json({ profile: req.body });
    } catch (error) {
        console.error('[DEBUG] Error saving profile:', error);
        res.status(500).json({ error: error.message });
    }
});

// Update account details (email, name)
router.patch('/me', authenticate, async (req, res) => {
    try {
        const { name, email } = req.body;

        // Simple validation
        if (!name && !email) {
            return res.status(400).json({ error: 'No data to update' });
        }

        const updates = [];
        const values = [];

        if (name) {
            updates.push('name = ?');
            values.push(name);
        }

        if (email) {
            // Check if email is taken by another user
            const [existing] = await db.query('SELECT id FROM users WHERE email = ? AND id != ?', [email, req.user.id]);
            if (existing.length > 0) {
                return res.status(400).json({ error: 'Email already in use' });
            }
            updates.push('email = ?');
            values.push(email);
        }

        if (updates.length > 0) {
            values.push(req.user.id);
            await db.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values);
        }

        // Return updated user
        const [updatedUser] = await db.query('SELECT id, username, email, name, avatar, provider, phone FROM users WHERE id = ?', [req.user.id]);

        res.json({ user: updatedUser[0] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
