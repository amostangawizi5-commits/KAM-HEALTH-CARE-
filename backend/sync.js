const { sequelize } = require('./src/models/index');

const runSync = async () => {
  try {
    console.log('🔄 Syncing database...');
    // Use alter: true to update tables without dropping data
    await sequelize.sync({ alter: true });
    console.log('✅ Database synced successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database sync failed:', error.message);
    process.exit(1);
  }
};

runSync();
