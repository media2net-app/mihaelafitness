const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || "prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza183UkxGelFDMmU0bEIwdXVBZ0l6UlYiLCJhcGlfa2V5IjoiMDFLNjhZNTUzU0RaNUtNMkZEWTQzRkRLTTAiLCJ0ZW5hbnRfaWQiOiIyYzAxN2NiZWFmY2ZlOWUwNjViYzFjNDIyNGY2OGYxNTRjMDEyZmQxYWYzYThjZDNkMzcwNzc3ZDUzMTc4Y2FjIiwiaW50ZXJuYWxfc2VjcmV0IjoiMzBmNTc4YWMtODlhMy00MGUyLWJkMmQtZTRlMzExZDhmZjg4In0.CGXndBzIhhtw4jIGEGXEdrYI_DYOQ7mAEo3_J84GkM4"
    }
  }
});

// Pure fruitsoorten met betrouwbare voedingswaarden per 100g
const PURE_FRUITS = [
  // Appels
  { name: 'Apple', calories: 52, protein: 0.3, carbs: 13.8, fat: 0.2, fiber: 2.4, sugar: 10.4 },
  { name: 'Green Apple', calories: 52, protein: 0.3, carbs: 13.8, fat: 0.2, fiber: 2.4, sugar: 10.4 },
  { name: 'Red Apple', calories: 52, protein: 0.3, carbs: 13.8, fat: 0.2, fiber: 2.4, sugar: 10.4 },
  
  // Bananen
  { name: 'Banana', calories: 89, protein: 1.1, carbs: 22.8, fat: 0.3, fiber: 2.6, sugar: 12.2 },
  { name: 'Ripe Banana', calories: 89, protein: 1.1, carbs: 22.8, fat: 0.3, fiber: 2.6, sugar: 12.2 },
  
  // Mango
  { name: 'Mango', calories: 60, protein: 0.8, carbs: 15, fat: 0.4, fiber: 1.6, sugar: 13.7 },
  { name: 'Fresh Mango', calories: 60, protein: 0.8, carbs: 15, fat: 0.4, fiber: 1.6, sugar: 13.7 },
  
  // Ananas
  { name: 'Pineapple', calories: 50, protein: 0.5, carbs: 13.1, fat: 0.1, fiber: 1.4, sugar: 9.9 },
  { name: 'Fresh Pineapple', calories: 50, protein: 0.5, carbs: 13.1, fat: 0.1, fiber: 1.4, sugar: 9.9 },
  
  // Sinaasappel
  { name: 'Orange', calories: 47, protein: 0.9, carbs: 11.8, fat: 0.1, fiber: 2.4, sugar: 9.4 },
  { name: 'Fresh Orange', calories: 47, protein: 0.9, carbs: 11.8, fat: 0.1, fiber: 2.4, sugar: 9.4 },
  
  // Aardbei
  { name: 'Strawberry', calories: 32, protein: 0.7, carbs: 7.7, fat: 0.3, fiber: 2, sugar: 4.9 },
  { name: 'Fresh Strawberry', calories: 32, protein: 0.7, carbs: 7.7, fat: 0.3, fiber: 2, sugar: 4.9 },
  
  // Bosbes
  { name: 'Blueberry', calories: 57, protein: 0.7, carbs: 14.5, fat: 0.3, fiber: 2.4, sugar: 10 },
  { name: 'Fresh Blueberry', calories: 57, protein: 0.7, carbs: 14.5, fat: 0.3, fiber: 2.4, sugar: 10 },
  
  // Druif
  { name: 'Grape', calories: 67, protein: 0.6, carbs: 17, fat: 0.4, fiber: 0.9, sugar: 16 },
  { name: 'Red Grapes', calories: 67, protein: 0.6, carbs: 17, fat: 0.4, fiber: 0.9, sugar: 16 },
  { name: 'Green Grapes', calories: 67, protein: 0.6, carbs: 17, fat: 0.4, fiber: 0.9, sugar: 16 },
  
  // Citroen
  { name: 'Lemon', calories: 29, protein: 1.1, carbs: 9.3, fat: 0.3, fiber: 2.8, sugar: 2.5 },
  { name: 'Fresh Lemon', calories: 29, protein: 1.1, carbs: 9.3, fat: 0.3, fiber: 2.8, sugar: 2.5 },
  
  // Limoen
  { name: 'Lime', calories: 30, protein: 0.7, carbs: 10.5, fat: 0.2, fiber: 2.8, sugar: 1.7 },
  { name: 'Fresh Lime', calories: 30, protein: 0.7, carbs: 10.5, fat: 0.2, fiber: 2.8, sugar: 1.7 },
  
  // Kiwi
  { name: 'Kiwi', calories: 61, protein: 1.1, carbs: 14.7, fat: 0.5, fiber: 3, sugar: 9 },
  { name: 'Fresh Kiwi', calories: 61, protein: 1.1, carbs: 14.7, fat: 0.5, fiber: 3, sugar: 9 },
  
  // Peer
  { name: 'Pear', calories: 57, protein: 0.4, carbs: 15.2, fat: 0.1, fiber: 3.1, sugar: 9.8 },
  { name: 'Fresh Pear', calories: 57, protein: 0.4, carbs: 15.2, fat: 0.1, fiber: 3.1, sugar: 9.8 },
  
  // Perzik
  { name: 'Peach', calories: 39, protein: 0.9, carbs: 9.5, fat: 0.3, fiber: 1.5, sugar: 8.4 },
  { name: 'Fresh Peach', calories: 39, protein: 0.9, carbs: 9.5, fat: 0.3, fiber: 1.5, sugar: 8.4 },
  
  // Kers
  { name: 'Cherry', calories: 63, protein: 1.1, carbs: 16, fat: 0.2, fiber: 2.1, sugar: 12.8 },
  { name: 'Fresh Cherry', calories: 63, protein: 1.1, carbs: 16, fat: 0.2, fiber: 2.1, sugar: 12.8 },
  
  // Pruim
  { name: 'Plum', calories: 46, protein: 0.7, carbs: 11.4, fat: 0.3, fiber: 1.4, sugar: 9.9 },
  { name: 'Fresh Plum', calories: 46, protein: 0.7, carbs: 11.4, fat: 0.3, fiber: 1.4, sugar: 9.9 },
  
  // Watermeloen
  { name: 'Watermelon', calories: 30, protein: 0.6, carbs: 7.6, fat: 0.2, fiber: 0.4, sugar: 6.2 },
  { name: 'Fresh Watermelon', calories: 30, protein: 0.6, carbs: 7.6, fat: 0.2, fiber: 0.4, sugar: 6.2 },
  
  // Meloen
  { name: 'Cantaloupe', calories: 34, protein: 0.8, carbs: 8.2, fat: 0.2, fiber: 0.9, sugar: 7.9 },
  { name: 'Fresh Cantaloupe', calories: 34, protein: 0.8, carbs: 8.2, fat: 0.2, fiber: 0.9, sugar: 7.9 },
  
  // Granaatappel
  { name: 'Pomegranate', calories: 83, protein: 1.7, carbs: 18.7, fat: 1.2, fiber: 4, sugar: 13.7 },
  { name: 'Fresh Pomegranate', calories: 83, protein: 1.7, carbs: 18.7, fat: 1.2, fiber: 4, sugar: 13.7 },
  
  // Vijg
  { name: 'Fig', calories: 74, protein: 0.8, carbs: 19.2, fat: 0.3, fiber: 2.9, sugar: 16.3 },
  { name: 'Fresh Fig', calories: 74, protein: 0.8, carbs: 19.2, fat: 0.3, fiber: 2.9, sugar: 16.3 },
  
  // Dadel
  { name: 'Date', calories: 277, protein: 1.8, carbs: 75, fat: 0.2, fiber: 6.7, sugar: 66.5 },
  { name: 'Fresh Date', calories: 277, protein: 1.8, carbs: 75, fat: 0.2, fiber: 6.7, sugar: 66.5 },
  
  // Rozijn
  { name: 'Raisin', calories: 299, protein: 3.1, carbs: 79, fat: 0.5, fiber: 3.7, sugar: 59.2 },
  { name: 'Dried Raisin', calories: 299, protein: 3.1, carbs: 79, fat: 0.5, fiber: 3.7, sugar: 59.2 }
];

async function addPureFruits() {
  try {
    console.log('🍎 Adding pure fruit ingredients...\n');
    
    let added = 0;
    let skipped = 0;
    
    for (const fruit of PURE_FRUITS) {
      try {
        // Check if ingredient already exists
        const existing = await prisma.ingredient.findFirst({
          where: {
            name: {
              equals: fruit.name,
              mode: 'insensitive'
            }
          }
        });
        
        if (existing) {
          console.log(`⚠️  ${fruit.name} already exists, skipping`);
          skipped++;
          continue;
        }
        
        // Create new ingredient
        await prisma.ingredient.create({
          data: {
            name: fruit.name,
            calories: fruit.calories,
            protein: fruit.protein,
            carbs: fruit.carbs,
            fat: fruit.fat,
            fiber: fruit.fiber,
            sugar: fruit.sugar,
            category: 'fruits',
            per: '100g',
            aliases: [`Pure:${fruit.name}`],
            isActive: true
          }
        });
        
        console.log(`✅ Added: ${fruit.name} (${fruit.calories} cal, ${fruit.protein}g protein, ${fruit.carbs}g carbs, ${fruit.fat}g fat)`);
        added++;
        
      } catch (error) {
        console.error(`❌ Error adding ${fruit.name}:`, error.message);
      }
    }
    
    console.log(`\n📊 Summary:`);
    console.log(`   - Added: ${added} pure fruits`);
    console.log(`   - Skipped: ${skipped} (already existed)`);
    console.log(`   - Total processed: ${PURE_FRUITS.length}`);
    
    // Show final fruit count
    const totalFruits = await prisma.ingredient.count({
      where: {
        category: 'fruits'
      }
    });
    
    console.log(`\n🍎 Total fruit ingredients in database: ${totalFruits}`);
    
  } catch (error) {
    console.error('❌ Error adding pure fruits:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
addPureFruits();




