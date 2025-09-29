const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkTrainingSessions() {
  try {
    console.log('🔍 Checking training sessions...');
    
    // Check if there are any training sessions
    const sessions = await prisma.trainingSession.findMany({
      include: {
        customer: {
          select: { id: true, name: true, email: true }
        }
      }
    });
    
    console.log(`📊 Found ${sessions.length} training sessions:`);
    sessions.forEach((session, index) => {
      console.log(`${index + 1}. ${session.customer?.name || 'Unknown'} - ${session.date} ${session.startTime}-${session.endTime} (${session.type})`);
    });
    
    // Check customers
    const customers = await prisma.user.findMany();
    console.log(`\n👥 Found ${customers.length} customers:`);
    customers.forEach((customer, index) => {
      console.log(`${index + 1}. ${customer.name} (${customer.email}) - ${customer.plan}`);
    });
    
    // If no sessions exist, create some sample sessions
    if (sessions.length === 0 && customers.length > 0) {
      console.log('\n➕ Creating sample training sessions...');
      
      const sampleSessions = [
        {
          customerId: customers[0].id,
          date: new Date('2025-09-23'),
          startTime: '09:00',
          endTime: '10:00',
          type: '1:1',
          status: 'scheduled',
          notes: 'Personal training session'
        },
        {
          customerId: customers[0].id,
          date: new Date('2025-09-25'),
          startTime: '10:00',
          endTime: '11:00',
          type: '1:1',
          status: 'scheduled',
          notes: 'Follow-up session'
        }
      ];
      
      for (const sessionData of sampleSessions) {
        const session = await prisma.trainingSession.create({
          data: sessionData,
          include: {
            customer: {
              select: { id: true, name: true, email: true }
            }
          }
        });
        console.log(`✅ Created session: ${session.customer?.name} - ${session.date} ${session.startTime}-${session.endTime}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTrainingSessions();
