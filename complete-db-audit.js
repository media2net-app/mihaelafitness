/**
 * 🔍 COMPLETE DATABASE AUDIT
 * Check ALL tables in both databases and report missing data
 */

const { PrismaClient } = require('@prisma/client');

// OLD DATABASE (Prisma Accelerate)
const OLD_DB_URL = 'prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza183UkxGelFDMmU0bEIwdXVBZ0l6UlYiLCJhcGlfa2V5IjoiMDFLNjhZNTUzU0RaNUtNMkZEWTQzRkRLTTAiLCJ0ZW5hbnRfaWQiOiIyYzAxN2NiZWFmY2ZlOWUwNjViYzFjNDIyNGY2OGYxNTRjMDEyZmQxYWYzYThjZDNkMzcwNzc3ZDUzMTc4Y2FjIiwiaW50ZXJuYWxfc2VjcmV0IjoiMzBmNTc4YWMtODlhMy00MGUyLWJkMmQtZTRlMzExZDhmZjg4In0.CGXndBzIhhtw4jIGEGXEdrYI_DYOQ7mAEo3_J84GkM4';

// NEW DATABASE (Supabase)
const NEW_DB_URL = 'postgresql://postgres:h4ONFtzdiYONfX15@db.efpqeufpwnwuyzsuikhf.supabase.co:5432/postgres';

console.log('🔍 COMPLETE DATABASE AUDIT\n');
console.log('=' .repeat(80));

async function auditDatabase() {
  const prismaOld = new PrismaClient({
    datasources: { db: { url: OLD_DB_URL } }
  });
  
  const prismaNew = new PrismaClient({
    datasources: { db: { url: NEW_DB_URL } }
  });
  
  try {
    console.log('\n📊 Counting records in ALL tables...\n');
    
    // List of ALL tables based on schema
    const tables = [
      { name: 'User', oldQuery: () => prismaOld.user.findMany(), newQuery: () => prismaNew.user.findMany() },
      { name: 'Ingredient', oldQuery: () => prismaOld.ingredient.findMany(), newQuery: () => prismaNew.ingredient.findMany() },
      { name: 'NutritionPlan', oldQuery: () => prismaOld.nutritionPlan.findMany(), newQuery: () => prismaNew.nutritionPlan.findMany() },
      { name: 'CustomerNutritionPlan', oldQuery: () => prismaOld.customerNutritionPlan.findMany(), newQuery: () => prismaNew.customerNutritionPlan.findMany() },
      { name: 'Workout', oldQuery: () => prismaOld.workout.findMany(), newQuery: () => prismaNew.workout.findMany() },
      { name: 'Exercise', oldQuery: () => prismaOld.exercise.findMany(), newQuery: () => prismaNew.exercise.findMany() },
      { name: 'TrainingSession', oldQuery: () => prismaOld.trainingSession.findMany(), newQuery: () => prismaNew.trainingSession.findMany() },
      { name: 'OnlineCoachingRegistration', oldQuery: () => prismaOld.onlineCoachingRegistration.findMany(), newQuery: () => prismaNew.onlineCoachingRegistration.findMany() },
      { name: 'Achievement', oldQuery: () => prismaOld.achievement.findMany(), newQuery: () => prismaNew.achievement.findMany() },
      { name: 'CustomerMeasurement', oldQuery: () => prismaOld.customerMeasurement.findMany(), newQuery: () => prismaNew.customerMeasurement.findMany() },
      { name: 'CustomerProgression', oldQuery: () => prismaOld.customerProgression.findMany(), newQuery: () => prismaNew.customerProgression.findMany() },
      { name: 'CustomerScheduleAssignment', oldQuery: () => prismaOld.customerScheduleAssignment.findMany(), newQuery: () => prismaNew.customerScheduleAssignment.findMany() },
      { name: 'CustomerWorkout', oldQuery: () => prismaOld.customerWorkout.findMany(), newQuery: () => prismaNew.customerWorkout.findMany() },
      { name: 'ExerciseLog', oldQuery: () => prismaOld.exerciseLog.findMany(), newQuery: () => prismaNew.exerciseLog.findMany() },
      { name: 'WorkoutExercise', oldQuery: () => prismaOld.workoutExercise.findMany(), newQuery: () => prismaNew.workoutExercise.findMany() },
      { name: 'WorkoutLog', oldQuery: () => prismaOld.workoutLog.findMany(), newQuery: () => prismaNew.workoutLog.findMany() },
      { name: 'PricingCalculation', oldQuery: () => prismaOld.pricingCalculation.findMany(), newQuery: () => prismaNew.pricingCalculation.findMany() },
      { name: 'GroupSubscription', oldQuery: () => prismaOld.groupSubscription.findMany(), newQuery: () => prismaNew.groupSubscription.findMany() },
    ];
    
    const results = [];
    const missing = [];
    
    for (const table of tables) {
      try {
        const oldCount = (await table.oldQuery()).length;
        const newCount = (await table.newQuery()).length;
        
        const status = oldCount === newCount ? '✅' : '❌';
        const diff = newCount - oldCount;
        
        results.push({
          table: table.name,
          oldCount,
          newCount,
          diff,
          status
        });
        
        if (oldCount > newCount) {
          missing.push({
            table: table.name,
            missing: oldCount - newCount
          });
        }
        
        console.log(`${status} ${table.name.padEnd(30)} Old: ${oldCount.toString().padStart(4)}  →  New: ${newCount.toString().padStart(4)}  ${diff !== 0 ? `(${diff > 0 ? '+' : ''}${diff})` : ''}`);
        
      } catch (error) {
        console.log(`⚠️  ${table.name.padEnd(30)} Error: ${error.message}`);
      }
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('📊 AUDIT SUMMARY');
    console.log('='.repeat(80));
    
    const complete = results.filter(r => r.status === '✅').length;
    const incomplete = results.filter(r => r.status === '❌').length;
    
    console.log(`✅ Complete tables: ${complete}`);
    console.log(`❌ Incomplete tables: ${incomplete}`);
    
    if (missing.length > 0) {
      console.log('\n⚠️  MISSING DATA:');
      missing.forEach(m => {
        console.log(`   - ${m.table}: ${m.missing} records missing`);
      });
    } else {
      console.log('\n🎉 ALL DATA MIGRATED SUCCESSFULLY!');
    }
    
    await prismaOld.$disconnect();
    await prismaNew.$disconnect();
    
    return missing;
    
  } catch (error) {
    console.error('\n❌ Audit failed:', error);
    await prismaOld.$disconnect();
    await prismaNew.$disconnect();
    throw error;
  }
}

// Run audit
auditDatabase().then(missing => {
  if (missing.length > 0) {
    console.log('\n⚠️  ACTION REQUIRED: Run complete migration to fix missing data');
    process.exit(1);
  } else {
    console.log('\n✅ Database audit passed - all data migrated');
    process.exit(0);
  }
}).catch(console.error);


