import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function findAndreeaPlan() {
  try {
    console.log('🔍 Zoeken naar voedingsplan voor Andreea Radulescu...\n');

    // First, find the customer
    const customers = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: 'Andreea', mode: 'insensitive' } },
          { name: { contains: 'Radulescu', mode: 'insensitive' } },
          { email: { contains: 'andreea', mode: 'insensitive' } },
        ]
      },
      select: {
        id: true,
        name: true,
        email: true,
      }
    });

    console.log(`📋 Gevonden ${customers.length} klant(en) met naam Andreea/Radulescu:`);
    customers.forEach(c => {
      console.log(`  - ID: ${c.id}, Naam: ${c.name}, Email: ${c.email}`);
    });

    if (customers.length === 0) {
      console.log('\n❌ Geen klant gevonden met naam Andreea Radulescu');
      console.log('\n🔍 Zoeken naar alle klanten met "Andreea" in de naam...');
      const allAndreea = await prisma.user.findMany({
        where: {
          name: { contains: 'Andreea', mode: 'insensitive' }
        },
        select: {
          id: true,
          name: true,
          email: true,
        },
        take: 20
      });
      allAndreea.forEach(c => {
        console.log(`  - ID: ${c.id}, Naam: ${c.name}, Email: ${c.email}`);
      });
      return;
    }

    // For each customer, find their nutrition plans
    for (const customer of customers) {
      console.log(`\n📊 Zoeken naar voedingsplannen voor ${customer.name} (${customer.id})...`);

      const assignments = await prisma.customerNutritionPlan.findMany({
        where: {
          customerId: customer.id
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

      console.log(`  ✅ Gevonden ${assignments.length} toegewezen voedingsplan(nen):`);
      
      if (assignments.length === 0) {
        console.log(`  ⚠️ Geen voedingsplannen toegewezen aan ${customer.name}`);
      } else {
        assignments.forEach((assignment, index) => {
          const plan = assignment.nutritionPlan;
          console.log(`\n  📋 Plan ${index + 1}:`);
          console.log(`     ID: ${plan.id}`);
          console.log(`     Naam: ${plan.name}`);
          console.log(`     Doel: ${plan.goal || 'N/A'}`);
          console.log(`     Macros: ${plan.calories} kcal, ${plan.protein}g P, ${plan.carbs}g C, ${plan.fat}g F`);
          console.log(`     Status: ${plan.status}`);
          console.log(`     Toegewezen op: ${assignment.assignedAt}`);
          console.log(`     Assignment status: ${assignment.status}`);
          console.log(`     Plan aangemaakt: ${plan.createdAt}`);
          console.log(`     Plan bijgewerkt: ${plan.updatedAt}`);
        });
      }

      // Also check if there are any nutrition plans with the customer name in the name
      console.log(`\n🔍 Zoeken naar voedingsplannen met "Andreea" of "Radulescu" in naam...`);
      const plansByName = await prisma.nutritionPlan.findMany({
        where: {
          OR: [
            { name: { contains: 'Andreea', mode: 'insensitive' } },
            { name: { contains: 'Radulescu', mode: 'insensitive' } },
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
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      if (plansByName.length > 0) {
        console.log(`  ✅ Gevonden ${plansByName.length} voedingsplan(nen) met naam in metadata:`);
        plansByName.forEach((plan, index) => {
          console.log(`\n  📋 Plan ${index + 1}:`);
          console.log(`     ID: ${plan.id}`);
          console.log(`     Naam: ${plan.name}`);
          console.log(`     Macros: ${plan.calories} kcal, ${plan.protein}g P, ${plan.carbs}g C, ${plan.fat}g F`);
          console.log(`     Status: ${plan.status}`);
          console.log(`     Aangemaakt: ${plan.createdAt}`);
          console.log(`     Bijgewerkt: ${plan.updatedAt}`);
        });
      } else {
        console.log(`  ⚠️ Geen voedingsplannen gevonden met "Andreea" of "Radulescu" in naam`);
      }
    }

    // Also check all recent nutrition plans
    console.log(`\n🔍 Laatste 20 voedingsplannen in de database:`);
    const recentPlans = await prisma.nutritionPlan.findMany({
      select: {
        id: true,
        name: true,
        goal: true,
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
            assignedAt: true,
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      },
      take: 20
    });

    recentPlans.forEach((plan, index) => {
      const customers = plan.customerNutritionPlans.map(cnp => cnp.customer.name).join(', ') || 'Geen klanten';
      console.log(`  ${index + 1}. ${plan.name} (${plan.id}) - Klanten: ${customers} - Bijgewerkt: ${plan.updatedAt}`);
    });

  } catch (error) {
    console.error('❌ Fout bij zoeken:', error);
  } finally {
    await prisma.$disconnect();
  }
}

findAndreeaPlan();

