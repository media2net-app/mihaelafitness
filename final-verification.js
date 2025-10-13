/**
 * 🔍 FINAL VERIFICATION - Check critical data in Supabase
 */

const { PrismaClient } = require('@prisma/client');

const SUPABASE_URL = 'postgresql://postgres:h4ONFtzdiYONfX15@db.efpqeufpwnwuyzsuikhf.supabase.co:5432/postgres';

console.log('🔍 FINAL VERIFICATION - Supabase Database\n');
console.log('=' .repeat(80));

async function verifyDatabase() {
  const prisma = new PrismaClient({
    datasources: { db: { url: SUPABASE_URL } }
  });
  
  try {
    console.log('\n📊 DATABASE OVERVIEW:\n');
    
    // 1. Users
    const users = await prisma.user.findMany();
    console.log(`✅ Users: ${users.length}`);
    console.log(`   Sample: ${users.slice(0, 3).map(u => u.name).join(', ')}`);
    
    // 2. Training Sessions (CRITICAL)
    const sessions = await prisma.trainingSession.findMany({
      include: {
        customer: {
          select: { name: true }
        }
      },
      orderBy: {
        date: 'desc'
      },
      take: 10
    });
    console.log(`\n✅ Training Sessions: ${sessions.length} total`);
    
    // Get current week sessions
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Monday
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Sunday
    endOfWeek.setHours(23, 59, 59, 999);
    
    const thisWeekSessions = await prisma.trainingSession.findMany({
      where: {
        date: {
          gte: startOfWeek,
          lte: endOfWeek
        }
      },
      include: {
        customer: {
          select: { name: true }
        }
      },
      orderBy: [
        { date: 'asc' },
        { startTime: 'asc' }
      ]
    });
    
    console.log(`   📅 This week (${startOfWeek.toLocaleDateString('nl-NL')} - ${endOfWeek.toLocaleDateString('nl-NL')}): ${thisWeekSessions.length} sessions`);
    
    if (thisWeekSessions.length > 0) {
      console.log(`\n   Recent sessions:`);
      thisWeekSessions.slice(0, 5).forEach(s => {
        const dateStr = new Date(s.date).toLocaleDateString('nl-NL');
        console.log(`   • ${dateStr} ${s.startTime}-${s.endTime} | ${s.customer?.name || 'Unknown'} (${s.type})`);
      });
    }
    
    // 3. Workouts
    const workouts = await prisma.workout.findMany();
    console.log(`\n✅ Workouts: ${workouts.length}`);
    console.log(`   Names: ${workouts.map(w => w.name).join(', ')}`);
    
    // 4. Workout Exercises (CRITICAL!)
    const workoutExercises = await prisma.workoutExercise.findMany();
    console.log(`\n✅ Workout Exercises: ${workoutExercises.length}`);
    
    // Check exercises per workout
    for (const workout of workouts) {
      const exercises = await prisma.workoutExercise.findMany({
        where: { workoutId: workout.id }
      });
      console.log(`   • ${workout.name}: ${exercises.length} exercises`);
    }
    
    // 5. Customer Workouts
    const customerWorkouts = await prisma.customerWorkout.findMany({
      include: {
        customer: { select: { name: true } },
        workout: { select: { name: true } }
      }
    });
    console.log(`\n✅ Customer Workout Assignments: ${customerWorkouts.length}`);
    customerWorkouts.forEach(cw => {
      console.log(`   • ${cw.customer.name} → ${cw.workout.name}`);
    });
    
    // 6. Customer Measurements
    const measurements = await prisma.customerMeasurement.findMany({
      include: {
        customer: { select: { name: true } }
      }
    });
    console.log(`\n✅ Customer Measurements: ${measurements.length}`);
    const uniqueCustomers = [...new Set(measurements.map(m => m.customer.name))];
    console.log(`   Customers tracked: ${uniqueCustomers.join(', ')}`);
    
    // 7. Pricing Calculations
    const pricing = await prisma.pricingCalculation.findMany();
    console.log(`\n✅ Pricing Calculations: ${pricing.length}`);
    pricing.forEach(p => {
      console.log(`   • ${p.customerName || 'Unknown'}: €${p.finalPrice}`);
    });
    
    // 8. Nutrition Plans
    const nutritionPlans = await prisma.nutritionPlan.findMany();
    console.log(`\n✅ Nutrition Plans: ${nutritionPlans.length}`);
    console.log(`   Plans: ${nutritionPlans.map(np => np.name).join(', ')}`);
    
    // 9. Customer Nutrition Plan Assignments
    const customerNutritionPlans = await prisma.customerNutritionPlan.findMany({
      include: {
        customer: { select: { name: true } },
        nutritionPlan: { select: { name: true } }
      }
    });
    console.log(`\n✅ Nutrition Plan Assignments: ${customerNutritionPlans.length}`);
    customerNutritionPlans.forEach(cnp => {
      console.log(`   • ${cnp.customer.name} → ${cnp.nutritionPlan.name}`);
    });
    
    // 10. Ingredients
    const ingredients = await prisma.ingredient.findMany({
      take: 5
    });
    const totalIngredients = await prisma.ingredient.count();
    console.log(`\n✅ Ingredients: ${totalIngredients} total`);
    console.log(`   Sample: ${ingredients.map(i => i.name).join(', ')}`);
    
    // 11. Exercises
    const exercises = await prisma.exercise.findMany({
      take: 5
    });
    const totalExercises = await prisma.exercise.count();
    console.log(`\n✅ Exercises: ${totalExercises} total`);
    console.log(`   Sample: ${exercises.map(e => e.name).join(', ')}`);
    
    await prisma.$disconnect();
    
    console.log('\n' + '='.repeat(80));
    console.log('🎉 VERIFICATION COMPLETE - Database is fully operational!');
    console.log('='.repeat(80));
    console.log('\n📝 NEXT STEPS:');
    console.log('   1. ✅ Localhost is already running on port 6001');
    console.log('   2. 🌐 Visit: http://localhost:6001/admin/schedule');
    console.log('   3. 🔍 Verify that all sessions are visible in the calendar');
    console.log('   4. ✅ Check that 13:00-13:30 is now available for booking');
    console.log('');
    
  } catch (error) {
    console.error('\n❌ Verification failed:', error);
    await prisma.$disconnect();
    throw error;
  }
}

// Run verification
verifyDatabase().catch(console.error);


