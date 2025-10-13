/**
 * 🚨 EMERGENCY: Migreer ALLE ontbrekende data naar Supabase
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

// OLD DATABASE (Prisma Accelerate)
const OLD_DB_URL = 'prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza183UkxGelFDMmU0bEIwdXVBZ0l6UlYiLCJhcGlfa2V5IjoiMDFLNjhZNTUzU0RaNUtNMkZEWTQzRkRLTTAiLCJ0ZW5hbnRfaWQiOiIyYzAxN2NiZWFmY2ZlOWUwNjViYzFjNDIyNGY2OGYxNTRjMDEyZmQxYWYzYThjZDNkMzcwNzc3ZDUzMTc4Y2FjIiwiaW50ZXJuYWxfc2VjcmV0IjoiMzBmNTc4YWMtODlhMy00MGUyLWJkMmQtZTRlMzExZDhmZjg4In0.CGXndBzIhhtw4jIGEGXEdrYI_DYOQ7mAEo3_J84GkM4';

// NEW DATABASE (Supabase)
const NEW_DB_URL = 'postgresql://postgres:h4ONFtzdiYONfX15@db.efpqeufpwnwuyzsuikhf.supabase.co:5432/postgres';

console.log('🚨 EMERGENCY: Migreer ALLE ontbrekende data\n');
console.log('=' .repeat(80));

async function migrateMissingTables() {
  const prismaOld = new PrismaClient({
    datasources: { db: { url: OLD_DB_URL } }
  });
  
  const prismaNew = new PrismaClient({
    datasources: { db: { url: NEW_DB_URL } }
  });
  
  try {
    const summary = {
      customerMeasurements: { imported: 0, skipped: 0, errors: 0 },
      customerWorkouts: { imported: 0, skipped: 0, errors: 0 },
      workoutExercises: { imported: 0, skipped: 0, errors: 0 },
      pricingCalculations: { imported: 0, skipped: 0, errors: 0 }
    };

    // 1. CUSTOMER MEASUREMENTS
    console.log('\n📊 Migrating CustomerMeasurements...');
    const oldMeasurements = await prismaOld.customerMeasurement.findMany();
    console.log(`   Found ${oldMeasurements.length} measurements in old DB`);
    
    for (const measurement of oldMeasurements) {
      try {
        const existing = await prismaNew.customerMeasurement.findUnique({
          where: { id: measurement.id }
        });
        
        if (existing) {
          summary.customerMeasurements.skipped++;
          continue;
        }
        
        await prismaNew.customerMeasurement.create({
          data: {
            id: measurement.id,
            customerId: measurement.customerId,
            week: measurement.week,
            date: measurement.date,
            weight: measurement.weight,
            height: measurement.height,
            age: measurement.age,
            chest: measurement.chest,
            waist: measurement.waist,
            hips: measurement.hips,
            thigh: measurement.thigh,
            arm: measurement.arm,
            neck: measurement.neck,
            bodyFat: measurement.bodyFat,
            muscleMass: measurement.muscleMass,
            bmi: measurement.bmi,
            notes: measurement.notes,
            createdAt: measurement.createdAt,
            updatedAt: measurement.updatedAt,
          }
        });
        
        summary.customerMeasurements.imported++;
        console.log(`   ✅ Week ${measurement.week} for customer ${measurement.customerId}`);
        
      } catch (error) {
        summary.customerMeasurements.errors++;
        console.error(`   ❌ Error:`, error.message);
      }
    }

    // 2. CUSTOMER WORKOUTS
    console.log('\n💪 Migrating CustomerWorkouts...');
    const oldCustomerWorkouts = await prismaOld.customerWorkout.findMany();
    console.log(`   Found ${oldCustomerWorkouts.length} customer workouts in old DB`);
    
    for (const cw of oldCustomerWorkouts) {
      try {
        const existing = await prismaNew.customerWorkout.findUnique({
          where: { id: cw.id }
        });
        
        if (existing) {
          summary.customerWorkouts.skipped++;
          continue;
        }
        
        await prismaNew.customerWorkout.create({
          data: {
            id: cw.id,
            customerId: cw.customerId,
            workoutId: cw.workoutId,
            assignedAt: cw.assignedAt,
            status: cw.status,
            notes: cw.notes,
            createdAt: cw.createdAt,
            updatedAt: cw.updatedAt,
          }
        });
        
        summary.customerWorkouts.imported++;
        console.log(`   ✅ Customer ${cw.customerId} → Workout ${cw.workoutId}`);
        
      } catch (error) {
        summary.customerWorkouts.errors++;
        console.error(`   ❌ Error:`, error.message);
      }
    }

    // 3. WORKOUT EXERCISES (MOST CRITICAL!)
    console.log('\n🏋️ Migrating WorkoutExercises (CRITICAL!)...');
    const oldWorkoutExercises = await prismaOld.workoutExercise.findMany();
    console.log(`   Found ${oldWorkoutExercises.length} workout exercises in old DB`);
    
    for (const we of oldWorkoutExercises) {
      try {
        const existing = await prismaNew.workoutExercise.findUnique({
          where: { id: we.id }
        });
        
        if (existing) {
          summary.workoutExercises.skipped++;
          continue;
        }
        
        await prismaNew.workoutExercise.create({
          data: {
            id: we.id,
            workoutId: we.workoutId,
            exerciseId: we.exerciseId,
            day: we.day,
            order: we.order,
            sets: we.sets,
            reps: we.reps,
            weight: we.weight,
            restTime: we.restTime,
            notes: we.notes,
            createdAt: we.createdAt,
            updatedAt: we.updatedAt,
          }
        });
        
        summary.workoutExercises.imported++;
        if (summary.workoutExercises.imported % 20 === 0) {
          console.log(`   ✅ Progress: ${summary.workoutExercises.imported}/${oldWorkoutExercises.length}`);
        }
        
      } catch (error) {
        summary.workoutExercises.errors++;
        console.error(`   ❌ Error:`, error.message);
      }
    }
    console.log(`   ✅ Completed: ${summary.workoutExercises.imported} workout exercises`);

    // 4. PRICING CALCULATIONS
    console.log('\n💰 Migrating PricingCalculations...');
    const oldPricingCalcs = await prismaOld.pricingCalculation.findMany();
    console.log(`   Found ${oldPricingCalcs.length} pricing calculations in old DB`);
    
    for (const pc of oldPricingCalcs) {
      try {
        const existing = await prismaNew.pricingCalculation.findUnique({
          where: { id: pc.id }
        });
        
        if (existing) {
          summary.pricingCalculations.skipped++;
          continue;
        }
        
        await prismaNew.pricingCalculation.create({
          data: {
            id: pc.id,
            service: pc.service,
            duration: pc.duration,
            frequency: pc.frequency,
            discount: pc.discount,
            vat: pc.vat,
            finalPrice: pc.finalPrice,
            includeNutritionPlan: pc.includeNutritionPlan,
            nutritionPlanCount: pc.nutritionPlanCount,
            customerId: pc.customerId,
            customerName: pc.customerName,
            createdAt: pc.createdAt,
          }
        });
        
        summary.pricingCalculations.imported++;
        console.log(`   ✅ ${pc.customerName || 'Unknown'} - €${pc.finalPrice}`);
        
      } catch (error) {
        summary.pricingCalculations.errors++;
        console.error(`   ❌ Error:`, error.message);
      }
    }

    await prismaOld.$disconnect();
    await prismaNew.$disconnect();

    // Print summary
    console.log('\n' + '='.repeat(80));
    console.log('📊 MIGRATION SUMMARY');
    console.log('='.repeat(80));
    
    console.log('\n✅ CustomerMeasurements:');
    console.log(`   Imported: ${summary.customerMeasurements.imported}`);
    console.log(`   Skipped: ${summary.customerMeasurements.skipped}`);
    console.log(`   Errors: ${summary.customerMeasurements.errors}`);
    
    console.log('\n✅ CustomerWorkouts:');
    console.log(`   Imported: ${summary.customerWorkouts.imported}`);
    console.log(`   Skipped: ${summary.customerWorkouts.skipped}`);
    console.log(`   Errors: ${summary.customerWorkouts.errors}`);
    
    console.log('\n✅ WorkoutExercises:');
    console.log(`   Imported: ${summary.workoutExercises.imported}`);
    console.log(`   Skipped: ${summary.workoutExercises.skipped}`);
    console.log(`   Errors: ${summary.workoutExercises.errors}`);
    
    console.log('\n✅ PricingCalculations:');
    console.log(`   Imported: ${summary.pricingCalculations.imported}`);
    console.log(`   Skipped: ${summary.pricingCalculations.skipped}`);
    console.log(`   Errors: ${summary.pricingCalculations.errors}`);
    
    const totalImported = 
      summary.customerMeasurements.imported +
      summary.customerWorkouts.imported +
      summary.workoutExercises.imported +
      summary.pricingCalculations.imported;
    
    const totalErrors = 
      summary.customerMeasurements.errors +
      summary.customerWorkouts.errors +
      summary.workoutExercises.errors +
      summary.pricingCalculations.errors;
    
    console.log('\n' + '='.repeat(80));
    console.log(`🎉 TOTAL IMPORTED: ${totalImported} records`);
    if (totalErrors > 0) {
      console.log(`⚠️  TOTAL ERRORS: ${totalErrors}`);
    }
    console.log('='.repeat(80));
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    await prismaOld.$disconnect();
    await prismaNew.$disconnect();
    throw error;
  }
}

// Run migration
migrateMissingTables().catch(console.error);


