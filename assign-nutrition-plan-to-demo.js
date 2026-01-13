const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function assignNutritionPlanToDemo() {
  try {
    // Find demo client
    const demoClient = await prisma.user.findUnique({
      where: { email: 'demo-klant@mihaelafitness.com' }
    });

    if (!demoClient) {
      console.error('❌ Demo client not found');
      return;
    }

    console.log('✅ Found demo client:', demoClient.name);

    // Find first active nutrition plan
    const nutritionPlan = await prisma.nutritionPlan.findFirst({
      where: { status: 'active' },
      orderBy: { createdAt: 'desc' }
    });

    if (!nutritionPlan) {
      console.error('❌ No active nutrition plan found');
      return;
    }

    console.log('✅ Found nutrition plan:', nutritionPlan.name);

    // Check if already assigned
    const existing = await prisma.customerNutritionPlan.findUnique({
      where: {
        customerId_nutritionPlanId: {
          customerId: demoClient.id,
          nutritionPlanId: nutritionPlan.id
        }
      }
    });

    if (existing) {
      console.log('ℹ️ Nutrition plan already assigned to demo client');
      return;
    }

    // Assign nutrition plan
    const assignment = await prisma.customerNutritionPlan.create({
      data: {
        customerId: demoClient.id,
        nutritionPlanId: nutritionPlan.id,
        status: 'active',
        notes: 'Assigned for demo purposes'
      }
    });

    console.log('✅ Nutrition plan assigned successfully!');
    console.log('Assignment ID:', assignment.id);
    console.log('Plan:', nutritionPlan.name);
    console.log('Goal:', nutritionPlan.goal);
    console.log('Calories:', nutritionPlan.calories);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

assignNutritionPlanToDemo();

