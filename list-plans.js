const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listPlans() {
  try {
    const plans = await prisma.nutritionPlan.findMany({
      select: {
        id: true,
        name: true
      }
    });
    
    console.log('📋 Available nutrition plans:');
    console.log('   Total:', plans.length);
    plans.forEach(p => {
      console.log(`   - ID: ${p.id}`);
      console.log(`     Name: ${p.name}`);
    });
    
    // Also check customer assignments
    const assignments = await prisma.customerNutritionPlan.findMany({
      select: {
        customerId: true,
        nutritionPlanId: true,
        customer: {
          select: {
            name: true
          }
        }
      }
    });
    
    console.log('\n👥 Customer assignments:');
    console.log('   Total:', assignments.length);
    assignments.forEach(a => {
      console.log(`   - Customer: ${a.customer.name} (${a.customerId})`);
      console.log(`     Plan ID: ${a.nutritionPlanId}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

listPlans();

