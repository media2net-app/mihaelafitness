const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Pure ingredienten met betrouwbare voedingswaarden per 100g
const PURE_INGREDIENTS = [
  // FRUIT
  { name: 'Apple', calories: 52, protein: 0.3, carbs: 13.8, fat: 0.2, fiber: 2.4, sugar: 10.4, category: 'fruits' },
  { name: 'Banana', calories: 89, protein: 1.1, carbs: 22.8, fat: 0.3, fiber: 2.6, sugar: 12.2, category: 'fruits' },
  { name: 'Orange', calories: 47, protein: 0.9, carbs: 11.8, fat: 0.1, fiber: 2.4, sugar: 9.4, category: 'fruits' },
  { name: 'Strawberry', calories: 32, protein: 0.7, carbs: 7.7, fat: 0.3, fiber: 2, sugar: 4.9, category: 'fruits' },
  { name: 'Blueberry', calories: 57, protein: 0.7, carbs: 14.5, fat: 0.3, fiber: 2.4, sugar: 10, category: 'fruits' },
  { name: 'Grape', calories: 67, protein: 0.6, carbs: 17, fat: 0.4, fiber: 0.9, sugar: 16, category: 'fruits' },
  { name: 'Lemon', calories: 29, protein: 1.1, carbs: 9.3, fat: 0.3, fiber: 2.8, sugar: 2.5, category: 'fruits' },
  { name: 'Lime', calories: 30, protein: 0.7, carbs: 10.5, fat: 0.2, fiber: 2.8, sugar: 1.7, category: 'fruits' },
  { name: 'Kiwi', calories: 61, protein: 1.1, carbs: 14.7, fat: 0.5, fiber: 3, sugar: 9, category: 'fruits' },
  { name: 'Pear', calories: 57, protein: 0.4, carbs: 15.2, fat: 0.1, fiber: 3.1, sugar: 9.8, category: 'fruits' },
  { name: 'Peach', calories: 39, protein: 0.9, carbs: 9.5, fat: 0.3, fiber: 1.5, sugar: 8.4, category: 'fruits' },
  { name: 'Cherry', calories: 63, protein: 1.1, carbs: 16, fat: 0.2, fiber: 2.1, sugar: 12.8, category: 'fruits' },
  { name: 'Plum', calories: 46, protein: 0.7, carbs: 11.4, fat: 0.3, fiber: 1.4, sugar: 9.9, category: 'fruits' },
  { name: 'Watermelon', calories: 30, protein: 0.6, carbs: 7.6, fat: 0.2, fiber: 0.4, sugar: 6.2, category: 'fruits' },
  { name: 'Cantaloupe', calories: 34, protein: 0.8, carbs: 8.2, fat: 0.2, fiber: 0.9, sugar: 7.9, category: 'fruits' },
  { name: 'Mango', calories: 60, protein: 0.8, carbs: 15, fat: 0.4, fiber: 1.6, sugar: 13.7, category: 'fruits' },
  { name: 'Pineapple', calories: 50, protein: 0.5, carbs: 13.1, fat: 0.1, fiber: 1.4, sugar: 9.9, category: 'fruits' },
  { name: 'Avocado', calories: 160, protein: 2, carbs: 8.5, fat: 14.7, fiber: 6.7, sugar: 0.7, category: 'fruits' },

  // VEGETABLES
  { name: 'Broccoli', calories: 34, protein: 2.8, carbs: 6.6, fat: 0.4, fiber: 2.6, sugar: 1.5, category: 'vegetables' },
  { name: 'Spinach', calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, fiber: 2.2, sugar: 0.4, category: 'vegetables' },
  { name: 'Carrot', calories: 41, protein: 0.9, carbs: 9.6, fat: 0.2, fiber: 2.8, sugar: 4.7, category: 'vegetables' },
  { name: 'Tomato', calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, fiber: 1.2, sugar: 2.6, category: 'vegetables' },
  { name: 'Cucumber', calories: 16, protein: 0.7, carbs: 4, fat: 0.1, fiber: 0.5, sugar: 1.7, category: 'vegetables' },
  { name: 'Bell Pepper', calories: 20, protein: 0.9, carbs: 4.6, fat: 0.2, fiber: 1.5, sugar: 2.4, category: 'vegetables' },
  { name: 'Onion', calories: 40, protein: 1.1, carbs: 9.3, fat: 0.1, fiber: 1.7, sugar: 4.2, category: 'vegetables' },
  { name: 'Garlic', calories: 149, protein: 6.4, carbs: 33.1, fat: 0.5, fiber: 2.1, sugar: 1, category: 'vegetables' },
  { name: 'Lettuce', calories: 15, protein: 1.4, carbs: 2.9, fat: 0.2, fiber: 1.3, sugar: 0.8, category: 'vegetables' },
  { name: 'Asparagus', calories: 20, protein: 2.2, carbs: 4, fat: 0.1, fiber: 2.1, sugar: 0, category: 'vegetables' },
  { name: 'Green Beans', calories: 31, protein: 1.8, carbs: 7, fat: 0.1, fiber: 2.7, sugar: 0, category: 'vegetables' },
  { name: 'Mushrooms', calories: 22, protein: 3.1, carbs: 3.3, fat: 0.3, fiber: 1, sugar: 0, category: 'vegetables' },
  { name: 'Zucchini', calories: 17, protein: 1.2, carbs: 3.1, fat: 0.3, fiber: 1, sugar: 2.5, category: 'vegetables' },
  { name: 'Eggplant', calories: 25, protein: 1, carbs: 6, fat: 0.2, fiber: 3, sugar: 3.5, category: 'vegetables' },
  { name: 'Cauliflower', calories: 25, protein: 1.9, carbs: 5, fat: 0.3, fiber: 2, sugar: 1.9, category: 'vegetables' },
  { name: 'Cabbage', calories: 25, protein: 1.3, carbs: 5.8, fat: 0.1, fiber: 2.5, sugar: 3.2, category: 'vegetables' },
  { name: 'Kale', calories: 49, protein: 4.3, carbs: 8.8, fat: 0.9, fiber: 3.6, sugar: 2.3, category: 'vegetables' },
  { name: 'Sweet Potato', calories: 86, protein: 1.6, carbs: 20.1, fat: 0.1, fiber: 3, sugar: 4.2, category: 'vegetables' },

  // MEAT & PROTEINS
  { name: 'Chicken Breast', calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, sugar: 0, category: 'proteins' },
  { name: 'Beef', calories: 250, protein: 26, carbs: 0, fat: 15, fiber: 0, sugar: 0, category: 'proteins' },
  { name: 'Salmon', calories: 208, protein: 25.4, carbs: 0, fat: 12.4, fiber: 0, sugar: 0, category: 'proteins' },
  { name: 'Tuna', calories: 132, protein: 28, carbs: 0, fat: 1.3, fiber: 0, sugar: 0, category: 'proteins' },
  { name: 'Turkey', calories: 189, protein: 29, carbs: 0, fat: 7, fiber: 0, sugar: 0, category: 'proteins' },
  { name: 'Pork', calories: 242, protein: 27.3, carbs: 0, fat: 13.9, fiber: 0, sugar: 0, category: 'proteins' },
  { name: 'Lamb', calories: 294, protein: 25, carbs: 0, fat: 21, fiber: 0, sugar: 0, category: 'proteins' },
  { name: 'Eggs', calories: 155, protein: 13, carbs: 1.1, fat: 11, fiber: 0, sugar: 1.1, category: 'proteins' },
  { name: 'Egg Whites', calories: 52, protein: 10.9, carbs: 0.7, fat: 0.2, fiber: 0, sugar: 0.7, category: 'proteins' },
  { name: 'Cod', calories: 82, protein: 18, carbs: 0, fat: 0.7, fiber: 0, sugar: 0, category: 'proteins' },
  { name: 'Shrimp', calories: 99, protein: 24, carbs: 0, fat: 0.3, fiber: 0, sugar: 0, category: 'proteins' },
  { name: 'Crab', calories: 97, protein: 20, carbs: 0, fat: 1.5, fiber: 0, sugar: 0, category: 'proteins' },
  { name: 'Lobster', calories: 89, protein: 19, carbs: 0, fat: 0.9, fiber: 0, sugar: 0, category: 'proteins' },

  // DAIRY & CHEESE
  { name: 'Milk', calories: 42, protein: 3.4, carbs: 5, fat: 1, fiber: 0, sugar: 5, category: 'dairy' },
  { name: 'Greek Yogurt', calories: 59, protein: 10, carbs: 3.6, fat: 0.4, fiber: 0, sugar: 3.6, category: 'dairy' },
  { name: 'Cottage Cheese', calories: 98, protein: 11.1, carbs: 3.4, fat: 4.3, fiber: 0, sugar: 2.7, category: 'dairy' },
  { name: 'Cheddar Cheese', calories: 403, protein: 25, carbs: 1.3, fat: 33, fiber: 0, sugar: 0.5, category: 'dairy' },
  { name: 'Mozzarella', calories: 280, protein: 22, carbs: 2.2, fat: 22, fiber: 0, sugar: 1, category: 'dairy' },
  { name: 'Feta Cheese', calories: 264, protein: 14, carbs: 4.1, fat: 21, fiber: 0, sugar: 4.1, category: 'dairy' },
  { name: 'Parmesan', calories: 431, protein: 38, carbs: 4.1, fat: 29, fiber: 0, sugar: 0.9, category: 'dairy' },
  { name: 'Butter', calories: 717, protein: 0.9, carbs: 0.1, fat: 81, fiber: 0, sugar: 0.1, category: 'dairy' },
  { name: 'Cream Cheese', calories: 342, protein: 6, carbs: 4.1, fat: 34, fiber: 0, sugar: 3.2, category: 'dairy' },
  { name: 'Ricotta', calories: 174, protein: 11, carbs: 3, fat: 13, fiber: 0, sugar: 0.3, category: 'dairy' },

  // BREAD & CARBS
  { name: 'White Bread', calories: 265, protein: 9, carbs: 49, fat: 3.2, fiber: 2.7, sugar: 5.7, category: 'carbohydrates' },
  { name: 'Whole Wheat Bread', calories: 247, protein: 13, carbs: 41, fat: 4.2, fiber: 6, sugar: 4.3, category: 'carbohydrates' },
  { name: 'Pasta', calories: 131, protein: 5, carbs: 25, fat: 1.1, fiber: 1.8, sugar: 0.6, category: 'carbohydrates' },
  { name: 'Whole Wheat Pasta', calories: 124, protein: 5, carbs: 25, fat: 1.1, fiber: 3.2, sugar: 0.6, category: 'carbohydrates' },
  { name: 'White Rice', calories: 130, protein: 2.7, carbs: 28, fat: 0.3, fiber: 0.4, sugar: 0.1, category: 'carbohydrates' },
  { name: 'Brown Rice', calories: 111, protein: 2.6, carbs: 23, fat: 0.9, fiber: 1.8, sugar: 0.4, category: 'carbohydrates' },
  { name: 'Basmati Rice', calories: 130, protein: 2.7, carbs: 28, fat: 0.3, fiber: 0.4, sugar: 0.1, category: 'carbohydrates' },
  { name: 'Quinoa', calories: 120, protein: 4.4, carbs: 22, fat: 1.9, fiber: 2.8, sugar: 0.9, category: 'carbohydrates' },
  { name: 'Oats', calories: 389, protein: 16.9, carbs: 66.3, fat: 6.9, fiber: 10.6, sugar: 0.5, category: 'carbohydrates' },
  { name: 'Potato', calories: 77, protein: 2, carbs: 17.5, fat: 0.1, fiber: 2.2, sugar: 0.8, category: 'carbohydrates' },
  { name: 'Sweet Potato', calories: 86, protein: 1.6, carbs: 20.1, fat: 0.1, fiber: 3, sugar: 4.2, category: 'carbohydrates' },
  { name: 'Bulgur', calories: 83, protein: 3.1, carbs: 19, fat: 0.2, fiber: 4.5, sugar: 0, category: 'carbohydrates' },
  { name: 'Barley', calories: 352, protein: 12, carbs: 73, fat: 2.3, fiber: 17, sugar: 0.8, category: 'carbohydrates' },

  // NUTS & SEEDS
  { name: 'Almonds', calories: 579, protein: 21.2, carbs: 21.6, fat: 49.9, fiber: 12.5, sugar: 4.4, category: 'nuts-seeds' },
  { name: 'Walnuts', calories: 654, protein: 15.2, carbs: 13.7, fat: 65.2, fiber: 6.7, sugar: 2.6, category: 'nuts-seeds' },
  { name: 'Cashews', calories: 553, protein: 18.2, carbs: 30.2, fat: 43.8, fiber: 3.3, sugar: 5.9, category: 'nuts-seeds' },
  { name: 'Pistachios', calories: 560, protein: 20, carbs: 27, fat: 45, fiber: 10, sugar: 7.7, category: 'nuts-seeds' },
  { name: 'Pecans', calories: 691, protein: 9.2, carbs: 13.9, fat: 72, fiber: 9.6, sugar: 4, category: 'nuts-seeds' },
  { name: 'Hazelnuts', calories: 628, protein: 15, carbs: 16.7, fat: 60.8, fiber: 9.7, sugar: 4.3, category: 'nuts-seeds' },
  { name: 'Peanuts', calories: 567, protein: 26, carbs: 16, fat: 49, fiber: 8.5, sugar: 4.7, category: 'nuts-seeds' },
  { name: 'Sunflower Seeds', calories: 584, protein: 21, carbs: 20, fat: 51, fiber: 9, sugar: 0, category: 'nuts-seeds' },
  { name: 'Pumpkin Seeds', calories: 559, protein: 30, carbs: 11, fat: 49, fiber: 6, sugar: 0, category: 'nuts-seeds' },
  { name: 'Chia Seeds', calories: 486, protein: 17, carbs: 42, fat: 31, fiber: 34, sugar: 0, category: 'nuts-seeds' },
  { name: 'Flax Seeds', calories: 534, protein: 18.3, carbs: 28.9, fat: 42.2, fiber: 27.3, sugar: 1.6, category: 'nuts-seeds' },
  { name: 'Sesame Seeds', calories: 573, protein: 18, carbs: 23, fat: 50, fiber: 12, sugar: 0, category: 'nuts-seeds' },

  // HEALTHY FATS
  { name: 'Olive Oil', calories: 884, protein: 0, carbs: 0, fat: 100, fiber: 0, sugar: 0, category: 'healthy-fats' },
  { name: 'Coconut Oil', calories: 862, protein: 0, carbs: 0, fat: 100, fiber: 0, sugar: 0, category: 'healthy-fats' },
  { name: 'Avocado Oil', calories: 884, protein: 0, carbs: 0, fat: 100, fiber: 0, sugar: 0, category: 'healthy-fats' },
  { name: 'Almond Butter', calories: 614, protein: 21.2, carbs: 18.8, fat: 55.5, fiber: 10.3, sugar: 4.4, category: 'healthy-fats' },
  { name: 'Peanut Butter', calories: 588, protein: 25.1, carbs: 20, fat: 50.4, fiber: 8.5, sugar: 9.2, category: 'healthy-fats' },
  { name: 'Tahini', calories: 595, protein: 17, carbs: 21, fat: 54, fiber: 9, sugar: 0.5, category: 'healthy-fats' },

  // OTHER ESSENTIALS
  { name: 'Honey', calories: 304, protein: 0.3, carbs: 82.4, fat: 0, fiber: 0.2, sugar: 82.1, category: 'other' },
  { name: 'Maple Syrup', calories: 260, protein: 0, carbs: 67, fat: 0, fiber: 0, sugar: 67, category: 'other' },
  { name: 'Salt', calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, category: 'other' },
  { name: 'Black Pepper', calories: 251, protein: 10, carbs: 64, fat: 3.3, fiber: 25, sugar: 0.6, category: 'other' },
  { name: 'Garlic Powder', calories: 331, protein: 16.6, carbs: 72.7, fat: 0.7, fiber: 9, sugar: 2.4, category: 'other' },
  { name: 'Onion Powder', calories: 341, protein: 10, carbs: 79, fat: 1, fiber: 15, sugar: 38, category: 'other' },
  { name: 'Paprika', calories: 282, protein: 14, carbs: 54, fat: 13, fiber: 35, sugar: 10, category: 'other' },
  { name: 'Cumin', calories: 375, protein: 18, carbs: 44, fat: 22, fiber: 11, sugar: 2.3, category: 'other' },
  { name: 'Oregano', calories: 265, protein: 9, carbs: 69, fat: 4.3, fiber: 43, sugar: 4.1, category: 'other' },
  { name: 'Basil', calories: 22, protein: 3.2, carbs: 2.6, fat: 0.6, fiber: 1.6, sugar: 0.3, category: 'other' },
  { name: 'Thyme', calories: 101, protein: 5.6, carbs: 24, fat: 1.7, fiber: 14, sugar: 0, category: 'other' },
  { name: 'Rosemary', calories: 131, protein: 3.3, carbs: 21, fat: 5.9, fiber: 14, sugar: 0, category: 'other' },
  { name: 'Cinnamon', calories: 247, protein: 4, carbs: 80.6, fat: 1.2, fiber: 53.1, sugar: 2.2, category: 'other' },
  { name: 'Ginger', calories: 80, protein: 1.8, carbs: 18, fat: 0.8, fiber: 2, sugar: 1.7, category: 'other' },
  { name: 'Turmeric', calories: 354, protein: 8, carbs: 65, fat: 10, fiber: 21, sugar: 3.2, category: 'other' },
  { name: 'Vinegar', calories: 19, protein: 0, carbs: 0.9, fat: 0, fiber: 0, sugar: 0.4, category: 'other' },
  { name: 'Lemon Juice', calories: 22, protein: 0.4, carbs: 7, fat: 0.2, fiber: 0.3, sugar: 0, category: 'other' },
  { name: 'Lime Juice', calories: 25, protein: 0.4, carbs: 8.4, fat: 0.1, fiber: 0.2, sugar: 0, category: 'other' }
];

async function clearAndAddPureIngredients() {
  try {
    console.log('🗑️ Clearing all existing ingredients...');
    
    // Clear all existing ingredients
    const deleteResult = await prisma.ingredient.deleteMany({});
    console.log(`✅ Deleted ${deleteResult.count} existing ingredients`);
    
    console.log('\n🍎 Adding pure ingredients...\n');
    
    let added = 0;
    let errors = 0;
    
    for (const ingredient of PURE_INGREDIENTS) {
      try {
        await prisma.ingredient.create({
          data: {
            name: ingredient.name,
            calories: ingredient.calories,
            protein: ingredient.protein,
            carbs: ingredient.carbs,
            fat: ingredient.fat,
            fiber: ingredient.fiber,
            sugar: ingredient.sugar,
            category: ingredient.category,
            per: '100g',
            aliases: JSON.stringify([`Pure:${ingredient.name}`]),
            isActive: true
          }
        });
        
        console.log(`✅ Added: ${ingredient.name} (${ingredient.calories} cal, ${ingredient.protein}g protein, ${ingredient.carbs}g carbs, ${ingredient.fat}g fat) - ${ingredient.category}`);
        added++;
        
      } catch (error) {
        console.error(`❌ Error adding ${ingredient.name}:`, error.message);
        errors++;
      }
    }
    
    console.log(`\n📊 Summary:`);
    console.log(`   - Added: ${added} pure ingredients`);
    console.log(`   - Errors: ${errors}`);
    console.log(`   - Total processed: ${PURE_INGREDIENTS.length}`);
    
    // Show category distribution
    const categoryStats = await prisma.ingredient.groupBy({
      by: ['category'],
      _count: {
        category: true
      }
    });
    
    console.log(`\n📋 Category Distribution:`);
    categoryStats.forEach(stat => {
      console.log(`   ${stat.category}: ${stat._count.category} ingredients`);
    });
    
    console.log(`\n🎉 Database now contains only pure, essential ingredients!`);
    
  } catch (error) {
    console.error('❌ Process failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
clearAndAddPureIngredients();


