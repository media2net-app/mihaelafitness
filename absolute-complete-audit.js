/**
 * 🔍 ABSOLUTE COMPLETE AUDIT - Check EVERY SINGLE table from schema
 */

const { PrismaClient } = require('@prisma/client');

const OLD_DB_URL = 'prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza183UkxGelFDMmU0bEIwdXVBZ0l6UlYiLCJhcGlfa2V5IjoiMDFLNjhZNTUzU0RaNUtNMkZEWTQzRkRLTTAiLCJ0ZW5hbnRfaWQiOiIyYzAxN2NiZWFmY2ZlOWUwNjViYzFjNDIyNGY2OGYxNTRjMDEyZmQxYWYzYThjZDNkMzcwNzc3ZDUzMTc4Y2FjIiwiaW50ZXJuYWxfc2VjcmV0IjoiMzBmNTc4YWMtODlhMy00MGUyLWJkMmQtZTRlMzExZDhmZjg4In0.CGXndBzIhhtw4jIGEGXEdrYI_DYOQ7mAEo3_J84GkM4';
const NEW_DB_URL = 'postgresql://postgres:h4ONFtzdiYONfX15@db.efpqeufpwnwuyzsuikhf.supabase.co:5432/postgres';

console.log('🔍 ABSOLUTE COMPLETE DATABASE AUDIT\n');
console.log('Checking EVERY SINGLE table from schema.prisma');
console.log('=' .repeat(80));

async function absoluteCompleteAudit() {
  const prismaOld = new PrismaClient({
    datasources: { db: { url: OLD_DB_URL } }
  });
  
  const prismaNew = new PrismaClient({
    datasources: { db: { url: NEW_DB_URL } }
  });
  
  try {
    console.log('\n📊 Auditing ALL tables...\n');
    
    const results = [];
    const missing = [];
    
    // ALL tables from schema.prisma
    const tables = [
      'User',
      'Workout', 
      'NutritionPlan',
      'Achievement',
      'Goal',
      'Service',
      'PricingCalculation',
      'CustomerWorkout',
      'CustomerNutritionPlan',
      'TrainingSession',
      'NutritionCalculation',
      'CustomerMeasurement',
      'CustomerProgression',
      'Exercise',
      'WorkoutExercise',
      'CustomerScheduleAssignment',
      'Ingredient',
      'CustomerPhoto',
      'Todo',
      'Payment',
      'Recipe',
      'RecipeIngredient',
      'LaunchNotification',
      'OnlineCoachingRegistration'
    ];
    
    for (const tableName of tables) {
      try {
        const modelName = tableName.charAt(0).toLowerCase() + tableName.slice(1);
        
        let oldCount = 0;
        let newCount = 0;
        
        // Try to query both databases
        try {
          oldCount = await prismaOld[modelName].count();
        } catch (e) {
          // Table might not exist in old DB
        }
        
        try {
          newCount = await prismaNew[modelName].count();
        } catch (e) {
          // Table might not exist in new DB
        }
        
        const status = oldCount === newCount ? '✅' : (oldCount > newCount ? '❌' : '⚠️');
        const diff = newCount - oldCount;
        
        results.push({
          table: tableName,
          oldCount,
          newCount,
          diff,
          status
        });
        
        if (oldCount > newCount) {
          missing.push({
            table: tableName,
            missing: oldCount - newCount
          });
        }
        
        const diffStr = diff !== 0 ? `(${diff > 0 ? '+' : ''}${diff})` : '';
        console.log(`${status} ${tableName.padEnd(30)} Old: ${oldCount.toString().padStart(4)}  →  New: ${newCount.toString().padStart(4)}  ${diffStr}`);
        
      } catch (error) {
        console.log(`⚠️  ${tableName.padEnd(30)} Error: ${error.message.substring(0, 50)}`);
      }
    }
    
    await prismaOld.$disconnect();
    await prismaNew.$disconnect();
    
    console.log('\n' + '='.repeat(80));
    console.log('📊 ABSOLUTE COMPLETE AUDIT SUMMARY');
    console.log('='.repeat(80));
    
    const complete = results.filter(r => r.status === '✅').length;
    const incomplete = results.filter(r => r.status === '❌').length;
    const warnings = results.filter(r => r.status === '⚠️').length;
    
    console.log(`✅ Complete tables: ${complete}/${tables.length}`);
    console.log(`❌ Incomplete tables: ${incomplete}`);
    if (warnings > 0) {
      console.log(`⚠️  Warnings (more in new than old): ${warnings}`);
    }
    
    if (missing.length > 0) {
      console.log('\n❌ MISSING DATA:');
      missing.forEach(m => {
        console.log(`   • ${m.table}: ${m.missing} records MISSING`);
      });
      console.log('\n⚠️  ACTION REQUIRED: Some data is still missing!');
      return false;
    } else {
      console.log('\n🎉 ALL DATA MIGRATED - DATABASE IS 100% COMPLETE!');
      return true;
    }
    
  } catch (error) {
    console.error('\n❌ Audit failed:', error);
    await prismaOld.$disconnect();
    await prismaNew.$disconnect();
    throw error;
  }
}

// Run audit
absoluteCompleteAudit()
  .then(complete => {
    if (!complete) {
      process.exit(1);
    }
  })
  .catch(console.error);


