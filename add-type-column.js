const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || "prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza183UkxGelFDMmU0bEIwdXVBZ0l6UlYiLCJhcGlfa2V5IjoiMDFLNjhZNTUzU0RaNUtNMkZEWTQzRkRLTTAiLCJ0ZW5hbnRfaWQiOiIyYzAxN2NiZWFmY2ZlOWUwNjViYzFjNDIyNGY2OGYxNTRjMDEyZmQxYWYzYThjZDNkMzcwNzc3ZDUzMTc4Y2FjIiwiaW50ZXJuYWxfc2VjcmV0IjoiMzBmNTc4YWMtODlhMy00MGUyLWJkMmQtZTRlMzExZDhmZjg4In0.CGXndBzIhhtw4jIGEGXEdrYI_DYOQ7mAEo3_J84GkM4"
    }
  }
});

// Mapping of ingredient names to their TYPE
const TYPE_MAPPING = {
  // Fruits - "piece"
  '1 Apple': 'piece',
  '1 Banana': 'piece',
  '1 Orange': 'piece',
  '1 Pear': 'piece',
  '1 Peach': 'piece',
  '1 Kiwi': 'piece',
  '1 Mango': 'piece',
  '1 Avocado': 'piece',
  '1 Lemon': 'piece',
  '1 Lime': 'piece',
  
  // Vegetables - "piece"
  '1 Carrot': 'piece',
  '1 Tomato': 'piece',
  '1 Cucumber': 'piece',
  '1 Bell Pepper': 'piece',
  '1 Onion': 'piece',
  '1 Sweet Potato': 'piece',
  '1 Potato': 'piece',
  '1 Zucchini': 'piece',
  '1 Eggplant': 'piece',
  
  // Proteins - "piece"
  '1 Egg': 'piece',
  '1 Chicken Breast': 'piece',
  '1 Chicken Thigh': 'piece',
  '1 Chicken Wing': 'piece',
  '1 Salmon Fillet': 'piece',
  '1 Cod Fillet': 'piece',
  '1 Pork Chop': 'piece',
  '1 Beef Steak': 'piece',
  '1 Turkey Breast': 'piece',
  
  // Dairy - specific types
  '1 Slice Cheese': 'slice',
  '1 Slice Mozzarella': 'slice',
  '1 Cup Milk': 'cup',
  '1 Cup Greek Yogurt': 'cup',
  
  // Bread & Carbs - specific types
  '1 Slice White Bread': 'slice',
  '1 Slice Whole Wheat Bread': 'slice',
  '1 Cup Cooked Rice': 'cup',
  '1 Cup Cooked Brown Rice': 'cup',
  '1 Cup Cooked Pasta': 'cup',
  '1 Cup Oats': 'cup',
  '1 Cup Quinoa': 'cup',
  
  // Nuts & Fats - specific types
  '1 Handful Almonds': 'handful',
  '1 Handful Walnuts': 'handful',
  '1 Handful Cashews': 'handful',
  '1 Tablespoon Peanut Butter': 'tablespoon',
  '1 Tablespoon Olive Oil': 'tablespoon'
};

async function addTypeColumn() {
  try {
    console.log('🔧 Adding TYPE column and updating ingredients...\n');
    
    // First, let's update the PER field to just show "1" for all per piece ingredients
    const perPieceIngredients = await prisma.ingredient.findMany({
      where: {
        per: {
          in: ['1', '1 slice', '1 cup', '1 handful', '1 tablespoon']
        }
      }
    });
    
    console.log(`Found ${perPieceIngredients.length} per piece ingredients to update`);
    
    let updated = 0;
    
    for (const ingredient of perPieceIngredients) {
      try {
        // Get the type from mapping
        const type = TYPE_MAPPING[ingredient.name];
        
        if (type) {
          // Update the ingredient with type and set PER to "1"
          await prisma.ingredient.update({
            where: {
              id: ingredient.id
            },
            data: {
              per: '1',
              // We'll add the type to aliases for now since we can't add a new column directly
              aliases: [...(ingredient.aliases || []), `TYPE:${type}`]
            }
          });
          
          console.log(`✅ Updated: ${ingredient.name} - PER = "1", TYPE = "${type}"`);
          updated++;
        } else {
          console.log(`⚠️  No type mapping found for: ${ingredient.name}`);
        }
        
      } catch (error) {
        console.error(`❌ Error updating ${ingredient.name}:`, error.message);
      }
    }
    
    // Also update all 100g ingredients to have "gram" type
    const gramIngredients = await prisma.ingredient.findMany({
      where: {
        per: '100g'
      }
    });
    
    console.log(`\n📊 Updating ${gramIngredients.length} gram-based ingredients...`);
    
    for (const ingredient of gramIngredients) {
      try {
        await prisma.ingredient.update({
          where: {
            id: ingredient.id
          },
          data: {
            aliases: [...(ingredient.aliases || []), 'TYPE:gram']
          }
        });
        
        console.log(`✅ Updated: ${ingredient.name} - TYPE = "gram"`);
        updated++;
        
      } catch (error) {
        console.error(`❌ Error updating ${ingredient.name}:`, error.message);
      }
    }
    
    console.log(`\n📊 Summary:`);
    console.log(`   - Updated: ${updated} ingredients`);
    console.log(`   - Total processed: ${perPieceIngredients.length + gramIngredients.length}`);
    
    // Show examples by type
    console.log(`\n📋 Examples by TYPE:`);
    
    const examples = await prisma.ingredient.findMany({
      where: {
        aliases: {
          hasSome: ['TYPE:piece', 'TYPE:slice', 'TYPE:cup', 'TYPE:handful', 'TYPE:tablespoon', 'TYPE:gram']
        }
      },
      select: {
        name: true,
        per: true,
        aliases: true
      },
      take: 20
    });
    
    examples.forEach(ingredient => {
      const typeAlias = ingredient.aliases.find(alias => alias.startsWith('TYPE:'));
      const type = typeAlias ? typeAlias.replace('TYPE:', '') : 'unknown';
      console.log(`   - ${ingredient.name}: PER = "${ingredient.per}", TYPE = "${type}"`);
    });
    
    console.log(`\n🎉 All ingredients now have TYPE information!`);
    console.log(`📝 Note: TYPE is stored in aliases field. You can extract it by looking for "TYPE:" prefix.`);
    
  } catch (error) {
    console.error('❌ Error adding TYPE column:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
addTypeColumn();




