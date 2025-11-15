// src/config/poolManager.js
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const {
  DB_HOST,
  DB_USER,
  DB_PASS,
} = process.env;

// Cache to store pools for each client
const poolCache = new Map();

export function getClientPool(clientId) {
  // Check if pool already exists in cache
  if (poolCache.has(clientId)) {
    return poolCache.get(clientId);
  }

  let dbName = null;
  if (clientId == "wabillboards") {
    dbName = `insiight_WA_Billboards_db`;
  }
  else if (clientId == "ordinary_agency") {
    dbName = `insiight_ordinary_db`;
  }
  else dbName = `insiight_${clientId}_db`;

  const pool = mysql.createPool({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASS,
    database: dbName,
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    // Valid MySQL2 pool options
    idleTimeout: 60000,           // Close idle connections after 60 seconds
    maxIdle: 10,                  // Maximum idle connections in pool
    enableKeepAlive: true,        // Keep connections alive
    keepAliveInitialDelay: 0      // Initial delay for keep-alive
  });

  if (!pool) {
    console.log(`No pool for client "${clientId}"`);
    return null;
  }

  // Store pool in cache
  poolCache.set(clientId, pool);
  console.log(`Created new pool for client "${clientId}" (total pools: ${poolCache.size})`);
  
  return pool;
}

// Optional: Add cleanup function for graceful shutdown
export function closeAllPools() {
  const promises = [];
  for (const [clientId, pool] of poolCache.entries()) {
    console.log(`Closing pool for client "${clientId}"`);
    promises.push(pool.end());
  }
  poolCache.clear();
  return Promise.all(promises);
}

// Optional: Close specific client pool
export function closeClientPool(clientId) {
  if (poolCache.has(clientId)) {
    const pool = poolCache.get(clientId);
    poolCache.delete(clientId);
    console.log(`Closed pool for client "${clientId}"`);
    return pool.end();
  }
  return Promise.resolve();
}
