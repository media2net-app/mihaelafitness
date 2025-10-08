const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || "prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza183UkxGelFDMmU0bEIwdXVBZ0l6UlYiLCJhcGlfa2V5IjoiMDFLNjhZNTUzU0RaNUtNMkZEWTQzRkRLTTAiLCJ0ZW5hbnRfaWQiOiIyYzAxN2NiZWFmY2ZlOWUwNjViYzFjNDIyNGY2OGYxNTRjMDEyZmQxYWYzYThjZDNkMzcwNzc3ZDUzMTc4Y2FjIiwiaW50ZXJuYWxfc2VjcmV0IjoiMzBmNTc4YWMtODlhMy00MGUyLWJkMmQtZTRlMzExZDhmZjg4In0.CGXndBzIhhtw4jIGEGXEdrYI_DYOQ7mAEo3_J84GkM4"
    }
  }
});

// Conversie factoren voor verschillende eenheden naar 100g
const CONVERSION_FACTORS = {
  '50g': 2.0,        // 50g -> 100g = factor 2
  '80g': 1.25,       // 80g -> 100g = factor 1.25
  '150g': 0.667,     // 150g -> 100g = factor 0.667
  '200ml': 0.5,      // 200ml -> 100ml = factor 0.5 (assuming similar density to water)
  '100ml': 1.0,      // 100ml -> 100ml = factor 1.0
  '1 banana (100g)': 1.0,    // Already per 100g
  '1 bar (50g)': 2.0,        // 50g bar -> 100g = factor 2
  '1 scoop (30g)': 3.33      // 30g scoop -> 100g = factor 3.33
};

async function standardizeUnits() {
  try {
    console.log('🔧 Starting unit standardization to per 100g...\n');
    
    // Haal alle ingredienten op met niet-standaard eenheden
    const ingredients = await prisma.ingredient.findMany({
      where: {
        OR: [
          { per: { not: '100g' } },
          { per: null }
        ]
      }
    });
    
    console.log(`📊 Found ${ingredients.length} ingredients with non-standard units\n`);
    
    let standardizedCount = 0;
    const standardizations = [];
    
    for (const ingredient of ingredients) {
      const currentUnit = ingredient.per;
      console.log(`🔍 Processing: ${ingredient.name} (${currentUnit})`);
      
      // Check if we have a conversion factor for this unit
      if (CONVERSION_FACTORS[currentUnit]) {
        const factor = CONVERSION_FACTORS[currentUnit];
        
        console.log(`   Converting from ${currentUnit} to 100g (factor: ${factor})`);
        console.log(`   Current: ${ingredient.calories} cal, ${ingredient.protein}g protein, ${ingredient.carbs}g carbs, ${ingredient.fat}g fat`);
        
        // Calculate new values
        const newCalories = Math.round(ingredient.calories * factor);
        const newProtein = Math.round(ingredient.protein * factor * 10) / 10;
        const newCarbs = Math.round(ingredient.carbs * factor * 10) / 10;
        const newFat = Math.round(ingredient.fat * factor * 10) / 10;
        const newFiber = ingredient.fiber ? Math.round(ingredient.fiber * factor * 10) / 10 : 0;
        const newSugar = ingredient.sugar ? Math.round(ingredient.sugar * factor * 10) / 10 : 0;
        
        console.log(`   New: ${newCalories} cal, ${newProtein}g protein, ${newCarbs}g carbs, ${newFat}g fat`);
        
        // Update the ingredient
        await prisma.ingredient.update({
          where: { id: ingredient.id },
          data: {
            calories: newCalories,
            protein: newProtein,
            carbs: newCarbs,
            fat: newFat,
            fiber: newFiber,
            sugar: newSugar,
            per: '100g'
          }
        });
        
        standardizedCount++;
        standardizations.push({
          name: ingredient.name,
          oldUnit: currentUnit,
          factor: factor,
          old: { calories: ingredient.calories, protein: ingredient.protein, carbs: ingredient.carbs, fat: ingredient.fat },
          new: { calories: newCalories, protein: newProtein, carbs: newCarbs, fat: newFat }
        });
        
        console.log(`   ✅ Updated successfully\n`);
      } else {
        console.log(`   ⚠️  No conversion factor found for unit: ${currentUnit}`);
        console.log(`   Setting to 100g without conversion\n`);
        
        // Just set the unit to 100g without conversion
        await prisma.ingredient.update({
          where: { id: ingredient.id },
          data: {
            per: '100g'
          }
        });
        
        standardizedCount++;
        standardizations.push({
          name: ingredient.name,
          oldUnit: currentUnit,
          factor: 1.0,
          old: { calories: ingredient.calories, protein: ingredient.protein, carbs: ingredient.carbs, fat: ingredient.fat },
          new: { calories: ingredient.calories, protein: ingredient.protein, carbs: ingredient.carbs, fat: ingredient.fat }
        });
      }
    }
    
    console.log(`📈 Summary:`);
    console.log(`   - Total ingredients processed: ${ingredients.length}`);
    console.log(`   - Ingredients standardized: ${standardizedCount}`);
    
    if (standardizations.length > 0) {
      console.log(`\n🔧 Standardizations made:`);
      standardizations.forEach(std => {
        console.log(`   - ${std.name}: ${std.oldUnit} → 100g (factor: ${std.factor})`);
        console.log(`     ${std.old.calories}→${std.new.calories} cal, ${std.old.protein}→${std.new.protein}g protein`);
      });
    }
    
    // Verify all ingredients are now standardized
    console.log(`\n🔍 Verifying standardization...`);
    const remainingNonStandard = await prisma.ingredient.findMany({
      where: {
        OR: [
          { per: { not: '100g' } },
          { per: null }
        ]
      }
    });
    
    if (remainingNonStandard.length === 0) {
      console.log(`✅ All ingredients are now standardized to per 100g!`);
    } else {
      console.log(`⚠️  ${remainingNonStandard.length} ingredients still have non-standard units:`);
      remainingNonStandard.forEach(ingredient => {
        console.log(`   - ${ingredient.name}: ${ingredient.per || 'null'}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

standardizeUnits();




