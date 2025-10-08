const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || "prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza183UkxGelFDMmU0bEIwdXVBZ0l6UlYiLCJhcGlfa2V5IjoiMDFLNjhZNTUzU0RaNUtNMkZEWTQzRkRLTTAiLCJ0ZW5hbnRfaWQiOiIyYzAxN2NiZWFmY2ZlOWUwNjViYzFjNDIyNGY2OGYxNTRjMDEyZmQxYWYzYThjZDNkMzcwNzc3ZDUzMTc4Y2FjIiwiaW50ZXJuYWxfc2VjcmV0IjoiMzBmNTc4YWMtODlhMy00MGUyLWJkMmQtZTRlMzExZDhmZjg4In0.CGXndBzIhhtw4jIGEGXEdrYI_DYOQ7mAEo3_J84GkM4"
    }
  }
});

// Betrouwbare referentiewaarden voor hoge calorie ingredienten
const HIGH_CALORIE_REFERENCE = {
  'protein bar': { calories: 350, protein: 20, carbs: 35, fat: 15, note: 'Per 50g bar, dus 700 cal per 100g is correct' },
  'scoop protein powder': { calories: 370, protein: 80, carbs: 5, fat: 3, note: 'Per 30g scoop, dus 1233 cal per 100g zou correct zijn' },
  'olive oil': { calories: 884, protein: 0, carbs: 0, fat: 100, note: 'Pure olie, 884 cal per 100g is correct' },
  'coconut oil': { calories: 862, protein: 0, carbs: 0, fat: 100, note: 'Pure olie, 862 cal per 100g is correct' },
  'almond butter': { calories: 614, protein: 21.2, carbs: 18.8, fat: 55.5, note: 'Notenboter, 614 cal per 100g is correct' },
  'peanut butter': { calories: 588, protein: 25.1, carbs: 20, fat: 50.4, note: 'Notenboter, 588 cal per 100g is correct' },
  'almonds': { calories: 579, protein: 21.2, carbs: 21.6, fat: 49.9, note: 'Noten, 579 cal per 100g is correct' },
  'walnuts': { calories: 654, protein: 15.2, carbs: 13.7, fat: 65.2, note: 'Noten, 654 cal per 100g is correct' },
  'cashews': { calories: 553, protein: 18.2, carbs: 30.2, fat: 43.8, note: 'Noten, 553 cal per 100g is correct' },
  'mixed nuts': { calories: 607, protein: 20, carbs: 21, fat: 54, note: 'Gemengde noten, 607 cal per 100g is correct' },
  'nuts': { calories: 607, protein: 20, carbs: 21, fat: 54, note: 'Noten, 607 cal per 100g is correct' },
  'honey': { calories: 304, protein: 0.3, carbs: 82.4, fat: 0, note: 'Pure suiker, 304 cal per 100g is correct' },
  'maple syrup': { calories: 260, protein: 0, carbs: 67, fat: 0, note: 'Pure suiker, 260 cal per 100g is correct' },
  'cinnamon': { calories: 247, protein: 4, carbs: 80.6, fat: 1.2, note: 'Specerij, 247 cal per 100g is correct' },
  'cocoa powder': { calories: 228, protein: 19.6, carbs: 57.9, fat: 13.7, note: 'Pure cacao, 228 cal per 100g is correct' }
};

async function checkHighCalorieIngredients() {
  try {
    console.log('🔍 Checking high calorie ingredients for accuracy...\n');
    
    // Haal alle ingredienten op, gesorteerd op calorieën (hoog naar laag)
    const ingredients = await prisma.ingredient.findMany({
      orderBy: { calories: 'desc' }
    });
    
    console.log(`📊 Found ${ingredients.length} ingredients in database\n`);
    
    // Toon top 20 hoogste calorieën
    console.log('🔥 Top 20 Highest Calorie Ingredients:');
    console.log('='.repeat(80));
    
    const top20 = ingredients.slice(0, 20);
    top20.forEach((ingredient, index) => {
      console.log(`${(index + 1).toString().padStart(2)}. ${ingredient.name.padEnd(25)} | ${ingredient.calories.toString().padStart(4)} cal | ${ingredient.protein.toString().padStart(5)}g protein | ${ingredient.carbs.toString().padStart(5)}g carbs | ${ingredient.fat.toString().padStart(5)}g fat | ${ingredient.per}`);
    });
    
    console.log('\n' + '='.repeat(80));
    
    // Check ingredienten met meer dan 300 calorieën
    const highCalorieIngredients = ingredients.filter(ing => ing.calories > 300);
    
    console.log(`\n🔍 Detailed Analysis of High Calorie Ingredients (>300 cal):`);
    console.log(`Found ${highCalorieIngredients.length} ingredients with >300 calories\n`);
    
    let suspiciousCount = 0;
    const suspiciousIngredients = [];
    
    for (const ingredient of highCalorieIngredients) {
      const normalizedName = ingredient.name.toLowerCase().trim();
      console.log(`📋 ${ingredient.name}:`);
      console.log(`   ${ingredient.calories} cal, ${ingredient.protein}g protein, ${ingredient.carbs}g carbs, ${ingredient.fat}g fat`);
      console.log(`   Category: ${ingredient.category || 'N/A'}, Unit: ${ingredient.per}`);
      
      // Check against reference values
      if (HIGH_CALORIE_REFERENCE[normalizedName]) {
        const ref = HIGH_CALORIE_REFERENCE[normalizedName];
        const isCorrect = 
          Math.abs(ingredient.calories - ref.calories) <= 10 &&
          Math.abs(ingredient.protein - ref.protein) <= 2 &&
          Math.abs(ingredient.carbs - ref.carbs) <= 2 &&
          Math.abs(ingredient.fat - ref.fat) <= 2;
        
        if (isCorrect) {
          console.log(`   ✅ Reference check: CORRECT`);
          console.log(`   📝 Note: ${ref.note}`);
        } else {
          console.log(`   ❌ Reference check: INCORRECT`);
          console.log(`   Expected: ${ref.calories} cal, ${ref.protein}g protein, ${ref.carbs}g carbs, ${ref.fat}g fat`);
          console.log(`   📝 Note: ${ref.note}`);
          suspiciousCount++;
          suspiciousIngredients.push({
            name: ingredient.name,
            current: { calories: ingredient.calories, protein: ingredient.protein, carbs: ingredient.carbs, fat: ingredient.fat },
            expected: ref
          });
        }
      } else {
        // Check for obviously wrong values based on category
        let isSuspicious = false;
        let reason = '';
        
        if (ingredient.category === 'vegetables' && ingredient.calories > 100) {
          isSuspicious = true;
          reason = 'Vegetable with unusually high calories';
        } else if (ingredient.category === 'fruits' && ingredient.calories > 200) {
          isSuspicious = true;
          reason = 'Fruit with unusually high calories';
        } else if (ingredient.category === 'proteins' && ingredient.calories > 500) {
          isSuspicious = true;
          reason = 'Protein with unusually high calories (unless it\'s processed)';
        } else if (ingredient.calories > 800 && ingredient.fat < 50) {
          isSuspicious = true;
          reason = 'Very high calories but low fat content (suspicious)';
        }
        
        if (isSuspicious) {
          console.log(`   ⚠️  SUSPICIOUS: ${reason}`);
          suspiciousCount++;
          suspiciousIngredients.push({
            name: ingredient.name,
            current: { calories: ingredient.calories, protein: ingredient.protein, carbs: ingredient.carbs, fat: ingredient.fat },
            expected: null,
            reason: reason
          });
        } else {
          console.log(`   ✅ No reference data, but values seem reasonable for category`);
        }
      }
      
      console.log('');
    }
    
    // Special check for protein powder
    console.log('🔬 Special Analysis: Protein Powder');
    const proteinPowder = ingredients.find(ing => ing.name.toLowerCase().includes('protein powder'));
    if (proteinPowder) {
      console.log(`Current values: ${proteinPowder.calories} cal, ${proteinPowder.protein}g protein, ${proteinPowder.carbs}g carbs, ${proteinPowder.fat}g fat`);
      
      // Protein powder should be around 370-400 cal per 100g
      if (proteinPowder.calories > 1000) {
        console.log('❌ PROTEIN POWDER CALORIES TOO HIGH!');
        console.log('Expected: ~370-400 cal per 100g');
        console.log('This suggests the conversion from 30g scoop to 100g was incorrect');
        
        // Calculate what it should be
        const correctCalories = Math.round(370 * 100 / 30); // 370 cal per 30g = 1233 cal per 100g
        console.log(`Should be approximately: ${correctCalories} cal per 100g`);
      } else if (proteinPowder.calories < 300) {
        console.log('❌ PROTEIN POWDER CALORIES TOO LOW!');
        console.log('Expected: ~370-400 cal per 100g');
      } else {
        console.log('✅ Protein powder calories seem reasonable');
      }
    }
    
    // Summary
    console.log('\n📊 Summary:');
    console.log(`   - Total ingredients: ${ingredients.length}`);
    console.log(`   - High calorie ingredients (>300 cal): ${highCalorieIngredients.length}`);
    console.log(`   - Suspicious ingredients found: ${suspiciousCount}`);
    
    if (suspiciousIngredients.length > 0) {
      console.log('\n⚠️  Suspicious ingredients that need attention:');
      suspiciousIngredients.forEach(ing => {
        console.log(`   - ${ing.name}: ${ing.current.calories} cal (${ing.reason || 'Doesn\'t match reference'})`);
      });
    } else {
      console.log('\n✅ No suspicious high-calorie ingredients found!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkHighCalorieIngredients();




