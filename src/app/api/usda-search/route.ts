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

    // USDA FoodData Central API endpoint
    const usdaUrl = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(query)}&api_key=${apiKey}&pageSize=20`;

    const response = await fetch(usdaUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`USDA API error: ${response.status}`);
    }

    const data = await response.json();

    // Transform USDA data to our format
    const transformedFoods = data.foods?.map((food: any) => ({
      fdcId: food.fdcId,
      description: food.description,
      foodNutrients: food.foodNutrients || []
    })) || [];

    return NextResponse.json({
      foods: transformedFoods,
      totalHits: data.totalHits || 0
    });

  } catch (error) {
    console.error('USDA API Error:', error);
    return NextResponse.json(
      { error: 'Fout bij het ophalen van data van USDA API' },
      { status: 500 }
    );
  }
}




