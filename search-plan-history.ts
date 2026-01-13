import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function searchPlanHistory() {
  try {
    const planId = 'cmhz9zcck0000ie04rtjh9rod';
    const andreeaRadulescuId = 'cmgziq5zr000ijp04wig5wn45';
    const targetDate = new Date('2025-11-09'); // 9 november 2025
    
    console.log('🔍 Zoeken naar historie van plan en assignments...\n');
    console.log(`Plan ID: ${planId}`);
    console.log(`Andreea Radulescu ID: ${andreeaRadulescuId}`);
    console.log(`Zoekdatum: ${targetDate.toISOString()}\n`);

    // Check current plan details
    const currentPlan = await prisma.nutritionPlan.findUnique({
      where: { id: planId },
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        customerNutritionPlans: {
          select: {
            id: true,
            customerId: true,
            assignedAt: true,
            status: true,
            customer: {
              select: {
                name: true,
                email: true,
              }
            }
          }
        }
      }
    });

    if (currentPlan) {
      console.log('📋 Huidig plan:');
      console.log(`   Naam: ${currentPlan.name}`);
      console.log(`   Aangemaakt: ${currentPlan.createdAt}`);
      console.log(`   Bijgewerkt: ${currentPlan.updatedAt}`);
      console.log(`   Plan werd aangemaakt op: ${currentPlan.createdAt.toISOString()}`);
      
      // Check if plan was created after target date
      if (currentPlan.createdAt > targetDate) {
        console.log(`\n⚠️ Dit plan werd aangemaakt NA 9 november (${currentPlan.createdAt.toISOString()})`);
        console.log(`   Dit betekent dat het oorspronkelijke plan met dit ID waarschijnlijk verwijderd is.`);
      }
    }

    // Search for all assignments for Andreea Radulescu around the target date
    console.log(`\n🔍 Zoeken naar alle assignments voor Andreea Radulescu rond 9 november...`);
    
    // Get all assignments (including deleted ones if we can)
    const allAssignments = await prisma.customerNutritionPlan.findMany({
      where: {
        customerId: andreeaRadulescuId,
      },
      include: {
        nutritionPlan: {
          select: {
            id: true,
            name: true,
            createdAt: true,
            updatedAt: true,
          }
        }
      },
      orderBy: {
        assignedAt: 'desc'
      }
    });

    console.log(`\n📊 Alle assignments voor Andreea Radulescu (${allAssignments.length} totaal):`);
    allAssignments.forEach((assignment, index) => {
      const dateStr = assignment.assignedAt.toISOString().split('T')[0];
      const isAroundTarget = Math.abs(assignment.assignedAt.getTime() - targetDate.getTime()) < 7 * 24 * 60 * 60 * 1000; // Within 7 days
      const marker = isAroundTarget ? ' ⭐ (rond 9 november!)' : '';
      console.log(`\n   ${index + 1}. Assignment ID: ${assignment.id}`);
      console.log(`      Plan ID: ${assignment.nutritionPlan.id}`);
      console.log(`      Plan Naam: ${assignment.nutritionPlan.name}`);
      console.log(`      Toegewezen op: ${assignment.assignedAt.toISOString()} (${dateStr})${marker}`);
      console.log(`      Status: ${assignment.status}`);
      console.log(`      Plan aangemaakt: ${assignment.nutritionPlan.createdAt.toISOString()}`);
    });

    // Search for plans that might have been deleted
    // Check if there are any plans with similar names or created around that time
    console.log(`\n🔍 Zoeken naar plannen aangemaakt rond 9 november...`);
    const plansAroundDate = await prisma.nutritionPlan.findMany({
      where: {
        OR: [
          {
            createdAt: {
              gte: new Date('2025-11-08'),
              lte: new Date('2025-11-10'),
            }
          },
          {
            updatedAt: {
              gte: new Date('2025-11-08'),
              lte: new Date('2025-11-10'),
            }
          }
        ]
      },
      select: {
        id: true,
        name: true,
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
            assignedAt: true,
            status: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`\n📋 Plannen aangemaakt/bijgewerkt rond 9 november (${plansAroundDate.length} gevonden):`);
    plansAroundDate.forEach((plan, index) => {
      const customers = plan.customerNutritionPlans.map(cnp => cnp.customer.name).join(', ') || 'Geen klanten';
      console.log(`\n   ${index + 1}. ${plan.name}`);
      console.log(`      ID: ${plan.id}`);
      console.log(`      Aangemaakt: ${plan.createdAt.toISOString()}`);
      console.log(`      Bijgewerkt: ${plan.updatedAt.toISOString()}`);
      console.log(`      Klanten: ${customers}`);
    });

    // Check Supabase point-in-time recovery options
    console.log(`\n\n💡 Tips voor backup recovery:`);
    console.log(`   1. Check Supabase dashboard voor Point-in-Time Recovery (PITR)`);
    console.log(`   2. Ga naar: https://supabase.com/dashboard/project/[your-project]/database/backups`);
    console.log(`   3. Kijk naar backups van 9 november 2025`);
    console.log(`   4. Als PITR beschikbaar is, kun je de database terugzetten naar 9 november`);
    console.log(`\n   5. Via Prisma kun je ook direct SQL queries uitvoeren:`);
    console.log(`      - Gebruik prisma.$queryRaw voor custom SQL queries`);
    console.log(`      - Check de Supabase logs voor DELETE operaties rond 9 november`);

  } catch (error) {
    console.error('❌ Fout:', error);
  } finally {
    await prisma.$disconnect();
  }
}

searchPlanHistory();






