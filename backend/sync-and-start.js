const sequelize = require('./src/config/database');
const models = require('./src/models');

async function initDatabase() {
  try {
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connected successfully!');
    console.log(`📊 Database: ${sequelize.config.database}`);
    console.log(`👤 User: ${sequelize.config.username}`);
    console.log(`🌐 Host: ${sequelize.config.host}\n`);

    // Sync database (force: false - keep existing data)
    await sequelize.sync({ alter: true });
    console.log('✅ Database synced successfully!\n');

    // Check if we have data
    const userCount = await models.User.count();
    console.log(`👥 Users in database: ${userCount}`);

    if (userCount === 0) {
      console.log('⚠️ No users found. Please run seed script.');
    } else {
      console.log('✅ Database already has data!');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

initDatabase();
