import mysql from 'mysql2/promise';

const DB_CONFIG: {
  host: string;
  user: string;
  password: string;
  database?: string;
  port: number;
  connectTimeout: number;
} = {
  host: '139.99.92.94',
  user: 'acsoba593068_fdduser',
  password: 'fuKT{YG}_H^W',
  // Try connecting without specifying a database first, then we can list available databases
  // If you know the specific database name, uncomment the line below and replace 'mysql' with the actual database name
  // database: 'mysql',
  port: 3306,
  connectTimeout: 10000, // 10 seconds timeout
};

async function testDatabaseConnection() {
  let connection: mysql.Connection | null = null;

  try {
    console.log('🔌 Attempting to connect to MySQL database...');
    console.log(`   Host: ${DB_CONFIG.host}`);
    console.log(`   User: ${DB_CONFIG.user}`);
    console.log(`   Database: ${DB_CONFIG.database || '(not specified)'}`);
    console.log(`   Port: ${DB_CONFIG.port}`);
    console.log('');

    // Create connection
    connection = await mysql.createConnection(DB_CONFIG);
    console.log('✅ Successfully connected to MySQL database!');
    console.log('');

    // Test query - get MySQL version
    console.log('📊 Testing database query...');
    const [rows] = await connection.execute('SELECT VERSION() as version, DATABASE() as current_database');
    console.log('✅ Query executed successfully!');
    console.log('   Results:', rows);
    console.log('');

    // List available databases
    console.log('📋 Listing available databases...');
    const [databases] = await connection.execute('SHOW DATABASES');
    console.log('   Available databases:');
    (databases as any[]).forEach((db: any) => {
      console.log(`   - ${db.Database}`);
    });
    console.log('');

    // Get current user info
    console.log('👤 Getting current user information...');
    const [userInfo] = await connection.execute('SELECT USER(), CURRENT_USER()');
    console.log('   User info:', userInfo);
    console.log('');

    console.log('🎉 Database connection test completed successfully!');
    return true;
  } catch (error: any) {
    console.error('❌ Database connection failed!');
    console.error('   Error:', error.message);
    if (error.code) {
      console.error('   Error code:', error.code);
    }
    if (error.errno) {
      console.error('   Error number:', error.errno);
    }
    return false;
  } finally {
    // Close connection
    if (connection) {
      await connection.end();
      console.log('🔌 Connection closed.');
    }
  }
}

// Run the test
testDatabaseConnection()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });

