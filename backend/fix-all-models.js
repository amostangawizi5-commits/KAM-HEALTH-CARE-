const { Sequelize, DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Database connection
const sequelize = new Sequelize('kazimili_care', 'mordern_developer', 'Cive@2004', {
  host: 'localhost',
  port: 5432,
  dialect: 'postgres',
  logging: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

// Define all models directly (to avoid issues with existing model files)
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, { freezeTableName: true });

const Patient = sequelize.define('Patient', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  dateOfBirth: {
    type: DataTypes.DATE,
    allowNull: true
  },
  gender: {
    type: DataTypes.STRING,
    allowNull: true
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, { freezeTableName: true });

const Visit = sequelize.define('Visit', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  patientId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  visitDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  visitType: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'pending',
    allowNull: false
  },
  registeredBy: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, { freezeTableName: true });

const Medicine = sequelize.define('Medicine', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  category: {
    type: DataTypes.STRING,
    allowNull: true
  },
  price: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  expiryDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  manufacturer: {
    type: DataTypes.STRING,
    allowNull: true
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, { freezeTableName: true });

const Prescription = sequelize.define('Prescription', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  visitId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  doctorId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  pharmacistId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'PENDING',
    allowNull: false
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, { freezeTableName: true });

const PrescriptionItem = sequelize.define('PrescriptionItem', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  prescriptionId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  medicineId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  dosage: {
    type: DataTypes.STRING,
    allowNull: true
  },
  instructions: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, { freezeTableName: true });

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  billId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  paymentMethod: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'PENDING',
    allowNull: false
  },
  receivedBy: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, { freezeTableName: true });

const PharmacyBill = sequelize.define('PharmacyBill', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  visitId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  totalAmount: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'PENDING',
    allowNull: false
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, { freezeTableName: true });

const BillItem = sequelize.define('BillItem', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  billId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false
  },
  quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  unitPrice: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  totalPrice: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, { freezeTableName: true });

const DoctorConsultation = sequelize.define('DoctorConsultation', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  visitId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  doctorId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  diagnosis: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  treatment: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, { freezeTableName: true });

const ConsultantAssessment = sequelize.define('ConsultantAssessment', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  visitId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  consultantId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  assessment: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  recommendations: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, { freezeTableName: true });

// Define relationships
Visit.belongsTo(Patient, { foreignKey: 'patientId' });
Patient.hasMany(Visit, { foreignKey: 'patientId' });

Visit.belongsTo(User, { as: 'registrar', foreignKey: 'registeredBy' });
User.hasMany(Visit, { as: 'registeredVisits', foreignKey: 'registeredBy' });

ConsultantAssessment.belongsTo(Visit, { foreignKey: 'visitId' });
Visit.hasOne(ConsultantAssessment, { foreignKey: 'visitId' });

ConsultantAssessment.belongsTo(User, { as: 'consultant', foreignKey: 'consultantId' });
User.hasMany(ConsultantAssessment, { as: 'consultantAssessments', foreignKey: 'consultantId' });

DoctorConsultation.belongsTo(Visit, { foreignKey: 'visitId' });
Visit.hasOne(DoctorConsultation, { foreignKey: 'visitId' });

DoctorConsultation.belongsTo(User, { as: 'doctor', foreignKey: 'doctorId' });
User.hasMany(DoctorConsultation, { as: 'doctorConsultations', foreignKey: 'doctorId' });

Prescription.belongsTo(Visit, { foreignKey: 'visitId' });
Visit.hasMany(Prescription, { foreignKey: 'visitId' });

Prescription.belongsTo(User, { as: 'doctor', foreignKey: 'doctorId' });
User.hasMany(Prescription, { as: 'doctorPrescriptions', foreignKey: 'doctorId' });

Prescription.belongsTo(User, { as: 'pharmacist', foreignKey: 'pharmacistId' });
User.hasMany(Prescription, { as: 'pharmacistPrescriptions', foreignKey: 'pharmacistId' });

PrescriptionItem.belongsTo(Prescription, { foreignKey: 'prescriptionId' });
Prescription.hasMany(PrescriptionItem, { foreignKey: 'prescriptionId' });

PrescriptionItem.belongsTo(Medicine, { foreignKey: 'medicineId' });
Medicine.hasMany(PrescriptionItem, { foreignKey: 'medicineId' });

PharmacyBill.belongsTo(Visit, { foreignKey: 'visitId' });
Visit.hasOne(PharmacyBill, { foreignKey: 'visitId' });

BillItem.belongsTo(PharmacyBill, { as: 'bill', foreignKey: 'billId' });
PharmacyBill.hasMany(BillItem, { foreignKey: 'billId' });

Payment.belongsTo(PharmacyBill, { as: 'bill', foreignKey: 'billId' });
PharmacyBill.hasMany(Payment, { foreignKey: 'billId' });

Payment.belongsTo(User, { as: 'receiver', foreignKey: 'receivedBy' });
User.hasMany(Payment, { as: 'receivedPayments', foreignKey: 'receivedBy' });

async function fullSetup() {
  console.log('🚀 Starting full database setup...\n');

  try {
    // Step 1: Connect
    await sequelize.authenticate();
    console.log('✅ Connected to PostgreSQL successfully!');
    console.log(`📊 Database: ${sequelize.config.database}`);
    console.log(`👤 User: ${sequelize.config.username}\n`);

    // Step 2: Drop all tables (clean slate)
    console.log('🗑️ Dropping all tables...');
    await sequelize.query(`
      DO $$ 
      DECLARE 
        r RECORD;
      BEGIN
        FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') 
        LOOP
          EXECUTE 'DROP TABLE IF EXISTS "' || r.tablename || '" CASCADE';
        END LOOP;
      END $$;
    `);
    console.log('✅ All tables dropped!\n');

    // Step 3: Sync all models
    console.log('📋 Creating tables...');
    await sequelize.sync({ force: true });
    console.log('✅ All tables created!\n');

    // Step 4: Seed data
    console.log('🌱 Seeding data...');
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Create Users
    const users = await User.bulkCreate([
      {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@kazimili.com',
        password: hashedPassword,
        role: 'ADMIN',
        phone: '0712345678',
        isActive: true
      },
      {
        firstName: 'James',
        lastName: 'Mwangi',
        email: 'doctor@kazimili.com',
        password: hashedPassword,
        role: 'DOCTOR',
        phone: '0723456789',
        isActive: true
      },
      {
        firstName: 'Mary',
        lastName: 'Akinyi',
        email: 'reception@kazimili.com',
        password: hashedPassword,
        role: 'RECEPTIONIST',
        phone: '0734567890',
        isActive: true
      }
    ]);
    console.log(`✅ ${users.length} users created`);

    // Create Patients
    const patients = await Patient.bulkCreate([
      {
        name: 'John Doe',
        phone: '0711111111',
        email: 'john.doe@email.com',
        address: 'Nairobi, Kenya',
        dateOfBirth: '1985-03-15',
        gender: 'Male'
      },
      {
        name: 'Jane Smith',
        phone: '0722222222',
        email: 'jane.smith@email.com',
        address: 'Mombasa, Kenya',
        dateOfBirth: '1990-07-22',
        gender: 'Female'
      },
      {
        name: 'Peter Ochieng',
        phone: '0733333333',
        email: 'peter.ochieng@email.com',
        address: 'Kisumu, Kenya',
        dateOfBirth: '1978-11-05',
        gender: 'Male'
      }
    ]);
    console.log(`✅ ${patients.length} patients created`);

    // Create Medicines
    const medicines = await Medicine.bulkCreate([
      {
        name: 'Paracetamol 500mg',
        category: 'Pain Relief',
        price: 50.00,
        quantity: 1000,
        expiryDate: '2027-12-31',
        manufacturer: 'Tanzania Pharmaceuticals'
      },
      {
        name: 'Amoxicillin 250mg',
        category: 'Antibiotic',
        price: 150.00,
        quantity: 500,
        expiryDate: '2026-08-31',
        manufacturer: 'Cosmos Pharma'
      },
      {
        name: 'Cetirizine 10mg',
        category: 'Antihistamine',
        price: 80.00,
        quantity: 300,
        expiryDate: '2027-05-31',
        manufacturer: 'Regal Pharmaceuticals'
      },
      {
        name: 'Ibuprofen 400mg',
        category: 'Anti-inflammatory',
        price: 120.00,
        quantity: 400,
        expiryDate: '2026-12-31',
        manufacturer: 'Tanzania Pharmaceuticals'
      }
    ]);
    console.log(`✅ ${medicines.length} medicines created`);

    // Create Visits
    const visits = await Visit.bulkCreate([
      {
        patientId: 1,
        visitDate: new Date(),
        visitType: 'General',
        status: 'completed',
        registeredBy: 3
      },
      {
        patientId: 2,
        visitDate: new Date(),
        visitType: 'Consultation',
        status: 'pending',
        registeredBy: 3
      }
    ]);
    console.log(`✅ ${visits.length} visits created`);

    console.log('\n🎉 Database setup completed successfully!');
    console.log('\n📊 Login credentials:');
    console.log('  Admin:    admin@kazimili.com / password123');
    console.log('  Doctor:   doctor@kazimili.com / password123');
    console.log('  Reception: reception@kazimili.com / password123');
    console.log('\n📋 Tables created:');
    
    const [tables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
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

fullSetup();
