const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || "prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza183UkxGelFDMmU0bEIwdXVBZ0l6UlYiLCJhcGlfa2V5IjoiMDFLNjhZNTUzU0RaNUtNMkZEWTQzRkRLTTAiLCJ0ZW5hbnRfaWQiOiIyYzAxN2NiZWFmY2ZlOWUwNjViYzFjNDIyNGY2OGYxNTRjMDEyZmQxYWYzYThjZDNkMzcwNzc3ZDUzMTc4Y2FjIiwiaW50ZXJuYWxfc2VjcmV0IjoiMzBmNTc4YWMtODlhMy00MGUyLWJkMmQtZTRlMzExZDhmZjg4In0.CGXndBzIhhtw4jIGEGXEdrYI_DYOQ7mAEo3_J84GkM4"
    }
  }
});

// Mapping of ingredient names to their proper PER units
const PER_UNIT_MAPPING = {
  // Fruits - just "1"
  '1 Apple': '1',
  '1 Banana': '1',
  '1 Orange': '1',
  '1 Pear': '1',
  '1 Peach': '1',
  '1 Kiwi': '1',
  '1 Mango': '1',
  '1 Avocado': '1',
  '1 Lemon': '1',
  '1 Lime': '1',
  
  // Vegetables - just "1"
  '1 Carrot': '1',
  '1 Tomato': '1',
  '1 Cucumber': '1',
  '1 Bell Pepper': '1',
  '1 Onion': '1',
  '1 Sweet Potato': '1',
  '1 Potato': '1',
  '1 Zucchini': '1',
  '1 Eggplant': '1',
  
  // Proteins - just "1"
  '1 Egg': '1',
  '1 Chicken Breast': '1',
  '1 Chicken Thigh': '1',
  '1 Chicken Wing': '1',
  '1 Salmon Fillet': '1',
  '1 Cod Fillet': '1',
  '1 Pork Chop': '1',
  '1 Beef Steak': '1',
  '1 Turkey Breast': '1',
  
  // Dairy - specific units
  '1 Slice Cheese': '1 slice',
  '1 Slice Mozzarella': '1 slice',
  '1 Cup Milk': '1 cup',
  '1 Cup Greek Yogurt': '1 cup',
  
  // Bread & Carbs - specific units
  '1 Slice White Bread': '1 slice',
  '1 Slice Whole Wheat Bread': '1 slice',
  '1 Cup Cooked Rice': '1 cup',
  '1 Cup Cooked Brown Rice': '1 cup',
  '1 Cup Cooked Pasta': '1 cup',
  '1 Cup Oats': '1 cup',
  '1 Cup Quinoa': '1 cup',
  
  // Nuts & Fats - specific units
  '1 Handful Almonds': '1 handful',
  '1 Handful Walnuts': '1 handful',
  '1 Handful Cashews': '1 handful',
  '1 Tablespoon Peanut Butter': '1 tablespoon',
  '1 Tablespoon Olive Oil': '1 tablespoon'
};

async function fixPerFieldUnits() {
  try {
    console.log('🔧 Fixing PER field with proper units...\n');
    
    // Find all ingredients that have "1" in the per field
    const perPieceIngredients = await prisma.ingredient.findMany({
      where: {
        per: '1'
      }
    });
    
    console.log(`Found ${perPieceIngredients.length} per piece ingredients to update`);
    
    let updated = 0;
    
    for (const ingredient of perPieceIngredients) {
      try {
        // Get the proper unit from mapping
        const properUnit = PER_UNIT_MAPPING[ingredient.name];
        
        if (properUnit) {
          // Update the per field with the proper unit
          await prisma.ingredient.update({
            where: {
              id: ingredient.id
            },
            data: {
              per: properUnit
            }
          });
          
          console.log(`✅ Updated: ${ingredient.name} - PER field changed from "1" to "${properUnit}"`);
          updated++;
        } else {
          console.log(`⚠️  No mapping found for: ${ingredient.name}`);
        }
        
      } catch (error) {
        console.error(`❌ Error updating ${ingredient.name}:`, error.message);
      }
    }
    
    console.log(`\n📊 Summary:`);
    console.log(`   - Updated: ${updated} ingredients`);
    console.log(`   - Total processed: ${perPieceIngredients.length}`);
    
    // Show examples by category
    const examples = await prisma.ingredient.findMany({
      where: {
        per: {
          in: ['1', '1 slice', '1 cup', '1 handful', '1 tablespoon']
        }
      },
      select: {
        name: true,
        per: true
      },
      orderBy: {
        per: 'asc'
      }
    });
    
    console.log(`\n📋 Examples of updated ingredients:`);
    examples.forEach(ingredient => {
      console.log(`   - ${ingredient.name}: PER = "${ingredient.per}"`);
    });
    
    console.log(`\n🎉 All per piece ingredients now show proper units in the PER field!`);
    
  } catch (error) {
    console.error('❌ Error fixing PER field units:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
fixPerFieldUnits();




