const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticate } = require('../middleware/auth');

// Get all food entries for user
router.get('/', authenticate, async (req, res) => {
    try {
        console.log(`[DEBUG] Fetching foods for user ${req.user.id}`);
        const [rows] = await db.query(
            'SELECT id, name, calories, meal_type, timestamp as logged_at FROM food_entries WHERE user_id = ? ORDER BY timestamp DESC',
            [req.user.id]
        );
        console.log(`[DEBUG] Found ${rows.length} food entries`);

        res.json({ foods: rows });
    } catch (error) {
        console.error('[DEBUG] Error fetching foods:', error);
        res.status(500).json({ error: error.message });
    }
});

// Add food entry
router.post('/', authenticate, async (req, res) => {
    try {
        console.log(`[DEBUG] Adding food for user ${req.user.id}:`, req.body);
        const { name, calories, meal_type = 'breakfast' } = req.body;
        const timestamp = new Date();

        const [result] = await db.query(
            'INSERT INTO food_entries (user_id, name, calories, meal_type, timestamp) VALUES (?, ?, ?, ?, ?)',
            [req.user.id, name, calories, meal_type, timestamp]
        );

        res.json({
            food: {
                id: result.insertId,
                name,
                calories,
                meal_type,
                logged_at: timestamp.toISOString()
            }
        });
    } catch (error) {
        console.error('[DEBUG] Error adding food:', error);
        res.status(500).json({ error: error.message });
    }
});

// Delete food entry
router.delete('/:id', authenticate, async (req, res) => {
    try {
        await db.query(
            'DELETE FROM food_entries WHERE id = ? AND user_id = ?',
            [req.params.id, req.user.id]
        );

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
