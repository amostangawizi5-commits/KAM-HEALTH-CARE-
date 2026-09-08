const { sequelize } = require('./src/models');

async function syncDatabase() {
  try {
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Connected to PostgreSQL successfully!');
    console.log(`📊 Database: ${sequelize.config.database}\n`);

    // Sync all models - force: true drops and recreates tables
    await sequelize.sync({ force: true });
    console.log('✅ All tables created successfully!\n');

    // Get list of tables
    const [tables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    console.log('📋 Tables created:');
    tables.forEach((t, i) => {
      console.log(`  ${i + 1}. ${t.table_name}`);
    });

    console.log(`\n✅ Total: ${tables.length} tables created`);
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.original) {
      console.error('📝 Original error:', error.original.message);
    }
    process.exit(1);
  }
}

syncDatabase();
