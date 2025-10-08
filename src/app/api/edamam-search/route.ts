import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const apiKey = searchParams.get('apiKey');

    if (!query || !apiKey) {
      return NextResponse.json(
        { error: 'Query en API key zijn vereist' },
        { status: 400 }
      );
    }

    // Edamam Nutrition API endpoint
    const edamamUrl = `https://api.edamam.com/api/food-database/v2/parser?app_id=YOUR_APP_ID&app_key=${apiKey}&ingr=${encodeURIComponent(query)}&nutrition-type=cooking`;

    const response = await fetch(edamamUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Edamam API error: ${response.status}`);
    }

    const data = await response.json();

    // Transform Edamam data to our format
    const transformedFoods = data.hints?.map((hint: any) => {
      const food = hint.food;
      const nutrients = food.nutrients || {};
      
      return {
        id: food.foodId,
        name: food.label,
        calories: Math.round(nutrients.ENERC_KCAL || 0),
        protein: Math.round((nutrients.PROCNT || 0) * 10) / 10,
        carbs: Math.round((nutrients.CHOCDF || 0) * 10) / 10,
        fat: Math.round((nutrients.FAT || 0) * 10) / 10,
        fiber: Math.round((nutrients.FIBTG || 0) * 10) / 10,
        sugar: Math.round((nutrients.SUGAR || 0) * 10) / 10,
        category: categorizeFood(food.label)
      };
    }) || [];

    return NextResponse.json({
      foods: transformedFoods,
      totalHits: data.hints?.length || 0
    });

  } catch (error) {
    console.error('Edamam API Error:', error);
    return NextResponse.json(
      { error: 'Fout bij het ophalen van data van Edamam API' },
      { status: 500 }
    );
  }
}

function categorizeFood(name: string): string {
  const lowerName = name.toLowerCase();
  
  if (lowerName.includes('chicken') || lowerName.includes('beef') || lowerName.includes('fish') || lowerName.includes('egg') || lowerName.includes('salmon') || lowerName.includes('turkey')) {
    return 'proteins';
  } else if (lowerName.includes('rice') || lowerName.includes('pasta') || lowerName.includes('bread') || lowerName.includes('oats') || lowerName.includes('quinoa')) {
    return 'carbohydrates';
  } else if (lowerName.includes('avocado') || lowerName.includes('oil') || lowerName.includes('nuts') || lowerName.includes('almond') || lowerName.includes('walnut')) {
    return 'healthy-fats';
  } else if (lowerName.includes('apple') || lowerName.includes('banana') || lowerName.includes('berry') || lowerName.includes('orange') || lowerName.includes('grape')) {
    return 'fruits';
  } else if (lowerName.includes('broccoli') || lowerName.includes('spinach') || lowerName.includes('carrot') || lowerName.includes('lettuce') || lowerName.includes('tomato')) {
    return 'vegetables';
  } else if (lowerName.includes('milk') || lowerName.includes('cheese') || lowerName.includes('yogurt') || lowerName.includes('butter')) {
    return 'dairy';
  }
  return 'other';
}




