import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function removeWrongAssignment() {
  try {
    const assignmentId = 'cmi2q8r860001dy6gpqcuu777'; // De assignment die ik net gemaakt heb
    
    console.log('🗑️ Verwijderen van verkeerde assignment...\n');
    
    const assignment = await prisma.customerNutritionPlan.findUnique({
      where: { id: assignmentId },
      include: {
        customer: {
          select: {
            name: true,
            email: true,
          }
        },
        nutritionPlan: {
          select: {
            name: true,
          }
        }
      }
    });

    if (!assignment) {
      console.log('❌ Assignment niet gevonden');
      return;
    }

    console.log(`Assignment gevonden:`);
    console.log(`  Klant: ${assignment.customer.name}`);
    console.log(`  Plan: ${assignment.nutritionPlan.name}`);
    
    await prisma.customerNutritionPlan.delete({
      where: { id: assignmentId }
    });

    console.log(`\n✅ Assignment verwijderd!`);
    
  } catch (error) {
    console.error('❌ Fout:', error);
  } finally {
    await prisma.$disconnect();
  }
}

removeWrongAssignment();






