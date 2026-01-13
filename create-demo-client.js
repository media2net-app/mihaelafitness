require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createDemoClient() {
  try {
    console.log('🔵 Creating demo client account...');

    const demoEmail = 'demo-klant@mihaelafitness.com';
    const demoPassword = 'demo123'; // Simple password for testing
    const demoName = 'Demo Klant';

    // Hash the password
    const hashedPassword = await bcrypt.hash(demoPassword, 10);
    console.log('✅ Password hashed');

    // First, ensure password column exists using raw SQL
    try {
      await prisma.$executeRawUnsafe(`
        DO $$ 
        BEGIN 
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = 'password'
          ) THEN
            ALTER TABLE users ADD COLUMN password TEXT;
          END IF;
        END $$;
      `);
      console.log('✅ Password column verified');
    } catch (error) {
      console.log('⚠️  Could not verify password column, continuing...', error.message);
    }

    // Check if user already exists using raw query to avoid schema issues
    const existingUser = await prisma.$queryRawUnsafe(`
      SELECT id, email, name, status 
      FROM users 
      WHERE email = $1
    `, demoEmail);

    if (existingUser && existingUser.length > 0) {
      const user = existingUser[0];
      console.log('⚠️  Demo user already exists, updating password...');
      
      // Update password using raw SQL
      await prisma.$executeRawUnsafe(`
        UPDATE users 
        SET password = $1, name = $2, status = $3, plan = $4, "trainingFrequency" = $5
        WHERE email = $6
      `, hashedPassword, demoName, 'active', 'Premium', 3, demoEmail);
      
      console.log('✅ Demo client updated successfully!');
      console.log('📧 Email:', demoEmail);
      console.log('🔑 Password:', demoPassword);
      console.log('👤 Name:', user.name);
      console.log('🆔 ID:', user.id);
    } else {
      // Create new user using raw SQL with only essential fields
      const result = await prisma.$queryRawUnsafe(`
        INSERT INTO users (email, name, password, status, plan, "trainingFrequency", goal, phone, "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
        RETURNING id, email, name
      `, demoEmail, demoName, hashedPassword, 'active', 'Premium', 3, 'Demo account voor testing', '+40712345678');
      
      const newUser = result[0];
      console.log('✅ Demo client created successfully!');
      console.log('📧 Email:', demoEmail);
      console.log('🔑 Password:', demoPassword);
      console.log('👤 Name:', newUser.name);
      console.log('🆔 ID:', newUser.id);
    }

    console.log('\n🎉 Demo account is ready to use!');
    console.log('You can now login at /login with:');
    console.log('  Email: ' + demoEmail);
    console.log('  Password: ' + demoPassword);

  } catch (error) {
    console.error('❌ Error creating demo client:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createDemoClient()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
