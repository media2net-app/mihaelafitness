import * as fs from 'fs';
import * as path from 'path';

async function extractAndreeaPlan() {
  try {
    const backupPath = '/Users/gebruiker/Downloads/db_cluster-10-11-2025@23-30-29.backup';
    const planId = 'cmhz9zcck0000ie04rtjh9rod';
    const andreeaRadulescuId = 'cmgziq5zr000ijp04wig5wn45';

    console.log('🔍 Zoeken naar voedingsplan van Andreea Radulescu in backup...\n');
    console.log(`Backup: ${backupPath}`);
    console.log(`Plan ID: ${planId}`);
    console.log(`Andreea Radulescu ID: ${andreeaRadulescuId}\n`);

    if (!fs.existsSync(backupPath)) {
      console.error(`❌ Backup bestand niet gevonden: ${backupPath}`);
      return;
    }

    console.log('📖 Backup bestand lezen (dit kan even duren)...\n');
    const content = fs.readFileSync(backupPath, 'utf-8');

    // Search for INSERT INTO nutrition_plans with the plan ID
    console.log('🔍 Zoeken naar INSERT statement voor nutrition_plans...\n');
    
    // Pattern to find INSERT INTO nutrition_plans with our plan ID
    // PostgreSQL dumps often have COPY statements or INSERT statements
    const insertPattern = new RegExp(
      `INSERT INTO[\\s\\S]{0,500}nutrition_plans[\\s\\S]{0,10000}${planId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]{0,50000}`,
      'gi'
    );

    const insertMatches = content.match(insertPattern);
    
    if (insertMatches && insertMatches.length > 0) {
      console.log(`✅ INSERT statement gevonden voor plan ID!\n`);
      insertMatches.forEach((match, index) => {
        console.log(`\n${'='.repeat(80)}`);
        console.log(`MATCH ${index + 1}:`);
        console.log('='.repeat(80));
        
        // Try to extract weekMenu JSON
        const weekMenuMatch = match.match(/weekMenu['"]?\s*[,:]\s*({[^}]*}|'[^']*'|"[^"]*")/i);
        if (weekMenuMatch) {
          console.log('\n📋 WEEKMENU DATA GEVONDEN:');
          console.log(weekMenuMatch[1]);
        }
        
        // Show the full INSERT statement (truncated)
        console.log('\n📄 Volledige INSERT statement (eerste 2000 karakters):');
        console.log(match.substring(0, 2000));
        if (match.length > 2000) {
          console.log(`\n... (${match.length - 2000} meer karakters)`);
        }
      });
    } else {
      console.log('❌ Geen INSERT statement gevonden voor plan ID');
    }

    // Also search for COPY statements (PostgreSQL often uses COPY for bulk inserts)
    console.log('\n\n🔍 Zoeken naar COPY statement voor nutrition_plans...\n');
    const copyPattern = new RegExp(
      `COPY[\\s\\S]{0,200}nutrition_plans[\\s\\S]{0,50000}${planId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]{0,50000}`,
      'gi'
    );

    const copyMatches = content.match(copyPattern);
    
    if (copyMatches && copyMatches.length > 0) {
      console.log(`✅ COPY statement gevonden voor plan ID!\n`);
      copyMatches.forEach((match, index) => {
        console.log(`\n${'='.repeat(80)}`);
        console.log(`COPY MATCH ${index + 1}:`);
        console.log('='.repeat(80));
        console.log(match.substring(0, 3000));
        if (match.length > 3000) {
          console.log(`\n... (${match.length - 3000} meer karakters)`);
        }
      });
    } else {
      console.log('❌ Geen COPY statement gevonden voor plan ID');
    }

    // Search for customer_nutrition_plans assignments for Andreea Radulescu
    console.log('\n\n🔍 Zoeken naar assignments voor Andreea Radulescu...\n');
    const assignmentPattern = new RegExp(
      `(INSERT INTO|COPY)[\\s\\S]{0,500}customer_nutrition_plans[\\s\\S]{0,10000}${andreeaRadulescuId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]{0,20000}`,
      'gi'
    );

    const assignmentMatches = content.match(assignmentPattern);
    
    if (assignmentMatches && assignmentMatches.length > 0) {
      console.log(`✅ Assignment gevonden voor Andreea Radulescu!\n`);
      assignmentMatches.forEach((match, index) => {
        console.log(`\n${'='.repeat(80)}`);
        console.log(`ASSIGNMENT MATCH ${index + 1}:`);
        console.log('='.repeat(80));
        console.log(match.substring(0, 2000));
        if (match.length > 2000) {
          console.log(`\n... (${match.length - 2000} meer karakters)`);
        }
      });
    } else {
      console.log('❌ Geen assignments gevonden voor Andreea Radulescu');
    }

    // Search for the plan ID in any context
    console.log('\n\n🔍 Zoeken naar plan ID in alle contexten...\n');
    const allMatches = content.match(
      new RegExp(`[\\s\\S]{0,500}${planId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]{0,500}`, 'gi')
    );

    if (allMatches && allMatches.length > 0) {
      console.log(`✅ Plan ID gevonden in ${allMatches.length} context(en)!\n`);
      // Show first few matches
      allMatches.slice(0, 5).forEach((match, index) => {
        console.log(`\nContext ${index + 1}:`);
        console.log(match.substring(0, 1000));
        console.log('...\n');
      });
    }

    // Try to find weekMenu data specifically
    console.log('\n\n🔍 Zoeken naar weekMenu data in combinatie met plan ID...\n');
    const weekMenuPattern = new RegExp(
      `${planId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]{0,10000}weekMenu[\\s\\S]{0,50000}({[^}]{100,50000}}|'[^']{100,50000}'|"[^"]{100,50000}")`,
      'gi'
    );

    const weekMenuMatches = content.match(weekMenuPattern);
    
    if (weekMenuMatches && weekMenuMatches.length > 0) {
      console.log(`✅ WEEKMENU DATA GEVONDEN!\n`);
      weekMenuMatches.forEach((match, index) => {
        console.log(`\n${'='.repeat(80)}`);
        console.log(`WEEKMENU MATCH ${index + 1}:`);
        console.log('='.repeat(80));
        
        // Extract JSON part
        const jsonMatch = match.match(/({[^}]{100,50000}}|'[^']{100,50000}'|"[^"]{100,50000}")/);
        if (jsonMatch) {
          console.log('\n📋 WEEKMENU JSON:');
          let jsonStr = jsonMatch[1];
          // Remove quotes if present
          if ((jsonStr.startsWith("'") && jsonStr.endsWith("'")) || 
              (jsonStr.startsWith('"') && jsonStr.endsWith('"'))) {
            jsonStr = jsonStr.slice(1, -1);
            // Unescape
            jsonStr = jsonStr.replace(/\\'/g, "'").replace(/\\"/g, '"').replace(/\\\\/g, '\\');
          }
          console.log(jsonStr.substring(0, 5000));
          if (jsonStr.length > 5000) {
            console.log(`\n... (${jsonStr.length - 5000} meer karakters)`);
          }
        }
      });
    } else {
      console.log('❌ Geen weekMenu data gevonden in combinatie met plan ID');
    }

    console.log('\n\n✅ Zoeken voltooid!');

  } catch (error) {
    console.error('❌ Fout:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Stack:', error.stack);
    }
  }
}

extractAndreeaPlan();






