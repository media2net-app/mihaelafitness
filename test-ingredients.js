// Test script to demonstrate ingredient database accuracy
const { calculateMealMacros } = require('./src/lib/ingredientDatabase.ts');

// Test cases from your nutrition plans
const testMeals = [
  "120 g grilled chicken breast + 150 g sweet potato + green salad + 10 g olive oil",
  "1 cup oats + 1 banana + 1 tbsp peanut butter + 1 cup almond milk",
  "150 g salmon + 100 g quinoa + steamed broccoli + 1/2 avocado",
  "2 eggs + 2 egg whites + 1 slice whole grain bread + 1/2 avocado"
];

console.log("🧪 Testing Ingredient Database Accuracy\n");

testMeals.forEach((meal, index) => {
  console.log(`Test ${index + 1}: ${meal}`);
  const macros = calculateMealMacros(meal);
  console.log(`📊 Results:`);
  console.log(`   Calories: ${macros.calories} kcal`);
  console.log(`   Protein: ${macros.protein}g`);
  console.log(`   Carbs: ${macros.carbs}g`);
  console.log(`   Fat: ${macros.fat}g`);
  console.log("---");
});
