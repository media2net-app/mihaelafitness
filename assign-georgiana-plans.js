const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || "postgresql://postgres:password@localhost:5432/mihaela_fitness"
    }
  }
});

async function assignGeorgianaPlans() {
  try {
    console.log('🔍 Looking for Georgiana Tomescu...');
    
    // Find Georgiana Tomescu
    const georgiana = await prisma.user.findFirst({
      where: {
        name: {
          contains: 'Georgiana',
          mode: 'insensitive'
        }
      }
    });

    if (!georgiana) {
      console.log('❌ Georgiana Tomescu not found');
      return;
    }

    console.log(`✅ Found Georgiana: ${georgiana.name} (ID: ${georgiana.id})`);

    // Find all Georgiana Tomescu nutrition plans
    const georgianaPlans = await prisma.nutritionPlan.findMany({
      where: {
        name: {
          contains: 'Georgiana Tomescu',
          mode: 'insensitive'
        }
      }
    });

    console.log(`📋 Found ${georgianaPlans.length} Georgiana nutrition plans:`);
    georgianaPlans.forEach(plan => {
      console.log(`  - ${plan.name} (ID: ${plan.id})`);
    });

    // Assign each plan to Georgiana
    for (const plan of georgianaPlans) {
      try {
        // Check if assignment already exists
        const existingAssignment = await prisma.customerNutritionPlan.findUnique({
          where: {
            customerId_nutritionPlanId: {
              customerId: georgiana.id,
              nutritionPlanId: plan.id
            }
          }
        });

        if (existingAssignment) {
          console.log(`⚠️  Assignment already exists for ${plan.name}`);
          continue;
        }

        // Create assignment
        const assignment = await prisma.customerNutritionPlan.create({
          data: {
            customerId: georgiana.id,
            nutritionPlanId: plan.id,
            status: 'active',
            notes: 'Auto-assigned to Georgiana Tomescu'
          }
        });

        console.log(`✅ Assigned ${plan.name} to Georgiana`);
      } catch (error) {
        console.error(`❌ Error assigning ${plan.name}:`, error.message);
      }
    }

    console.log('🎉 Assignment process completed!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

assignGeorgianaPlans();

