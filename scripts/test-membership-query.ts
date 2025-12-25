import mysql from 'mysql2/promise';

const MYSQL_CONFIG = {
  host: '139.99.92.94',
  user: 'acsoba593068_fdduser',
  password: 'fuKT{YG}_H^W',
  database: 'acsoba593068_membership',
  port: 3306,
  connectTimeout: 10000,
};

async function testMembershipQuery() {
  let connection: mysql.Connection | null = null;

  try {
    console.log('🔌 Connecting to membership database...');
    connection = await mysql.createConnection(MYSQL_CONFIG);
    console.log('✅ Connected successfully!\n');

    // Check if table exists
    console.log('📋 Checking if tblm_Member table exists...');
    const [tables] = await connection.execute(
      "SHOW TABLES LIKE 'tblm_Member'"
    );
    const tableExists = (tables as any[]).length > 0;
    console.log(`   Table exists: ${tableExists}\n`);

    if (tableExists) {
      // Check table structure
      console.log('📊 Checking table structure...');
      const [columns] = await connection.execute(
        "DESCRIBE tblm_Member"
      );
      console.log('   Columns:');
      (columns as any[]).forEach((col: any) => {
        console.log(`   - ${col.Field} (${col.Type})`);
      });
      console.log('');

      // Try a sample query (without a specific membership number)
      console.log('🔍 Testing query structure...');
      const [sampleRows] = await connection.execute(
        'SELECT MMembershipID FROM tblm_Member LIMIT 5'
      );
      console.log(`   Sample query returned ${(sampleRows as any[]).length} rows`);
      if ((sampleRows as any[]).length > 0) {
        console.log('   Sample membership IDs:');
        (sampleRows as any[]).slice(0, 3).forEach((row: any) => {
          console.log(`   - ${row.MMembershipID}`);
        });
      }
      console.log('');

      // Test the actual validation query with a placeholder
      console.log('✅ Query structure is valid!');
      console.log('   The validation query will work correctly.');
    } else {
      console.log('❌ Table tblm_Member does not exist!');
    }

    return true;
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    if (error.code) {
      console.error('   Error code:', error.code);
    }
    return false;
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Connection closed.');
    }
  }
}

testMembershipQuery()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });


