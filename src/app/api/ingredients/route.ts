import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const format = searchParams.get('format');

    let whereClause: any = {
      isActive: true
    };

    // Filter by category if provided
    if (category && category !== 'all') {
      whereClause.category = category;
    }

    // Search by name or aliases if provided
    if (search) {
      whereClause.OR = [
        {
          name: {
            contains: search,
            mode: 'insensitive'
          }
        }
      ];
    }

    const ingredients = await prisma.ingredient.findMany({
      where: whereClause,
      orderBy: {
        name: 'asc'
      }
    });

    // Optional CSV export
    if (format === 'csv') {
      const headers = ['name','per','category','calories','protein','carbs','fat','fiber','aliases'];
      const rows = [headers.join(',')];
      for (const it of ingredients) {
        const alias = (() => {
          try {
            const aliasesArray = typeof (it as any).aliases === 'string' ? JSON.parse((it as any).aliases) : (it as any).aliases;
            return Array.isArray(aliasesArray) ? aliasesArray.join('|') : '';
          } catch {
            return '';
          }
        })();
        const vals = [
          it.name ?? '',
          (it as any).per ?? '',
          (it as any).category ?? '',
          String(it.calories ?? 0),
          String(it.protein ?? 0),
          String(it.carbs ?? 0),
          String(it.fat ?? 0),
          String((it as any).fiber ?? 0),
          alias
        ];
        // Escape commas/quotes
        const escaped = vals.map(v => {
          const s = String(v);
          if (s.includes(',') || s.includes('"') || s.includes('\n')) {
            return '"' + s.replace(/"/g, '""') + '"';
          }
          return s;
        });
        rows.push(escaped.join(','));
      }
      const csv = rows.join('\n');
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Cache-Control': 'no-store'
        }
      });
    }

    return NextResponse.json(ingredients);
  } catch (error) {
    console.error('Error fetching ingredients:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ingredients' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, calories, protein, carbs, fat, fiber, sugar, category, per, aliases, isActive } = body;

    // Validate required fields
    if (!name || calories === undefined || protein === undefined || carbs === undefined || fat === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: name, calories, protein, carbs, fat' },
        { status: 400 }
      );
    }

    // Check if ingredient already exists
    const existingIngredient = await prisma.ingredient.findFirst({
      where: {
        name: {
          equals: name,
          mode: 'insensitive'
        }
      }
    });

    if (existingIngredient) {
      return NextResponse.json(
        { error: 'Ingredient with this name already exists' },
        { status: 409 }
      );
    }

    // Create new ingredient
    const newIngredient = await prisma.ingredient.create({
      data: {
        name,
        calories: parseFloat(calories),
        protein: parseFloat(protein),
        carbs: parseFloat(carbs),
        fat: parseFloat(fat),
        fiber: fiber ? parseFloat(fiber) : 0,
        sugar: sugar ? parseFloat(sugar) : 0,
        category: category || 'other',
        per: per || '100g',
        aliases: (() => {
          if (!aliases) {
            return [`Pure:${name}`];
          }
          
          // If aliases is already an array (from frontend), use it directly
          if (Array.isArray(aliases)) {
            return aliases.length > 0 ? aliases : [`Pure:${name}`];
          }
          
          // If aliases is a string, try to parse it
          if (typeof aliases === 'string') {
            if (aliases.trim() === '') {
              return [`Pure:${name}`];
            }
            try {
              const parsed = JSON.parse(aliases);
              return Array.isArray(parsed) ? parsed : [`Pure:${name}`];
            } catch (error) {
              console.log('Failed to parse aliases, using fallback:', aliases);
              return [`Pure:${name}`];
            }
          }
          
          return [`Pure:${name}`];
        })(),
        isActive: isActive !== undefined ? isActive : true
      }
    });

    return NextResponse.json(newIngredient, { status: 201 });
  } catch (error) {
    console.error('Error creating ingredient:', error);
    return NextResponse.json(
      { error: 'Failed to create ingredient' },
      { status: 500 }
    );
  }
}