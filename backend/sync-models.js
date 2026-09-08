const { sequelize } = require('./src/config/database');
const User = require('./src/models/User');
const Patient = require('./src/models/Patient');
const Medicine = require('./src/models/Medicine');
const Visit = require('./src/models/Visit');
const Prescription = require('./src/models/Prescription');
const PrescriptionItem = require('./src/models/PrescriptionItem');
const Payment = require('./src/models/Payment');
const PharmacyBill = require('./src/models/PharmacyBill');
const BillItem = require('./src/models/BillItem');
const DoctorConsultation = require('./src/models/DoctorConsultation');
const ConsultantAssessment = require('./src/models/ConsultantAssessment');

async function syncDatabase() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to PostgreSQL');

    // Sync all models - force: true ita-drop na recreate tables
    await sequelize.sync({ force: true });
    console.log('✅ All tables created successfully!');

    // Verify tables
    const [tables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    console.log('\n📋 Tables created:');
    tables.forEach((t, i) => {
      console.log(`  ${i + 1}. ${t.table_name}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

syncDatabase();
