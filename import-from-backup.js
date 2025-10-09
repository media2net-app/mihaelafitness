/**
 * 🚀 Import data from migration-backup.json to Supabase
 * Skip export step - use existing backup
 */

const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 SUPABASE IMPORT FROM BACKUP...\n');
console.log('=' .repeat(60));

// Step 1: Push schema to Supabase
async function pushSchema() {
  console.log('\n📋 STEP 1: Pushing schema to Supabase...');
  console.log('=' .repeat(60));
  console.log('⚙️  Running: npx prisma db push');
  
  try {
    execSync('npx prisma db push --skip-generate', { stdio: 'inherit' });
    console.log('✅ Schema pushed successfully!');
    return true;
  } catch (error) {
    console.error('❌ Schema push failed:', error.message);
    return false;
  }
}

// Step 2: Import data to Supabase
async function importData() {
  console.log('\n📥 STEP 2: Importing data from backup...');
  console.log('=' .repeat(60));
  
  // Check if backup exists
  if (!fs.existsSync('migration-backup.json')) {
    throw new Error('❌ migration-backup.json not found! Run migrate-to-supabase.js first.');
  }
  
  // Load backup
  const data = JSON.parse(fs.readFileSync('migration-backup.json', 'utf8'));
  console.log('📦 Backup loaded:');
  console.log(`   - Users: ${data.users?.length || 0}`);
  console.log(`   - Ingredients: ${data.ingredients?.length || 0}`);
  console.log(`   - Nutrition Plans: ${data.nutritionPlans?.length || 0}`);
  console.log(`   - Customer Plans: ${data.customerNutritionPlans?.length || 0}`);
  console.log(`   - Workouts: ${data.workouts?.length || 0}`);
  console.log(`   - Exercises: ${data.exercises?.length || 0}`);
  console.log(`   - Online Coaching: ${data.onlineCoachingRegistrations?.length || 0}`);
  
  const prisma = new PrismaClient();
  
  try {
    // Import users
    console.log('\n👥 Importing users...');
    for (const user of data.users || []) {
      await prisma.user.upsert({
        where: { id: user.id },
        update: user,
        create: user,
      });
    }
    console.log(`   ✅ ${data.users?.length || 0} users imported`);
    
    // Import ingredients
    console.log('🥗 Importing ingredients...');
    for (const ingredient of data.ingredients || []) {
      await prisma.ingredient.upsert({
        where: { id: ingredient.id },
        update: ingredient,
        create: ingredient,
      });
    }
    console.log(`   ✅ ${data.ingredients?.length || 0} ingredients imported`);
    
    // Import nutrition plans
    console.log('📋 Importing nutrition plans...');
    for (const plan of data.nutritionPlans || []) {
      await prisma.nutritionPlan.upsert({
        where: { id: plan.id },
        update: plan,
        create: plan,
      });
    }
    console.log(`   ✅ ${data.nutritionPlans?.length || 0} nutrition plans imported`);
    
    // Import customer nutrition plans
    console.log('👤 Importing customer plans...');
    for (const customerPlan of data.customerNutritionPlans || []) {
      await prisma.customerNutritionPlan.upsert({
        where: { id: customerPlan.id },
        update: customerPlan,
        create: customerPlan,
      });
    }
    console.log(`   ✅ ${data.customerNutritionPlans?.length || 0} customer plans imported`);
    
    // Import workouts
    console.log('💪 Importing workouts...');
    for (const workout of data.workouts || []) {
      await prisma.workout.upsert({
        where: { id: workout.id },
        update: workout,
        create: workout,
      });
    }
    console.log(`   ✅ ${data.workouts?.length || 0} workouts imported`);
    
    // Import exercises
    console.log('🏋️  Importing exercises...');
    for (const exercise of data.exercises || []) {
      await prisma.exercise.upsert({
        where: { id: exercise.id },
        update: exercise,
        create: exercise,
      });
    }
    console.log(`   ✅ ${data.exercises?.length || 0} exercises imported`);
    
    // Import online coaching registrations
    console.log('📧 Importing online coaching registrations...');
    for (const registration of data.onlineCoachingRegistrations || []) {
      await prisma.onlineCoachingRegistration.upsert({
        where: { id: registration.id },
        update: registration,
        create: registration,
      });
    }
    console.log(`   ✅ ${data.onlineCoachingRegistrations?.length || 0} registrations imported`);
    
    console.log('\n✅ All data imported successfully!');
    
  } catch (error) {
    console.error('❌ Import failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Main execution
async function main() {
  console.log('⚠️  IMPORTANT: Make sure .env has Supabase DATABASE_URL!');
  console.log('   See SUPABASE_MIGRATION.md for instructions.\n');
  
  try {
    // Step 1: Push schema
    const schemaSuccess = await pushSchema();
    if (!schemaSuccess) {
      throw new Error('Schema push failed');
    }
    
    // Step 2: Import data
    await importData();
    
    console.log('\n' + '=' .repeat(60));
    console.log('🎉 MIGRATION COMPLETE!');
    console.log('=' .repeat(60));
    console.log('\n✅ Next steps:');
    console.log('   1. Test locally: npm run dev -- -p 6001');
    console.log('   2. Check: http://localhost:6001/admin/voedingsplannen');
    console.log('   3. Update Vercel env vars with Supabase URL');
    console.log('   4. Deploy: npx vercel --prod\n');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    console.log('\n💡 Check migration-backup.json for exported data');
    process.exit(1);
  }
}

main();

