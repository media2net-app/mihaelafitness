const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

// PRODUCTION DATABASE URL - !!! VOER DIT ALLEEN UIT ALS JE ZEKER WEET WAT JE DOET !!!
const PRODUCTION_DATABASE_URL = 'prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza183UkxGelFDMmU0bEIwdXVBZ0l6UlYiLCJhcGlfa2V5IjoiMDFLNjhZNTUzU0RaNUtNMkZEWTQzRkRLTTAiLCJ0ZW5hbnRfaWQiOiIyYzAxN2NiZWFmY2ZlOWUwNjViYzFjNDIyNGY2OGYxNTRjMDEyZmQxYWYzYThjZDNkMzcwNzc3ZDUzMTc4Y2FjIiwiaW50ZXJuYWxfc2VjcmV0IjoiMzBmNTc4YWMtODlhMy00MGUyLWJkMmQtZTRlMzExZDhmZjg4In0.CGXndBzIhhtw4jIGEGXEdrYI_DYOQ7mAEo3_J84GkM4';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: PRODUCTION_DATABASE_URL
    }
  }
});

async function directImport() {
  try {
    console.log('\n🚨 DIRECT PRODUCTION DATABASE IMPORT 🚨');
    console.log('═══════════════════════════════════════\n');
    console.log('⚠️  WARNING: This script will directly modify the PRODUCTION database!');
    console.log('⚠️  Make sure you understand what you\'re doing!\n');
    
    // Load exported data
    const exportPath = path.join(__dirname, 'ingredients-basic-export.json');
    
    if (!fs.existsSync(exportPath)) {
      console.error('❌ Error: ingredients-basic-export.json not found!');
      console.log('   Please run: node export-basic-ingredients.js first\n');
      process.exit(1);
    }
    
    const ingredients = JSON.parse(fs.readFileSync(exportPath, 'utf8'));
    
    console.log(`📦 Loaded ${ingredients.length} ingredients\n`);
    console.log('🔄 Starting direct database import...\n');
    
    let created = 0;
    let skipped = 0;
    let errors = 0;
    
    for (const ing of ingredients) {
      try {
        // Check if exists by name only (safer than by ID)
        const existing = await prisma.ingredient.findFirst({
          where: { name: ing.name }
        });
        
        if (existing) {
          skipped++;
          if (skipped % 50 === 0) {
            console.log(`   ⏭️  Skipped ${skipped} existing ingredients...`);
          }
          continue;
        }
        
        // Create without ID - let database generate it
        await prisma.ingredient.create({
          data: {
            name: ing.name,
            per: ing.per || '100g',
            calories: parseFloat(ing.calories),
            protein: parseFloat(ing.protein),
            carbs: parseFloat(ing.carbs),
            fat: parseFloat(ing.fat),
            fiber: ing.fiber !== undefined ? parseFloat(ing.fiber) : 0,
            sugar: ing.sugar !== undefined ? parseFloat(ing.sugar) : 0,
            category: ing.category || 'other',
            aliases: ing.aliases || [`Pure:${ing.name}`],
            isActive: ing.isActive !== undefined ? ing.isActive : true
          }
        });
        
        created++;
        if (created % 50 === 0) {
          console.log(`   ✅ Created ${created} ingredients...`);
        }
        
      } catch (error) {
        errors++;
        console.error(`   ❌ Error with ${ing.name}:`, error.message);
      }
    }
    
    console.log('\n═══════════════════════════════════════');
    console.log('📊 IMPORT SUMMARY');
    console.log('═══════════════════════════════════════\n');
    console.log(`   Total ingredients: ${ingredients.length}`);
    console.log(`   ✅ Created: ${created}`);
    console.log(`   ⏭️  Skipped: ${skipped}`);
    console.log(`   ❌ Errors: ${errors}`);
    console.log('\n═══════════════════════════════════════\n');
    
    if (errors === 0 && created > 0) {
      console.log('✅ Import completed successfully!\n');
    } else if (errors > 0) {
      console.log('⚠️  Import completed with errors.\n');
    } else {
      console.log('ℹ️  All ingredients already exist in database.\n');
    }
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

directImport();

