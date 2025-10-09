import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';


export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { goal, carbType = 'middle' } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Calculation ID is required' },
        { status: 400 }
      );
    }

    // Get the nutrition calculation
    const calculation = await prisma.nutritionCalculation.findUnique({
      where: { id }
    });

    if (!calculation) {
      return NextResponse.json(
        { error: 'Nutrition calculation not found' },
        { status: 404 }
      );
    }

    // Calculate goal-based calories
    let targetCalories = calculation.maintenanceCalories;
    if (goal === 'weight-loss') {
      targetCalories = calculation.maintenanceCalories - 500; // 500 calorie deficit
    } else if (goal === 'weight-gain') {
      targetCalories = calculation.maintenanceCalories + 500; // 500 calorie surplus
    }

    // Define macro percentages based on carb type
    let carbPercentage, proteinPercentage, fatPercentage;
    
    switch (carbType) {
      case 'low':
        carbPercentage = 0.20;   // 20% carbs
        proteinPercentage = 0.35; // 35% protein
        fatPercentage = 0.45;    // 45% fat
        break;
      case 'high':
        carbPercentage = 0.60;   // 60% carbs
        proteinPercentage = 0.20; // 20% protein
        fatPercentage = 0.20;    // 20% fat
        break;
      case 'middle':
      default:
        carbPercentage = 0.45;   // 45% carbs
        proteinPercentage = 0.25; // 25% protein
        fatPercentage = 0.30;    // 30% fat
        break;
    }

    // Calculate macronutrients based on carb type
    const carbCalories = targetCalories * carbPercentage;
    const proteinCalories = targetCalories * proteinPercentage;
    const fatCalories = targetCalories * fatPercentage;

    const carbs = Math.round(carbCalories / 4);
    const protein = Math.round(proteinCalories / 4);
    const fat = Math.round(fatCalories / 9);

    // Create nutrition plan
    const nutritionPlan = await prisma.nutritionPlan.create({
      data: {
        name: `${calculation.customerName} - ${goal.charAt(0).toUpperCase() + goal.slice(1).replace('-', ' ')} (${carbType.charAt(0).toUpperCase() + carbType.slice(1)} Carbs)`,
        goal: goal,
        calories: Math.round(targetCalories),
        protein: protein,
        carbs: carbs,
        fat: fat,
        meals: 6, // Default to 6 meals (breakfast, morning-snack, lunch, afternoon-snack, dinner, evening-snack)
        description: `Personalized nutrition plan for ${calculation.customerName} based on calculation. Goal: ${goal.charAt(0).toUpperCase() + goal.slice(1).replace('-', ' ')} with ${carbType} carb approach (${Math.round(carbPercentage * 100)}% carbs, ${Math.round(proteinPercentage * 100)}% protein, ${Math.round(fatPercentage * 100)}% fat).`,
        weekMenu: {
          monday: {
            breakfast: "",
            "morning-snack": "",
            lunch: "",
            "afternoon-snack": "",
            dinner: "",
            "evening-snack": ""
          },
          tuesday: {
            breakfast: "",
            "morning-snack": "",
            lunch: "",
            "afternoon-snack": "",
            dinner: "",
            "evening-snack": ""
          },
          wednesday: {
            breakfast: "",
            "morning-snack": "",
            lunch: "",
            "afternoon-snack": "",
            dinner: "",
            "evening-snack": ""
          },
          thursday: {
            breakfast: "",
            "morning-snack": "",
            lunch: "",
            "afternoon-snack": "",
            dinner: "",
            "evening-snack": ""
          },
          friday: {
            breakfast: "",
            "morning-snack": "",
            lunch: "",
            "afternoon-snack": "",
            dinner: "",
            "evening-snack": ""
          },
          saturday: {
            breakfast: "",
            "morning-snack": "",
            lunch: "",
            "afternoon-snack": "",
            dinner: "",
            "evening-snack": ""
          },
          sunday: {
            breakfast: "",
            "morning-snack": "",
            lunch: "",
            "afternoon-snack": "",
            dinner: "",
            "evening-snack": ""
          }
        }
      }
    });

    // Create customer nutrition plan assignment
    await prisma.customerNutritionPlan.create({
      data: {
        customerId: calculation.customerId,
        nutritionPlanId: nutritionPlan.id,
        assignedAt: new Date(),
        status: 'active'
      }
    });

    return NextResponse.json({
      success: true,
      nutritionPlan,
      message: `Nutrition plan created successfully for ${calculation.customerName}`
    });
  } catch (error) {
    console.error('Error converting calculation to plan:', error);
    return NextResponse.json(
      { error: 'Failed to convert calculation to plan' },
      { status: 500 }
    );
  }
}
