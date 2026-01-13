import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function findDeletedAndreeaPlan() {
  try {
    const andreeaRadulescuId = 'cmgziq5zr000ijp04wig5wn45';
    
    console.log('🔍 Zoeken naar alle voedingsplannen (inclusief verwijderde/inactieve)...\n');

    // Find all nutrition plans, including inactive/deleted ones
    const allPlans = await prisma.nutritionPlan.findMany({
      where: {
        OR: [
          { name: { contains: 'Radulescu', mode: 'insensitive' } },
          { name: { contains: 'Andreea', mode: 'insensitive' } },
        ]
      },
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
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    console.log(`📋 Gevonden ${allPlans.length} voedingsplan(nen) met "Andreea" of "Radulescu" in naam:\n`);

    allPlans.forEach((plan, index) => {
      console.log(`\n📋 Plan ${index + 1}:`);
      console.log(`   ID: ${plan.id}`);
      console.log(`   Naam: ${plan.name}`);
      console.log(`   Status: ${plan.status}`);
      console.log(`   Macros: ${plan.calories} kcal, ${plan.protein}g P, ${plan.carbs}g C, ${plan.fat}g F`);
      console.log(`   Aangemaakt: ${plan.createdAt}`);
      console.log(`   Bijgewerkt: ${plan.updatedAt}`);
      
      if (plan.customerNutritionPlans.length > 0) {
        console.log(`   Toegewezen aan:`);
        plan.customerNutritionPlans.forEach(cnp => {
          const isAndreeaRadulescu = cnp.customerId === andreeaRadulescuId;
          const marker = isAndreeaRadulescu ? ' ⭐ (Dit is Andreea Radulescu!)' : '';
          console.log(`     - ${cnp.customer.name} (${cnp.customer.email}) - Status: ${cnp.status}${marker}`);
        });
      } else {
        console.log(`   ⚠️ Geen klanten toegewezen`);
      }
    });

    // Also check all assignments for Andreea Radulescu (including inactive ones)
    console.log(`\n\n🔍 Alle assignments voor Andreea Radulescu (inclusief inactieve):\n`);
    const allAssignments = await prisma.customerNutritionPlan.findMany({
      where: {
        customerId: andreeaRadulescuId
      },
      include: {
        nutritionPlan: {
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
          }
        }
      },
      orderBy: {
        assignedAt: 'desc'
      }
    });

    if (allAssignments.length === 0) {
      console.log('❌ Geen assignments gevonden voor Andreea Radulescu (zelfs geen inactieve)');
    } else {
      console.log(`✅ Gevonden ${allAssignments.length} assignment(s):\n`);
      allAssignments.forEach((assignment, index) => {
        const plan = assignment.nutritionPlan;
        console.log(`📋 Assignment ${index + 1}:`);
        console.log(`   Assignment ID: ${assignment.id}`);
        console.log(`   Assignment Status: ${assignment.status}`);
        console.log(`   Toegewezen op: ${assignment.assignedAt}`);
        console.log(`   Plan ID: ${plan.id}`);
        console.log(`   Plan Naam: ${plan.name}`);
        console.log(`   Plan Status: ${plan.status}`);
        console.log(`   Macros: ${plan.calories} kcal, ${plan.protein}g P, ${plan.carbs}g C, ${plan.fat}g F`);
        console.log(`   Plan aangemaakt: ${plan.createdAt}`);
        console.log(`   Plan bijgewerkt: ${plan.updatedAt}`);
        console.log('');
      });
    }

    // Check if there are any plans that might have been deleted from assignments but still exist
    console.log(`\n\n🔍 Zoeken naar alle recente voedingsplannen (laatste 50)...\n`);
    const recentPlans = await prisma.nutritionPlan.findMany({
      select: {
        id: true,
        name: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        customerNutritionPlans: {
          select: {
            customer: {
              select: {
                name: true,
                email: true,
              }
            },
            status: true,
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      },
      take: 50
    });

    console.log(`Laatste 50 voedingsplannen:`);
    recentPlans.forEach((plan, index) => {
      const customers = plan.customerNutritionPlans
        .filter(cnp => cnp.status === 'active')
        .map(cnp => cnp.customer.name)
        .join(', ') || 'Geen actieve klanten';
      console.log(`  ${index + 1}. ${plan.name} (${plan.id.substring(0, 20)}...) - Actieve klanten: ${customers}`);
    });

  } catch (error) {
    console.error('❌ Fout bij zoeken:', error);
  } finally {
    await prisma.$disconnect();
  }
}

findDeletedAndreeaPlan();






