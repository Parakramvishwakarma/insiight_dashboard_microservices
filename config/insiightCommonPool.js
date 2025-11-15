// db.js
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const {
    DB_HOST,
    DB_USER,
    DB_PASS,
} = process.env;

const pool = mysql.createPool({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASS,
    database: "insiight_clients",
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10, // Maximum number of concurrent connections
    queueLimit: 0
});

console.log('✅ MySQL connection pool to shiine insiigth clients database created');

export default pool;
