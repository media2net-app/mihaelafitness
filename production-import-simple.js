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

async function simpleImport() {
  try {
    console.log('\n🚀 SIMPLE PRODUCTION IMPORT');
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
    console.log('🔄 Starting import (skipping existence checks)...\n');
    
    let created = 0;
    let errors = 0;
    
    for (const ing of ingredients) {
      try {
        // Direct create without checking if exists
        // If it fails due to duplicate, we'll catch and continue
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
        if (created % 25 === 0) {
          console.log(`   ✅ Created ${created} ingredients...`);
        }
        
      } catch (error) {
        // Skip duplicates and other errors silently
        if (error.code === 'P2002') {
          // Unique constraint violation - ingredient exists
          if (errors === 0) {
            console.log(`   ⏭️  Skipping duplicates...`);
          }
        } else {
          // Other error
          errors++;
          if (errors <= 5) {
            console.error(`   ❌ Error with ${ing.name}: ${error.message}`);
          }
        }
      }
    }
    
    console.log('\n═══════════════════════════════════════');
    console.log('📊 IMPORT SUMMARY');
    console.log('═══════════════════════════════════════\n');
    console.log(`   Total ingredients: ${ingredients.length}`);
    console.log(`   ✅ Created: ${created}`);
    console.log(`   ⏭️  Skipped/Errors: ${ingredients.length - created}`);
    console.log('\n═══════════════════════════════════════\n');
    
    if (created > 0) {
      console.log('✅ Import completed successfully!\n');
      console.log('🔍 Verifying...');
      
      // Quick verification
      const count = await prisma.ingredient.count();
      console.log(`✅ Total ingredients in database: ${count}\n`);
    } else {
      console.log('ℹ️  No new ingredients were added.\n');
    }
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

simpleImport();

