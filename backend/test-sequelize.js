const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  'kazimilicare_db',
  'kazimilicare_user',
  'Cive@2004',
  {
    host: 'localhost',
    port: 5432,
    dialect: 'postgres',
    logging: console.log
  }
);

async function test() {
  try {
    console.log('🔄 Testing Sequelize connection...');
    await sequelize.authenticate();
    console.log('✅ Sequelize connection successful!');
    
    // Try to create a simple table
    await sequelize.query('CREATE TABLE IF NOT EXISTS test_table (id SERIAL PRIMARY KEY, name VARCHAR(100))');
    console.log('✅ Test table created!');
    
    // Insert test data
    await sequelize.query("INSERT INTO test_table (name) VALUES ('test')");
    console.log('✅ Test data inserted!');
    
    // Query test data
    const result = await sequelize.query('SELECT * FROM test_table');
    console.log('✅ Query successful:', result[0]);
    
    // Drop test table
    await sequelize.query('DROP TABLE test_table');
    console.log('✅ Test table dropped!');
    
    console.log('🎉 All tests passed! Database is working perfectly.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    process.exit(1);
  }
}

test();
