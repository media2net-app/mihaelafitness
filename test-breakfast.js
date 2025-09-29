// Test script voor ontbijt macro berekeningen
const { calculateMealMacros } = require('./src/lib/ingredientDatabase.ts');

// Test ontbijt: 60 g oats + 200 ml almond milk + 1 banana + 15 g peanut butter
const breakfast = "60 g oats + 200 ml almond milk + 1 banana + 15 g peanut butter";

console.log("🥣 Ontbijt Macro Berekening");
console.log("==========================");
console.log(`Ontbijt: ${breakfast}`);
console.log("");

const macros = calculateMealMacros(breakfast);

console.log("📊 Resultaten:");
console.log(`   Calorieën: ${macros.calories} kcal`);
console.log(`   Eiwit: ${macros.protein}g`);
console.log(`   Koolhydraten: ${macros.carbs}g`);
console.log(`   Vet: ${macros.fat}g`);
console.log("");

// Vergelijk met verwachte waarden uit de afbeelding
console.log("🎯 Verwachte waarden (uit afbeelding):");
console.log("   Calorieën: ~400 kcal");
console.log("   Eiwit: 13g");
console.log("   Koolhydraten: 71g");
console.log("   Vet: 13g");
console.log("");

// Test individuele ingrediënten
console.log("🔍 Individuele ingrediënten:");
const ingredients = [
  "60 g oats",
  "200 ml almond milk", 
  "1 banana",
  "15 g peanut butter"
];

ingredients.forEach(ingredient => {
  const ingredientMacros = calculateMealMacros(ingredient);
  console.log(`   ${ingredient}: ${ingredientMacros.calories} kcal, P:${ingredientMacros.protein}g, C:${ingredientMacros.carbs}g, F:${ingredientMacros.fat}g`);
});
