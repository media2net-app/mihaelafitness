import * as fs from 'fs';
import * as path from 'path';

async function searchBackupFiles() {
  try {
    const planId = 'cmhz9zcck0000ie04rtjh9rod';
    const andreeaRadulescuId = 'cmgziq5zr000ijp04wig5wn45';
    const backupsDir = path.join(process.cwd(), 'backups');

    console.log('🔍 Zoeken in backup bestanden...\n');
    console.log(`Plan ID: ${planId}`);
    console.log(`Andreea Radulescu ID: ${andreeaRadulescuId}\n`);

    // List all backup files
    const backupFiles = fs.readdirSync(backupsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    console.log(`📁 Gevonden ${backupFiles.length} backup bestand(en):\n`);

    for (const file of backupFiles) {
      const filePath = path.join(backupsDir, file);
      console.log(`\n📄 Doorzoeken: ${file}`);
      console.log('='.repeat(60));

      const content = fs.readFileSync(filePath, 'utf-8');

      // Search for plan ID
      const planMatches = content.match(
        new RegExp(`(${planId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]{0,2000})`, 'gi')
      );

      if (planMatches && planMatches.length > 0) {
        console.log(`\n✅ PLAN ID GEVONDEN in ${file}!\n`);
        planMatches.forEach((match, index) => {
          console.log(`Match ${index + 1}:`);
          // Extract relevant lines
          const lines = match.split('\n').slice(0, 50).join('\n');
          console.log(lines.substring(0, 1000));
          console.log('...\n');
        });
      } else {
        console.log(`   ❌ Plan ID niet gevonden`);
      }

      // Search for Andreea Radulescu ID
      const customerMatches = content.match(
        new RegExp(`(${andreeaRadulescuId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]{0,2000})`, 'gi')
      );

      if (customerMatches && customerMatches.length > 0) {
        console.log(`\n✅ ANDREEA RADULESCU ID GEVONDEN in ${file}!\n`);
        customerMatches.forEach((match, index) => {
          console.log(`Match ${index + 1}:`);
          const lines = match.split('\n').slice(0, 50).join('\n');
          console.log(lines.substring(0, 1000));
          console.log('...\n');
        });
      } else {
        console.log(`   ❌ Andreea Radulescu ID niet gevonden`);
      }

      // Search for "Radulescu" in general
      const radulescuMatches = content.match(
        new RegExp(`(Radulescu[\\s\\S]{0,500})`, 'gi')
      );

      if (radulescuMatches && radulescuMatches.length > 0) {
        console.log(`\n✅ "Radulescu" tekst gevonden in ${file} (${radulescuMatches.length} keer)\n`);
        radulescuMatches.slice(0, 5).forEach((match, index) => {
          console.log(`Match ${index + 1}:`);
          console.log(match.substring(0, 500));
          console.log('...\n');
        });
      }

      // Search for INSERT INTO nutrition_plans around the plan ID
      const insertMatches = content.match(
        new RegExp(`(INSERT INTO[\\s\\S]{0,10000}${planId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]{0,10000})`, 'gi')
      );

      if (insertMatches && insertMatches.length > 0) {
        console.log(`\n✅ INSERT STATEMENT GEVONDEN voor plan in ${file}!\n`);
        insertMatches.forEach((match, index) => {
          console.log(`Insert ${index + 1}:`);
          // Try to extract the weekMenu data
          const weekMenuMatch = match.match(/weekMenu[^,}]*({[^}]*})/);
          if (weekMenuMatch) {
            console.log('WeekMenu data gevonden!');
            console.log(weekMenuMatch[1].substring(0, 500));
          }
          console.log(match.substring(0, 2000));
          console.log('...\n');
        });
      }
    }

    console.log('\n\n💡 Als je het plan vindt in een backup:');
    console.log('   1. Extract de weekMenu JSON data');
    console.log('   2. Maak een nieuw plan aan met die data');
    console.log('   3. Wijs toe aan Andreea Radulescu');

  } catch (error) {
    console.error('❌ Fout:', error);
  }
}

searchBackupFiles();






