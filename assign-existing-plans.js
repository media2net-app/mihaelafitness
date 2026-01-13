const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function assignExistingPlans() {
  try {
    console.log('🔍 Looking for plans that need assignment...\n');
    
    // Get all nutrition plans with their assignments
    const allPlans = await prisma.nutritionPlan.findMany({
      include: {
        customerNutritionPlans: {
          include: {
            customer: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    // Get all calculations
    const calculations = await prisma.nutritionCalculationV2.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log(`Found ${allPlans.length} plans and ${calculations.length} calculations\n`);
    
    let assignedCount = 0;
    let skippedCount = 0;
    
    for (const plan of allPlans) {
      // Skip if already assigned
      if (plan.customerNutritionPlans.length > 0) {
        console.log(`⏭️  ${plan.name} - Already assigned to ${plan.customerNutritionPlans.length} customer(s)`);
        skippedCount++;
        continue;
      }
      
      // Try to find matching calculation by customer name in plan name or description
      const planNameLower = plan.name.toLowerCase();
      const descriptionLower = (plan.description || '').toLowerCase();
      
      const matchingCalc = calculations.find(calc => {
        const customerNameLower = (calc.customerName || '').toLowerCase();
        return planNameLower.includes(customerNameLower) || 
               descriptionLower.includes(customerNameLower) ||
               (customerNameLower && planNameLower.includes(customerNameLower.split(' ')[0])); // Match first name
      });
      
      if (matchingCalc && matchingCalc.customerId) {
        try {
          // Check if assignment already exists
          const existing = await prisma.customerNutritionPlan.findUnique({
            where: {
              customerId_nutritionPlanId: {
                customerId: matchingCalc.customerId,
                nutritionPlanId: plan.id
              }
            }
          });
          
          if (existing) {
            console.log(`⏭️  ${plan.name} - Already assigned to ${matchingCalc.customerName}`);
            skippedCount++;
            continue;
          }
          
          // Verify customer exists
          const customer = await prisma.user.findUnique({
            where: { id: matchingCalc.customerId }
          });
          
          if (!customer) {
            console.log(`⚠️  ${plan.name} - Customer ${matchingCalc.customerName} (${matchingCalc.customerId}) not found`);
            continue;
          }
          
          // Create assignment
          await prisma.customerNutritionPlan.create({
            data: {
              customerId: matchingCalc.customerId,
              nutritionPlanId: plan.id,
              status: 'active',
              notes: `Auto-assigned from calculation on ${new Date().toLocaleDateString()}`
            }
          });
          
          console.log(`✅ ${plan.name} - Assigned to ${matchingCalc.customerName} (${customer.name})`);
          assignedCount++;
        } catch (error) {
          console.error(`❌ Error assigning ${plan.name}:`, error.message);
        }
      } else {
        console.log(`⚠️  ${plan.name} - No matching calculation found`);
      }
    }
    
    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Assigned: ${assignedCount}`);
    console.log(`   ⏭️  Skipped (already assigned): ${skippedCount}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

assignExistingPlans();






