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

    // Nutritionix API endpoint
    const nutritionixUrl = 'https://trackapi.nutritionix.com/v2/search/instant';

    const response = await fetch(nutritionixUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'x-app-id': 'YOUR_APP_ID', // You need to get this from Nutritionix
        'x-app-key': apiKey
      },
      body: JSON.stringify({
        query: query,
        detailed: true
      })
    });

    if (!response.ok) {
      throw new Error(`Nutritionix API error: ${response.status}`);
    }

    const data = await response.json();

    // Transform Nutritionix data to our format
    const transformedFoods = data.common?.map((item: any) => {
      const nutrition = item.full_nutrients || [];
      
      return {
        id: item.food_name,
        name: item.food_name,
        calories: Math.round(getNutrientValue(nutrition, 208) || 0), // Energy
        protein: Math.round((getNutrientValue(nutrition, 203) || 0) * 10) / 10, // Protein
        carbs: Math.round((getNutrientValue(nutrition, 205) || 0) * 10) / 10, // Carbohydrates
        fat: Math.round((getNutrientValue(nutrition, 204) || 0) * 10) / 10, // Fat
        fiber: Math.round((getNutrientValue(nutrition, 291) || 0) * 10) / 10, // Fiber
        sugar: Math.round((getNutrientValue(nutrition, 269) || 0) * 10) / 10, // Sugars
        category: categorizeFood(item.food_name)
      };
    }) || [];

    return NextResponse.json({
      foods: transformedFoods,
      totalHits: data.common?.length || 0
    });

  } catch (error) {
    console.error('Nutritionix API Error:', error);
    return NextResponse.json(
      { error: 'Fout bij het ophalen van data van Nutritionix API' },
      { status: 500 }
    );
  }
}

function getNutrientValue(nutrients: any[], nutrientId: number): number {
  const nutrient = nutrients.find(n => n.attr_id === nutrientId);
  return nutrient ? nutrient.value : 0;
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




