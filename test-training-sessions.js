// Test training sessions API
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    console.log('Testing training sessions...');
    
    // Check if model exists
    if (!prisma.trainingSession) {
      console.error('❌ TrainingSession model not found!');
      process.exit(1);
    }
    
    // Try to count
    const count = await prisma.trainingSession.count();
    console.log(`✅ TrainingSession model exists! Total sessions: ${count}`);
    
    // Try to fetch some sessions
    const sessions = await prisma.trainingSession.findMany({
      take: 5,
      include: {
        customer: {
          select: { id: true, name: true, email: true }
        }
      }
    });
    
    console.log(`✅ Successfully fetched ${sessions.length} sessions`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.message.includes('does not exist')) {
      console.error('Table does not exist!');
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

test();
