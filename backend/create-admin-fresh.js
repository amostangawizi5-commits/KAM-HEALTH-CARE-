const { Sequelize } = require('sequelize');
const bcrypt = require('bcryptjs');

const sequelize = new Sequelize({
  database: 'kazimilicare_db',
  username: 'kazimilicare_user',
  password: 'Cive@2004',
  host: '127.0.0.1',
  port: 5432,
  dialect: 'postgres',
  logging: false
});

async function createUsers() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to PostgreSQL');
    
    const { DataTypes } = require('sequelize');
    
    const User = sequelize.define('User', {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      email: { type: DataTypes.STRING(255), allowNull: false, unique: true },
      password: { type: DataTypes.STRING(255), allowNull: false },
      firstName: { type: DataTypes.STRING(100), allowNull: false },
      lastName: { type: DataTypes.STRING(100), allowNull: false },
      role: { type: DataTypes.ENUM('ADMIN', 'RECEPTIONIST', 'CONSULTANT', 'DOCTOR', 'LAB_TECHNICIAN', 'PHARMACIST', 'CASHIER'), allowNull: false },
      phone: { type: DataTypes.STRING(20) },
      isActive: { type: DataTypes.BOOLEAN, defaultValue: true }
    });
    
    await User.sync({ alter: true });
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    
    // Create admin
    const admin = await User.findOrCreate({
      where: { email: 'admin@kazimilicare.com' },
      defaults: {
        email: 'admin@kazimilicare.com',
        password: hashedPassword,
        firstName: 'System',
        lastName: 'Administrator',
        role: 'ADMIN',
        phone: '+255700000000',
        isActive: true
      }
    });
    
    console.log('✅ Admin created: admin@kazimilicare.com / admin123');
    
    // Create other users
    const users = [
      { email: 'reception@kazimilicare.com', firstName: 'Reception', lastName: 'User', role: 'RECEPTIONIST' },
      { email: 'consultant@kazimilicare.com', firstName: 'Consultant', lastName: 'User', role: 'CONSULTANT' },
      { email: 'doctor@kazimilicare.com', firstName: 'Doctor', lastName: 'User', role: 'DOCTOR' },
      { email: 'pharmacist@kazimilicare.com', firstName: 'Pharmacist', lastName: 'User', role: 'PHARMACIST' },
      { email: 'cashier@kazimilicare.com', firstName: 'Cashier', lastName: 'User', role: 'CASHIER' }
    ];
    
    for (const userData of users) {
      const hashedPwd = await bcrypt.hash('admin123', salt);
      await User.findOrCreate({
        where: { email: userData.email },
        defaults: {
          ...userData,
          password: hashedPwd,
          phone: '+255700000000',
          isActive: true
        }
      });
      console.log(`✅ ${userData.role} created: ${userData.email} / admin123`);
    }
    
    console.log('🎉 All users created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createUsers();
