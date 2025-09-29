const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testTrainingSessions() {
  try {
    console.log('🔍 Testing training sessions API logic...');
    
    // Test 1: Get all training sessions
    console.log('\n1. Testing: Get all training sessions');
    const allSessions = await prisma.trainingSession.findMany({
      include: {
        customer: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: [
        { date: 'asc' },
        { startTime: 'asc' }
      ]
    });
    console.log(`Found ${allSessions.length} total sessions`);
    
    // Test 2: Get sessions with date range
    console.log('\n2. Testing: Get sessions with date range (2025-09-29 to 2025-10-05)');
    const startDate = new Date('2025-09-29');
    const endDate = new Date('2025-10-05');
    console.log('Date range:', { startDate, endDate });
    
    const rangeSessions = await prisma.trainingSession.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        customer: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: [
        { date: 'asc' },
        { startTime: 'asc' }
      ]
    });
    console.log(`Found ${rangeSessions.length} sessions in date range`);
    
    if (rangeSessions.length > 0) {
      console.log('First session in range:');
      console.log(JSON.stringify(rangeSessions[0], null, 2));
    }
    
    // Test 3: Check if there are any sessions at all
    console.log('\n3. Testing: Check if any sessions exist');
    const sessionCount = await prisma.trainingSession.count();
    console.log(`Total sessions in database: ${sessionCount}`);
    
    if (sessionCount > 0) {
      const firstSession = await prisma.trainingSession.findFirst({
        include: {
          customer: {
            select: { id: true, name: true, email: true }
          }
        }
      });
      console.log('First session in database:');
      console.log(JSON.stringify(firstSession, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testTrainingSessions();
