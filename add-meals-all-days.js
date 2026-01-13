require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addMealsForAllDays() {
  try {
    // Find demo client
    const demoClient = await prisma.user.findUnique({
      where: { email: 'demo-klant@mihaelafitness.com' }
    });

    if (!demoClient) {
      console.error('❌ Demo client not found');
      return;
    }

    // Find active nutrition plan assignment
    const assignment = await prisma.customerNutritionPlan.findFirst({
      where: {
        customerId: demoClient.id,
        status: 'active'
      },
      include: {
        nutritionPlan: true
      }
    });

    if (!assignment) {
      console.error('❌ No active nutrition plan found');
      return;
    }

    const plan = assignment.nutritionPlan;
    const currentWeekMenu = plan.weekMenu || {};

    // Sample meals for each day
    const sampleMeals = {
      breakfast: '2 eieren, 1 snee volkorenbrood, 1/2 avocado',
      'morning-snack': '1 appel, 10 amandelen',
      lunch: '150g kipfilet, 100g zoete aardappel, 150g groenten',
      'afternoon-snack': 'Griekse yoghurt met bessen',
      dinner: '150g zalm, 100g quinoa, 200g groenten',
      'evening-snack': 'Kwark met noten'
    };

    // Update weekMenu for all days
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    const updatedWeekMenu = { ...currentWeekMenu };
    
    days.forEach(day => {
      if (!updatedWeekMenu[day]) {
        updatedWeekMenu[day] = {};
      }
      
      // Add meals if they don't exist
      Object.keys(sampleMeals).forEach(mealType => {
        if (!updatedWeekMenu[day][mealType]) {
          updatedWeekMenu[day][mealType] = sampleMeals[mealType];
        }
      });
    });

    // Update the nutrition plan
    await prisma.nutritionPlan.update({
      where: { id: plan.id },
      data: {
        weekMenu: updatedWeekMenu
      }
    });

    console.log('✅ WeekMenu updated for all days!');
    console.log('Days with meals:', days);
    
    // Verify
    const updatedPlan = await prisma.nutritionPlan.findUnique({
      where: { id: plan.id },
      select: { weekMenu: true }
    });
    
    days.forEach(day => {
      const dayMenu = updatedPlan.weekMenu[day] || {};
      const mealCount = Object.keys(dayMenu).filter(k => !k.includes('instructions')).length;
      console.log(`${day}: ${mealCount} maaltijden`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addMealsForAllDays();

