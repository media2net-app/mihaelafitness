const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function inspectWeekMenu() {
  try {
    const planId = 'cmgh1c6jq006j89gxlq1h2eo8';
    
    const nutritionPlan = await prisma.nutritionPlan.findUnique({
      where: { id: planId }
    });
    
    if (!nutritionPlan) {
      console.log('❌ Plan not found!');
      return;
    }
    
    console.log('✅ Plan found:', nutritionPlan.name);
    console.log('\n📋 WeekMenu full structure:');
    console.log(JSON.stringify(nutritionPlan.weekMenu, null, 2).substring(0, 3000));
    
    // Check structure
    const weekMenu = nutritionPlan.weekMenu;
    console.log('\n🔍 Analyzing structure:');
    console.log('   Type:', typeof weekMenu);
    console.log('   Is object:', weekMenu && typeof weekMenu === 'object');
    console.log('   Keys:', Object.keys(weekMenu));
    
    // Check first day in detail
    const firstDay = weekMenu.monday || weekMenu.friday;
    if (firstDay) {
      console.log('\n📅 First day structure:');
      console.log('   Type:', typeof firstDay);
      console.log('   Keys:', Object.keys(firstDay));
      
      // Check first meal
      const firstMealKey = Object.keys(firstDay)[0];
      const firstMeal = firstDay[firstMealKey];
      console.log(`\n🍽️ First meal (${firstMealKey}):`);
      console.log('   Type:', typeof firstMeal);
      console.log('   Is array:', Array.isArray(firstMeal));
      if (Array.isArray(firstMeal)) {
        console.log('   Length:', firstMeal.length);
        console.log('   First 3 items:', firstMeal.slice(0, 3));
      } else {
        console.log('   Value:', firstMeal);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

inspectWeekMenu();

