const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || "prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza183UkxGelFDMmU0bEIwdXVBZ0l6UlYiLCJhcGlfa2V5IjoiMDFLNjhZNTUzU0RaNUtNMkZEWTQzRkRLTTAiLCJ0ZW5hbnRfaWQiOiIyYzAxN2NiZWFmY2ZlOWUwNjViYzFjNDIyNGY2OGYxNTRjMDEyZmQxYWYzYThjZDNkMzcwNzc3ZDUzMTc4Y2FjIiwiaW50ZXJuYWxfc2VjcmV0IjoiMzBmNTc4YWMtODlhMy00MGUyLWJkMmQtZTRlMzExZDhmZjg4In0.CGXndBzIhhtw4jIGEGXEdrYI_DYOQ7mAEo3_J84GkM4"
    }
  }
});

// Betrouwbare voedingswaarden per 100g (gebaseerd op USDA en NEVO databases)
const CORRECT_NUTRITIONAL_VALUES = {
  // Noten en zaden
  'almond butter': { calories: 614, protein: 21.2, carbs: 18.8, fat: 55.5, fiber: 10.3, sugar: 4.4 },
  'almonds': { calories: 579, protein: 21.2, carbs: 21.6, fat: 49.9, fiber: 12.5, sugar: 4.4 },
  'cashews': { calories: 553, protein: 18.2, carbs: 30.2, fat: 43.8, fiber: 3.3, sugar: 5.9 },
  'walnuts': { calories: 654, protein: 15.2, carbs: 13.7, fat: 65.2, fiber: 6.7, sugar: 2.6 },
  'chia seeds': { calories: 486, protein: 16.5, carbs: 42.1, fat: 30.7, fiber: 34.4, sugar: 0 },
  'flax seeds': { calories: 534, protein: 18.3, carbs: 28.9, fat: 42.2, fiber: 27.3, sugar: 1.6 },
  'pumpkin seeds': { calories: 559, protein: 30, carbs: 11, fat: 49, fiber: 6, sugar: 0 },
  'sunflower seeds': { calories: 584, protein: 21, carbs: 20, fat: 51, fiber: 9, sugar: 0 },
  'mixed nuts': { calories: 607, protein: 20, carbs: 21, fat: 54, fiber: 7, sugar: 0 },
  'nuts': { calories: 607, protein: 20, carbs: 21, fat: 54, fiber: 7, sugar: 0 },

  // Eiwitten
  'chicken breast': { calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, sugar: 0 },
  'grilled chicken': { calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, sugar: 0 },
  'beef': { calories: 250, protein: 26, carbs: 0, fat: 15, fiber: 0, sugar: 0 },
  'lean beef': { calories: 250, protein: 26, carbs: 0, fat: 15, fiber: 0, sugar: 0 },
  'pork': { calories: 242, protein: 27.3, carbs: 0, fat: 13.9, fiber: 0, sugar: 0 },
  'lean pork chop baked': { calories: 242, protein: 27.3, carbs: 0, fat: 13.9, fiber: 0, sugar: 0 },
  'lean pork chop trimmed of fat baked': { calories: 242, protein: 27.3, carbs: 0, fat: 13.9, fiber: 0, sugar: 0 },
  'pork cotlet': { calories: 242, protein: 27.3, carbs: 0, fat: 13.9, fiber: 0, sugar: 0 },
  'salmon': { calories: 208, protein: 25.4, carbs: 0, fat: 12.4, fiber: 0, sugar: 0 },
  'salmon with pasta': { calories: 208, protein: 25.4, carbs: 0, fat: 12.4, fiber: 0, sugar: 0 },
  'salmon with potatoes': { calories: 208, protein: 25.4, carbs: 0, fat: 12.4, fiber: 0, sugar: 0 },
  'tuna': { calories: 132, protein: 28, carbs: 0, fat: 1.3, fiber: 0, sugar: 0 },
  'tuna wrap with tortilla': { calories: 132, protein: 28, carbs: 0, fat: 1.3, fiber: 0, sugar: 0 },
  'turkey': { calories: 189, protein: 29, carbs: 0, fat: 7, fiber: 0, sugar: 0 },
  'turkey breast': { calories: 189, protein: 29, carbs: 0, fat: 7, fiber: 0, sugar: 0 },
  'turkey breast roasted': { calories: 189, protein: 29, carbs: 0, fat: 7, fiber: 0, sugar: 0 },
  'white fish': { calories: 111, protein: 23, carbs: 0, fat: 1, fiber: 0, sugar: 0 },
  'egg': { calories: 155, protein: 13, carbs: 1.1, fat: 11, fiber: 0, sugar: 1.1 },
  'eggs': { calories: 155, protein: 13, carbs: 1.1, fat: 11, fiber: 0, sugar: 1.1 },
  'boiled eggs': { calories: 155, protein: 13, carbs: 1.1, fat: 11, fiber: 0, sugar: 1.1 },
  'egg whites': { calories: 52, protein: 10.9, carbs: 0.7, fat: 0.2, fiber: 0, sugar: 0.7 },
  'whites': { calories: 52, protein: 10.9, carbs: 0.7, fat: 0.2, fiber: 0, sugar: 0.7 },
  'scrambled egg whites': { calories: 52, protein: 10.9, carbs: 0.7, fat: 0.2, fiber: 0, sugar: 0.7 },
  'omelette eggs': { calories: 155, protein: 13, carbs: 1.1, fat: 11, fiber: 0, sugar: 1.1 },
  'eggs with vegetables': { calories: 155, protein: 13, carbs: 1.1, fat: 11, fiber: 0, sugar: 1.1 },
  'salad with eggs and cheese': { calories: 155, protein: 13, carbs: 1.1, fat: 11, fiber: 0, sugar: 1.1 },
  'protein powder': { calories: 370, protein: 80, carbs: 5, fat: 3, fiber: 0, sugar: 0 },
  'vegan protein': { calories: 370, protein: 80, carbs: 5, fat: 3, fiber: 0, sugar: 0 },
  'scoop protein powder': { calories: 120, protein: 25, carbs: 3, fat: 1, fiber: 0, sugar: 1 },
  'protein bar': { calories: 350, protein: 20, carbs: 35, fat: 15, fiber: 5, sugar: 0 },

  // Groenten
  'apple': { calories: 52, protein: 0.3, carbs: 13.8, fat: 0.2, fiber: 2.4, sugar: 10.4 },
  'arugula': { calories: 25, protein: 2.6, carbs: 3.7, fat: 0.7, fiber: 1.6, sugar: 2.1 },
  'asparagus': { calories: 20, protein: 2.2, carbs: 4, fat: 0.1, fiber: 2.1, sugar: 0 },
  'avocado': { calories: 160, protein: 2, carbs: 8.5, fat: 14.7, fiber: 6.7, sugar: 0.7 },
  'bell pepper': { calories: 20, protein: 0.9, carbs: 4.6, fat: 0.2, fiber: 1.5, sugar: 2.4 },
  'bell peppers': { calories: 20, protein: 0.9, carbs: 4.6, fat: 0.2, fiber: 1.5, sugar: 2.4 },
  'broccoli': { calories: 34, protein: 2.8, carbs: 6.6, fat: 0.4, fiber: 2.6, sugar: 1.5 },
  'steamed broccoli': { calories: 34, protein: 2.8, carbs: 6.6, fat: 0.4, fiber: 2.6, sugar: 1.5 },
  'carrot': { calories: 41, protein: 0.9, carbs: 9.6, fat: 0.2, fiber: 2.8, sugar: 4.7 },
  'carrots': { calories: 41, protein: 0.9, carbs: 9.6, fat: 0.2, fiber: 2.8, sugar: 4.7 },
  'carrot sticks': { calories: 41, protein: 0.9, carbs: 9.6, fat: 0.2, fiber: 2.8, sugar: 4.7 },
  'cabbage and carrot salad': { calories: 41, protein: 0.9, carbs: 9.6, fat: 0.2, fiber: 2.8, sugar: 4.7 },
  'cherry tomatoes': { calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, fiber: 1.2, sugar: 2.6 },
  'cucumber': { calories: 16, protein: 0.7, carbs: 4, fat: 0.1, fiber: 0.5, sugar: 1.7 },
  'cucumber sticks': { calories: 16, protein: 0.7, carbs: 4, fat: 0.1, fiber: 0.5, sugar: 1.7 },
  'cucumber and tomato salad': { calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, fiber: 1.2, sugar: 2.6 },
  'mixed salad with lettuce, cucumber and tomato': { calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, fiber: 1.2, sugar: 2.6 },
  'salad with lettuce, cucumber and tomato': { calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, fiber: 1.2, sugar: 2.6 },
  'garlic': { calories: 149, protein: 6.4, carbs: 33.1, fat: 0.5, fiber: 2.1, sugar: 1 },
  'green beans': { calories: 31, protein: 1.8, carbs: 7, fat: 0.1, fiber: 2.7, sugar: 0 },
  'green salad': { calories: 15, protein: 1.4, carbs: 2.9, fat: 0.2, fiber: 1.3, sugar: 0.8 },
  'lettuce': { calories: 15, protein: 1.4, carbs: 2.9, fat: 0.2, fiber: 1.3, sugar: 0.8 },
  'salad lettuce': { calories: 15, protein: 1.4, carbs: 2.9, fat: 0.2, fiber: 1.3, sugar: 0.8 },
  'salad': { calories: 15, protein: 1.4, carbs: 2.9, fat: 0.2, fiber: 1.3, sugar: 0.8 },
  'mushrooms': { calories: 22, protein: 3.1, carbs: 3.3, fat: 0.3, fiber: 1, sugar: 0 },
  'onion': { calories: 40, protein: 1.1, carbs: 9.3, fat: 0.1, fiber: 1.7, sugar: 4.2 },
  'spinach': { calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, fiber: 2.2, sugar: 0.4 },
  'tomato': { calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, fiber: 1.2, sugar: 2.6 },
  'tomato sauce': { calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, fiber: 1.2, sugar: 2.6 },
  'tuna salad': { calories: 15, protein: 1.4, carbs: 2.9, fat: 0.2, fiber: 1.3, sugar: 0.8 },
  'zucchini': { calories: 17, protein: 1.2, carbs: 3.1, fat: 0.3, fiber: 1, sugar: 2.5 },
  'roasted zucchini': { calories: 17, protein: 1.2, carbs: 3.1, fat: 0.3, fiber: 1, sugar: 2.5 },
  'steamed zucchini': { calories: 17, protein: 1.2, carbs: 3.1, fat: 0.3, fiber: 1, sugar: 2.5 },
  'mixed vegetables': { calories: 35, protein: 2, carbs: 7, fat: 0.2, fiber: 2.5, sugar: 3.5 },
  'vegetables': { calories: 28, protein: 1.6, carbs: 5.6, fat: 0.2, fiber: 2.4, sugar: 3.2 },
  'vegetables any': { calories: 28, protein: 1.6, carbs: 5.6, fat: 0.2, fiber: 2.4, sugar: 3.2 },
  'veggie sticks': { calories: 28, protein: 1.6, carbs: 5.6, fat: 0.2, fiber: 2.4, sugar: 3.2 },
  'grilled veggies': { calories: 28, protein: 1.6, carbs: 5.6, fat: 0.2, fiber: 2.4, sugar: 3.2 },
  'roasted veggies': { calories: 28, protein: 1.6, carbs: 5.6, fat: 0.2, fiber: 2.4, sugar: 3.2 },
  'sauted veggies': { calories: 28, protein: 1.6, carbs: 5.6, fat: 0.2, fiber: 2.4, sugar: 3.2 },
  'steamed veggies': { calories: 28, protein: 1.6, carbs: 5.6, fat: 0.2, fiber: 2.4, sugar: 3.2 },
  'cooked peas': { calories: 81, protein: 5.4, carbs: 14.5, fat: 0.4, fiber: 5.1, sugar: 5.7 },
  'peas': { calories: 81, protein: 5.4, carbs: 14, fat: 0.4, fiber: 5.1, sugar: 0 },
  'pumpkin soup': { calories: 26, protein: 1, carbs: 6.5, fat: 0.1, fiber: 0.5, sugar: 2.8 },

  // Fruit
  'banana': { calories: 89, protein: 1.1, carbs: 22.8, fat: 0.3, fiber: 2.6, sugar: 12.2 },
  'berries': { calories: 23, protein: 0.4, carbs: 5.5, fat: 0.2, fiber: 2.5, sugar: 5.5 },
  'blueberries': { calories: 57, protein: 0.7, carbs: 14, fat: 0.3, fiber: 2.4, sugar: 10 },
  'blueberry': { calories: 57, protein: 0.7, carbs: 14.5, fat: 0.3, fiber: 2.4, sugar: 10 },
  'frozen berries': { calories: 45, protein: 0.7, carbs: 11, fat: 0.3, fiber: 2.2, sugar: 0 },
  'mixed berries': { calories: 50, protein: 0.7, carbs: 12, fat: 0.3, fiber: 2.3, sugar: 0 },
  'fruit and nuts with apple': { calories: 52, protein: 0.3, carbs: 13.8, fat: 0.2, fiber: 2.4, sugar: 10.4 },
  'fruit and nuts with orange': { calories: 47, protein: 0.9, carbs: 11.8, fat: 0.1, fiber: 2.4, sugar: 9.4 },
  'fruit with banana': { calories: 89, protein: 1.1, carbs: 22.8, fat: 0.3, fiber: 2.6, sugar: 12.2 },
  'grape': { calories: 67, protein: 0.6, carbs: 17, fat: 0.4, fiber: 0.9, sugar: 16 },
  'kiwi': { calories: 61, protein: 1.1, carbs: 14.7, fat: 0.5, fiber: 3, sugar: 9 },
  'mango': { calories: 60, protein: 0.8, carbs: 15, fat: 0.4, fiber: 1.6, sugar: 13.7 },
  'orange': { calories: 47, protein: 0.9, carbs: 11.8, fat: 0.1, fiber: 2.4, sugar: 9.4 },
  'pear': { calories: 57, protein: 0.4, carbs: 15.2, fat: 0.1, fiber: 3.1, sugar: 9.8 },
  'pineapple': { calories: 50, protein: 0.5, carbs: 13.1, fat: 0.1, fiber: 1.4, sugar: 9.9 },
  'strawberries': { calories: 32, protein: 0.7, carbs: 8, fat: 0.3, fiber: 2, sugar: 0 },
  'strawberry': { calories: 32, protein: 0.7, carbs: 7.7, fat: 0.3, fiber: 2, sugar: 4.9 },
  's': { calories: 32, protein: 0.7, carbs: 7.7, fat: 0.3, fiber: 2, sugar: 4.9 },

  // Koolhydraten
  'baked potatoes': { calories: 77, protein: 2, carbs: 17.5, fat: 0.1, fiber: 2.2, sugar: 0.8 },
  'boiled potatoes': { calories: 77, protein: 2, carbs: 17.5, fat: 0.1, fiber: 2.2, sugar: 0.8 },
  'mashed potatoes': { calories: 77, protein: 2, carbs: 17.5, fat: 0.1, fiber: 2.2, sugar: 0.8 },
  'potato': { calories: 77, protein: 2, carbs: 17.5, fat: 0.1, fiber: 2.2, sugar: 0.8 },
  'potatoes': { calories: 62, protein: 1.6, carbs: 14, fat: 0.1, fiber: 1.6, sugar: 0.8 },
  'potato stew': { calories: 77, protein: 2, carbs: 17.5, fat: 0.1, fiber: 2.2, sugar: 0.8 },
  'sweet potato': { calories: 69, protein: 1.3, carbs: 16.1, fat: 0.1, fiber: 2.4, sugar: 4.8 },
  'sweet potato baked': { calories: 86, protein: 1.6, carbs: 20.1, fat: 0.1, fiber: 3, sugar: 4.2 },
  'sweet potatoes': { calories: 77, protein: 2, carbs: 17.5, fat: 0.1, fiber: 2.2, sugar: 0.8 },
  'sweet potatoes baked': { calories: 77, protein: 2, carbs: 17.5, fat: 0.1, fiber: 2.2, sugar: 0.8 },
  'sweet potatoes boiled': { calories: 77, protein: 2, carbs: 17.5, fat: 0.1, fiber: 2.2, sugar: 0.8 },
  'bread': { calories: 265, protein: 9, carbs: 49, fat: 3.2, fiber: 2.7, sugar: 5.7 },
  'wholegrain bread': { calories: 265, protein: 9, carbs: 49, fat: 3.2, fiber: 2.7, sugar: 5.7 },
  'wholemeal bread': { calories: 265, protein: 9, carbs: 49, fat: 3.2, fiber: 2.7, sugar: 5.7 },
  'brown rice': { calories: 130, protein: 2.7, carbs: 28, fat: 0.3, fiber: 0.4, sugar: 0.1 },
  'rice': { calories: 130, protein: 2.7, carbs: 28, fat: 0.3, fiber: 0.4, sugar: 0.1 },
  'bulgur': { calories: 83, protein: 3.1, carbs: 19, fat: 0.2, fiber: 4.5, sugar: 0 },
  'cooked bulgur': { calories: 83, protein: 3.1, carbs: 18.6, fat: 0.2, fiber: 4.5, sugar: 0.4 },
  'cooked quinoa': { calories: 120, protein: 4.4, carbs: 22, fat: 1.9, fiber: 2.8, sugar: 0.9 },
  'quinoa': { calories: 120, protein: 4.4, carbs: 22, fat: 1.9, fiber: 2.8, sugar: 0.9 },
  'pasta': { calories: 131, protein: 5, carbs: 25, fat: 1.1, fiber: 1.8, sugar: 0.6 },
  'wholemeal pasta': { calories: 131, protein: 5, carbs: 25, fat: 1.1, fiber: 1.8, sugar: 0.6 },
  'oats': { calories: 389, protein: 16.9, carbs: 66.3, fat: 6.9, fiber: 10.6, sugar: 0.5 },
  'oats pancakes': { calories: 389, protein: 16.9, carbs: 66.3, fat: 6.9, fiber: 10.6, sugar: 0 },
  'pancakes': { calories: 227, protein: 6.4, carbs: 28, fat: 9.7, fiber: 1.2, sugar: 6.2 },
  'red beans': { calories: 64, protein: 4.4, carbs: 11.5, fat: 0.3, fiber: 6.5, sugar: 0.5 },
  'lentil soup': { calories: 116, protein: 9, carbs: 20.1, fat: 0.4, fiber: 7.9, sugar: 1.8 },
  'salad lentils': { calories: 116, protein: 9, carbs: 20.1, fat: 0.4, fiber: 7.9, sugar: 1.8 },

  // Zuivel
  'almond milk': { calories: 30, protein: 1.2, carbs: 1.2, fat: 2.2, fiber: 0.6, sugar: 0.6 },
  'cheese': { calories: 113, protein: 7, carbs: 1, fat: 9, fiber: 0, sugar: 1 },
  'coconut milk': { calories: 230, protein: 2.3, carbs: 6, fat: 24, fiber: 2.2, sugar: 3.3 },
  'cottage cheese': { calories: 98, protein: 11.1, carbs: 3.4, fat: 4.3, fiber: 0, sugar: 2.7 },
  'greek yogurt': { calories: 89, protein: 15, carbs: 5.4, fat: 0.6, fiber: 0, sugar: 5.4 },
  'milk': { calories: 42, protein: 3.4, carbs: 5, fat: 1, fiber: 0, sugar: 5 },
  'quark': { calories: 59, protein: 10, carbs: 3.6, fat: 0.4, fiber: 0, sugar: 3.6 },

  // Vetten en oliën
  'coconut oil': { calories: 862, protein: 0, carbs: 0, fat: 100, fiber: 0, sugar: 0 },
  'olive oil': { calories: 884, protein: 0, carbs: 0, fat: 100, fiber: 0, sugar: 0 },
  'olive oil wrap with tortilla': { calories: 884, protein: 0, carbs: 0, fat: 100, fiber: 0, sugar: 0 },
  'peanut butter': { calories: 588, protein: 25.1, carbs: 20, fat: 50.4, fiber: 8.5, sugar: 9.2 },
  'hummus': { calories: 166, protein: 8, carbs: 14, fat: 9.6, fiber: 6, sugar: 0 },

  // Overig
  'cinnamon': { calories: 247, protein: 4, carbs: 80.6, fat: 1.2, fiber: 53.1, sugar: 2.2 },
  'cocoa powder': { calories: 228, protein: 19.6, carbs: 57.9, fat: 13.7, fiber: 33.2, sugar: 1.8 },
  'honey': { calories: 304, protein: 0.3, carbs: 82.4, fat: 0, fiber: 0.2, sugar: 82.1 },
  'lemon juice': { calories: 22, protein: 0.4, carbs: 7, fat: 0.2, fiber: 0.3, sugar: 0 },
  'maple syrup': { calories: 260, protein: 0, carbs: 67, fat: 0, fiber: 0, sugar: 67 }
};

// Problematische ingredienten die gecorrigeerd moeten worden
const PROBLEMATIC_INGREDIENTS = [
  'olive oil', // Heeft 44 calories in database, maar zou 884 moeten zijn
  'coconut oil', // Heeft 862 calories, dit klopt
  'egg whites', // Heeft 155 calories in database, maar zou 52 moeten zijn
  'whites', // Heeft 155 calories in database, maar zou 52 moeten zijn
  'scrambled egg whites', // Heeft 155 calories in database, maar zou 52 moeten zijn
  'grilled veggies', // Heeft verkeerde voedingswaarden (eiwit waarden)
  'roasted veggies', // Heeft verkeerde voedingswaarden (eiwit waarden)
  'sauted veggies', // Heeft verkeerde voedingswaarden (eiwit waarden)
  'steamed veggies', // Heeft verkeerde voedingswaarden (eiwit waarden)
  'veggie sticks', // Heeft verkeerde voedingswaarden (eiwit waarden)
  'eggs with vegetables', // Heeft verkeerde voedingswaarden
  'salad with eggs and cheese', // Heeft verkeerde voedingswaarden
  'salmon with pasta', // Heeft verkeerde voedingswaarden
  'salmon with potatoes', // Heeft verkeerde voedingswaarden
  'tuna wrap with tortilla', // Heeft verkeerde voedingswaarden
  'olive oil wrap with tortilla' // Heeft verkeerde voedingswaarden
];

async function validateAndFixIngredients() {
  try {
    console.log('🔍 Starting ingredient validation and correction...\n');
    
    // Haal alle ingredienten op uit de database
    const ingredients = await prisma.ingredient.findMany({
      orderBy: { name: 'asc' }
    });
    
    console.log(`📊 Found ${ingredients.length} ingredients in database\n`);
    
    let correctedCount = 0;
    let problematicCount = 0;
    const corrections = [];
    
    for (const ingredient of ingredients) {
      const normalizedName = ingredient.name.toLowerCase().trim();
      
      // Check if we have correct values for this ingredient
      if (CORRECT_NUTRITIONAL_VALUES[normalizedName]) {
        const correctValues = CORRECT_NUTRITIONAL_VALUES[normalizedName];
        
        // Check if values need correction
        const needsCorrection = 
          Math.abs(ingredient.calories - correctValues.calories) > 1 ||
          Math.abs(ingredient.protein - correctValues.protein) > 0.1 ||
          Math.abs(ingredient.carbs - correctValues.carbs) > 0.1 ||
          Math.abs(ingredient.fat - correctValues.fat) > 0.1 ||
          (ingredient.fiber && Math.abs(ingredient.fiber - correctValues.fiber) > 0.1) ||
          (ingredient.sugar && Math.abs(ingredient.sugar - correctValues.sugar) > 0.1);
        
        if (needsCorrection) {
          console.log(`🔧 Correcting: ${ingredient.name}`);
          console.log(`   Current: ${ingredient.calories} cal, ${ingredient.protein}g protein, ${ingredient.carbs}g carbs, ${ingredient.fat}g fat`);
          console.log(`   Correct: ${correctValues.calories} cal, ${correctValues.protein}g protein, ${correctValues.carbs}g carbs, ${correctValues.fat}g fat`);
          
          // Update the ingredient
          await prisma.ingredient.update({
            where: { id: ingredient.id },
            data: {
              calories: correctValues.calories,
              protein: correctValues.protein,
              carbs: correctValues.carbs,
              fat: correctValues.fat,
              fiber: correctValues.fiber || 0,
              sugar: correctValues.sugar || 0,
              per: '100g' // Ensure all are per 100g
            }
          });
          
          correctedCount++;
          corrections.push({
            name: ingredient.name,
            old: { calories: ingredient.calories, protein: ingredient.protein, carbs: ingredient.carbs, fat: ingredient.fat },
            new: correctValues
          });
        }
      } else if (PROBLEMATIC_INGREDIENTS.includes(normalizedName)) {
        console.log(`⚠️  Problematic ingredient found: ${ingredient.name}`);
        console.log(`   Current values: ${ingredient.calories} cal, ${ingredient.protein}g protein, ${ingredient.carbs}g carbs, ${ingredient.fat}g fat`);
        problematicCount++;
      }
    }
    
    console.log(`\n📈 Summary:`);
    console.log(`   - Total ingredients checked: ${ingredients.length}`);
    console.log(`   - Ingredients corrected: ${correctedCount}`);
    console.log(`   - Problematic ingredients found: ${problematicCount}`);
    
    if (corrections.length > 0) {
      console.log(`\n🔧 Corrections made:`);
      corrections.forEach(correction => {
        console.log(`   - ${correction.name}: ${correction.old.calories}→${correction.new.calories} cal, ${correction.old.protein}→${correction.new.protein}g protein`);
      });
    }
    
    // Check for ingredients that might have wrong units
    console.log(`\n🔍 Checking for unit standardization issues...`);
    const unitIssues = await prisma.ingredient.findMany({
      where: {
        OR: [
          { per: { not: '100g' } },
          { per: null }
        ]
      }
    });
    
    if (unitIssues.length > 0) {
      console.log(`   Found ${unitIssues.length} ingredients with non-standard units:`);
      unitIssues.forEach(ingredient => {
        console.log(`   - ${ingredient.name}: ${ingredient.per || 'null'}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

validateAndFixIngredients();
