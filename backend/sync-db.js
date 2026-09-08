const { sequelize } = require('./src/config/database');

async function syncDatabase() {
  try {
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Connected to PostgreSQL successfully!');
    
    // Sync all models (force: true ita-drop na recreate tables)
    // Ikiwa unataka kukeep data, tumia { alter: true }
    await sequelize.sync({ force: true });
    console.log('✅ Database synced successfully!');
    
    // Show all tables
    const [tables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log('\n📋 Tables created:');
    if (tables.length === 0) {
      console.log('  No tables found');
    } else {
      tables.forEach((t, i) => {
        console.log(`  ${i + 1}. ${t.table_name}`);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

syncDatabase();
