const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || "prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza183UkxGelFDMmU0bEIwdXVBZ0l6UlYiLCJhcGlfa2V5IjoiMDFLNjhZNTUzU0RaNUtNMkZEWTQzRkRLTTAiLCJ0ZW5hbnRfaWQiOiIyYzAxN2NiZWFmY2ZlOWUwNjViYzFjNDIyNGY2OGYxNTRjMDEyZmQxYWYzYThjZDNkMzcwNzc3ZDUzMTc4Y2FjIiwiaW50ZXJuYWxfc2VjcmV0IjoiMzBmNTc4YWMtODlhMy00MGUyLWJkMmQtZTRlMzExZDhmZjg4In0.CGXndBzIhhtw4jIGEGXEdrYI_DYOQ7mAEo3_J84GkM4"
    }
  }
});

// Betrouwbare referentiewaarden voor verificatie
const REFERENCE_VALUES = {
  'olive oil': { calories: 884, protein: 0, carbs: 0, fat: 100 },
  'coconut oil': { calories: 862, protein: 0, carbs: 0, fat: 100 },
  'egg whites': { calories: 52, protein: 10.9, carbs: 0.7, fat: 0.2 },
  'chicken breast': { calories: 165, protein: 31, carbs: 0, fat: 3.6 },
  'banana': { calories: 89, protein: 1.1, carbs: 22.8, fat: 0.3 },
  'almond butter': { calories: 614, protein: 21.2, carbs: 18.8, fat: 55.5 },
  'almonds': { calories: 579, protein: 21.2, carbs: 21.6, fat: 49.9 },
  'avocado': { calories: 160, protein: 2, carbs: 8.5, fat: 14.7 },
  'broccoli': { calories: 34, protein: 2.8, carbs: 6.6, fat: 0.4 },
  'spinach': { calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4 },
  'sweet potato': { calories: 86, protein: 1.6, carbs: 20.1, fat: 0.1 },
  'quinoa': { calories: 120, protein: 4.4, carbs: 22, fat: 1.9 },
  'salmon': { calories: 208, protein: 25.4, carbs: 0, fat: 12.4 },
  'greek yogurt': { calories: 59, protein: 10, carbs: 3.6, fat: 0.4 },
  'protein powder': { calories: 370, protein: 80, carbs: 5, fat: 3 }
};

async function testIngredientsDatabase() {
  try {
    console.log('🧪 Testing updated ingredients database...\n');
    
    // Haal alle ingredienten op
    const ingredients = await prisma.ingredient.findMany({
      orderBy: { name: 'asc' }
    });
    
    console.log(`📊 Total ingredients in database: ${ingredients.length}\n`);
    
    // Test 1: Check if all ingredients are standardized to per 100g
    console.log('🔍 Test 1: Unit Standardization');
    const nonStandardUnits = ingredients.filter(ing => ing.per !== '100g');
    if (nonStandardUnits.length === 0) {
      console.log('✅ All ingredients are standardized to per 100g\n');
    } else {
      console.log(`❌ ${nonStandardUnits.length} ingredients still have non-standard units:`);
      nonStandardUnits.forEach(ing => console.log(`   - ${ing.name}: ${ing.per}`));
      console.log('');
    }
    
    // Test 2: Verify key ingredients against reference values
    console.log('🔍 Test 2: Reference Value Verification');
    let correctCount = 0;
    let incorrectCount = 0;
    const incorrectIngredients = [];
    
    for (const [name, refValues] of Object.entries(REFERENCE_VALUES)) {
      const ingredient = ingredients.find(ing => ing.name.toLowerCase() === name.toLowerCase());
      
      if (ingredient) {
        const isCorrect = 
          Math.abs(ingredient.calories - refValues.calories) <= 5 &&
          Math.abs(ingredient.protein - refValues.protein) <= 0.5 &&
          Math.abs(ingredient.carbs - refValues.carbs) <= 0.5 &&
          Math.abs(ingredient.fat - refValues.fat) <= 0.5;
        
        if (isCorrect) {
          console.log(`✅ ${ingredient.name}: Values match reference`);
          correctCount++;
        } else {
          console.log(`❌ ${ingredient.name}: Values don't match reference`);
          console.log(`   Database: ${ingredient.calories} cal, ${ingredient.protein}g protein, ${ingredient.carbs}g carbs, ${ingredient.fat}g fat`);
          console.log(`   Reference: ${refValues.calories} cal, ${refValues.protein}g protein, ${refValues.carbs}g carbs, ${refValues.fat}g fat`);
          incorrectCount++;
          incorrectIngredients.push(ingredient.name);
        }
      } else {
        console.log(`⚠️  ${name}: Not found in database`);
      }
    }
    
    console.log(`\n📈 Reference Test Results: ${correctCount} correct, ${incorrectCount} incorrect\n`);
    
    // Test 3: Check for obviously wrong values
    console.log('🔍 Test 3: Obvious Error Detection');
    const suspiciousIngredients = [];
    
    ingredients.forEach(ingredient => {
      // Check for impossible values
      if (ingredient.calories < 0 || ingredient.calories > 1000) {
        suspiciousIngredients.push(`${ingredient.name}: Impossible calories (${ingredient.calories})`);
      }
      if (ingredient.protein < 0 || ingredient.protein > 100) {
        suspiciousIngredients.push(`${ingredient.name}: Impossible protein (${ingredient.protein}g)`);
      }
      if (ingredient.carbs < 0 || ingredient.carbs > 100) {
        suspiciousIngredients.push(`${ingredient.name}: Impossible carbs (${ingredient.carbs}g)`);
      }
      if (ingredient.fat < 0 || ingredient.fat > 100) {
        suspiciousIngredients.push(`${ingredient.name}: Impossible fat (${ingredient.fat}g)`);
      }
      
      // Check for missing fiber/sugar when they should be present
      if (ingredient.category === 'fruits' && (!ingredient.fiber || ingredient.fiber === 0)) {
        suspiciousIngredients.push(`${ingredient.name}: Fruit with no fiber`);
      }
      if (ingredient.category === 'vegetables' && (!ingredient.fiber || ingredient.fiber === 0)) {
        suspiciousIngredients.push(`${ingredient.name}: Vegetable with no fiber`);
      }
    });
    
    if (suspiciousIngredients.length === 0) {
      console.log('✅ No obviously wrong values detected\n');
    } else {
      console.log(`⚠️  ${suspiciousIngredients.length} potentially problematic values:`);
      suspiciousIngredients.forEach(issue => console.log(`   - ${issue}`));
      console.log('');
    }
    
    // Test 4: Category distribution
    console.log('🔍 Test 4: Category Distribution');
    const categoryCount = {};
    ingredients.forEach(ingredient => {
      const category = ingredient.category || 'uncategorized';
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    });
    
    console.log('Category distribution:');
    Object.entries(categoryCount)
      .sort(([,a], [,b]) => b - a)
      .forEach(([category, count]) => {
        console.log(`   ${category}: ${count} ingredients`);
      });
    console.log('');
    
    // Test 5: Sample of corrected ingredients
    console.log('🔍 Test 5: Sample of Key Ingredients');
    const keyIngredients = ['olive oil', 'egg whites', 'chicken breast', 'banana', 'almond butter', 'chia seeds'];
    
    keyIngredients.forEach(name => {
      const ingredient = ingredients.find(ing => ing.name.toLowerCase() === name.toLowerCase());
      if (ingredient) {
        console.log(`${ingredient.name}:`);
        console.log(`   ${ingredient.calories} cal, ${ingredient.protein}g protein, ${ingredient.carbs}g carbs, ${ingredient.fat}g fat`);
        console.log(`   Fiber: ${ingredient.fiber || 0}g, Sugar: ${ingredient.sugar || 0}g`);
        console.log(`   Unit: ${ingredient.per}, Category: ${ingredient.category || 'N/A'}`);
        console.log('');
      }
    });
    
    // Final summary
    console.log('📊 Final Database Status:');
    console.log(`   - Total ingredients: ${ingredients.length}`);
    console.log(`   - Standardized to per 100g: ${ingredients.filter(ing => ing.per === '100g').length}`);
    console.log(`   - Reference tests passed: ${correctCount}/${Object.keys(REFERENCE_VALUES).length}`);
    console.log(`   - Suspicious values: ${suspiciousIngredients.length}`);
    
    if (incorrectCount === 0 && suspiciousIngredients.length === 0) {
      console.log('\n🎉 Database validation PASSED! All ingredients appear to be correctly formatted.');
    } else {
      console.log('\n⚠️  Database validation found some issues that may need attention.');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testIngredientsDatabase();




