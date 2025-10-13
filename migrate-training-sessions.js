/**
 * 🚨 EMERGENCY: Migreer ontbrekende Training Sessions naar Supabase
 */

const { PrismaClient } = require('@prisma/client');

// OLD DATABASE (Prisma Accelerate)
const OLD_DB_URL = 'prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza183UkxGelFDMmU0bEIwdXVBZ0l6UlYiLCJhcGlfa2V5IjoiMDFLNjhZNTUzU0RaNUtNMkZEWTQzRkRLTTAiLCJ0ZW5hbnRfaWQiOiIyYzAxN2NiZWFmY2ZlOWUwNjViYzFjNDIyNGY2OGYxNTRjMDEyZmQxYWYzYThjZDNkMzcwNzc3ZDUzMTc4Y2FjIiwiaW50ZXJuYWxfc2VjcmV0IjoiMzBmNTc4YWMtODlhMy00MGUyLWJkMmQtZTRlMzExZDhmZjg4In0.CGXndBzIhhtw4jIGEGXEdrYI_DYOQ7mAEo3_J84GkM4';

// NEW DATABASE (Supabase)
const NEW_DB_URL = 'postgresql://postgres:h4ONFtzdiYONfX15@db.efpqeufpwnwuyzsuikhf.supabase.co:5432/postgres';

console.log('🚨 EMERGENCY MIGRATION: Training Sessions\n');
console.log('=' .repeat(60));

async function migrateTrainingSessions() {
  console.log('\n📤 STEP 1: Connecting to OLD database (Prisma Accelerate)...');
  
  const prismaOld = new PrismaClient({
    datasources: { db: { url: OLD_DB_URL } }
  });
  
  const prismaNew = new PrismaClient({
    datasources: { db: { url: NEW_DB_URL } }
  });
  
  try {
    // 1. Export training sessions from old DB
    console.log('📥 Fetching training sessions from old database...');
    const oldSessions = await prismaOld.trainingSession.findMany({
      include: {
        customer: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: {
        date: 'asc'
      }
    });
    
    console.log(`✅ Found ${oldSessions.length} training sessions in old database`);
    
    if (oldSessions.length === 0) {
      console.log('⚠️  No training sessions found in old database');
      await prismaOld.$disconnect();
      await prismaNew.$disconnect();
      return;
    }
    
    // Log sample sessions for debugging
    console.log('\n📋 Sample sessions:');
    oldSessions.slice(0, 5).forEach(session => {
      console.log(`   - ${session.date.toISOString().split('T')[0]} at ${session.startTime} - ${session.customer?.name || 'Unknown'} (${session.type})`);
    });
    
    // 2. Import to Supabase
    console.log(`\n📥 Importing ${oldSessions.length} sessions to Supabase...`);
    
    let imported = 0;
    let skipped = 0;
    let errors = 0;
    
    for (const session of oldSessions) {
      try {
        // Check if session already exists
        const existing = await prismaNew.trainingSession.findUnique({
          where: { id: session.id }
        });
        
        if (existing) {
          console.log(`   ⏭️  Session ${session.id} already exists, skipping...`);
          skipped++;
          continue;
        }
        
        // Create session in Supabase
        await prismaNew.trainingSession.create({
          data: {
            id: session.id,
            customerId: session.customerId,
            date: session.date,
            startTime: session.startTime,
            endTime: session.endTime,
            type: session.type,
            status: session.status,
            notes: session.notes,
            trainingType: session.trainingType,
            createdAt: session.createdAt,
            updatedAt: session.updatedAt,
          }
        });
        
        imported++;
        console.log(`   ✅ Imported: ${session.date.toISOString().split('T')[0]} at ${session.startTime} - ${session.customer?.name || 'Unknown'}`);
        
      } catch (error) {
        errors++;
        console.error(`   ❌ Error importing session ${session.id}:`, error.message);
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 MIGRATION SUMMARY:');
    console.log('=' .repeat(60));
    console.log(`✅ Successfully imported: ${imported}`);
    console.log(`⏭️  Already existed (skipped): ${skipped}`);
    console.log(`❌ Errors: ${errors}`);
    console.log(`📋 Total in old DB: ${oldSessions.length}`);
    
    // 3. Verify in Supabase
    console.log('\n🔍 Verifying in Supabase...');
    const supabaseSessions = await prismaNew.trainingSession.findMany();
    console.log(`✅ Total sessions now in Supabase: ${supabaseSessions.length}`);
    
    await prismaOld.$disconnect();
    await prismaNew.$disconnect();
    
    console.log('\n🎉 MIGRATION COMPLETE!');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    await prismaOld.$disconnect();
    await prismaNew.$disconnect();
    throw error;
  }
}

// Run migration
migrateTrainingSessions().catch(console.error);


