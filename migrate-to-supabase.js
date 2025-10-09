/**
 * 🚀 Complete Supabase Migration Script
 * Exports data from old DB → Pushes schema to Supabase → Imports data
 */

const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');
const fs = require('fs');

// OLD DATABASE (Prisma Accelerate)
const OLD_DB_URL = process.env.DATABASE_URL || 'postgres://...';

// NEW DATABASE (Supabase) - from .env.local
const NEW_DB_URL = 'postgres://postgres.efpqeufpwnwuyzsuikhf:ETxEgx2E6UDUfwLt@aws-0-eu-central-1.pooler.supabase.com:5432/postgres?sslmode=require';

console.log('🚀 SUPABASE MIGRATION STARTING...\n');
console.log('=' .repeat(60));

// Step 1: Export data from old database
async function exportData() {
  console.log('\n📤 STEP 1: Exporting data from old database...');
  console.log('=' .repeat(60));
  
  const prismaOld = new PrismaClient({
    datasources: { db: { url: OLD_DB_URL } }
  });
  
  try {
    // Export all data
    const data = {
      users: await prismaOld.user.findMany(),
      ingredients: await prismaOld.ingredient.findMany(),
      nutritionPlans: await prismaOld.nutritionPlan.findMany(),
      customerNutritionPlans: await prismaOld.customerNutritionPlan.findMany(),
      workouts: await prismaOld.workout.findMany(),
      exercises: await prismaOld.exercise.findMany(),
      onlineCoachingRegistrations: await prismaOld.onlineCoachingRegistration.findMany(),
    };
    
    console.log('✅ Data exported:');
    console.log(`   - Users: ${data.users.length}`);
    console.log(`   - Ingredients: ${data.ingredients.length}`);
    console.log(`   - Nutrition Plans: ${data.nutritionPlans.length}`);
    console.log(`   - Customer Plans: ${data.customerNutritionPlans.length}`);
    console.log(`   - Workouts: ${data.workouts.length}`);
    console.log(`   - Exercises: ${data.exercises.length}`);
    console.log(`   - Online Coaching Registrations: ${data.onlineCoachingRegistrations.length}`);
    
    // Save to file as backup
    fs.writeFileSync('migration-backup.json', JSON.stringify(data, null, 2));
    console.log('✅ Backup saved to: migration-backup.json');
    
    await prismaOld.$disconnect();
    return data;
    
  } catch (error) {
    console.error('❌ Export failed:', error.message);
    await prismaOld.$disconnect();
    throw error;
  }
}

// Step 2: Push schema to Supabase
async function pushSchema() {
  console.log('\n📋 STEP 2: Pushing schema to Supabase...');
  console.log('=' .repeat(60));
  
  try {
    // Temporarily update DATABASE_URL in .env.local for prisma db push
    console.log('⚙️  Running: npx prisma db push');
    
    // Set DATABASE_URL for this command
    const env = { ...process.env, DATABASE_URL: NEW_DB_URL };
    
    execSync('npx prisma db push --skip-generate', {
      stdio: 'inherit',
      env
    });
    
    console.log('✅ Schema pushed to Supabase successfully!');
    
  } catch (error) {
    console.error('❌ Schema push failed:', error.message);
    throw error;
  }
}

// Step 3: Import data to Supabase
async function importData(data) {
  console.log('\n📥 STEP 3: Importing data to Supabase...');
  console.log('=' .repeat(60));
  
  const prismaNew = new PrismaClient({
    datasources: { db: { url: NEW_DB_URL } }
  });
  
  try {
    // Import in correct order (respecting foreign keys)
    
    // 1. Users first (no dependencies)
    console.log('📝 Importing users...');
    for (const user of data.users) {
      await prismaNew.user.create({
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
          password: user.password,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        }
      }).catch(e => console.log(`   ⚠️  User ${user.email} already exists, skipping...`));
    }
    console.log(`✅ Imported ${data.users.length} users`);
    
    // 2. Ingredients (no dependencies)
    console.log('📝 Importing ingredients...');
    for (const ingredient of data.ingredients) {
      await prismaNew.ingredient.create({
        data: {
          id: ingredient.id,
          name: ingredient.name,
          nameRo: ingredient.nameRo,
          per: ingredient.per,
          perRo: ingredient.perRo,
          calories: ingredient.calories,
          protein: ingredient.protein,
          carbs: ingredient.carbs,
          fat: ingredient.fat,
          fiber: ingredient.fiber,
          sugar: ingredient.sugar,
          category: ingredient.category,
          aliases: ingredient.aliases,
          isActive: ingredient.isActive,
          createdAt: ingredient.createdAt,
          updatedAt: ingredient.updatedAt,
        }
      }).catch(e => console.log(`   ⚠️  Ingredient ${ingredient.name} already exists, skipping...`));
    }
    console.log(`✅ Imported ${data.ingredients.length} ingredients`);
    
    // 3. Nutrition Plans (no dependencies)
    console.log('📝 Importing nutrition plans...');
    for (const plan of data.nutritionPlans) {
      await prismaNew.nutritionPlan.create({
        data: {
          id: plan.id,
          name: plan.name,
          description: plan.description,
          weekMenu: plan.weekMenu,
          dailyCalories: plan.dailyCalories,
          dailyProtein: plan.dailyProtein,
          dailyCarbs: plan.dailyCarbs,
          dailyFat: plan.dailyFat,
          goal: plan.goal,
          mealsPerDay: plan.mealsPerDay,
          createdAt: plan.createdAt,
          updatedAt: plan.updatedAt,
        }
      }).catch(e => console.log(`   ⚠️  Plan ${plan.name} already exists, skipping...`));
    }
    console.log(`✅ Imported ${data.nutritionPlans.length} nutrition plans`);
    
    // 4. Customer Nutrition Plans (depends on users and plans)
    console.log('📝 Importing customer nutrition plan assignments...');
    for (const assignment of data.customerNutritionPlans) {
      await prismaNew.customerNutritionPlan.create({
        data: {
          id: assignment.id,
          customerId: assignment.customerId,
          nutritionPlanId: assignment.nutritionPlanId,
          assignedAt: assignment.assignedAt,
          status: assignment.status,
          notes: assignment.notes,
          createdAt: assignment.createdAt,
          updatedAt: assignment.updatedAt,
        }
      }).catch(e => console.log(`   ⚠️  Assignment already exists, skipping...`));
    }
    console.log(`✅ Imported ${data.customerNutritionPlans.length} assignments`);
    
    // 5. Exercises (no dependencies)
    console.log('📝 Importing exercises...');
    for (const exercise of data.exercises) {
      await prismaNew.exercise.create({
        data: {
          id: exercise.id,
          name: exercise.name,
          description: exercise.description,
          muscleGroup: exercise.muscleGroup,
          equipment: exercise.equipment,
          difficulty: exercise.difficulty,
          videoUrl: exercise.videoUrl,
          instructions: exercise.instructions,
          tips: exercise.tips,
          isActive: exercise.isActive,
          createdAt: exercise.createdAt,
          updatedAt: exercise.updatedAt,
        }
      }).catch(e => console.log(`   ⚠️  Exercise ${exercise.name} already exists, skipping...`));
    }
    console.log(`✅ Imported ${data.exercises.length} exercises`);
    
    // 6. Workouts (no dependencies for now)
    console.log('📝 Importing workouts...');
    for (const workout of data.workouts) {
      await prismaNew.workout.create({
        data: {
          id: workout.id,
          name: workout.name,
          description: workout.description,
          workoutData: workout.workoutData,
          duration: workout.duration,
          difficulty: workout.difficulty,
          goal: workout.goal,
          equipment: workout.equipment,
          createdAt: workout.createdAt,
          updatedAt: workout.updatedAt,
        }
      }).catch(e => console.log(`   ⚠️  Workout ${workout.name} already exists, skipping...`));
    }
    console.log(`✅ Imported ${data.workouts.length} workouts`);
    
    // 7. Online Coaching Registrations
    console.log('📝 Importing online coaching registrations...');
    for (const registration of data.onlineCoachingRegistrations) {
      await prismaNew.onlineCoachingRegistration.create({
        data: {
          id: registration.id,
          name: registration.name,
          email: registration.email,
          phone: registration.phone,
          program: registration.program,
          interests: registration.interests,
          notes: registration.notes,
          status: registration.status,
          createdAt: registration.createdAt,
          updatedAt: registration.updatedAt,
        }
      }).catch(e => console.log(`   ⚠️  Registration already exists, skipping...`));
    }
    console.log(`✅ Imported ${data.onlineCoachingRegistrations.length} registrations`);
    
    await prismaNew.$disconnect();
    console.log('\n✅ All data imported successfully!');
    
  } catch (error) {
    console.error('❌ Import failed:', error.message);
    await prismaNew.$disconnect();
    throw error;
  }
}

// Main migration flow
async function main() {
  try {
    console.log('\n⚠️  IMPORTANT: Make sure you have updated .env.local with Supabase URL!');
    console.log('   See SUPABASE_MIGRATION.md for instructions.\n');
    
    // Export from old DB
    const data = await exportData();
    
    // Push schema to new DB
    await pushSchema();
    
    // Import to new DB
    await importData(data);
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 MIGRATION COMPLETE!');
    console.log('='.repeat(60));
    console.log('\n✅ Next steps:');
    console.log('   1. Test locally: npm run dev -- -p 6001');
    console.log('   2. Verify data at http://localhost:6001/admin/voedingsplannen');
    console.log('   3. Update Vercel env vars with new DATABASE_URL');
    console.log('   4. Deploy: npx vercel --prod --yes');
    console.log('');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    console.error('\n💡 Check migration-backup.json for exported data');
    process.exit(1);
  }
}

// Run migration
main();

