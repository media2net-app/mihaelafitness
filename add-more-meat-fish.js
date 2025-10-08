const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || "prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza183UkxGelFDMmU0bEIwdXVBZ0l6UlYiLCJhcGlfa2V5IjoiMDFLNjhZNTUzU0RaNUtNMkZEWTQzRkRLTTAiLCJ0ZW5hbnRfaWQiOiIyYzAxN2NiZWFmY2ZlOWUwNjViYzFjNDIyNGY2OGYxNTRjMDEyZmQxYWYzYThjZDNkMzcwNzc3ZDUzMTc4Y2FjIiwiaW50ZXJuYWxfc2VjcmV0IjoiMzBmNTc4YWMtODlhMy00MGUyLWJkMmQtZTRlMzExZDhmZjg4In0.CGXndBzIhhtw4jIGEGXEdrYI_DYOQ7mAEo3_J84GkM4"
    }
  }
});

// Meer specifieke vlees- en visingredienten
const MORE_MEAT_FISH = [
  // BEEF VARIETIES
  { name: 'Beef Steak', calories: 250, protein: 26, carbs: 0, fat: 15, fiber: 0, sugar: 0, category: 'proteins' },
  { name: 'Ribeye Steak', calories: 291, protein: 25, carbs: 0, fat: 20, fiber: 0, sugar: 0, category: 'proteins' },
  { name: 'Sirloin Steak', calories: 250, protein: 26, carbs: 0, fat: 15, fiber: 0, sugar: 0, category: 'proteins' },
  { name: 'Tenderloin', calories: 250, protein: 26, carbs: 0, fat: 15, fiber: 0, sugar: 0, category: 'proteins' },
  { name: 'Ground Beef', calories: 254, protein: 25, carbs: 0, fat: 16, fiber: 0, sugar: 0, category: 'proteins' },
  { name: 'Beef Chuck', calories: 250, protein: 26, carbs: 0, fat: 15, fiber: 0, sugar: 0, category: 'proteins' },
  { name: 'Beef Brisket', calories: 250, protein: 26, carbs: 0, fat: 15, fiber: 0, sugar: 0, category: 'proteins' },
  { name: 'Beef Short Ribs', calories: 250, protein: 26, carbs: 0, fat: 15, fiber: 0, sugar: 0, category: 'proteins' },
  
  // PORK VARIETIES
  { name: 'Pork Chop', calories: 242, protein: 27.3, carbs: 0, fat: 13.9, fiber: 0, sugar: 0, category: 'proteins' },
  { name: 'Pork Tenderloin', calories: 143, protein: 26, carbs: 0, fat: 3, fiber: 0, sugar: 0, category: 'proteins' },
  { name: 'Pork Shoulder', calories: 242, protein: 27.3, carbs: 0, fat: 13.9, fiber: 0, sugar: 0, category: 'proteins' },
  { name: 'Pork Belly', calories: 518, protein: 9, carbs: 0, fat: 53, fiber: 0, sugar: 0, category: 'proteins' },
  { name: 'Ground Pork', calories: 242, protein: 27.3, carbs: 0, fat: 13.9, fiber: 0, sugar: 0, category: 'proteins' },
  { name: 'Pork Ribs', calories: 242, protein: 27.3, carbs: 0, fat: 13.9, fiber: 0, sugar: 0, category: 'proteins' },
  { name: 'Bacon', calories: 541, protein: 37, carbs: 1.4, fat: 42, fiber: 0, sugar: 0, category: 'proteins' },
  { name: 'Ham', calories: 145, protein: 18, carbs: 1.5, fat: 7, fiber: 0, sugar: 0, category: 'proteins' },
  
  // CHICKEN VARIETIES
  { name: 'Chicken Thigh', calories: 209, protein: 26, carbs: 0, fat: 10, fiber: 0, sugar: 0, category: 'proteins' },
  { name: 'Chicken Wing', calories: 203, protein: 18, carbs: 0, fat: 14, fiber: 0, sugar: 0, category: 'proteins' },
  { name: 'Chicken Drumstick', calories: 172, protein: 28, carbs: 0, fat: 5, fiber: 0, sugar: 0, category: 'proteins' },
  { name: 'Chicken Leg', calories: 172, protein: 28, carbs: 0, fat: 5, fiber: 0, sugar: 0, category: 'proteins' },
  { name: 'Ground Chicken', calories: 143, protein: 27, carbs: 0, fat: 3, fiber: 0, sugar: 0, category: 'proteins' },
  { name: 'Chicken Liver', calories: 116, protein: 17, carbs: 0.7, fat: 4.8, fiber: 0, sugar: 0, category: 'proteins' },
  { name: 'Duck', calories: 337, protein: 19, carbs: 0, fat: 28, fiber: 0, sugar: 0, category: 'proteins' },
  { name: 'Goose', calories: 161, protein: 22, carbs: 0, fat: 7, fiber: 0, sugar: 0, category: 'proteins' },
  
  // LAMB VARIETIES
  { name: 'Lamb Chop', calories: 294, protein: 25, carbs: 0, fat: 21, fiber: 0, sugar: 0, category: 'proteins' },
  { name: 'Lamb Leg', calories: 294, protein: 25, carbs: 0, fat: 21, fiber: 0, sugar: 0, category: 'proteins' },
  { name: 'Lamb Shoulder', calories: 294, protein: 25, carbs: 0, fat: 21, fiber: 0, sugar: 0, category: 'proteins' },
  { name: 'Ground Lamb', calories: 294, protein: 25, carbs: 0, fat: 21, fiber: 0, sugar: 0, category: 'proteins' },
  
  // TURKEY VARIETIES
  { name: 'Turkey Thigh', calories: 189, protein: 29, carbs: 0, fat: 7, fiber: 0, sugar: 0, category: 'proteins' },
  { name: 'Turkey Wing', calories: 189, protein: 29, carbs: 0, fat: 7, fiber: 0, sugar: 0, category: 'proteins' },
  { name: 'Ground Turkey', calories: 189, protein: 29, carbs: 0, fat: 7, fiber: 0, sugar: 0, category: 'proteins' },
  { name: 'Turkey Breast', calories: 135, protein: 30, carbs: 0, fat: 1, fiber: 0, sugar: 0, category: 'proteins' },
  
  // FISH VARIETIES
  { name: 'Cod Fillet', calories: 82, protein: 18, carbs: 0, fat: 0.7, fiber: 0, sugar: 0, category: 'proteins' },
  { name: 'Haddock', calories: 90, protein: 20, carbs: 0, fat: 0.6, fiber: 0, sugar: 0, category: 'proteins' },
  { name: 'Halibut', calories: 111, protein: 23, carbs: 0, fat: 1.3, fiber: 0, sugar: 0, category: 'proteins' },
  { name: 'Mackerel', calories: 205, protein: 19, carbs: 0, fat: 14, fiber: 0, sugar: 0, category: 'proteins' },
  { name: 'Sardines', calories: 208, protein: 25, carbs: 0, fat: 11, fiber: 0, sugar: 0, category: 'proteins' },
  { name: 'Anchovies', calories: 131, protein: 20, carbs: 0, fat: 4.8, fiber: 0, sugar: 0, category: 'proteins' },
  { name: 'Trout', calories: 119, protein: 20, carbs: 0, fat: 3.5, fiber: 0, sugar: 0, category: 'proteins' },
  { name: 'Bass', calories: 97, protein: 18, carbs: 0, fat: 2, fiber: 0, sugar: 0, category: 'proteins' },
  { name: 'Snapper', calories: 100, protein: 20, carbs: 0, fat: 1.3, fiber: 0, sugar: 0, category: 'proteins' },
  { name: 'Grouper', calories: 92, protein: 19, carbs: 0, fat: 1.2, fiber: 0, sugar: 0, category: 'proteins' },
  { name: 'Mahi Mahi', calories: 85, protein: 18, carbs: 0, fat: 0.7, fiber: 0, sugar: 0, category: 'proteins' },
  { name: 'Swordfish', calories: 144, protein: 23, carbs: 0, fat: 4.9, fiber: 0, sugar: 0, category: 'proteins' },
  { name: 'Tilapia', calories: 96, protein: 20, carbs: 0, fat: 1.7, fiber: 0, sugar: 0, category: 'proteins' },
  { name: 'Catfish', calories: 95, protein: 18, carbs: 0, fat: 2.3, fiber: 0, sugar: 0, category: 'proteins' },
  { name: 'Perch', calories: 91, protein: 19, carbs: 0, fat: 0.9, fiber: 0, sugar: 0, category: 'proteins' },
  { name: 'Pike', calories: 88, protein: 19, carbs: 0, fat: 0.7, fiber: 0, sugar: 0, category: 'proteins' },
  { name: 'Carp', calories: 127, protein: 18, carbs: 0, fat: 5.6, fiber: 0, sugar: 0, category: 'proteins' },
  { name: 'Herring', calories: 158, protein: 18, carbs: 0, fat: 9, fiber: 0, sugar: 0, category: 'proteins' },
  { name: 'Pollock', calories: 82, protein: 18, carbs: 0, fat: 0.6, fiber: 0, sugar: 0, category: 'proteins' },
  { name: 'Whiting', calories: 90, protein: 18, carbs: 0, fat: 1.2, fiber: 0, sugar: 0, category: 'proteins' },
  
  // SHELLFISH VARIETIES
  { name: 'Mussels', calories: 86, protein: 12, carbs: 3.7, fat: 2.2, fiber: 0, sugar: 0, category: 'proteins' },
  { name: 'Oysters', calories: 68, protein: 7, carbs: 4, fat: 2.5, fiber: 0, sugar: 0, category: 'proteins' },
  { name: 'Scallops', calories: 69, protein: 12, carbs: 2.4, fat: 0.8, fiber: 0, sugar: 0, category: 'proteins' },
  { name: 'Clams', calories: 86, protein: 14, carbs: 2.6, fat: 1.7, fiber: 0, sugar: 0, category: 'proteins' },
  { name: 'Squid', calories: 92, protein: 16, carbs: 3, fat: 1.4, fiber: 0, sugar: 0, category: 'proteins' },
  { name: 'Octopus', calories: 82, protein: 15, carbs: 2.2, fat: 1, fiber: 0, sugar: 0, category: 'proteins' },
  { name: 'Crayfish', calories: 82, protein: 16, carbs: 0, fat: 1.2, fiber: 0, sugar: 0, category: 'proteins' },
  { name: 'Lobster Tail', calories: 89, protein: 19, carbs: 0, fat: 0.9, fiber: 0, sugar: 0, category: 'proteins' },
  
  // GAME MEAT
  { name: 'Venison', calories: 158, protein: 30, carbs: 0, fat: 3.2, fiber: 0, sugar: 0, category: 'proteins' },
  { name: 'Rabbit', calories: 173, protein: 33, carbs: 0, fat: 3.5, fiber: 0, sugar: 0, category: 'proteins' },
  { name: 'Bison', calories: 143, protein: 28, carbs: 0, fat: 2.4, fiber: 0, sugar: 0, category: 'proteins' },
  { name: 'Elk', calories: 111, protein: 22, carbs: 0, fat: 1.4, fiber: 0, sugar: 0, category: 'proteins' },
  { name: 'Wild Boar', calories: 160, protein: 28, carbs: 0, fat: 4.3, fiber: 0, sugar: 0, category: 'proteins' }
];

async function addMoreMeatFish() {
  try {
    console.log('🥩 Adding more meat and fish varieties...\n');
    
    let added = 0;
    let skipped = 0;
    
    for (const ingredient of MORE_MEAT_FISH) {
      try {
        // Check if ingredient already exists
        const existing = await prisma.ingredient.findFirst({
          where: {
            name: {
              equals: ingredient.name,
              mode: 'insensitive'
            }
          }
        });
        
        if (existing) {
          console.log(`⚠️  ${ingredient.name} already exists, skipping`);
          skipped++;
          continue;
        }
        
        // Create new ingredient
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
            aliases: [`Pure:${ingredient.name}`],
            isActive: true
          }
        });
        
        console.log(`✅ Added: ${ingredient.name} (${ingredient.calories} cal, ${ingredient.protein}g protein, ${ingredient.carbs}g carbs, ${ingredient.fat}g fat)`);
        added++;
        
      } catch (error) {
        console.error(`❌ Error adding ${ingredient.name}:`, error.message);
      }
    }
    
    console.log(`\n📊 Summary:`);
    console.log(`   - Added: ${added} meat/fish varieties`);
    console.log(`   - Skipped: ${skipped} (already existed)`);
    console.log(`   - Total processed: ${MORE_MEAT_FISH.length}`);
    
    // Show protein category count
    const proteinCount = await prisma.ingredient.count({
      where: {
        category: 'proteins'
      }
    });
    
    console.log(`\n🥩 Total protein ingredients in database: ${proteinCount}`);
    
    // Show all protein ingredients
    const proteins = await prisma.ingredient.findMany({
      where: {
        category: 'proteins'
      },
      select: {
        name: true,
        calories: true,
        protein: true
      },
      orderBy: {
        name: 'asc'
      }
    });
    
    console.log(`\n🥩 All protein ingredients:`);
    proteins.forEach(protein => {
      console.log(`   - ${protein.name} (${protein.calories} cal, ${protein.protein}g protein)`);
    });
    
  } catch (error) {
    console.error('❌ Error adding meat/fish:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
addMoreMeatFish();




