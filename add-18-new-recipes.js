// Script to add 18 new recipes
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findIngredient(ingredientName, ingredients) {
  const cleanName = ingredientName.toLowerCase().trim();
  
  // Try exact match first
  let ingredient = ingredients.find(ing => 
    ing.name?.toLowerCase() === cleanName ||
    ing.nameRo?.toLowerCase() === cleanName
  );
  
  if (!ingredient) {
    // Try partial match
    ingredient = ingredients.find(ing => {
      const name = (ing.name || '').toLowerCase();
      const nameRo = (ing.nameRo || '').toLowerCase();
      return name.includes(cleanName) || cleanName.includes(name) ||
             nameRo.includes(cleanName) || cleanName.includes(nameRo);
    });
  }
  
  return ingredient;
}

function calculateMacros(ingredient, quantity, unit) {
  if (!ingredient) return { calories: 0, protein: 0, carbs: 0, fat: 0 };
  
  let multiplier = 1;
  const per = (ingredient.per || '100g').toLowerCase();
  
  // Handle "1 scoop (15g)" format
  if (per.includes('scoop')) {
    const scoopMatch = per.match(/(\d+(?:\.\d+)?)\s*g/);
    if (scoopMatch) {
      const scoopGrams = parseFloat(scoopMatch[1]);
      if (unit === 'g') {
        multiplier = quantity / scoopGrams;
      } else if (unit === 'scoop' || unit === 'scoops') {
        multiplier = quantity;
      }
    }
  }
  // Handle "1" format (for pieces like eggs)
  else if (per === '1' || per.match(/^1\s*(piece|unit|egg)$/)) {
    multiplier = quantity;
  }
  // Handle "100g" or "100ml" format
  else {
    const perMatch = per.match(/(\d+(?:\.\d+)?)/);
    const baseAmount = perMatch ? parseFloat(perMatch[1]) : 100;
    if (unit === 'g' || unit === 'ml') {
      multiplier = quantity / baseAmount;
    } else if (unit === 'piece' || unit === 'pieces') {
      // Estimate piece weight (e.g., 1 egg ≈ 50g)
      multiplier = (quantity * 50) / baseAmount;
    }
  }
  
  return {
    calories: Math.round(ingredient.calories * multiplier),
    protein: Math.round(ingredient.protein * multiplier * 10) / 10,
    carbs: Math.round(ingredient.carbs * multiplier * 10) / 10,
    fat: Math.round(ingredient.fat * multiplier * 10) / 10,
  };
}

const recipes = [
  {
    name: "Low Carb Pancakes",
    description: "Low carb pancakes with protein powder",
    prepTime: 15,
    servings: 1,
    labels: ["breakfast"],
    instructions: [
      "Mix eggs, baking powder, almond flour, and protein powder",
      "Cook pancakes in a pan",
      "Serve with toppings: peanut butter, coconut flakes, and raspberries"
    ],
    ingredients: [
      { name: "Egg", quantity: 2, unit: "piece" },
      { name: "Baking Powder", quantity: 3, unit: "g" },
      { name: "Almond Flour", quantity: 50, unit: "g" },
      { name: "Protein Powder", quantity: 15, unit: "g" },
      { name: "Peanut Butter", quantity: 15, unit: "g" },
      { name: "Coconut Flakes", quantity: 10, unit: "g" },
      { name: "Raspberries", quantity: 50, unit: "g" }
    ]
  },
  {
    name: "Waffles",
    description: "Protein waffles with quinoa and rye flour",
    prepTime: 20,
    servings: 1,
    labels: ["breakfast"],
    instructions: [
      "Mix quinoa flour, rye flour, eggs, coconut milk, baking powder, lemon peel, and protein powder",
      "Cook in waffle maker",
      "Serve with yogurt, blueberries, and peanut butter"
    ],
    ingredients: [
      { name: "Quinoa Flour", quantity: 50, unit: "g" },
      { name: "Rye Flour", quantity: 30, unit: "g" },
      { name: "Egg", quantity: 2, unit: "piece" },
      { name: "Coconut Milk", quantity: 50, unit: "ml" },
      { name: "Baking Powder", quantity: 3, unit: "g" },
      { name: "Lemon Peel", quantity: 2, unit: "g" },
      { name: "Protein Powder", quantity: 30, unit: "g" },
      { name: "Greek Yogurt", quantity: 50, unit: "g" },
      { name: "Blueberries", quantity: 50, unit: "g" },
      { name: "Peanut Butter", quantity: 15, unit: "g" }
    ]
  },
  {
    name: "Protein Pancakes",
    description: "High protein pancakes with quinoa and banana",
    prepTime: 15,
    servings: 1,
    labels: ["breakfast"],
    instructions: [
      "Mix quinoa flour, rye flour, protein powder, mashed banana, eggs, baking powder, and chia seeds",
      "Cook pancakes in a pan",
      "Serve with strawberries, blueberries, and yogurt"
    ],
    ingredients: [
      { name: "Quinoa Flour", quantity: 40, unit: "g" },
      { name: "Rye Flour", quantity: 10, unit: "g" },
      { name: "Protein Powder", quantity: 30, unit: "g" },
      { name: "Banana", quantity: 100, unit: "g" },
      { name: "Egg", quantity: 3, unit: "piece" },
      { name: "Baking Powder", quantity: 3, unit: "g" },
      { name: "Chia Seeds", quantity: 5, unit: "g" },
      { name: "Strawberries", quantity: 50, unit: "g" },
      { name: "Blueberries", quantity: 50, unit: "g" },
      { name: "Greek Yogurt", quantity: 50, unit: "g" }
    ]
  },
  {
    name: "Protein Chocolate Waffles",
    description: "Chocolate protein waffles with coffee essence",
    prepTime: 20,
    servings: 1,
    labels: ["breakfast"],
    instructions: [
      "Mix whole wheat flour, protein powder, rye flour, baking powder, cacao, egg whites, vanilla essence, and coffee essence",
      "Cook in waffle maker",
      "Serve with Greek yogurt, banana, pecan nuts, and honey"
    ],
    ingredients: [
      { name: "Whole Wheat Flour", quantity: 40, unit: "g" },
      { name: "Protein Powder", quantity: 30, unit: "g" },
      { name: "Rye Flour", quantity: 40, unit: "g" },
      { name: "Baking Powder", quantity: 3, unit: "g" },
      { name: "Cocoa Powder", quantity: 5, unit: "g" },
      { name: "Egg White", quantity: 200, unit: "ml" },
      { name: "Vanilla Extract", quantity: 2, unit: "g" },
      { name: "Coffee", quantity: 2, unit: "g" },
      { name: "Greek Yogurt", quantity: 100, unit: "g" },
      { name: "Banana", quantity: 50, unit: "g" },
      { name: "Pecan Nuts", quantity: 10, unit: "g" },
      { name: "Honey", quantity: 10, unit: "g" }
    ]
  },
  {
    name: "High Protein Pizza",
    description: "Pizza with chicken breast base",
    prepTime: 45,
    servings: 1,
    labels: ["lunch", "dinner"],
    instructions: [
      "Mix minced chicken breast with salt, pepper, egg, and semolina for the base",
      "Shape into pizza base and bake at 220 degrees for 35-40 minutes",
      "Top with light mozzarella, tomato sauce, green olives, mushrooms, oregano, and chili"
    ],
    ingredients: [
      { name: "Chicken Breast", quantity: 250, unit: "g" },
      { name: "Salt", quantity: 1, unit: "g" },
      { name: "Black Pepper", quantity: 1, unit: "g" },
      { name: "Egg", quantity: 1, unit: "piece" },
      { name: "Semolina", quantity: 20, unit: "g" },
      { name: "Light Mozzarella", quantity: 125, unit: "g" },
      { name: "Tomato Sauce", quantity: 100, unit: "g" },
      { name: "Green Olives", quantity: 15, unit: "g" },
      { name: "Mushrooms", quantity: 50, unit: "g" },
      { name: "Oregano", quantity: 1, unit: "g" },
      { name: "Chili Powder", quantity: 1, unit: "g" }
    ]
  },
  {
    name: "Protein Muffins",
    description: "High protein muffins with coconut milk",
    prepTime: 25,
    servings: 1,
    labels: ["breakfast", "snack"],
    instructions: [
      "Mix egg whites, eggs, wholemeal flour, coconut milk, protein powder, and baking powder",
      "Bake in muffin tin",
      "Top with blueberries, nuts, coconut flakes, banana, and plums"
    ],
    ingredients: [
      { name: "Egg White", quantity: 150, unit: "g" },
      { name: "Egg", quantity: 2, unit: "piece" },
      { name: "Whole Wheat Flour", quantity: 100, unit: "g" },
      { name: "Coconut Milk", quantity: 100, unit: "ml" },
      { name: "Protein Powder", quantity: 60, unit: "g" },
      { name: "Baking Powder", quantity: 5, unit: "g" },
      { name: "Blueberries", quantity: 30, unit: "g" },
      { name: "Walnuts", quantity: 10, unit: "g" },
      { name: "Coconut Flakes", quantity: 5, unit: "g" },
      { name: "Banana", quantity: 50, unit: "g" },
      { name: "Plums", quantity: 50, unit: "g" }
    ]
  },
  {
    name: "Protein Tart with Plums",
    description: "Protein tart with plums",
    prepTime: 30,
    servings: 1,
    labels: ["breakfast", "snack"],
    instructions: [
      "Mix egg, oat flakes, protein powder, baking powder, and plant-based milk",
      "Shape into tart base",
      "Add plums and bake"
    ],
    ingredients: [
      { name: "Egg", quantity: 1, unit: "piece" },
      { name: "Oats", quantity: 40, unit: "g" },
      { name: "Protein Powder", quantity: 20, unit: "g" },
      { name: "Baking Powder", quantity: 5, unit: "g" },
      { name: "Almond Milk", quantity: 100, unit: "ml" },
      { name: "Plums", quantity: 100, unit: "g" }
    ]
  },
  {
    name: "Protein Papanases",
    description: "Romanian protein papanases with cottage cheese",
    prepTime: 30,
    servings: 1,
    labels: ["breakfast", "snack"],
    instructions: [
      "Mix rye flour, eggs, cottage cheese, and protein powder",
      "Shape into papanases",
      "Brush with egg, add fruits, and bake at 200 degrees for 25 minutes"
    ],
    ingredients: [
      { name: "Rye Flour", quantity: 40, unit: "g" },
      { name: "Egg", quantity: 2, unit: "piece" },
      { name: "Cottage Cheese", quantity: 200, unit: "g" },
      { name: "Protein Powder", quantity: 30, unit: "g" },
      { name: "Mixed Berries", quantity: 50, unit: "g" }
    ]
  },
  {
    name: "Pancakes with Banana and Cinnamon",
    description: "Oat pancakes with protein topping",
    prepTime: 15,
    servings: 1,
    labels: ["breakfast"],
    instructions: [
      "Mix oat flakes, baking powder, plant-based milk, and eggs for pancakes",
      "Mix protein powder with plant-based milk for protein topping",
      "Cook pancakes and serve with protein topping, yogurt, and banana"
    ],
    ingredients: [
      { name: "Oats", quantity: 40, unit: "g" },
      { name: "Baking Powder", quantity: 3, unit: "g" },
      { name: "Almond Milk", quantity: 50, unit: "ml" },
      { name: "Egg", quantity: 2, unit: "piece" },
      { name: "Cinnamon", quantity: 2, unit: "g" },
      { name: "Protein Powder", quantity: 30, unit: "g" },
      { name: "Almond Milk", quantity: 60, unit: "ml" },
      { name: "Greek Yogurt", quantity: 100, unit: "g" },
      { name: "Banana", quantity: 50, unit: "g" }
    ]
  },
  {
    name: "Banana Bread",
    description: "Protein banana bread with pecan nuts",
    prepTime: 45,
    servings: 1,
    labels: ["breakfast", "snack"],
    instructions: [
      "Mix eggs, oat flakes, protein powder, plant-based milk, very ripe bananas, baking powder, and rum essence",
      "Top with 2 bananas and pecan nuts",
      "Bake in oven for 35-40 minutes at 180 degrees"
    ],
    ingredients: [
      { name: "Egg", quantity: 3, unit: "piece" },
      { name: "Oats", quantity: 100, unit: "g" },
      { name: "Protein Powder", quantity: 60, unit: "g" },
      { name: "Almond Milk", quantity: 150, unit: "ml" },
      { name: "Banana", quantity: 150, unit: "g" },
      { name: "Baking Powder", quantity: 5, unit: "g" },
      { name: "Rum Extract", quantity: 2, unit: "g" },
      { name: "Banana", quantity: 200, unit: "g" },
      { name: "Pecan Nuts", quantity: 15, unit: "g" }
    ]
  },
  {
    name: "Protein Pancakes Classic",
    description: "Classic protein pancakes with oat flakes",
    prepTime: 15,
    servings: 1,
    labels: ["breakfast"],
    instructions: [
      "Mix eggs, plant-based milk, protein powder, oat flakes, and baking powder",
      "Cook pancakes in a pan",
      "Serve with blueberries, walnuts, and peanut butter"
    ],
    ingredients: [
      { name: "Egg", quantity: 2, unit: "piece" },
      { name: "Almond Milk", quantity: 70, unit: "ml" },
      { name: "Protein Powder", quantity: 30, unit: "g" },
      { name: "Oats", quantity: 80, unit: "g" },
      { name: "Baking Powder", quantity: 5, unit: "g" },
      { name: "Blueberries", quantity: 50, unit: "g" },
      { name: "Walnuts", quantity: 10, unit: "g" },
      { name: "Peanut Butter", quantity: 15, unit: "g" }
    ]
  },
  {
    name: "Protein Pancakes with Frozen Fruits",
    description: "Protein pancakes with frozen fruits",
    prepTime: 15,
    servings: 1,
    labels: ["breakfast"],
    instructions: [
      "Mix protein powder, eggs, oat flakes, plant-based milk, and baking powder",
      "Add frozen fruits",
      "Cook pancakes and serve"
    ],
    ingredients: [
      { name: "Protein Powder", quantity: 30, unit: "g" },
      { name: "Egg", quantity: 2, unit: "piece" },
      { name: "Oats", quantity: 80, unit: "g" },
      { name: "Almond Milk", quantity: 70, unit: "ml" },
      { name: "Baking Powder", quantity: 5, unit: "g" },
      { name: "Frozen Mixed Berries", quantity: 40, unit: "g" }
    ]
  },
  {
    name: "Protein Pancakes Berry",
    description: "Protein pancakes with berries",
    prepTime: 15,
    servings: 1,
    labels: ["breakfast"],
    instructions: [
      "Mix oat flakes, eggs, plant-based milk, protein powder, and baking powder",
      "Cook pancakes in a pan",
      "Serve with blueberries, strawberries, and honey"
    ],
    ingredients: [
      { name: "Oats", quantity: 50, unit: "g" },
      { name: "Egg", quantity: 2, unit: "piece" },
      { name: "Almond Milk", quantity: 100, unit: "ml" },
      { name: "Protein Powder", quantity: 30, unit: "g" },
      { name: "Baking Powder", quantity: 3, unit: "g" },
      { name: "Blueberries", quantity: 50, unit: "g" },
      { name: "Strawberries", quantity: 50, unit: "g" },
      { name: "Honey", quantity: 10, unit: "g" }
    ]
  },
  {
    name: "High Protein Cottage Cheese Pancakes",
    description: "Cottage cheese pancakes with mango",
    prepTime: 15,
    servings: 1,
    labels: ["breakfast"],
    instructions: [
      "Mix eggs, plant-based milk, protein powder, baking powder, oat flakes, and cottage cheese",
      "Cook pancakes in a pan",
      "Serve with mango, strawberries, and mango sauce"
    ],
    ingredients: [
      { name: "Egg", quantity: 2, unit: "piece" },
      { name: "Almond Milk", quantity: 130, unit: "ml" },
      { name: "Protein Powder", quantity: 30, unit: "g" },
      { name: "Baking Powder", quantity: 5, unit: "g" },
      { name: "Oats", quantity: 50, unit: "g" },
      { name: "Cottage Cheese", quantity: 150, unit: "g" },
      { name: "Mango", quantity: 80, unit: "g" },
      { name: "Strawberries", quantity: 50, unit: "g" },
      { name: "Mango Puree", quantity: 30, unit: "g" }
    ]
  },
  {
    name: "Vanilla Waffle",
    description: "Vanilla waffles with cinnamon and lemon",
    prepTime: 20,
    servings: 1,
    labels: ["breakfast"],
    instructions: [
      "Mix oat flakes, banana, protein powder, cinnamon, dry lemon, eggs, plant-based milk, and baking powder",
      "Cook in waffle maker",
      "Serve with blueberries, green apple, honey, Greek yogurt, and peanut butter"
    ],
    ingredients: [
      { name: "Oats", quantity: 50, unit: "g" },
      { name: "Banana", quantity: 100, unit: "g" },
      { name: "Protein Powder", quantity: 30, unit: "g" },
      { name: "Cinnamon", quantity: 2, unit: "g" },
      { name: "Lemon Peel", quantity: 2, unit: "g" },
      { name: "Egg", quantity: 2, unit: "piece" },
      { name: "Almond Milk", quantity: 50, unit: "ml" },
      { name: "Baking Powder", quantity: 5, unit: "g" },
      { name: "Blueberries", quantity: 50, unit: "g" },
      { name: "Green Apple", quantity: 20, unit: "g" },
      { name: "Honey", quantity: 5, unit: "g" },
      { name: "Greek Yogurt", quantity: 100, unit: "g" },
      { name: "Peanut Butter", quantity: 10, unit: "g" }
    ]
  },
  {
    name: "Blueberry Pancakes",
    description: "Blueberry pancakes with vanilla essence",
    prepTime: 15,
    servings: 1,
    labels: ["breakfast"],
    instructions: [
      "Mix oat flakes, coconut milk, protein powder, baking powder, vanilla essence, and blueberries",
      "Cook pancakes in a pan",
      "Serve with Greek yogurt and peach jam"
    ],
    ingredients: [
      { name: "Oats", quantity: 50, unit: "g" },
      { name: "Coconut Milk", quantity: 60, unit: "ml" },
      { name: "Protein Powder", quantity: 20, unit: "g" },
      { name: "Baking Powder", quantity: 5, unit: "g" },
      { name: "Vanilla Extract", quantity: 8, unit: "g" },
      { name: "Blueberries", quantity: 50, unit: "g" },
      { name: "Greek Yogurt", quantity: 30, unit: "g" },
      { name: "Peach Jam", quantity: 30, unit: "g" }
    ]
  }
];

async function addRecipes() {
  try {
    console.log('Loading all ingredients...');
    const allIngredients = await prisma.ingredient.findMany();
    console.log(`Found ${allIngredients.length} ingredients in database`);

    for (const recipeData of recipes) {
      console.log(`\n📝 Processing recipe: ${recipeData.name}`);
      
      // Calculate total macros
      let totalCalories = 0;
      let totalProtein = 0;
      let totalCarbs = 0;
      let totalFat = 0;
      
      const recipeIngredients = [];
      
      for (const ing of recipeData.ingredients) {
        const ingredient = await findIngredient(ing.name, allIngredients);
        
        if (!ingredient) {
          console.log(`⚠️  Ingredient not found: ${ing.name} - will add with 0 macros`);
          recipeIngredients.push({
            name: ing.name,
            quantity: ing.quantity,
            unit: ing.unit,
            exists: false,
            availableInApi: false
          });
          continue;
        }
        
        const macros = calculateMacros(ingredient, ing.quantity, ing.unit);
        totalCalories += macros.calories;
        totalProtein += macros.protein;
        totalCarbs += macros.carbs;
        totalFat += macros.fat;
        
        recipeIngredients.push({
          name: ing.name,
          quantity: ing.quantity,
          unit: ing.unit,
          exists: true,
          availableInApi: true,
          apiMatch: JSON.stringify({
            id: ingredient.id,
            name: ingredient.name,
            nameRo: ingredient.nameRo
          })
        });
      }
      
      // Create recipe
      const recipe = await prisma.recipe.create({
        data: {
          name: recipeData.name,
          description: recipeData.description || '',
          prepTime: recipeData.prepTime,
          servings: recipeData.servings || 1,
          instructions: JSON.stringify(recipeData.instructions || []),
          totalCalories: Math.round(totalCalories),
          totalProtein: Math.round(totalProtein * 10) / 10,
          totalCarbs: Math.round(totalCarbs * 10) / 10,
          totalFat: Math.round(totalFat * 10) / 10,
          labels: recipeData.labels || []
        }
      });
      
      // Add ingredients
      await prisma.recipeIngredient.createMany({
        data: recipeIngredients.map(ing => ({
          recipeId: recipe.id,
          name: ing.name,
          quantity: ing.quantity,
          unit: ing.unit,
          exists: ing.exists,
          availableInApi: ing.availableInApi,
          apiMatch: ing.apiMatch || null
        }))
      });
      
      console.log(`✅ Created recipe: ${recipeData.name}`);
      console.log(`   Calories: ${totalCalories}, Protein: ${totalProtein.toFixed(1)}g, Carbs: ${totalCarbs.toFixed(1)}g, Fat: ${totalFat.toFixed(1)}g`);
    }
    
    console.log('\n🎉 All recipes added successfully!');
  } catch (error) {
    console.error('❌ Error adding recipes:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

addRecipes();






