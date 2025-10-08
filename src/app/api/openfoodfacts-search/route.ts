import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');

    if (!query) {
      return NextResponse.json(
        { error: 'Query is vereist' },
        { status: 400 }
      );
    }

    // Open Food Facts API endpoint
    const offUrl = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=20`;

    const response = await fetch(offUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'MihaelaFitness/1.0'
      },
    });

    if (!response.ok) {
      throw new Error(`Open Food Facts API error: ${response.status}`);
    }

    const data = await response.json();

    // Transform Open Food Facts data to our format
    const transformedFoods = data.products?.map((product: any) => {
      const nutriments = product.nutriments || {};
      
      return {
        id: product.code || product._id,
        name: product.product_name || product.product_name_en || 'Unknown Product',
        calories: Math.round(nutriments['energy-kcal_100g'] || nutriments['energy_100g'] / 4.184 || 0),
        protein: Math.round((nutriments['proteins_100g'] || 0) * 10) / 10,
        carbs: Math.round((nutriments['carbohydrates_100g'] || 0) * 10) / 10,
        fat: Math.round((nutriments['fat_100g'] || 0) * 10) / 10,
        fiber: Math.round((nutriments['fiber_100g'] || 0) * 10) / 10,
        sugar: Math.round((nutriments['sugars_100g'] || 0) * 10) / 10,
        category: categorizeFood(product.product_name || product.product_name_en || '')
      };
    }).filter((food: any) => food.calories > 0) || []; // Filter out products with no nutritional data

    return NextResponse.json({
      foods: transformedFoods,
      totalHits: data.count || 0
    });

  } catch (error) {
    console.error('Open Food Facts API Error:', error);
    return NextResponse.json(
      { error: 'Fout bij het ophalen van data van Open Food Facts API' },
      { status: 500 }
    );
  }
}

function categorizeFood(name: string): string {
  const lowerName = name.toLowerCase();
  
  if (lowerName.includes('chicken') || lowerName.includes('beef') || lowerName.includes('fish') || lowerName.includes('egg') || lowerName.includes('salmon') || lowerName.includes('turkey') || lowerName.includes('meat')) {
    return 'proteins';
  } else if (lowerName.includes('rice') || lowerName.includes('pasta') || lowerName.includes('bread') || lowerName.includes('oats') || lowerName.includes('quinoa') || lowerName.includes('cereal')) {
    return 'carbohydrates';
  } else if (lowerName.includes('avocado') || lowerName.includes('oil') || lowerName.includes('nuts') || lowerName.includes('almond') || lowerName.includes('walnut') || lowerName.includes('butter')) {
    return 'healthy-fats';
  } else if (lowerName.includes('apple') || lowerName.includes('banana') || lowerName.includes('berry') || lowerName.includes('orange') || lowerName.includes('grape') || lowerName.includes('fruit')) {
    return 'fruits';
  } else if (lowerName.includes('broccoli') || lowerName.includes('spinach') || lowerName.includes('carrot') || lowerName.includes('lettuce') || lowerName.includes('tomato') || lowerName.includes('vegetable')) {
    return 'vegetables';
  } else if (lowerName.includes('milk') || lowerName.includes('cheese') || lowerName.includes('yogurt') || lowerName.includes('dairy')) {
    return 'dairy';
  }
  return 'other';
}




