const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

// PRODUCTION DATABASE URL  
const PRODUCTION_DATABASE_URL = 'prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza183UkxGelFDMmU0bEIwdXVBZ0l6UlYiLCJhcGlfa2V5IjoiMDFLNjhZNTUzU0RaNUtNMkZEWTQzRkRLTTAiLCJ0ZW5hbnRfaWQiOiIyYzAxN2NiZWFmY2ZlOWUwNjViYzFjNDIyNGY2OGYxNTRjMDEyZmQxYWYzYThjZDNkMzcwNzc3ZDUzMTc4Y2FjIiwiaW50ZXJuYWxfc2VjcmV0IjoiMzBmNTc4YWMtODlhMy00MGUyLWJkMmQtZTRlMzExZDhmZjg4In0.CGXndBzIhhtw4jIGEGXEdrYI_DYOQ7mAEo3_J84GkM4';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: PRODUCTION_DATABASE_URL
    }
  }
});

// Generate a cuid-like ID
function generateCuid() {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 15);
  return `cmg${timestamp}${randomStr}`.substring(0, 25);
}

async function rawSqlImport() {
  try {
    console.log('\n🚀 RAW SQL PRODUCTION IMPORT');
    console.log('═══════════════════════════════════════\n');
    
    // Load exported data
    const exportPath = path.join(__dirname, 'ingredients-basic-export.json');
    
    if (!fs.existsSync(exportPath)) {
      console.error('❌ Error: ingredients-basic-export.json not found!');
      console.log('   Please run: node export-basic-ingredients.js first\n');
      process.exit(1);
    }
    
    const ingredients = JSON.parse(fs.readFileSync(exportPath, 'utf8'));
    
    console.log(`📦 Loaded ${ingredients.length} ingredients\n`);
    console.log('🔄 Starting RAW SQL import...\n');
    
    let created = 0;
    let skipped = 0;
    let errors = 0;
    
    for (const ing of ingredients) {
      try {
        // Check if exists using raw SQL
        const existing = await prisma.$queryRaw`
          SELECT id FROM ingredients WHERE name = ${ing.name} LIMIT 1
        `;
        
        if (existing && existing.length > 0) {
          skipped++;
          if (skipped % 50 === 0) {
            console.log(`   ⏭️  Skipped ${skipped} existing ingredients...`);
          }
          continue;
        }
        
        // Insert using raw SQL - only fields that exist in production
        const id = generateCuid();
        const aliases = JSON.stringify(ing.aliases || [`Pure:${ing.name}`]);
        
        await prisma.$executeRaw`
          INSERT INTO ingredients (
            id, name, per, calories, protein, carbs, fat, fiber, sugar, category, aliases, "isActive", "createdAt", "updatedAt"
          ) VALUES (
            ${id},
            ${ing.name},
            ${ing.per || '100g'},
            ${parseFloat(ing.calories)},
            ${parseFloat(ing.protein)},
            ${parseFloat(ing.carbs)},
            ${parseFloat(ing.fat)},
            ${ing.fiber !== undefined ? parseFloat(ing.fiber) : 0},
            ${ing.sugar !== undefined ? parseFloat(ing.sugar) : 0},
            ${ing.category || 'other'},
            ${aliases}::jsonb,
            ${ing.isActive !== undefined ? ing.isActive : true},
            NOW(),
            NOW()
          )
        `;
        
        created++;
        if (created % 25 === 0) {
          console.log(`   ✅ Created ${created} ingredients...`);
        }
        
      } catch (error) {
        errors++;
        if (errors <= 5) {
          console.error(`   ❌ Error with ${ing.name}: ${error.message}`);
        }
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
    
    if (created > 0) {
      console.log('✅ Import completed successfully!\n');
    } else if (skipped === ingredients.length) {
      console.log('ℹ️  All ingredients already exist in database.\n');
    } else {
      console.log('⚠️  Import completed with issues.\n');
    }
    
    // Verification
    console.log('🔍 Verifying database...');
    const result = await prisma.$queryRaw`SELECT COUNT(*)::int as count FROM ingredients`;
    console.log(`✅ Total ingredients in production database: ${result[0].count}\n`);
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

rawSqlImport();

