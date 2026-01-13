import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

async function restoreAndreeaRadulescuPlan() {
  try {
    const andreeaRadulescuId = 'cmgziq5zr000ijp04wig5wn45';
    const weekMenuPath = '/Users/gebruiker/Desktop/MIHAELAFITNESS/mihaela-fitness/andreea-radulescu-plan-weekmenu.json';
    
    console.log('🔄 Herstellen van voedingsplan voor Andreea Radulescu...\n');

    // Read weekMenu data
    if (!fs.existsSync(weekMenuPath)) {
      console.error(`❌ WeekMenu bestand niet gevonden: ${weekMenuPath}`);
      return;
    }

    const weekMenuData = JSON.parse(fs.readFileSync(weekMenuPath, 'utf-8'));
    console.log('✅ WeekMenu data geladen\n');

    // Check if customer exists
    const customer = await prisma.user.findUnique({
      where: { id: andreeaRadulescuId },
      select: {
        id: true,
        name: true,
        email: true,
      }
    });

    if (!customer) {
      console.error(`❌ Klant niet gevonden: ${andreeaRadulescuId}`);
      return;
    }

    console.log(`✅ Klant gevonden: ${customer.name} (${customer.email})\n`);

    // Create new nutrition plan with the restored data
    console.log('📝 Nieuw voedingsplan aanmaken...\n');
    
    const newPlan = await prisma.nutritionPlan.create({
      data: {
        name: 'Nutrition Plan - Andreea Radulescu (Hersteld)',
        goal: 'weight-gain',
        calories: 1947,
        protein: 124,
        carbs: 223,
        fat: 62,
        meals: 5,
        status: 'active',
        description: 'Hersteld plan van 9 november 2025',
        weekMenu: weekMenuData,
      }
    });

    console.log(`✅ Plan aangemaakt: ${newPlan.id}`);
    console.log(`   Naam: ${newPlan.name}`);
    console.log(`   Macros: ${newPlan.calories} kcal, ${newPlan.protein}g P, ${newPlan.carbs}g C, ${newPlan.fat}g F\n`);

    // Assign plan to Andreea Radulescu
    console.log('🔗 Plan toewijzen aan Andreea Radulescu...\n');
    
    const assignment = await prisma.customerNutritionPlan.create({
      data: {
        customerId: andreeaRadulescuId,
        nutritionPlanId: newPlan.id,
        status: 'active',
        notes: 'Hersteld van backup van 10 november 2025'
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

    console.log(`✅ Plan toegewezen aan ${assignment.customer.name}!`);
    console.log(`   Assignment ID: ${assignment.id}`);
    console.log(`   Status: ${assignment.status}\n`);

    console.log(`\n✅ Klaar! Het plan is nu beschikbaar op:`);
    console.log(`   https://www.mihaelafitness.com/my-plan/${newPlan.id}`);
    console.log(`\n   Of via de admin:`);
    console.log(`   http://localhost:4000/admin/voedingsplannen/${newPlan.id}`);

  } catch (error) {
    console.error('❌ Fout bij herstellen:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

restoreAndreeaRadulescuPlan();






