const { PrismaClient } = require('@prisma/client');

async function testConnection() {
  console.log('🔍 Testing Supabase connection...\n');
  
  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });
  
  try {
    // Test 1: Raw query
    console.log('Test 1: Executing raw SELECT query...');
    const result = await prisma.$queryRaw`SELECT current_database(), current_user, version()`;
    console.log('✅ Connection successful!');
    console.log('📊 Result:', result);
    
    // Test 2: Check if tables exist
    console.log('\nTest 2: Checking existing tables...');
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    console.log('📋 Existing tables:', tables);
    
    console.log('\n✅ All tests passed! Database is reachable.');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('\nFull error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();

