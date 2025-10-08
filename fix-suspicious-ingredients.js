const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || "prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza183UkxGelFDMmU0bEIwdXVBZ0l6UlYiLCJhcGlfa2V5IjoiMDFLNjhZNTUzU0RaNUtNMkZEWTQzRkRLTTAiLCJ0ZW5hbnRfaWQiOiIyYzAxN2NiZWFmY2ZlOWUwNjViYzFjNDIyNGY2OGYxNTRjMDEyZmQxYWYzYThjZDNkMzcwNzc3ZDUzMTc4Y2FjIiwiaW50ZXJuYWxfc2VjcmV0IjoiMzBmNTc4YWMtODlhMy00MGUyLWJkMmQtZTRlMzExZDhmZjg4In0.CGXndBzIhhtw4jIGEGXEdrYI_DYOQ7mAEo3_J84GkM4"
    }
  }
});

// Correcte voedingswaarden voor verdachte ingredienten
const CORRECTIONS = {
  'protein bar': {
    // Protein bars zijn meestal 350-400 cal per 100g, niet 700
    // De 700 cal kwam van de conversie van 50g naar 100g, maar dat was incorrect
    calories: 350,
    protein: 20,
    carbs: 35,
    fat: 15,
    fiber: 5,
    sugar: 0,
    reason: 'Protein bars zijn gemiddeld 350-400 cal per 100g, niet 700'
  },
  'scoop protein powder': {
    // Dit is de conversie van 30g scoop naar 100g
    // 30g scoop = 120 cal, dus 100g = 400 cal (120 * 100/30 = 400)
    // Maar dit is eigenlijk te laag voor pure whey protein
    // Pure whey protein is ongeveer 370-400 cal per 100g
    calories: 370,
    protein: 80,
    carbs: 5,
    fat: 3,
    fiber: 0,
    sugar: 1,
    reason: 'Pure whey protein is 370-400 cal per 100g'
  }
};

async function fixSuspiciousIngredients() {
  try {
    console.log('🔧 Fixing suspicious high-calorie ingredients...\n');
    
    let fixedCount = 0;
    const fixes = [];
    
    for (const [ingredientName, correctValues] of Object.entries(CORRECTIONS)) {
      console.log(`🔍 Checking: ${ingredientName}`);
      
      // Find the ingredient
      const ingredient = await prisma.ingredient.findFirst({
        where: {
          name: {
            contains: ingredientName,
            mode: 'insensitive'
          }
        }
      });
      
      if (ingredient) {
        console.log(`   Current values: ${ingredient.calories} cal, ${ingredient.protein}g protein, ${ingredient.carbs}g carbs, ${ingredient.fat}g fat`);
        console.log(`   Correct values: ${correctValues.calories} cal, ${correctValues.protein}g protein, ${correctValues.carbs}g carbs, ${correctValues.fat}g fat`);
        console.log(`   Reason: ${correctValues.reason}`);
        
        // Update the ingredient
        await prisma.ingredient.update({
          where: { id: ingredient.id },
          data: {
            calories: correctValues.calories,
            protein: correctValues.protein,
            carbs: correctValues.carbs,
            fat: correctValues.fat,
            fiber: correctValues.fiber,
            sugar: correctValues.sugar,
            per: '100g'
          }
        });
        
        console.log(`   ✅ Updated successfully\n`);
        
        fixedCount++;
        fixes.push({
          name: ingredient.name,
          old: { calories: ingredient.calories, protein: ingredient.protein, carbs: ingredient.carbs, fat: ingredient.fat },
          new: correctValues
        });
      } else {
        console.log(`   ⚠️  Ingredient not found: ${ingredientName}\n`);
      }
    }
    
    console.log(`📈 Summary:`);
    console.log(`   - Ingredients fixed: ${fixedCount}`);
    
    if (fixes.length > 0) {
      console.log(`\n🔧 Fixes applied:`);
      fixes.forEach(fix => {
        console.log(`   - ${fix.name}:`);
        console.log(`     ${fix.old.calories}→${fix.new.calories} cal, ${fix.old.protein}→${fix.new.protein}g protein`);
      });
    }
    
    // Verify the fixes
    console.log(`\n🔍 Verifying fixes...`);
    for (const [ingredientName, correctValues] of Object.entries(CORRECTIONS)) {
      const ingredient = await prisma.ingredient.findFirst({
        where: {
          name: {
            contains: ingredientName,
            mode: 'insensitive'
          }
        }
      });
      
      if (ingredient) {
        const isCorrect = 
          Math.abs(ingredient.calories - correctValues.calories) <= 5 &&
          Math.abs(ingredient.protein - correctValues.protein) <= 2 &&
          Math.abs(ingredient.carbs - correctValues.carbs) <= 2 &&
          Math.abs(ingredient.fat - correctValues.fat) <= 2;
        
        if (isCorrect) {
          console.log(`   ✅ ${ingredient.name}: Values are now correct`);
        } else {
          console.log(`   ❌ ${ingredient.name}: Values still incorrect`);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixSuspiciousIngredients();




