const { Sequelize, DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

const sequelize = new Sequelize('kazimili_care', 'mordern_developer', 'Cive@2004', {
  host: 'localhost',
  port: 5432,
  dialect: 'postgres',
  logging: false
});

// Define models (same as above)
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

async function seedDatabase() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to PostgreSQL');

    const hashedPassword = await bcrypt.hash('password123', 10);

    // Create Users
    const users = [
      {
        name: 'Admin User',
        email: 'admin@kazimili.com',
        password: hashedPassword,
        role: 'admin',
        phone: '0712345678'
      },
      {
        name: 'Dr. James Mwangi',
        email: 'doctor@kazimili.com',
        password: hashedPassword,
        role: 'doctor',
        phone: '0723456789'
      },
      {
        name: 'Mary Akinyi',
        email: 'reception@kazimili.com',
        password: hashedPassword,
        role: 'receptionist',
        phone: '0734567890'
      }
    ];

    for (const userData of users) {
      const user = await User.create(userData);
      console.log('✅ User created:', user.email);
    }

    // Create Patients
    const patients = [
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
    ];

    for (const patientData of patients) {
      const patient = await Patient.create(patientData);
      console.log('✅ Patient created:', patient.name);
    }

    // Create Medicines
    const medicines = [
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
      }
    ];

    for (const medicineData of medicines) {
      const medicine = await Medicine.create(medicineData);
      console.log('✅ Medicine created:', medicine.name);
    }

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📊 Login credentials:');
    console.log('  Admin:    admin@kazimili.com / password123');
    console.log('  Doctor:   doctor@kazimili.com / password123');
    console.log('  Reception: reception@kazimili.com / password123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

seedDatabase();
