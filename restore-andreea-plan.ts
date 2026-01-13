import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function restoreAndreeaPlan() {
  try {
    const planId = 'cmhz9zcck0000ie04rtjh9rod';
    const andreeaRadulescuId = 'cmgziq5zr000ijp04wig5wn45';

    console.log('🔍 Controleren van plan...\n');

    // Check if plan exists
    const plan = await prisma.nutritionPlan.findUnique({
      where: { id: planId },
      select: {
        id: true,
        name: true,
        goal: true,
        calories: true,
        protein: true,
        carbs: true,
        fat: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        customerNutritionPlans: {
          select: {
            id: true,
            customerId: true,
            status: true,
            assignedAt: true,
            customer: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            }
          }
        }
      }
    });

    if (!plan) {
      console.log('❌ Plan niet gevonden in database!');
      return;
    }

    console.log('✅ Plan gevonden:');
    console.log(`   ID: ${plan.id}`);
    console.log(`   Naam: ${plan.name}`);
    console.log(`   Status: ${plan.status}`);
    console.log(`   Macros: ${plan.calories} kcal, ${plan.protein}g P, ${plan.carbs}g C, ${plan.fat}g F`);
    console.log(`   Aangemaakt: ${plan.createdAt}`);
    console.log(`   Bijgewerkt: ${plan.updatedAt}`);
    
    console.log(`\n📋 Huidige toewijzingen:`);
    if (plan.customerNutritionPlans.length === 0) {
      console.log('   ⚠️ Geen klanten toegewezen');
    } else {
      plan.customerNutritionPlans.forEach(cnp => {
        console.log(`   - ${cnp.customer.name} (${cnp.customer.email}) - Status: ${cnp.status}`);
      });
    }

    // Check if Andreea Radulescu already has this plan assigned
    const existingAssignment = await prisma.customerNutritionPlan.findUnique({
      where: {
        customerId_nutritionPlanId: {
          customerId: andreeaRadulescuId,
          nutritionPlanId: planId
        }
      }
    });

    if (existingAssignment) {
      console.log(`\n✅ Plan is al toegewezen aan Andreea Radulescu!`);
      console.log(`   Assignment ID: ${existingAssignment.id}`);
      console.log(`   Status: ${existingAssignment.status}`);
      console.log(`   Toegewezen op: ${existingAssignment.assignedAt}`);
      
      // If it's inactive, activate it
      if (existingAssignment.status !== 'active') {
        console.log(`\n🔄 Assignment is inactief, activeren...`);
        await prisma.customerNutritionPlan.update({
          where: { id: existingAssignment.id },
          data: { status: 'active' }
        });
        console.log(`✅ Assignment geactiveerd!`);
      }
    } else {
      console.log(`\n➕ Plan toewijzen aan Andreea Radulescu...`);
      
      // Create new assignment
      const newAssignment = await prisma.customerNutritionPlan.create({
        data: {
          customerId: andreeaRadulescuId,
          nutritionPlanId: planId,
          status: 'active'
        },
        include: {
          customer: {
            select: {
              name: true,
              email: true,
            }
          }
        }
      });

      console.log(`✅ Plan succesvol toegewezen aan ${newAssignment.customer.name}!`);
      console.log(`   Assignment ID: ${newAssignment.id}`);
      console.log(`   Status: ${newAssignment.status}`);
      console.log(`   Toegewezen op: ${newAssignment.assignedAt}`);
    }

    // Verify the assignment
    console.log(`\n🔍 Verificatie - Alle assignments voor Andreea Radulescu:`);
    const allAssignments = await prisma.customerNutritionPlan.findMany({
      where: {
        customerId: andreeaRadulescuId
      },
      include: {
        nutritionPlan: {
          select: {
            id: true,
            name: true,
            status: true,
          }
        }
      },
      orderBy: {
        assignedAt: 'desc'
      }
    });

    if (allAssignments.length === 0) {
      console.log('   ⚠️ Geen assignments gevonden');
    } else {
      allAssignments.forEach((assignment, index) => {
        console.log(`   ${index + 1}. ${assignment.nutritionPlan.name} - Status: ${assignment.status}`);
      });
    }

    console.log(`\n✅ Klaar! Het plan is nu beschikbaar op:`);
    console.log(`   https://www.mihaelafitness.com/my-plan/${planId}`);

  } catch (error) {
    console.error('❌ Fout bij herstellen van plan:', error);
  } finally {
    await prisma.$disconnect();
  }
}

restoreAndreeaPlan();






