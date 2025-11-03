// Script to fix negative Bulgur quantity
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixNegativeBulgur() {
  try {
    const recipe = await prisma.recipe.findFirst({
      where: { name: 'Cod Fillet with Bulgur and Mediterranean Vegetables' },
      include: { ingredients: { where: { name: { contains: 'Bulgur', mode: 'insensitive' } } } }
    });
    
    if (recipe && recipe.ingredients.length > 0) {
      const ing = recipe.ingredients[0];
      console.log(`Found: ${ing.name}, quantity: ${ing.quantity} ${ing.unit}`);
      
      // Fix negative quantity - estimate based on typical recipe (should be around 150-200g cooked bulgur)
      const correctQuantity = 180;
      
      await prisma.recipeIngredient.update({
        where: { id: ing.id },
        data: { quantity: correctQuantity }
      });
      
      console.log(`✅ Fixed: Changed quantity from ${ing.quantity} to ${correctQuantity}`);
    }
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixNegativeBulgur();

