import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Common Romanian translations for ingredients
const commonTranslations: { [key: string]: string } = {
  // Piece-based items
  '1 Egg': 'Ou',
  '1 Slice Whole Wheat Bread': 'Pâine Integrală',
  '1 Slice White Bread': 'Pâine Albă',
  '1 Slice Cheese': 'Brânză',
  '1 Tablespoon Olive Oil': 'Ulei de Măsline',
  '1 Banana': 'Banană',
  '1 Apple': 'Măr',
  '1 Carrot': 'Morcov',
  '1 Cucumber': 'Castravete',
  '1 Onion': 'Ceapă',
  
  // Grains & Starches
  'Basmati Rice': 'Orez Basmati',
  'White Rice': 'Orez Alb',
  'Brown Rice': 'Orez Brun',
  'Oats': 'Ovăz',
  'Quinoa': 'Quinoa',
  'Whole Wheat Pasta': 'Paste Integrale',
  'Pasta': 'Paste',
  'Potato': 'Cartof',
  'Sweet Potato': 'Cartof Dulce',
  'Bread': 'Pâine',
  'Rice cake': 'Tort de Orez',
  'Dry Couscous': 'Cuscus Uscat',
  'Couscous': 'Cuscus',
  
  // Vegetables
  'Broccoli': 'Broccoli',
  'Spinach': 'Spanac',
  'Lettuce': 'Salată Verde',
  'Tomato': 'Roșie',
  'Cucumber': 'Castravete',
  'Carrot': 'Morcov',
  'Avocado': 'Avocado',
  'Paprika': 'Boia',
  'Zucchini': 'Dovlecel',
  'Green Beans': 'Fasole Verde',
  'Cauliflower': 'Conopidă',
  'Eggplant': 'Vânătă',
  '1 Eggplant': 'Vânătă',
  'Onion': 'Ceapă',
  'Salad': 'Salată',
  'Tomato sauce': 'Sos de Roșii',
  'Mashed potato': 'Piure de Cartofi',
  
  // Proteins
  'Chicken Breast': 'Piept de Pui',
  'Chicken Thigh': 'Pulpă de Pui',
  'Turkey': 'Curcan',
  'Turkey Breast': 'Piept de Curcan',
  'Ground Turkey': 'Carne Tocată de Curcan',
  'Salmon': 'Somon',
  'Tuna': 'Ton',
  'Cod Fillet': 'File de Cod',
  'Shrimp': 'Creveți',
  'Ground Beef': 'Carne Tocată de Vită',
  'Ribeye Steak': 'Antricot',
  'Beef': 'Carne de Vită',
  'Pork': 'Carne de Porc',
  'Egg': 'Ou',
  'Egg Whites': 'Albuș',
  'Tofu': 'Tofu',
  
  // Dairy
  'Milk': 'Lapte',
  'Greek Yogurt': 'Iaurt Grecesc',
  'Yogurt': 'Iaurt',
  'Cottage Cheese': 'Brânză de Vaci',
  'Cheese': 'Brânză',
  'Mozzarella': 'Mozzarella',
  'Feta': 'Brânză Feta',
  'Almond milk': 'Lapte de Migdale',
  'Soy milk': 'Lapte de Soia',
  
  // Fruits
  'Apple': 'Măr',
  'Banana': 'Banană',
  'Orange': 'Portocală',
  'Strawberry': 'Căpșună',
  'Strawberries': 'Căpșuni',
  'Blueberry': 'Afină',
  'Blueberries': 'Afine',
  'Raspberry': 'Zmeură',
  'Raspberries': 'Zmeură',
  'Grape': 'Strugure',
  'Lemon': 'Lămâie',
  'Pear': 'Pară',
  'Peach': 'Piersică',
  'Watermelon': 'Pepene Verde',
  
  // Nuts & Seeds
  'Almonds': 'Migdale',
  'Walnuts': 'Nuci',
  'Peanuts': 'Alune',
  'Cashews': 'Caju',
  'Chia Seeds': 'Semințe de Chia',
  'Peanut Butter': 'Unt de Arahide',
  'Almond Butter': 'Unt de Migdale',
  
  // Oils & Fats
  'Olive Oil': 'Ulei de Măsline',
  'Coconut Oil': 'Ulei de Cocos',
  'Butter': 'Unt',
  
  // Legumes
  'Beans': 'Fasole',
  'Dry beans': 'Fasole Uscată',
  'Cooked beans': 'Fasole Fiartă',
  'Lentils': 'Linte',
  'Chickpeas': 'Năut',
  'Corn': 'Porumb',
  
  // Sweeteners
  'Honey': 'Miere',
  'Agave Syrup': 'Sirop de Agave',
  'Maple Syrup': 'Sirop de Arțar',
  
  // Other
  'Protein Powder': 'Pudră Proteică',
  'Baking Powder': 'Praf de Copt',
  'Coconut flakes': 'Fulgi de Cocos',
  'Dark Chocolate': 'Ciocolată Neagră',
};

export async function POST() {
  try {
    console.log('🔄 Starting translation sync...');
    
    let updatedCount = 0;
    let skippedCount = 0;
    let notFoundCount = 0;
    
    for (const [englishName, romanianName] of Object.entries(commonTranslations)) {
      try {
        // Find ingredient by exact name match
        const ingredient = await prisma.ingredient.findFirst({
          where: { name: englishName }
        });
        
        if (ingredient) {
          // Update with Romanian translation
          await prisma.ingredient.update({
            where: { id: ingredient.id },
            data: { nameRo: romanianName }
          });
          updatedCount++;
          console.log(`✅ Updated: "${englishName}" -> "${romanianName}"`);
        } else {
          notFoundCount++;
          console.log(`⚠️  Not found in DB: "${englishName}"`);
        }
      } catch (error) {
        console.error(`❌ Error updating ${englishName}:`, error);
        skippedCount++;
      }
    }
    
    console.log('\n📊 Sync Summary:');
    console.log(`  ✅ Updated: ${updatedCount}`);
    console.log(`  ⚠️  Not found: ${notFoundCount}`);
    console.log(`  ❌ Errors: ${skippedCount}`);
    
    return NextResponse.json({
      success: true,
      updated: updatedCount,
      notFound: notFoundCount,
      errors: skippedCount,
      message: `Successfully updated ${updatedCount} ingredient translations`
    });
    
  } catch (error) {
    console.error('Error syncing translations:', error);
    return NextResponse.json(
      { error: 'Failed to sync translations', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

