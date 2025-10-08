const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || "prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza183UkxGelFDMmU0bEIwdXVBZ0l6UlYiLCJhcGlfa2V5IjoiMDFLNjhZNTUzU0RaNUtNMkZEWTQzRkRLTTAiLCJ0ZW5hbnRfaWQiOiIyYzAxN2NiZWFmY2ZlOWUwNjViYzFjNDIyNGY2OGYxNTRjMDEyZmQxYWYzYThjZDNkMzcwNzc3ZDUzMTc4Y2FjIiwiaW50ZXJuYWxfc2VjcmV0IjoiMzBmNTc4YWMtODlhMy00MGUyLWJkMmQtZTRlMzExZDhmZjg4In0.CGXndBzIhhtw4jIGEGXEdrYI_DYOQ7mAEo3_J84GkM4"
    }
  }
});

async function fixPerField() {
  try {
    console.log('🔧 Fixing PER field for per piece ingredients...\n');
    
    // Find all ingredients that have "1 piece" in the per field
    const perPieceIngredients = await prisma.ingredient.findMany({
      where: {
        per: '1 piece'
      }
    });
    
    console.log(`Found ${perPieceIngredients.length} per piece ingredients to update`);
    
    let updated = 0;
    
    for (const ingredient of perPieceIngredients) {
      try {
        // Update the per field to just "1"
        await prisma.ingredient.update({
          where: {
            id: ingredient.id
          },
          data: {
            per: '1'
          }
        });
        
        console.log(`✅ Updated: ${ingredient.name} - PER field changed from "1 piece" to "1"`);
        updated++;
        
      } catch (error) {
        console.error(`❌ Error updating ${ingredient.name}:`, error.message);
      }
    }
    
    console.log(`\n📊 Summary:`);
    console.log(`   - Updated: ${updated} ingredients`);
    console.log(`   - Total processed: ${perPieceIngredients.length}`);
    
    // Show some examples
    const examples = await prisma.ingredient.findMany({
      where: {
        per: '1'
      },
      select: {
        name: true,
        per: true
      },
      take: 10
    });
    
    console.log(`\n📋 Examples of updated ingredients:`);
    examples.forEach(ingredient => {
      console.log(`   - ${ingredient.name}: PER = "${ingredient.per}"`);
    });
    
    console.log(`\n🎉 All per piece ingredients now show "1" in the PER field!`);
    
  } catch (error) {
    console.error('❌ Error fixing PER field:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
fixPerField();




