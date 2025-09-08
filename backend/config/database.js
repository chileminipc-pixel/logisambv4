const mysql = require('mysql2/promise');

// MariaDB configuration for LOGISAMB production
const dbConfig = {
  host: process.env.DB_HOST || 'livesoft.ddns.me',
  user: process.env.DB_USER || 'fadmin_fadmin',
  password: process.env.DB_PASSWORD || 'livesoft01',
  database: process.env.DB_DATABASE || 'new_fadminspa_logis_paso',
  port: process.env.DB_PORT || 3306,
  connectionLimit: 10,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true,
  charset: 'utf8mb4',
  timezone: 'local',
  ssl: false // Set to true if MariaDB requires SSL
};

console.log('🔗 Database configuration:', {
  host: dbConfig.host,
  user: dbConfig.user,
  database: dbConfig.database,
  port: dbConfig.port
});

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
async function testConnection() {
  try {
    console.log('🔍 Testing database connection...');
    const connection = await pool.getConnection();
    
    // Test query
    const [rows] = await connection.execute('SELECT 1 as test, NOW() as timestamp');
    console.log('✅ Database connection successful:', rows[0]);
    
    // Test if main tables exist
    const [tables] = await connection.execute(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = ? 
      AND TABLE_NAME IN ('usuarios', 'empresas', 'guias', 'facturas_impagas')
    `, [dbConfig.database]);
    
    console.log('📋 Available tables:', tables.map(t => t.TABLE_NAME));
    
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

// Helper function to execute queries with error handling
async function executeQuery(sql, params = []) {
  let connection;
  try {
    connection = await pool.getConnection();
    const [rows] = await connection.execute(sql, params);
    return rows;
  } catch (error) {
    console.error('Database query error:', error.message);
    console.error('SQL:', sql);
    console.error('Params:', params);
    throw error;
  } finally {
    if (connection) connection.release();
  }
}

// Helper function for transactions
async function executeTransaction(queries) {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();
    
    const results = [];
    for (const { sql, params } of queries) {
      const [rows] = await connection.execute(sql, params);
      results.push(rows);
    }
    
    await connection.commit();
    return results;
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Transaction error:', error.message);
    throw error;
  } finally {
    if (connection) connection.release();
  }
}

// Close pool gracefully
async function closePool() {
  try {
    await pool.end();
    console.log('🔒 Database pool closed');
  } catch (error) {
    console.error('Error closing database pool:', error.message);
  }
}

module.exports = {
  pool,
  executeQuery,
  executeTransaction,
  testConnection,
  closePool,
  dbConfig
};