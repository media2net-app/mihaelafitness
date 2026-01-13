require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createDemoTasks() {
  try {
    console.log('🔍 Creating daily tasks for demo client...');
    
    const demoEmail = 'demo-klant@mihaelafitness.com';
    
    // Get demo user
    const user = await prisma.user.findUnique({
      where: { email: demoEmail },
      select: { id: true, name: true }
    });

    if (!user) {
      console.log('❌ Demo user not found!');
      return;
    }

    console.log('✅ Demo user found:', user.name);

    // Define tasks
    const tasks = [
      {
        title: '10.000 stappen',
        description: 'Loop minimaal 10.000 stappen per dag',
        targetValue: 10000,
        unit: 'stappen',
        icon: 'Footprints',
        order: 1
      },
      {
        title: '10 paginas lezen',
        description: 'Lees 10 paginas uit je boek',
        targetValue: 10,
        unit: 'paginas',
        icon: 'Book',
        order: 2
      },
      {
        title: '10 minuten mediteren',
        description: 'Mediteer 10 minuten per dag',
        targetValue: 10,
        unit: 'minuten',
        icon: 'Brain',
        order: 3
      }
    ];

    console.log(`\n📝 Creating ${tasks.length} daily tasks...`);
    
    for (const taskData of tasks) {
      // Check if task already exists
      const existing = await prisma.dailyTask.findFirst({
        where: {
          customerId: user.id,
          title: taskData.title
        }
      });

      if (existing) {
        console.log(`⚠️  Task "${taskData.title}" already exists, skipping...`);
      } else {
        const task = await prisma.dailyTask.create({
          data: {
            customerId: user.id,
            ...taskData
          }
        });
        console.log(`✅ Created task: ${task.title} (${task.targetValue} ${task.unit})`);
      }
    }

    console.log('\n✅ Demo tasks created successfully!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createDemoTasks()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });

