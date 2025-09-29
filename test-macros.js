// Test macro berekeningen voor maandag ontbijt
console.log("🧪 Testing Macro Calculations for Monday Breakfast");
console.log("==================================================");

// Simuleer de ingredient database functie
const testMeal = "60 g oats + 200 ml almond milk + 1 banana + 15 g peanut butter";

console.log(`Test meal: ${testMeal}`);
console.log("");

// Handmatige berekeningen gebaseerd op ingredient database
const ingredients = [
  { name: "oats", amount: 60, calories: 233, protein: 10.2, carbs: 39.6, fat: 4.2 },
  { name: "almond milk", amount: 200, calories: 30, protein: 1.2, carbs: 1.2, fat: 2.2 },
  { name: "banana", amount: 1, calories: 105, protein: 1.3, carbs: 27, fat: 0.4 },
  { name: "peanut butter", amount: 15, calories: 88, protein: 3.8, carbs: 3, fat: 7.5 }
];

let totalCalories = 0;
let totalProtein = 0;
let totalCarbs = 0;
let totalFat = 0;

console.log("📊 Ingredient Breakdown:");
ingredients.forEach(ingredient => {
  console.log(`${ingredient.name} (${ingredient.amount}g/ml):`);
  console.log(`  Calories: ${ingredient.calories} kcal`);
  console.log(`  Protein: ${ingredient.protein}g`);
  console.log(`  Carbs: ${ingredient.carbs}g`);
  console.log(`  Fat: ${ingredient.fat}g`);
  console.log("");
  
  totalCalories += ingredient.calories;
  totalProtein += ingredient.protein;
  totalCarbs += ingredient.carbs;
  totalFat += ingredient.fat;
});

console.log("🎯 TOTAAL ONTBIJT:");
console.log(`   Calories: ${totalCalories} kcal`);
console.log(`   Protein: ${totalProtein}g`);
console.log(`   Carbs: ${totalCarbs}g`);
console.log(`   Fat: ${totalFat}g`);
console.log("");

console.log("📋 Verwachte waarden (uit afbeelding):");
console.log("   Calories: ~400 kcal");
console.log("   Protein: 13g");
console.log("   Carbs: 71g");
console.log("   Fat: 13g");
console.log("");

console.log("✅ Vergelijking:");
console.log(`   Calories: ${totalCalories} vs ~400 (${totalCalories > 380 && totalCalories < 420 ? '✅' : '❌'})`);
console.log(`   Protein: ${totalProtein}g vs 13g (${Math.abs(totalProtein - 13) < 2 ? '✅' : '❌'})`);
console.log(`   Carbs: ${totalCarbs}g vs 71g (${Math.abs(totalCarbs - 71) < 5 ? '✅' : '❌'})`);
console.log(`   Fat: ${totalFat}g vs 13g (${Math.abs(totalFat - 13) < 2 ? '✅' : '❌'})`);
