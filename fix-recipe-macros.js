// Script to calculate and fix recipe macros
// Target: 500 kcal, 23g protein, 12g fat, 45g carbs

// Ingredient database values per 100g
const ingredients = {
  'Wrap whole wheat (60 grame)': { kcal: 180, p: 6, c: 32, f: 3, per: 1 }, // per piece
  'Chicken Breast': { kcal: 165, p: 31, c: 0, f: 3.6 },
  'Brown Rice (cooked)': { kcal: 111, p: 2.6, c: 23, f: 0.9 },
  'Avocado': { kcal: 160, p: 2, c: 8.5, f: 14.7 },
  'Cheddar Cheese': { kcal: 403, p: 25, c: 1.3, f: 33 },
  'Salad': { kcal: 15, p: 1.4, c: 2.9, f: 0 },
  'Turkey Breast': { kcal: 135, p: 30, c: 0, f: 1 },
  'Sweet Potato': { kcal: 86, p: 1.6, c: 20.1, f: 0.1 },
  'Beef': { kcal: 250, p: 26, c: 0, f: 15 },
  'Bell Pepper': { kcal: 20, p: 0.9, c: 4.6, f: 0.2 },
  'Onion': { kcal: 40, p: 1.1, c: 9.3, f: 0.1 },
  'Mushrooms': { kcal: 22, p: 3.1, c: 3.3, f: 0.3 },
  'Tomato': { kcal: 18, p: 0.9, c: 3.9, f: 0.2 },
  '1 Egg': { kcal: 78, p: 6.5, c: 0.6, f: 5.5, per: 1 }, // per piece
  'Spinach': { kcal: 23, p: 2.9, c: 3.6, f: 0.4 },
  'Pork': { kcal: 242, p: 27.3, c: 0, f: 13.9 },
  'Broccoli': { kcal: 34, p: 2.8, c: 6.6, f: 0.4 },
  'Carrot': { kcal: 41, p: 0.9, c: 9.6, f: 0.2 },
  'Salmon': { kcal: 208, p: 25.4, c: 0, f: 12.4 },
  'Asparagus': { kcal: 20, p: 2.2, c: 4, f: 0.1 },
  'Potato': { kcal: 77, p: 2, c: 17.5, f: 0.1 },
  'Quinoa': { kcal: 120, p: 4.4, c: 22, f: 1.9 },
  'Cucumber': { kcal: 16, p: 0.7, c: 3.6, f: 0.1 },
  'Lentils': { kcal: 116, p: 9, c: 20, f: 0.4 },
  'Pasta (cooked)': { kcal: 131, p: 5, c: 25, f: 1.1 },
  'Olive Oil': { kcal: 884, p: 0, c: 0, f: 100 }
};

function calculateRecipe(recipeIngs) {
  let total = { kcal: 0, p: 0, c: 0, f: 0 };
  
  for (const ing of recipeIngs) {
    const ingData = ingredients[ing.name];
    if (!ingData) {
      console.warn(`Unknown ingredient: ${ing.name}`);
      continue;
    }
    
    const multiplier = ingData.per ? 
      (ing.quantity / ingData.per) : 
      (ing.quantity / 100);
    
    total.kcal += (ingData.kcal || 0) * multiplier;
    total.p += (ingData.p || 0) * multiplier;
    total.c += (ingData.c || 0) * multiplier;
    total.f += (ingData.f || 0) * multiplier;
  }
  
  return {
    kcal: Math.round(total.kcal * 10) / 10,
    protein: Math.round(total.p * 10) / 10,
    carbs: Math.round(total.c * 10) / 10,
    fat: Math.round(total.f * 10) / 10
  };
}

// Test calculation
const testRecipe = [
  { name: 'Chicken Breast', quantity: 60, unit: 'g' },
  { name: 'Brown Rice (cooked)', quantity: 65, unit: 'g' },
  { name: 'Avocado', quantity: 40, unit: 'g' },
  { name: 'Cheddar Cheese', quantity: 8, unit: 'g' },
  { name: 'Salad', quantity: 30, unit: 'g' }
];

const result = calculateRecipe(testRecipe);
console.log('Test calculation:');
console.log('Calories:', result.kcal);
console.log('Protein:', result.protein, 'g');
console.log('Carbs:', result.carbs, 'g');
console.log('Fat:', result.fat, 'g');

