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
      { name: "Egg", quantity: 3, unit: "piece" },
      { name: "Mixed Vegetables", quantity: 150, unit: "g" },
      { name: "Cheese", quantity: 50, unit: "g" },
      { name: "Oil", quantity: 5, unit: "ml" }
    ],
    targetMacros: { calories: 500, protein: 23, fat: 12, carbs: 45 }
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
      { name: "Oatmeal", quantity: 60, unit: "g" },
      { name: "Banana", quantity: 100, unit: "g" },
      { name: "Frozen Fruits", quantity: 80, unit: "g" },
      { name: "Seeds", quantity: 15, unit: "g" },
      { name: "Protein Powder", quantity: 20, unit: "g" }
    ],
    targetMacros: { calories: 500, protein: 23, fat: 12, carbs: 45 }
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
      { name: "Pancake Mix", quantity: 40, unit: "g" },
      { name: "Egg", quantity: 1, unit: "piece" },
      { name: "Protein Powder", quantity: 25, unit: "g" },
      { name: "Greek Yogurt", quantity: 100, unit: "g" },
      { name: "Fresh Fruits", quantity: 100, unit: "g" },
      { name: "Oil", quantity: 3, unit: "ml" }
    ],
    targetMacros: { calories: 500, protein: 23, fat: 12, carbs: 45 }
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
      { name: "Banana", quantity: 100, unit: "g" },
      { name: "Frozen Fruits", quantity: 100, unit: "g" },
      { name: "Protein Powder", quantity: 30, unit: "g" },
      { name: "Peanut Butter", quantity: 15, unit: "g" },
      { name: "Milk", quantity: 150, unit: "ml" }
    ],
    targetMacros: { calories: 500, protein: 23, fat: 12, carbs: 45 }
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
      { name: "Egg", quantity: 3, unit: "piece" },
      { name: "Mixed Vegetables", quantity: 120, unit: "g" },
      { name: "Avocado", quantity: 50, unit: "g" },
      { name: "Oil", quantity: 3, unit: "ml" }
    ],
    targetMacros: { calories: 500, protein: 23, fat: 12, carbs: 45 }
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
      { name: "Bread", quantity: 60, unit: "g" },
      { name: "Egg", quantity: 2, unit: "piece" },
      { name: "Avocado", quantity: 60, unit: "g" },
      { name: "Butter", quantity: 5, unit: "g" }
    ],
    targetMacros: { calories: 500, protein: 23, fat: 12, carbs: 45 }
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
      { name: "Frozen Fruits", quantity: 150, unit: "g" },
      { name: "Protein Powder", quantity: 30, unit: "g" },
      { name: "Greek Yogurt", quantity: 80, unit: "g" },
      { name: "Banana", quantity: 50, unit: "g" },
      { name: "Seeds", quantity: 10, unit: "g" }
    ],
    targetMacros: { calories: 500, protein: 23, fat: 12, carbs: 45 }
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
      { name: "Protein Powder", quantity: 35, unit: "g" },
      { name: "Light Mascarpone", quantity: 80, unit: "g" },
      { name: "Fresh Fruits", quantity: 120, unit: "g" },
      { name: "Honey", quantity: 10, unit: "g" }
    ],
    targetMacros: { calories: 500, protein: 23, fat: 12, carbs: 45 }
  }
];

console.log(JSON.stringify(recipes, null, 2));
