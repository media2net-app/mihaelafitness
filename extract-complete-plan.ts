import * as fs from 'fs';

async function extractCompletePlan() {
  try {
    const backupPath = '/Users/gebruiker/Downloads/db_cluster-10-11-2025@23-30-29.backup';
    const planId = 'cmhs5fd1r0001jy04rq3w214f'; // Het plan dat we gevonden hebben
    
    console.log('🔍 Extraheren van volledige plan data...\n');
    console.log(`Plan ID: ${planId}\n`);

    const content = fs.readFileSync(backupPath, 'utf-8');

    // Find the COPY statement for nutrition_plans
    console.log('📋 Zoeken naar nutrition_plans COPY statement...\n');
    
    const copyStartPattern = /COPY public\.nutrition_plans[^;]*FROM stdin;/gi;
    const copyStartMatch = content.match(copyStartPattern);
    
    if (!copyStartMatch) {
      console.log('❌ COPY statement niet gevonden');
      return;
    }

    // Find the position of the COPY statement
    const copyStartIndex = content.indexOf('COPY public.nutrition_plans');
    if (copyStartIndex === -1) {
      console.log('❌ COPY statement start niet gevonden');
      return;
    }

    // Find where the COPY data ends (marked by \.)
    const copyEndPattern = new RegExp(
      `COPY public\\.nutrition_plans[\\s\\S]*?^\\\\.$`,
      'gm'
    );
    
    const copyMatch = content.match(copyEndPattern);
    if (!copyMatch || copyMatch.length === 0) {
      console.log('❌ COPY data sectie niet gevonden');
      return;
    }

    const copySection = copyMatch[0];
    console.log(`✅ COPY sectie gevonden (${copySection.length} karakters)\n`);

    // Find the line with our plan ID
    const planLinePattern = new RegExp(
      `^${planId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\t\\s]+[^\\n]+`,
      'gm'
    );
    
    const planLineMatch = copySection.match(planLinePattern);
    
    if (!planLineMatch || planLineMatch.length === 0) {
      console.log('❌ Plan regel niet gevonden in COPY data');
      
      // Try alternative: search for plan ID anywhere in copy section
      const altPattern = new RegExp(
        `${planId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]{0,5000}`,
        'gi'
      );
      const altMatch = copySection.match(altPattern);
      if (altMatch) {
        console.log('\n✅ Plan ID gevonden in COPY sectie (alternatieve methode):');
        console.log(altMatch[0].substring(0, 2000));
      }
      return;
    }

    console.log('✅ Plan regel gevonden!\n');
    console.log('='.repeat(80));
    console.log('PLAN DATA:');
    console.log('='.repeat(80));
    console.log(planLineMatch[0]);
    console.log('='.repeat(80));

    // Parse the line - PostgreSQL COPY format is tab-separated
    const fields = planLineMatch[0].split('\t');
    
    // Get column order from COPY statement
    const columnMatch = copySection.match(/COPY public\.nutrition_plans \(([^)]+)\)/);
    if (columnMatch) {
      const columns = columnMatch[1].split(',').map(c => c.trim().replace(/"/g, ''));
      console.log('\n📋 Kolommen:');
      columns.forEach((col, idx) => {
        console.log(`   ${idx}: ${col}`);
      });
      
      console.log('\n📊 Plan data per kolom:');
      columns.forEach((col, idx) => {
        if (fields[idx]) {
          const value = fields[idx].trim();
          if (col === 'weekMenu' && value.length > 100) {
            console.log(`\n   ${col}:`);
            console.log(`   ${value.substring(0, 500)}...`);
            console.log(`   (Totaal: ${value.length} karakters)`);
            
            // Try to parse as JSON
            try {
              let jsonStr = value;
              // Remove quotes if present
              if ((jsonStr.startsWith("'") && jsonStr.endsWith("'")) || 
                  (jsonStr.startsWith('"') && jsonStr.endsWith('"'))) {
                jsonStr = jsonStr.slice(1, -1);
                jsonStr = jsonStr.replace(/\\'/g, "'").replace(/\\"/g, '"').replace(/\\\\/g, '\\');
              }
              const parsed = JSON.parse(jsonStr);
              console.log(`   ✅ Valid JSON!`);
              
              // Save to file
              const outputPath = '/Users/gebruiker/Desktop/MIHAELAFITNESS/mihaela-fitness/andreea-radulescu-plan-weekmenu.json';
              fs.writeFileSync(outputPath, JSON.stringify(parsed, null, 2));
              console.log(`   💾 Opgeslagen in: ${outputPath}`);
            } catch (e) {
              console.log(`   ⚠️ Geen geldige JSON, maar data is opgeslagen`);
            }
          } else {
            console.log(`   ${col}: ${value}`);
          }
        }
      });
    }

    // Also save the full line to a file for reference
    const fullDataPath = '/Users/gebruiker/Desktop/MIHAELAFITNESS/mihaela-fitness/andreea-radulescu-plan-full.txt';
    fs.writeFileSync(fullDataPath, planLineMatch[0]);
    console.log(`\n💾 Volledige plan regel opgeslagen in: ${fullDataPath}`);

  } catch (error) {
    console.error('❌ Fout:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
    }
  }
}

extractCompletePlan();






