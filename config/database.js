const mysql = require('mysql2/promise');
require('dotenv').config();

console.log('--- DB DEBUG ---');
console.log(`DB_HOST: "${process.env.DB_HOST}"`);
console.log(`DB_USER: "${process.env.DB_USER}"`);
console.log(`DB_NAME: "${process.env.DB_NAME}"`);
console.log(`DB_PORT: "${process.env.DB_PORT}"`);
if (process.env.DB_PASSWORD) {
    console.log(`DB_PASSWORD length: ${process.env.DB_PASSWORD.length}`);
    console.log(`DB_PASSWORD first char: "${process.env.DB_PASSWORD[0]}"`);
    console.log(`DB_PASSWORD last char: "${process.env.DB_PASSWORD[process.env.DB_PASSWORD.length - 1]}"`);
} else {
    console.log('DB_PASSWORD is NOT SET');
}
console.log('----------------');

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test connection
pool.getConnection()
    .then(connection => {
        console.log('✅ MySQL connected successfully');
        connection.release();
    })
    .catch(err => {
        console.error('❌ MySQL connection failed:', err.message);
    });

module.exports = pool;
