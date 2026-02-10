const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
};

async function migrate() {
    let connection;
    try {
        console.log('Connecting to database...');
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected!');

        // 1. Add traditional auth columns to users table
        try {
            console.log('Adding auth columns to users table...');
            await connection.query(`
                ALTER TABLE users 
                ADD COLUMN username VARCHAR(255) UNIQUE AFTER apple_id,
                ADD COLUMN password_hash VARCHAR(255) AFTER username,
                ADD COLUMN phone VARCHAR(20) AFTER password_hash,
                ADD INDEX idx_username (username);
            `);
            console.log('✅ Users table updated');
        } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log('⚠️ Columns already exist in users table');
            } else {
                console.error('Error updating users table:', err.message);
            }
        }

        // 2. Add macro nutrients to food_entries table
        try {
            console.log('Adding macros to food_entries table...');
            await connection.query(`
                ALTER TABLE food_entries
                ADD COLUMN protein DECIMAL(10,2) DEFAULT 0 AFTER calories,
                ADD COLUMN carbs DECIMAL(10,2) DEFAULT 0 AFTER protein,
                ADD COLUMN fats DECIMAL(10,2) DEFAULT 0 AFTER carbs;
            `);
            console.log('✅ food_entries table updated');
        } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log('⚠️ Columns already exist in food_entries table');
            } else {
                console.error('Error updating food_entries table:', err.message);
            }
        }

        console.log('🎉 Migration completed successfully!');

    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        if (connection) await connection.end();
        process.exit();
    }
}

migrate();
