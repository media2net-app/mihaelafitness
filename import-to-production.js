const fs = require('fs');
const path = require('path');

// Configuration
const PRODUCTION_URL = 'https://www.mihaelafitness.com';
const LOCAL_URL = 'http://localhost:6001';

// Parse command line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const isLocal = args.includes('--local');
const mode = args.find(arg => arg.startsWith('--mode='))?.split('=')[1] || 'skip-existing';

const targetUrl = isLocal ? LOCAL_URL : PRODUCTION_URL;

console.log('\n🚀 Ingredient Import Script');
console.log('═══════════════════════════════════════\n');
console.log(`📍 Target: ${targetUrl}`);
console.log(`🔄 Mode: ${mode}`);
console.log(`🧪 Dry Run: ${isDryRun ? 'YES (no changes will be made)' : 'NO (will make changes)'}\n`);

async function importIngredients() {
  try {
    // Load exported data - try basic export first, fall back to full export
    let exportPath = path.join(__dirname, 'ingredients-basic-export.json');
    
    if (!fs.existsSync(exportPath)) {
      console.log('⚠️  Basic export not found, trying full export...');
      exportPath = path.join(__dirname, 'ingredients-export.json');
    }
    
    if (!fs.existsSync(exportPath)) {
      console.error('❌ Error: No export file found!');
      console.log('   Please run: node export-basic-ingredients.js first\n');
      process.exit(1);
    }
    
    const ingredients = JSON.parse(fs.readFileSync(exportPath, 'utf8'));
    
    console.log(`📦 Loaded ${ingredients.length} ingredients from export file\n`);
    
    if (isDryRun) {
      console.log('🧪 DRY RUN MODE - No actual changes will be made\n');
      console.log('📋 Sample ingredients that would be imported:');
      ingredients.slice(0, 10).forEach((ing, idx) => {
        console.log(`   ${idx + 1}. ${ing.name} (${ing.nameRo || 'no translation'})`);
        console.log(`      ${ing.calories} kcal | ${ing.protein}g P | ${ing.carbs}g C | ${ing.fat}g F`);
      });
      if (ingredients.length > 10) {
        console.log(`   ... and ${ingredients.length - 10} more`);
      }
      console.log('\n✅ Dry run complete. To actually import, run without --dry-run flag\n');
      return;
    }
    
    // Split ingredients into batches of 50 for better progress tracking
    const batchSize = 50;
    const batches = [];
    for (let i = 0; i < ingredients.length; i += batchSize) {
      batches.push(ingredients.slice(i, i + batchSize));
    }
    
    console.log(`📊 Splitting into ${batches.length} batches of ~${batchSize} ingredients\n`);
    console.log('⏳ Starting import...\n');
    
    let totalCreated = 0;
    let totalUpdated = 0;
    let totalSkipped = 0;
    let totalErrors = 0;
    
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      const batchNum = i + 1;
      
      console.log(`📦 Processing batch ${batchNum}/${batches.length} (${batch.length} ingredients)...`);
      
      try {
        const response = await fetch(`${targetUrl}/api/ingredients/bulk-import`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ingredients: batch,
            mode: mode
          })
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`❌ Batch ${batchNum} failed: ${response.status} ${response.statusText}`);
          console.error(`   Response: ${errorText}\n`);
          totalErrors += batch.length;
          continue;
        }
        
        const result = await response.json();
        
        if (result.success) {
          totalCreated += result.results.created;
          totalUpdated += result.results.updated;
          totalSkipped += result.results.skipped;
          totalErrors += result.results.errors.length;
          
          console.log(`   ✅ Created: ${result.results.created}`);
          console.log(`   ✏️  Updated: ${result.results.updated}`);
          console.log(`   ⏭️  Skipped: ${result.results.skipped}`);
          if (result.results.errors.length > 0) {
            console.log(`   ❌ Errors: ${result.results.errors.length}`);
            result.results.errors.forEach(err => {
              console.log(`      - ${err.name}: ${err.error}`);
            });
          }
        } else {
          console.error(`❌ Batch ${batchNum} failed: ${result.error || 'Unknown error'}\n`);
          totalErrors += batch.length;
        }
        
        console.log(''); // Empty line for readability
        
        // Small delay between batches to avoid overwhelming the server
        if (i < batches.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
      } catch (error) {
        console.error(`❌ Batch ${batchNum} error:`, error.message, '\n');
        totalErrors += batch.length;
      }
    }
    
    // Final summary
    console.log('\n═══════════════════════════════════════');
    console.log('📊 IMPORT SUMMARY');
    console.log('═══════════════════════════════════════\n');
    console.log(`   Total ingredients: ${ingredients.length}`);
    console.log(`   ✅ Created: ${totalCreated}`);
    console.log(`   ✏️  Updated: ${totalUpdated}`);
    console.log(`   ⏭️  Skipped: ${totalSkipped}`);
    console.log(`   ❌ Errors: ${totalErrors}`);
    console.log('\n═══════════════════════════════════════\n');
    
    if (totalErrors === 0) {
      console.log('✅ Import completed successfully!\n');
    } else {
      console.log('⚠️  Import completed with errors. Please review the log above.\n');
    }
    
    // Verify import
    console.log('🔍 Verifying import...');
    try {
      const verifyResponse = await fetch(`${targetUrl}/api/ingredients`);
      if (verifyResponse.ok) {
        const allIngredients = await verifyResponse.json();
        console.log(`✅ Verification: Found ${allIngredients.length} ingredients in target database\n`);
        
        if (allIngredients.length >= totalCreated) {
          console.log('✅ Import verification successful!\n');
        } else {
          console.log('⚠️  Warning: Fewer ingredients found than expected.\n');
        }
      }
    } catch (error) {
      console.log('⚠️  Could not verify import:', error.message, '\n');
    }
    
  } catch (error) {
    console.error('❌ Import failed:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

// Show usage if help flag
if (args.includes('--help') || args.includes('-h')) {
  console.log('Usage: node import-to-production.js [options]\n');
  console.log('Options:');
  console.log('  --dry-run          Show what would be imported without making changes');
  console.log('  --local            Import to local server (localhost:6001) instead of production');
  console.log('  --mode=MODE        Import mode: skip-existing (default), update-existing, or upsert');
  console.log('  --help, -h         Show this help message\n');
  console.log('Examples:');
  console.log('  node import-to-production.js --dry-run');
  console.log('  node import-to-production.js --local');
  console.log('  node import-to-production.js --mode=update-existing');
  console.log('  node import-to-production.js (imports to production)\n');
  process.exit(0);
}

importIngredients();

