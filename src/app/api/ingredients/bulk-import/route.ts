import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ingredients, mode } = body;

    // Validate input
    if (!Array.isArray(ingredients) || ingredients.length === 0) {
      return NextResponse.json(
        { error: 'ingredients array is required and must not be empty' },
        { status: 400 }
      );
    }

    console.log(`📦 Starting bulk import of ${ingredients.length} ingredients...`);
    console.log(`🔄 Mode: ${mode || 'skip-existing'}`);

    const results = {
      total: ingredients.length,
      created: 0,
      updated: 0,
      skipped: 0,
      errors: [] as Array<{ name: string; error: string }>
    };

    for (const ingredient of ingredients) {
      try {
        // Validate required fields
        if (!ingredient.name || 
            ingredient.calories === undefined || 
            ingredient.protein === undefined || 
            ingredient.carbs === undefined || 
            ingredient.fat === undefined) {
          results.errors.push({
            name: ingredient.name || 'unknown',
            error: 'Missing required fields'
          });
          continue;
        }

        // Check if ingredient exists (by name or by id if provided)
        let existingIngredient;
        if (ingredient.id) {
          existingIngredient = await prisma.ingredient.findUnique({
            where: { id: ingredient.id }
          });
        }
        
        if (!existingIngredient) {
          existingIngredient = await prisma.ingredient.findFirst({
            where: {
              name: {
                equals: ingredient.name,
                mode: 'insensitive'
              }
            }
          });
        }

        if (existingIngredient) {
          if (mode === 'update-existing' || mode === 'upsert') {
            // Update existing ingredient
            await prisma.ingredient.update({
              where: { id: existingIngredient.id },
              data: {
                nameRo: ingredient.nameRo || existingIngredient.nameRo,
                per: ingredient.per || existingIngredient.per,
                perRo: ingredient.perRo || existingIngredient.perRo,
                calories: parseFloat(ingredient.calories),
                protein: parseFloat(ingredient.protein),
                carbs: parseFloat(ingredient.carbs),
                fat: parseFloat(ingredient.fat),
                fiber: ingredient.fiber !== undefined ? parseFloat(ingredient.fiber) : existingIngredient.fiber,
                sugar: ingredient.sugar !== undefined ? parseFloat(ingredient.sugar) : existingIngredient.sugar,
                category: ingredient.category || existingIngredient.category,
                aliases: ingredient.aliases || existingIngredient.aliases,
                isActive: ingredient.isActive !== undefined ? ingredient.isActive : existingIngredient.isActive
              }
            });
            results.updated++;
            console.log(`✏️  Updated: ${ingredient.name}`);
          } else {
            // Skip existing ingredient
            results.skipped++;
            console.log(`⏭️  Skipped: ${ingredient.name} (already exists)`);
          }
        } else {
          // Create new ingredient
          const newIngredient = await prisma.ingredient.create({
            data: {
              id: ingredient.id, // Use provided ID if available for consistency
              name: ingredient.name,
              nameRo: ingredient.nameRo || null,
              per: ingredient.per || '100g',
              perRo: ingredient.perRo || null,
              calories: parseFloat(ingredient.calories),
              protein: parseFloat(ingredient.protein),
              carbs: parseFloat(ingredient.carbs),
              fat: parseFloat(ingredient.fat),
              fiber: ingredient.fiber !== undefined ? parseFloat(ingredient.fiber) : 0,
              sugar: ingredient.sugar !== undefined ? parseFloat(ingredient.sugar) : 0,
              category: ingredient.category || 'other',
              aliases: ingredient.aliases || [`Pure:${ingredient.name}`],
              isActive: ingredient.isActive !== undefined ? ingredient.isActive : true
            }
          });
          results.created++;
          console.log(`✅ Created: ${ingredient.name}`);
        }
      } catch (error: any) {
        console.error(`❌ Error processing ${ingredient.name}:`, error.message);
        results.errors.push({
          name: ingredient.name,
          error: error.message
        });
      }
    }

    console.log('\n📊 Import Summary:');
    console.log(`   Total processed: ${results.total}`);
    console.log(`   ✅ Created: ${results.created}`);
    console.log(`   ✏️  Updated: ${results.updated}`);
    console.log(`   ⏭️  Skipped: ${results.skipped}`);
    console.log(`   ❌ Errors: ${results.errors.length}\n`);

    return NextResponse.json({
      success: true,
      message: 'Bulk import completed',
      results
    }, { status: 200 });

  } catch (error: any) {
    console.error('❌ Bulk import failed:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to process bulk import',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check API availability
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/ingredients/bulk-import',
    method: 'POST',
    description: 'Bulk import ingredients',
    usage: {
      body: {
        ingredients: 'Array of ingredient objects',
        mode: '"skip-existing" (default) | "update-existing" | "upsert"'
      }
    }
  });
}

