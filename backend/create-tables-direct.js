const { Sequelize, DataTypes } = require('sequelize');

// PostgreSQL connection
const sequelize = new Sequelize('kazimili_care', 'mordern_developer', 'Cive@2004', {
  host: 'localhost',
  port: 5432,
  dialect: 'postgres',
  logging: console.log
});

// Define models directly
const User = sequelize.define('User', {
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.STRING, allowNull: false, defaultValue: 'user' },
  phone: { type: DataTypes.STRING },
  createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { freezeTableName: true });

const Patient = sequelize.define('Patient', {
  name: { type: DataTypes.STRING, allowNull: false },
  phone: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING },
  address: { type: DataTypes.TEXT },
  dateOfBirth: { type: DataTypes.DATE },
  gender: { type: DataTypes.STRING },
  createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { freezeTableName: true });

const Visit = sequelize.define('Visit', {
  patientId: { type: DataTypes.INTEGER, allowNull: false },
  visitDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  visitType: { type: DataTypes.STRING },
  status: { type: DataTypes.STRING, defaultValue: 'pending' },
  registeredBy: { type: DataTypes.INTEGER },
  createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { freezeTableName: true });

const Medicine = sequelize.define('Medicine', {
  name: { type: DataTypes.STRING, allowNull: false },
  category: { type: DataTypes.STRING },
  price: { type: DataTypes.FLOAT, defaultValue: 0 },
  quantity: { type: DataTypes.INTEGER, defaultValue: 0 },
  expiryDate: { type: DataTypes.DATE },
  manufacturer: { type: DataTypes.STRING },
  createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { freezeTableName: true });

const Prescription = sequelize.define('Prescription', {
  visitId: { type: DataTypes.INTEGER, allowNull: false },
  doctorId: { type: DataTypes.INTEGER, allowNull: false },
  pharmacistId: { type: DataTypes.INTEGER },
  status: { type: DataTypes.STRING, defaultValue: 'pending' },
  notes: { type: DataTypes.TEXT },
  createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { freezeTableName: true });

const PrescriptionItem = sequelize.define('PrescriptionItem', {
  prescriptionId: { type: DataTypes.INTEGER, allowNull: false },
  medicineId: { type: DataTypes.INTEGER, allowNull: false },
  quantity: { type: DataTypes.INTEGER, allowNull: false },
  dosage: { type: DataTypes.STRING },
  instructions: { type: DataTypes.TEXT },
  createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { freezeTableName: true });

const Payment = sequelize.define('Payment', {
  billId: { type: DataTypes.INTEGER, allowNull: false },
  amount: { type: DataTypes.FLOAT, allowNull: false },
  paymentMethod: { type: DataTypes.STRING },
  status: { type: DataTypes.STRING, defaultValue: 'pending' },
  receivedBy: { type: DataTypes.INTEGER },
  createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { freezeTableName: true });

const PharmacyBill = sequelize.define('PharmacyBill', {
  visitId: { type: DataTypes.INTEGER, allowNull: false },
  totalAmount: { type: DataTypes.FLOAT, defaultValue: 0 },
  status: { type: DataTypes.STRING, defaultValue: 'pending' },
  createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { freezeTableName: true });

const BillItem = sequelize.define('BillItem', {
  billId: { type: DataTypes.INTEGER, allowNull: false },
  description: { type: DataTypes.STRING, allowNull: false },
  quantity: { type: DataTypes.INTEGER, defaultValue: 1 },
  unitPrice: { type: DataTypes.FLOAT, allowNull: false },
  totalPrice: { type: DataTypes.FLOAT, allowNull: false },
  createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { freezeTableName: true });

const DoctorConsultation = sequelize.define('DoctorConsultation', {
  visitId: { type: DataTypes.INTEGER, allowNull: false },
  doctorId: { type: DataTypes.INTEGER, allowNull: false },
  diagnosis: { type: DataTypes.TEXT },
  treatment: { type: DataTypes.TEXT },
  notes: { type: DataTypes.TEXT },
  createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { freezeTableName: true });

const ConsultantAssessment = sequelize.define('ConsultantAssessment', {
  visitId: { type: DataTypes.INTEGER, allowNull: false },
  consultantId: { type: DataTypes.INTEGER, allowNull: false },
  assessment: { type: DataTypes.TEXT },
  recommendations: { type: DataTypes.TEXT },
  createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { freezeTableName: true });

async function createTables() {
  try {
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

createTables();
