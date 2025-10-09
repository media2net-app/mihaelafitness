/**
 * Script to add Romanian translations to ingredients
 * 
 * Usage:
 * 1. Review the translations in commonTranslations
 * 2. Add more translations as needed
 * 3. Run: node translate-ingredients-to-romanian.js
 * 
 * For ingredients without translations, you can:
 * - Add them manually to commonTranslations
 * - Use Google Translate API (requires API key)
 * - Leave blank and fill in later via admin panel
 */

require('dotenv').config({ path: '.env' });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Common ingredient translations EN -> RO
const commonTranslations = {
  // Proteins
  'Chicken Breast': 'Piept de Pui',
  'Chicken': 'Pui',
  'Turkey': 'Curcan',
  'Turkey Breast': 'Piept de Curcan',
  'Beef': 'Carne de Vită',
  'Beef Steak': 'Friptură de Vită',
  'Ground Beef': 'Carne Tocată de Vită',
  'Pork': 'Porc',
  'Fish': 'Pește',
  'Salmon': 'Somon',
  'Tuna': 'Ton',
  'Eggs': 'Ouă',
  'Egg': 'Ou',
  'Egg Whites': 'Albuș',
  'Whole Eggs': 'Ouă Întregi',
  
  // Dairy
  'Milk': 'Lapte',
  'Cheese': 'Brânză',
  'Yogurt': 'Iaurt',
  'Greek Yogurt': 'Iaurt Grecesc',
  'Cottage Cheese': 'Brânză de Vaci',
  'Mozzarella': 'Mozzarella',
  'Feta Cheese': 'Brânză Feta',
  'Cream': 'Smântână',
  'Butter': 'Unt',
  
  // Grains & Carbs
  'Rice': 'Orez',
  'White Rice': 'Orez Alb',
  'Brown Rice': 'Orez Brun',
  'Pasta': 'Paste',
  'Whole Wheat Pasta': 'Paste Integrale',
  'Bread': 'Pâine',
  'Whole Wheat Bread': 'Pâine Integrală',
  'Whole Grain Bread': 'Pâine Integrală',
  'Oats': 'Ovăz',
  'Oatmeal': 'Fulgi de Ovăz',
  'Quinoa': 'Quinoa',
  'Couscous': 'Cuscus',
  
  // Vegetables
  'Broccoli': 'Broccoli',
  'Spinach': 'Spanac',
  'Tomato': 'Roșie',
  'Tomatoes': 'Roșii',
  'Tomato Sauce': 'Sos de Roșii',
  'Cucumber': 'Castravete',
  'Lettuce': 'Salată Verde',
  'Carrot': 'Morcov',
  'Carrots': 'Morcovi',
  'Bell Pepper': 'Ardei Gras',
  'Onion': 'Ceapă',
  'Garlic': 'Usturoi',
  'Zucchini': 'Dovlecel',
  'Eggplant': 'Vânătă',
  'Sweet Potato': 'Cartof Dulce',
  'Potato': 'Cartof',
  'Potatoes': 'Cartofi',
  'Green Beans': 'Fasole Verde',
  'Peas': 'Mazăre',
  'Corn': 'Porumb',
  'Mushrooms': 'Ciuperci',
  'Asparagus': 'Sparanghel',
  'Cauliflower': 'Conopidă',
  'Cabbage': 'Varză',
  
  // Fruits
  'Apple': 'Măr',
  'Banana': 'Banană',
  'Orange': 'Portocală',
  'Strawberry': 'Căpșună',
  'Strawberries': 'Căpșuni',
  'Blueberries': 'Afine',
  'Raspberries': 'Zmeură',
  'Grapes': 'Struguri',
  'Watermelon': 'Pepene Verde',
  'Melon': 'Pepene Galben',
  'Pineapple': 'Ananas',
  'Mango': 'Mango',
  'Pear': 'Pară',
  'Peach': 'Piersică',
  'Plum': 'Prună',
  'Kiwi': 'Kiwi',
  'Avocado': 'Avocado',
  'Lemon': 'Lămâie',
  'Lime': 'Lime',
  
  // Nuts & Seeds
  'Almonds': 'Migdale',
  'Walnuts': 'Nuci',
  'Cashews': 'Caju',
  'Peanuts': 'Arahide',
  'Peanut Butter': 'Unt de Arahide',
  'Almond Butter': 'Unt de Migdale',
  'Sunflower Seeds': 'Semințe de Floarea Soarelui',
  'Pumpkin Seeds': 'Semințe de Dovleac',
  'Chia Seeds': 'Semințe de Chia',
  'Flax Seeds': 'Semințe de In',
  
  // Oils & Fats
  'Olive Oil': 'Ulei de Măsline',
  'Coconut Oil': 'Ulei de Cocos',
  'Vegetable Oil': 'Ulei Vegetal',
  'Sunflower Oil': 'Ulei de Floarea Soarelui',
  
  // Legumes
  'Beans': 'Fasole',
  'Black Beans': 'Fasole Neagră',
  'Kidney Beans': 'Fasole Roșie',
  'Chickpeas': 'Năut',
  'Lentils': 'Linte',
  'Tofu': 'Tofu',
  
  // Condiments & Spices
  'Salt': 'Sare',
  'Pepper': 'Piper',
  'Paprika': 'Boia',
  'Cinnamon': 'Scorțișoară',
  'Vanilla': 'Vanilie',
  'Honey': 'Miere',
  'Maple Syrup': 'Sirop de Arțar',
  'Soy Sauce': 'Sos de Soia',
  'Vinegar': 'Oțet',
  'Mustard': 'Muștar',
  'Ketchup': 'Ketchup',
  'Mayonnaise': 'Maioneză',
  
  // Beverages
  'Water': 'Apă',
  'Coffee': 'Cafea',
  'Tea': 'Ceai',
  'Green Tea': 'Ceai Verde',
  'Juice': 'Suc',
  'Orange Juice': 'Suc de Portocale',
  
  // Supplements & Protein
  'Protein Powder': 'Pudră Proteică',
  'Whey Protein': 'Proteină din Zer',
  'Casein': 'Cazeină',
  'Creatine': 'Creatină',
  
  // Other
  'Baking Powder': 'Praf de Copt',
  'Baking Soda': 'Bicarbonat de Sodiu',
  'Flour': 'Făină',
  'Whole Wheat Flour': 'Făină Integrală',
  'Sugar': 'Zahăr',
  'Brown Sugar': 'Zahăr Brun',
  'Dark Chocolate': 'Ciocolată Neagră',
  'Chocolate': 'Ciocolată',
};

async function translateIngredients() {
  try {
    console.log('🔄 Starting ingredient translation...\n');
    
    // Get all ingredients
    const ingredients = await prisma.ingredient.findMany({
      where: {
        isActive: true
      }
    });
    
    console.log(`📊 Found ${ingredients.length} ingredients to process\n`);
    
    let translated = 0;
    let skipped = 0;
    let notFound = [];
    
    for (const ingredient of ingredients) {
      const englishName = ingredient.name.trim();
      
      // Check if translation already exists
      if (ingredient.nameRo) {
        console.log(`⏭️  Skipping "${englishName}" - already has RO translation: "${ingredient.nameRo}"`);
        skipped++;
        continue;
      }
      
      // Look for translation in common translations
      let romanianName = commonTranslations[englishName];
      
      // Try without case sensitivity
      if (!romanianName) {
        const lowerName = englishName.toLowerCase();
        const foundKey = Object.keys(commonTranslations).find(
          key => key.toLowerCase() === lowerName
        );
        if (foundKey) {
          romanianName = commonTranslations[foundKey];
        }
      }
      
      if (romanianName) {
        // Update ingredient with Romanian translation
        await prisma.ingredient.update({
          where: { id: ingredient.id },
          data: { nameRo: romanianName }
        });
        
        console.log(`✅ Translated "${englishName}" -> "${romanianName}"`);
        translated++;
      } else {
        console.log(`❌ No translation found for "${englishName}"`);
        notFound.push(englishName);
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 Translation Summary:');
    console.log('='.repeat(60));
    console.log(`✅ Translated: ${translated}`);
    console.log(`⏭️  Skipped (already translated): ${skipped}`);
    console.log(`❌ Not found: ${notFound.length}`);
    
    if (notFound.length > 0) {
      console.log('\n⚠️  Ingredients without translations:');
      console.log('   Add these to commonTranslations or translate manually:');
      notFound.forEach(name => console.log(`   - ${name}`));
    }
    
    console.log('\n✨ Translation complete!');
    
  } catch (error) {
    console.error('❌ Error translating ingredients:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the translation
translateIngredients();

