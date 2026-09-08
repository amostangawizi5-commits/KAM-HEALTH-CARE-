const { Client } = require('pg');
const bcrypt = require('bcryptjs');

const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'kazimilicare_user',
  password: 'Cive@2004',
  database: 'kazimilicare_db'
});

async function createUsers() {
  try {
    await client.connect();
    console.log('✅ Connected to PostgreSQL');
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    
    // Check if admin exists
    const checkResult = await client.query(
      "SELECT * FROM \"Users\" WHERE email = 'admin@kazimilicare.com'"
    );
    
    if (checkResult.rows.length > 0) {
      console.log('✅ Admin user already exists');
    } else {
      // Create admin
      await client.query(`
        INSERT INTO "Users" (id, email, password, "firstName", "lastName", role, phone, "isActive", "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), 'admin@kazimilicare.com', $1, 'System', 'Administrator', 'ADMIN', '+255700000000', true, NOW(), NOW())
      `, [hashedPassword]);
      console.log('✅ Admin created: admin@kazimilicare.com / admin123');
    }
    
    // Create other users
    const users = [
      { email: 'reception@kazimilicare.com', firstName: 'Reception', lastName: 'User', role: 'RECEPTIONIST' },
      { email: 'consultant@kazimilicare.com', firstName: 'Consultant', lastName: 'User', role: 'CONSULTANT' },
      { email: 'doctor@kazimilicare.com', firstName: 'Doctor', lastName: 'User', role: 'DOCTOR' },
      { email: 'pharmacist@kazimilicare.com', firstName: 'Pharmacist', lastName: 'User', role: 'PHARMACIST' },
      { email: 'cashier@kazimilicare.com', firstName: 'Cashier', lastName: 'User', role: 'CASHIER' }
    ];
    
    for (const user of users) {
      const check = await client.query(
        "SELECT * FROM \"Users\" WHERE email = $1", [user.email]
      );
      
      if (check.rows.length === 0) {
        const hashedPwd = await bcrypt.hash('admin123', salt);
        await client.query(`
          INSERT INTO "Users" (id, email, password, "firstName", "lastName", role, phone, "isActive", "createdAt", "updatedAt")
          VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, '+255700000000', true, NOW(), NOW())
        `, [user.email, hashedPwd, user.firstName, user.lastName, user.role]);
        console.log(`✅ ${user.role} created: ${user.email} / admin123`);
      } else {
        console.log(`✅ ${user.role} already exists: ${user.email}`);
      }
    }
    
    console.log('🎉 All users created successfully!');
    await client.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    await client.end();
    process.exit(1);
  }
}

createUsers();
