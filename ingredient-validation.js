const { PrismaClient } = require('@prisma/client');

// Load environment variables
require('dotenv').config();

const prisma = new PrismaClient();

// Validatie regels voor voedingswaarden
const validationRules = {
  // Minimum en maximum waarden per 100g
  calories: { min: 0, max: 1000 },
  protein: { min: 0, max: 100 },
  carbs: { min: 0, max: 100 },
  fat: { min: 0, max: 100 },
  fiber: { min: 0, max: 50 },
  sugar: { min: 0, max: 100 },
  
  // Categorieën die toegestaan zijn
  validCategories: [
    'fruits', 'vegetables', 'proteins', 'carbohydrates', 
    'healthy-fats', 'nuts-seeds', 'dairy', 'other'
  ],
  
  // Verplichte velden
  requiredFields: ['name', 'calories', 'protein', 'carbs', 'fat']
};

// Functie om een ingrediënt te valideren
function validateIngredient(ingredient) {
  const errors = [];
  const warnings = [];
  
  // Controleer verplichte velden
  for (const field of validationRules.requiredFields) {
    if (!ingredient[field] && ingredient[field] !== 0) {
      errors.push(`Ontbrekend verplicht veld: ${field}`);
    }
  }
  
  // Controleer numerieke waarden
  const numericFields = ['calories', 'protein', 'carbs', 'fat', 'fiber', 'sugar'];
  for (const field of numericFields) {
    if (ingredient[field] !== null && ingredient[field] !== undefined) {
      const value = parseFloat(ingredient[field]);
      
      if (isNaN(value)) {
        errors.push(`${field} moet een getal zijn`);
      } else if (value < validationRules[field].min) {
        errors.push(`${field} kan niet negatief zijn`);
      } else if (value > validationRules[field].max) {
        warnings.push(`${field} lijkt onrealistisch hoog (${value})`);
      }
    }
  }
  
  // Speciale controle: ingrediënt moet calorieën hebben EN niet alle macro's 0
  if (ingredient.calories === 0 || (ingredient.protein === 0 && ingredient.carbs === 0 && ingredient.fat === 0)) {
    errors.push('Ingrediënt moet calorieën hebben en ten minste één macro nutriënt');
  }
  
  // Controleer categorie
  if (ingredient.category && !validationRules.validCategories.includes(ingredient.category)) {
    warnings.push(`Onbekende categorie: ${ingredient.category}`);
  }
  
  // Controleer naam
  if (!ingredient.name || ingredient.name.trim().length === 0) {
    errors.push('Naam mag niet leeg zijn');
  } else if (ingredient.name.length > 100) {
    warnings.push('Naam is erg lang');
  }
  
  // Controleer logische consistentie
  if (ingredient.calories > 0) {
    const totalMacros = (ingredient.protein || 0) * 4 + (ingredient.carbs || 0) * 4 + (ingredient.fat || 0) * 9;
    const calorieDiff = Math.abs(ingredient.calories - totalMacros);
    
    if (calorieDiff > 50) {
      warnings.push(`Calorieën (${ingredient.calories}) komen niet overeen met macro's (${Math.round(totalMacros)})`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

// Functie om alle ingrediënten te valideren
async function validateAllIngredients() {
  try {
    console.log('🔍 Valideren van alle ingrediënten...');
    
    const ingredients = await prisma.ingredient.findMany();
    console.log(`📊 Gevonden ${ingredients.length} ingrediënten om te valideren`);
    
    const results = {
      valid: 0,
      invalid: 0,
      warnings: 0,
      totalErrors: 0,
      totalWarnings: 0,
      errorDetails: [],
      warningDetails: []
    };
    
    for (const ingredient of ingredients) {
      const validation = validateIngredient(ingredient);
      
      if (validation.isValid) {
        results.valid++;
      } else {
        results.invalid++;
        results.errorDetails.push({
          name: ingredient.name,
          errors: validation.errors
        });
        results.totalErrors += validation.errors.length;
      }
      
      if (validation.warnings.length > 0) {
        results.warnings++;
        results.warningDetails.push({
          name: ingredient.name,
          warnings: validation.warnings
        });
        results.totalWarnings += validation.warnings.length;
      }
    }
    
    // Rapporteer resultaten
    console.log('\n📈 VALIDATIE RESULTATEN:');
    console.log(`✅ Geldige ingrediënten: ${results.valid} (${Math.round(results.valid/ingredients.length*100)}%)`);
    console.log(`❌ Ongeldige ingrediënten: ${results.invalid} (${Math.round(results.invalid/ingredients.length*100)}%)`);
    console.log(`⚠️ Ingrediënten met waarschuwingen: ${results.warnings} (${Math.round(results.warnings/ingredients.length*100)}%)`);
    console.log(`📊 Totaal fouten: ${results.totalErrors}`);
    console.log(`📊 Totaal waarschuwingen: ${results.totalWarnings}`);
    
    // Toon details van fouten
    if (results.errorDetails.length > 0) {
      console.log('\n❌ FOUTEN:');
      results.errorDetails.slice(0, 10).forEach(item => {
        console.log(`   ${item.name}: ${item.errors.join(', ')}`);
      });
      if (results.errorDetails.length > 10) {
        console.log(`   ... en nog ${results.errorDetails.length - 10} meer`);
      }
    }
    
    // Toon details van waarschuwingen
    if (results.warningDetails.length > 0) {
      console.log('\n⚠️ WAARSCHUWINGEN:');
      results.warningDetails.slice(0, 10).forEach(item => {
        console.log(`   ${item.name}: ${item.warnings.join(', ')}`);
      });
      if (results.warningDetails.length > 10) {
        console.log(`   ... en nog ${results.warningDetails.length - 10} meer`);
      }
    }
    
    // Algemene beoordeling
    const qualityScore = (results.valid / ingredients.length) * 100;
    console.log('\n🎯 KWALITEITSSCORE:');
    if (qualityScore >= 90) {
      console.log('🏆 Uitstekend! Database kwaliteit is zeer hoog.');
    } else if (qualityScore >= 80) {
      console.log('👍 Goed! Database kwaliteit is goed, maar kan nog verbeterd worden.');
    } else if (qualityScore >= 70) {
      console.log('⚠️ Redelijk. Er zijn enkele problemen die aangepakt moeten worden.');
    } else {
      console.log('🚨 Slecht. Er zijn veel problemen die onmiddellijk opgelost moeten worden.');
    }
    
    console.log(`📊 Kwaliteitsscore: ${Math.round(qualityScore)}%`);
    
  } catch (error) {
    console.error('❌ Fout bij valideren van ingrediënten:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Functie om een specifiek ingrediënt te valideren
async function validateSpecificIngredient(ingredientName) {
  try {
    console.log(`🔍 Valideren van ingrediënt: ${ingredientName}`);
    
    const ingredient = await prisma.ingredient.findFirst({
      where: {
        name: {
          equals: ingredientName,
          mode: 'insensitive'
        }
      }
    });
    
    if (!ingredient) {
      console.log('❌ Ingrediënt niet gevonden');
      return;
    }
    
    const validation = validateIngredient(ingredient);
    
    console.log('\n📊 VALIDATIE RESULTATEN:');
    console.log(`Naam: ${ingredient.name}`);
    console.log(`Categorie: ${ingredient.category || 'Geen'}`);
    console.log(`Per: ${ingredient.per || 'Geen'}`);
    console.log(`Calorieën: ${ingredient.calories}`);
    console.log(`Eiwit: ${ingredient.protein}g`);
    console.log(`Koolhydraten: ${ingredient.carbs}g`);
    console.log(`Vet: ${ingredient.fat}g`);
    console.log(`Vezels: ${ingredient.fiber || 'Geen'}g`);
    console.log(`Suiker: ${ingredient.sugar || 'Geen'}g`);
    
    if (validation.isValid) {
      console.log('\n✅ Ingrediënt is geldig');
    } else {
      console.log('\n❌ Ingrediënt heeft fouten:');
      validation.errors.forEach(error => console.log(`   - ${error}`));
    }
    
    if (validation.warnings.length > 0) {
      console.log('\n⚠️ Waarschuwingen:');
      validation.warnings.forEach(warning => console.log(`   - ${warning}`));
    }
    
  } catch (error) {
    console.error('❌ Fout bij valideren van ingrediënt:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Main functie
async function main() {
  const command = process.argv[2];
  const ingredientName = process.argv[3];
  
  switch (command) {
    case 'all':
      await validateAllIngredients();
      break;
    case 'single':
      if (!ingredientName) {
        console.log('Gebruik: node ingredient-validation.js single <ingredient_name>');
        return;
      }
      await validateSpecificIngredient(ingredientName);
      break;
    default:
      console.log('Gebruik: node ingredient-validation.js [all|single]');
      console.log('  all: Valideer alle ingrediënten');
      console.log('  single <name>: Valideer een specifiek ingrediënt');
      break;
  }
}

main();
