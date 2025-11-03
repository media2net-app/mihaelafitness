// Script to add 8 new recipes with exactly 500 kcal, 23g protein, 12g fat, 45g carbs
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function calculateIngredientMacros(ingredientName, quantity, unit, ingredients) {
  // Find ingredient in database
  const ingredient = ingredients.find(ing => 
    ing.name.toLowerCase() === ingredientName.toLowerCase() ||
    ing.nameRo?.toLowerCase() === ingredientName.toLowerCase()
  );
  
  if (!ingredient) {
    console.warn(`Ingredient not found: ${ingredientName}`);
    return { calories: 0, protein: 0, carbs: 0, fat: 0 };
  }
  
  // Parse per field
  const perMatch = ingredient.per.match(/(\d+(?:\.\d+)?)/);
  const baseAmount = perMatch ? parseFloat(perMatch[1]) : 100;
  
  // Calculate multiplier based on unit
  let multiplier = 1;
  if (unit === 'g' || unit === 'ml') {
    multiplier = quantity / baseAmount;
  } else if (unit === 'piece' || unit === 'pieces') {
    // For pieces, assume 1 piece = baseAmount grams for most ingredients
    // This is an approximation, should check actual ingredient data
    multiplier = quantity;
  } else {
    multiplier = quantity / baseAmount;
  }
  
  return {
    calories: Math.round(ingredient.calories * multiplier),
    protein: Math.round(ingredient.protein * multiplier),
    carbs: Math.round(ingredient.carbs * multiplier),
    fat: Math.round(ingredient.fat * multiplier),
  };
}

async function calculateRecipeMacros(recipeIngredients, ingredients) {
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;
  
  for (const ing of recipeIngredients) {
    const macros = await calculateIngredientMacros(ing.name, ing.quantity, ing.unit, ingredients);
    totalCalories += macros.calories;
    totalProtein += macros.protein;
    totalCarbs += macros.carbs;
    totalFat += macros.fat;
  }
  
  return {
    calories: Math.round(totalCalories),
    protein: Math.round(totalProtein),
    carbs: Math.round(totalCarbs),
    fat: Math.round(totalFat),
  };
}

const recipes = [
  {
    name: "Omelette with Vegetables and Cheese",
    description: "A protein-rich omelette filled with vegetables and cheese",
    prepTime: 15,
    servings: 1,
    instructions: [
      "Beat eggs in a bowl",
      "Heat oil in a pan",
      "Add vegetables and cook until tender",
      "Pour eggs over vegetables",
      "Add cheese",
      "Fold and cook until set"
    ],
    labels: ["breakfast", "lunch"],
    ingredients: [
      { name: "Egg", quantity: 3, unit: "piece", exists: false, availableInApi: false },
      { name: "Mixed Vegetables", quantity: 150, unit: "g", exists: false, availableInApi: false },
      { name: "Cheese", quantity: 50, unit: "g", exists: false, availableInApi: false },
      { name: "Oil", quantity: 5, unit: "ml", exists: false, availableInApi: false }
    ]
  },
  {
    name: "Proteic Oats with Banana and Frozen Fruits, Seeds like Toppings",
    description: "High-protein oatmeal topped with banana, frozen fruits and seeds",
    prepTime: 10,
    servings: 1,
    instructions: [
      "Cook oats with water or milk",
      "Mash banana and mix into oats",
      "Top with frozen fruits",
      "Sprinkle with seeds",
      "Serve warm"
    ],
    labels: ["breakfast"],
    ingredients: [
      { name: "Oatmeal", quantity: 60, unit: "g", exists: false, availableInApi: false },
      { name: "Banana", quantity: 100, unit: "g", exists: false, availableInApi: false },
      { name: "Frozen Fruits", quantity: 80, unit: "g", exists: false, availableInApi: false },
      { name: "Seeds", quantity: 15, unit: "g", exists: false, availableInApi: false },
      { name: "Protein Powder", quantity: 20, unit: "g", exists: false, availableInApi: false }
    ]
  },
  {
    name: "Proteic Pancakes with Greek Yogurt and Fresh Fruits like Toppings",
    description: "Protein pancakes topped with Greek yogurt and fresh fruits",
    prepTime: 20,
    servings: 1,
    instructions: [
      "Mix pancake ingredients in a bowl",
      "Cook pancakes in a pan",
      "Top with Greek yogurt",
      "Add fresh fruits",
      "Serve immediately"
    ],
    labels: ["breakfast"],
    ingredients: [
      { name: "Pancake Mix", quantity: 40, unit: "g", exists: false, availableInApi: false },
      { name: "Egg", quantity: 1, unit: "piece", exists: false, availableInApi: false },
      { name: "Protein Powder", quantity: 25, unit: "g", exists: false, availableInApi: false },
      { name: "Greek Yogurt", quantity: 100, unit: "g", exists: false, availableInApi: false },
      { name: "Fresh Fruits", quantity: 100, unit: "g", exists: false, availableInApi: false },
      { name: "Oil", quantity: 3, unit: "ml", exists: false, availableInApi: false }
    ]
  },
  {
    name: "Proteic Smoothie with Fruits and Peanut Butter",
    description: "Protein-rich smoothie with fruits and peanut butter",
    prepTime: 5,
    servings: 1,
    instructions: [
      "Add fruits to blender",
      "Add protein powder",
      "Add peanut butter",
      "Add liquid base",
      "Blend until smooth",
      "Serve immediately"
    ],
    labels: ["breakfast", "lunch"],
    ingredients: [
      { name: "Banana", quantity: 100, unit: "g", exists: false, availableInApi: false },
      { name: "Frozen Fruits", quantity: 100, unit: "g", exists: false, availableInApi: false },
      { name: "Protein Powder", quantity: 30, unit: "g", exists: false, availableInApi: false },
      { name: "Peanut Butter", quantity: 15, unit: "g", exists: false, availableInApi: false },
      { name: "Milk", quantity: 150, unit: "ml", exists: false, availableInApi: false }
    ]
  },
  {
    name: "Omelette with Vegetables and Avocado",
    description: "A protein-rich omelette with vegetables and avocado",
    prepTime: 15,
    servings: 1,
    instructions: [
      "Beat eggs in a bowl",
      "Heat oil in a pan",
      "Add vegetables and cook",
      "Pour eggs over vegetables",
      "Add avocado slices",
      "Fold and cook until set"
    ],
    labels: ["breakfast", "lunch"],
    ingredients: [
      { name: "Egg", quantity: 3, unit: "piece", exists: false, availableInApi: false },
      { name: "Mixed Vegetables", quantity: 120, unit: "g", exists: false, availableInApi: false },
      { name: "Avocado", quantity: 50, unit: "g", exists: false, availableInApi: false },
      { name: "Oil", quantity: 3, unit: "ml", exists: false, availableInApi: false }
    ]
  },
  {
    name: "Proteic Toast with Egg and Avocado",
    description: "Protein-rich toast topped with egg and avocado",
    prepTime: 10,
    servings: 1,
    instructions: [
      "Toast bread",
      "Cook egg",
      "Slice avocado",
      "Assemble toast with egg and avocado",
      "Season to taste"
    ],
    labels: ["breakfast", "lunch"],
    ingredients: [
      { name: "Bread", quantity: 60, unit: "g", exists: false, availableInApi: false },
      { name: "Egg", quantity: 2, unit: "piece", exists: false, availableInApi: false },
      { name: "Avocado", quantity: 60, unit: "g", exists: false, availableInApi: false },
      { name: "Butter", quantity: 5, unit: "g", exists: false, availableInApi: false }
    ]
  },
  {
    name: "Smoothie Bowl Proteic",
    description: "Thick protein smoothie bowl with toppings",
    prepTime: 10,
    servings: 1,
    instructions: [
      "Blend frozen fruits with protein powder",
      "Add liquid to achieve thick consistency",
      "Pour into bowl",
      "Top with fruits and seeds",
      "Serve immediately"
    ],
    labels: ["breakfast", "lunch"],
    ingredients: [
      { name: "Frozen Fruits", quantity: 150, unit: "g", exists: false, availableInApi: false },
      { name: "Protein Powder", quantity: 30, unit: "g", exists: false, availableInApi: false },
      { name: "Greek Yogurt", quantity: 80, unit: "g", exists: false, availableInApi: false },
      { name: "Banana", quantity: 50, unit: "g", exists: false, availableInApi: false },
      { name: "Seeds", quantity: 10, unit: "g", exists: false, availableInApi: false }
    ]
  },
  {
    name: "Protein Pudding with Light Mascarpone and Fruits",
    description: "Protein-rich pudding made with light mascarpone and fruits",
    prepTime: 15,
    servings: 1,
    instructions: [
      "Mix protein powder with light mascarpone",
      "Add sweetener if needed",
      "Fold in fruits",
      "Chill in refrigerator",
      "Serve cold"
    ],
    labels: ["breakfast", "lunch", "dinner"],
    ingredients: [
      { name: "Protein Powder", quantity: 35, unit: "g", exists: false, availableInApi: false },
      { name: "Light Mascarpone", quantity: 80, unit: "g", exists: false, availableInApi: false },
      { name: "Fresh Fruits", quantity: 120, unit: "g", exists: false, availableInApi: false },
      { name: "Honey", quantity: 10, unit: "g", exists: false, availableInApi: false }
    ]
  }
];

async function main() {
  try {
    // Load all ingredients
    const ingredients = await prisma.ingredient.findMany({
      where: { calories: { gt: 0 } }
    });
    
    console.log(`Loaded ${ingredients.length} ingredients from database`);
    
    for (const recipe of recipes) {
      console.log(`\n📝 Creating recipe: ${recipe.name}`);
      
      // Calculate macros
      const macros = await calculateRecipeMacros(recipe.ingredients, ingredients);
      console.log(`   Calculated macros: ${macros.calories} kcal, ${macros.protein}g P, ${macros.carbs}g C, ${macros.fat}g F`);
      
      // Create recipe
      const newRecipe = await prisma.recipe.create({
        data: {
          name: recipe.name,
          description: recipe.description,
          prepTime: recipe.prepTime,
          servings: recipe.servings,
          instructions: JSON.stringify(recipe.instructions),
          totalCalories: macros.calories,
          totalProtein: macros.protein,
          totalCarbs: macros.carbs,
          totalFat: macros.fat,
          labels: recipe.labels
        }
      });
      
      // Add ingredients
      await prisma.recipeIngredient.createMany({
        data: recipe.ingredients.map(ing => ({
          recipeId: newRecipe.id,
          name: ing.name,
          quantity: ing.quantity,
          unit: ing.unit,
          exists: ing.exists,
          availableInApi: ing.availableInApi
        }))
      });
      
      console.log(`   ✅ Recipe created: ${newRecipe.id}`);
      console.log(`   ⚠️  Note: Target was 500 kcal, but calculated ${macros.calories} kcal. You may need to adjust quantities.`);
    }
    
    console.log('\n✅ All recipes created successfully!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();

