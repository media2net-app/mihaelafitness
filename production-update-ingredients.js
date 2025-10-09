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

async function updateIngredients() {
  try {
    console.log('\n🔄 UPDATE PRODUCTION INGREDIENTS');
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
    console.log('🔄 Starting UPDATE (insert new, update existing)...\n');
    
    let created = 0;
    let updated = 0;
    let errors = 0;
    
    for (const ing of ingredients) {
      try {
        // Check if exists using raw SQL
        const existing = await prisma.$queryRaw`
          SELECT id FROM ingredients WHERE name = ${ing.name} LIMIT 1
        `;
        
        const aliases = JSON.stringify(ing.aliases || [`Pure:${ing.name}`]);
        
        if (existing && existing.length > 0) {
          // UPDATE existing ingredient
          await prisma.$executeRaw`
            UPDATE ingredients
            SET 
              per = ${ing.per || '100g'},
              calories = ${parseFloat(ing.calories)},
              protein = ${parseFloat(ing.protein)},
              carbs = ${parseFloat(ing.carbs)},
              fat = ${parseFloat(ing.fat)},
              fiber = ${ing.fiber !== undefined ? parseFloat(ing.fiber) : 0},
              sugar = ${ing.sugar !== undefined ? parseFloat(ing.sugar) : 0},
              category = ${ing.category || 'other'},
              aliases = ${aliases}::jsonb,
              "isActive" = ${ing.isActive !== undefined ? ing.isActive : true},
              "updatedAt" = NOW()
            WHERE name = ${ing.name}
          `;
          
          updated++;
          if (updated % 25 === 0) {
            console.log(`   ✏️  Updated ${updated} ingredients...`);
          }
        } else {
          // INSERT new ingredient
          const id = generateCuid();
          
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
        }
        
      } catch (error) {
        errors++;
        if (errors <= 5) {
          console.error(`   ❌ Error with ${ing.name}: ${error.message}`);
        }
      }
    }
    
    console.log('\n═══════════════════════════════════════');
    console.log('📊 UPDATE SUMMARY');
    console.log('═══════════════════════════════════════\n');
    console.log(`   Total ingredients: ${ingredients.length}`);
    console.log(`   ✅ Created: ${created}`);
    console.log(`   ✏️  Updated: ${updated}`);
    console.log(`   ❌ Errors: ${errors}`);
    console.log('\n═══════════════════════════════════════\n');
    
    if (updated > 0 || created > 0) {
      console.log('✅ Update completed successfully!\n');
    } else {
      console.log('⚠️  No changes made.\n');
    }
    
    // Verification - check a sample ingredient
    console.log('🔍 Verification - checking sample ingredients:\n');
    const samples = await prisma.$queryRaw`
      SELECT name, calories, protein, carbs, fat 
      FROM ingredients 
      WHERE name IN ('Chicken Breast', 'Banana', 'Oats', 'Salmon', 'Egg')
      LIMIT 5
    `;
    
    samples.forEach(ing => {
      console.log(`   • ${ing.name}: ${ing.calories} kcal | ${ing.protein}g P | ${ing.carbs}g C | ${ing.fat}g F`);
    });
    
    console.log('\n✅ Database update complete!\n');
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

updateIngredients();

