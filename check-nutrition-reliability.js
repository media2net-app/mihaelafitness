const { PrismaClient } = require('@prisma/client');

// Load environment variables
require('dotenv').config();

const prisma = new PrismaClient();

// Betrouwbaarheidsniveaus per ingrediënt type
const reliabilityLevels = {
  // Zeer betrouwbaar (90-95%) - Basic, onbewerkte voedingsmiddelen
  'very_high': [
    'apple', 'banana', 'kiwi', 'pear', 'orange', 'strawberry', 'blueberry',
    'tomato', 'cucumber', 'carrot', 'broccoli', 'spinach', 'lettuce',
    'egg', 'chicken breast', 'salmon', 'tuna', 'beef', 'pork', 'turkey',
    'oats', 'rice', 'potato', 'sweet potato', 'quinoa',
    'olive oil', 'coconut oil', 'avocado', 'almonds', 'walnuts'
  ],
  
  // Redelijk betrouwbaar (75-85%) - Bewerkte producten
  'high': [
    'greek yogurt', 'milk', 'cheese', 'cottage cheese',
    'bread', 'pasta', 'honey', 'maple syrup',
    'almond milk', 'coconut milk', 'almond butter', 'peanut butter'
  ],
  
  // Matig betrouwbaar (60-75%) - Complexe combinaties
  'medium': [
    'mixed salad', 'salad with', 'steamed veggies', 'roasted veggies',
    'grilled veggies', 'sauted veggies', 'mixed vegetables',
    'salmon with pasta', 'tuna wrap', 'eggs with vegetables'
  ],
  
  // Laag betrouwbaar (40-60%) - Zeer complexe gerechten
  'low': [
    'pancakes', 'protein bar', 'hummus', 'lentil soup',
    'pumpkin soup', 'mashed potatoes', 'oats pancakes'
  ]
};

// Functie om betrouwbaarheidsniveau te bepalen
function getReliabilityLevel(ingredientName) {
  const name = ingredientName.toLowerCase();
  
  for (const [level, ingredients] of Object.entries(reliabilityLevels)) {
    for (const ingredient of ingredients) {
      if (name.includes(ingredient)) {
        return level;
      }
    }
  }
  
  return 'unknown';
}

// Functie om betrouwbaarheidspercentage te krijgen
function getReliabilityPercentage(level) {
  const percentages = {
    'very_high': 90,
    'high': 80,
    'medium': 70,
    'low': 55,
    'unknown': 50
  };
  return percentages[level] || 50;
}

// Functie om betrouwbaarheidsniveau te beschrijven
function getReliabilityDescription(level) {
  const descriptions = {
    'very_high': 'Zeer betrouwbaar - Basic, onbewerkte voedingsmiddelen',
    'high': 'Redelijk betrouwbaar - Bewerkte producten',
    'medium': 'Matig betrouwbaar - Complexe combinaties',
    'low': 'Laag betrouwbaar - Zeer complexe gerechten',
    'unknown': 'Onbekend - Handmatige verificatie aanbevolen'
  };
  return descriptions[level] || 'Onbekend';
}

// Functie om alle ingrediënten te analyseren
async function analyzeReliability() {
  try {
    console.log('🔍 ANALYSE VAN VOEDINGSWAARDEN BETROUWBAARHEID\n');
    
    const ingredients = await prisma.ingredient.findMany({
      orderBy: { name: 'asc' }
    });
    
    const reliabilityStats = {
      very_high: 0,
      high: 0,
      medium: 0,
      low: 0,
      unknown: 0,
      total: ingredients.length
    };
    
    const detailedResults = [];
    
    for (const ingredient of ingredients) {
      const level = getReliabilityLevel(ingredient.name);
      const percentage = getReliabilityPercentage(level);
      const description = getReliabilityDescription(level);
      
      reliabilityStats[level]++;
      
      detailedResults.push({
        name: ingredient.name,
        level,
        percentage,
        description,
        calories: ingredient.calories,
        protein: ingredient.protein,
        carbs: ingredient.carbs,
        fat: ingredient.fat
      });
    }
    
    // Toon statistieken
    console.log('📊 BETROUWBAARHEID STATISTIEKEN:');
    console.log(`📈 Totaal ingrediënten: ${reliabilityStats.total}`);
    console.log(`🟢 Zeer betrouwbaar (90%): ${reliabilityStats.very_high} (${Math.round(reliabilityStats.very_high/reliabilityStats.total*100)}%)`);
    console.log(`🟡 Redelijk betrouwbaar (80%): ${reliabilityStats.high} (${Math.round(reliabilityStats.high/reliabilityStats.total*100)}%)`);
    console.log(`🟠 Matig betrouwbaar (70%): ${reliabilityStats.medium} (${Math.round(reliabilityStats.medium/reliabilityStats.total*100)}%)`);
    console.log(`🔴 Laag betrouwbaar (55%): ${reliabilityStats.low} (${Math.round(reliabilityStats.low/reliabilityStats.total*100)}%)`);
    console.log(`❓ Onbekend (50%): ${reliabilityStats.unknown} (${Math.round(reliabilityStats.unknown/reliabilityStats.total*100)}%)\n`);
    
    // Bereken gewogen gemiddelde
    const weightedAverage = (
      reliabilityStats.very_high * 90 +
      reliabilityStats.high * 80 +
      reliabilityStats.medium * 70 +
      reliabilityStats.low * 55 +
      reliabilityStats.unknown * 50
    ) / reliabilityStats.total;
    
    console.log(`🎯 GEMIDDELDE BETROUWBAARHEID: ${Math.round(weightedAverage)}%\n`);
    
    // Toon ingrediënten die verificatie nodig hebben
    const needsVerification = detailedResults.filter(r => r.level === 'low' || r.level === 'unknown');
    
    if (needsVerification.length > 0) {
      console.log('⚠️  INGREDIËNTEN DIE VERIFICATIE NODIG HEBBEN:');
      needsVerification.forEach(ing => {
        console.log(`   ${ing.name} (${ing.percentage}% betrouwbaar)`);
        console.log(`   ${ing.description}`);
        console.log(`   Waarden: ${ing.calories} cal, ${ing.protein}g eiwit, ${ing.carbs}g carbs, ${ing.fat}g vet\n`);
      });
    }
    
    // Toon voorbeelden van zeer betrouwbare ingrediënten
    const veryReliable = detailedResults.filter(r => r.level === 'very_high').slice(0, 10);
    
    console.log('✅ VOORBEELDEN VAN ZEER BETROUWBAARE INGREDIËNTEN:');
    veryReliable.forEach(ing => {
      console.log(`   ${ing.name} (${ing.percentage}% betrouwbaar)`);
    });
    
    console.log('\n💡 AANBEVELINGEN:');
    console.log('1. Verificeer ingrediënten met lage betrouwbaarheid handmatig');
    console.log('2. Gebruik specifieke merkproducten voor complexe gerechten');
    console.log('3. Overweeg gebruikersfeedback voor lokale producten');
    console.log('4. Update regelmatig met nieuwste voedingswaarden');
    
  } catch (error) {
    console.error('❌ Fout bij analyseren van betrouwbaarheid:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Functie om specifiek ingrediënt te controleren
async function checkSpecificIngredient(ingredientName) {
  try {
    console.log(`🔍 BETROUWBAARHEID CONTROLE: ${ingredientName}\n`);
    
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
    
    const level = getReliabilityLevel(ingredient.name);
    const percentage = getReliabilityPercentage(level);
    const description = getReliabilityDescription(level);
    
    console.log('📊 INGREDIËNT DETAILS:');
    console.log(`Naam: ${ingredient.name}`);
    console.log(`Categorie: ${ingredient.category || 'Geen'}`);
    console.log(`Betrouwbaarheidsniveau: ${level}`);
    console.log(`Betrouwbaarheidspercentage: ${percentage}%`);
    console.log(`Beschrijving: ${description}\n`);
    
    console.log('🥗 VOEDINGSWAARDEN:');
    console.log(`Calorieën: ${ingredient.calories}`);
    console.log(`Eiwit: ${ingredient.protein}g`);
    console.log(`Koolhydraten: ${ingredient.carbs}g`);
    console.log(`Vet: ${ingredient.fat}g`);
    console.log(`Vezels: ${ingredient.fiber || 'Geen'}g`);
    console.log(`Suiker: ${ingredient.sugar || 'Geen'}g\n`);
    
    if (percentage < 70) {
      console.log('⚠️  AANBEVELING: Verificeer deze waarden handmatig');
      console.log('   - Controleer bij Voedingswaardetabel.nl');
      console.log('   - Check specifieke merkproducten');
      console.log('   - Overweeg gebruikersfeedback');
    } else {
      console.log('✅ Deze waarden zijn betrouwbaar voor algemeen gebruik');
    }
    
  } catch (error) {
    console.error('❌ Fout bij controleren van ingrediënt:', error);
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
      await analyzeReliability();
      break;
    case 'check':
      if (!ingredientName) {
        console.log('Gebruik: node check-nutrition-reliability.js check <ingredient_name>');
        return;
      }
      await checkSpecificIngredient(ingredientName);
      break;
    default:
      console.log('Gebruik: node check-nutrition-reliability.js [all|check]');
      console.log('  all: Analyseer betrouwbaarheid van alle ingrediënten');
      console.log('  check <name>: Controleer specifiek ingrediënt');
      break;
  }
}

main();


