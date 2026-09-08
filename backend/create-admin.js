const { sequelize, User } = require('./src/models/index');

const createAdmin = async () => {
  try {
    // Check if admin exists
    const existingAdmin = await User.findOne({ where: { email: 'admin@kazimilicare.com' } });
    
    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    // Create admin
    const admin = await User.create({
      email: 'admin@kazimilicare.com',
      password: 'admin123',
      firstName: 'System',
      lastName: 'Administrator',
      role: 'ADMIN',
      phone: '+255700000000',
      isActive: true
    });

    console.log('Admin user created successfully!');
    console.log('Email: admin@kazimilicare.com');
    console.log('Password: admin123');
    
    // Create other users
    const users = [
      {
        email: 'reception@kazimilicare.com',
        password: 'admin123',
        firstName: 'Reception',
        lastName: 'User',
        role: 'RECEPTIONIST',
        phone: '+255700000001'
      },
      {
        email: 'consultant@kazimilicare.com',
        password: 'admin123',
        firstName: 'Consultant',
        lastName: 'User',
        role: 'CONSULTANT',
        phone: '+255700000002'
      },
      {
        email: 'doctor@kazimilicare.com',
        password: 'admin123',
        firstName: 'Doctor',
        lastName: 'User',
        role: 'DOCTOR',
        phone: '+255700000003'
      },
      {
        email: 'pharmacist@kazimilicare.com',
        password: 'admin123',
        firstName: 'Pharmacist',
        lastName: 'User',
        role: 'PHARMACIST',
        phone: '+255700000004'
      },
      {
        email: 'cashier@kazimilicare.com',
        password: 'admin123',
        firstName: 'Cashier',
        lastName: 'User',
        role: 'CASHIER',
        phone: '+255700000005'
      }
    ];

    for (const userData of users) {
      const existing = await User.findOne({ where: { email: userData.email } });
      if (!existing) {
        await User.create(userData);
        console.log(` ${userData.role} user created: ${userData.email}`);
      }
    }

    console.log('\n All users created successfully!');
    console.log(' Demo Credentials:');
    console.log('   Admin: admin@kazimilicare.com / admin123');
    console.log('   Receptionist: reception@kazimilicare.com / admin123');
    console.log('   Consultant: consultant@kazimilicare.com / admin123');
    console.log('   Doctor: doctor@kazimilicare.com / admin123');
    console.log('   Pharmacist: pharmacist@kazimilicare.com / admin123');
    console.log('   Cashier: cashier@kazimilicare.com / admin123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating users:', error);
    process.exit(1);
  }
};

createAdmin();
