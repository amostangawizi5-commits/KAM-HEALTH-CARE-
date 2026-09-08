const { Sequelize } = require('sequelize');

// Direct connection without config file
const sequelize = new Sequelize({
  database: 'kazimilicare_db',
  username: 'kazimilicare_user',
  password: 'Cive@2004',
  host: '127.0.0.1',
  port: 5432,
  dialect: 'postgres',
  logging: console.log,
  dialectOptions: {
    ssl: false,
    connectTimeout: 30000
  }
});

async function sync() {
  try {
    console.log('🔄 Testing connection...');
    await sequelize.authenticate();
    console.log('✅ Connected to PostgreSQL successfully!');
    
    console.log('🔄 Creating tables...');
    
    // Define models directly here
    const { DataTypes } = require('sequelize');
    
    const User = sequelize.define('User', {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      email: { type: DataTypes.STRING(255), allowNull: false, unique: true },
      password: { type: DataTypes.STRING(255), allowNull: false },
      firstName: { type: DataTypes.STRING(100), allowNull: false },
      lastName: { type: DataTypes.STRING(100), allowNull: false },
      role: { 
        type: DataTypes.ENUM('ADMIN', 'RECEPTIONIST', 'CONSULTANT', 'DOCTOR', 'LAB_TECHNICIAN', 'PHARMACIST', 'CASHIER'),
        allowNull: false 
      },
      phone: { type: DataTypes.STRING(20) },
      isActive: { type: DataTypes.BOOLEAN, defaultValue: true }
    });
    
    const Patient = sequelize.define('Patient', {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      patientNo: { type: DataTypes.STRING(20), allowNull: false, unique: true },
      firstName: { type: DataTypes.STRING(100), allowNull: false },
      lastName: { type: DataTypes.STRING(100), allowNull: false },
      dateOfBirth: { type: DataTypes.DATEONLY, allowNull: false },
      gender: { type: DataTypes.ENUM('MALE', 'FEMALE', 'OTHER'), allowNull: false },
      phone: { type: DataTypes.STRING(20) },
      email: { type: DataTypes.STRING(255) },
      address: { type: DataTypes.TEXT },
      emergencyContact: { type: DataTypes.STRING(20) },
      bloodGroup: { type: DataTypes.ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') },
      allergies: { type: DataTypes.TEXT }
    });
    
    const Visit = sequelize.define('Visit', {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      patientId: { type: DataTypes.UUID, allowNull: false },
      visitDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      status: {
        type: DataTypes.ENUM(
          'REGISTERED', 'WAITING_CONSULTANT', 'UNDER_CONSULTATION',
          'WAITING_DOCTOR', 'UNDER_DOCTOR', 'WAITING_LABORATORY',
          'IN_LABORATORY', 'LAB_COMPLETED', 'WAITING_DOCTOR_REVIEW',
          'PRESCRIBED', 'WAITING_PHARMACY', 'PAYMENT_PENDING',
          'DISPENSED', 'COMPLETED', 'CANCELLED'
        ),
        defaultValue: 'REGISTERED'
      },
      visitReason: { type: DataTypes.TEXT },
      queueNumber: { type: DataTypes.INTEGER },
      isEmergency: { type: DataTypes.BOOLEAN, defaultValue: false },
      registeredBy: { type: DataTypes.UUID, allowNull: false }
    });
    
    // Define relationships
    Visit.belongsTo(Patient, { foreignKey: 'patientId' });
    Patient.hasMany(Visit, { foreignKey: 'patientId' });
    
    // Sync all tables
    await sequelize.sync({ force: true, alter: true });
    console.log('✅ All tables created successfully!');
    console.log('📋 Tables created: Users, Patients, Visits');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Sync failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

sync();
