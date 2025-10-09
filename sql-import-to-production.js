const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Parse Prisma connection URL
const prismaUrl = 'prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza183UkxGelFDMmU0bEIwdXVBZ0l6UlYiLCJhcGlfa2V5IjoiMDFLNjhZNTUzU0RaNUtNMkZEWTQzRkRLTTAiLCJ0ZW5hbnRfaWQiOiIyYzAxN2NiZWFmY2ZlOWUwNjViYzFjNDIyNGY2OGYxNTRjMDEyZmQxYWYzYThjZDNkMzcwNzc3ZDUzMTc4Y2FjIiwiaW50ZXJuYWxfc2VjcmV0IjoiMzBmNTc4YWMtODlhMy00MGUyLWJkMmQtZTRlMzExZDhmZjg4In0.CGXndBzIhhtw4jIGEGXEdrYI_DYOQ7mAEo3_J84GkM4';

// This is a Prisma Accelerate URL, we need the actual PostgreSQL connection string
// For now, let's inform the user they need to provide the direct DATABASE_URL
console.log('\n🚨 SQL-BASED PRODUCTION IMPORT 🚨');
console.log('═══════════════════════════════════════\n');
console.log('❌ ERROR: This script requires the DIRECT PostgreSQL connection URL');
console.log('   (not the Prisma Accelerate URL)\n');
console.log('📝 Please provide the direct PostgreSQL connection string from your');
console.log('   database provider (Neon, Supabase, etc.)\n');
console.log('   Format: postgresql://username:password@host:port/database\n');
console.log('⚠️  You can find this in your database provider dashboard.\n');
console.log('💡 Once you have it, edit this file and replace the connection URL,');
console.log('   then run the script again.\n');
process.exit(0);

// Uncomment and modify once you have the direct PostgreSQL URL:
/*
const pool = new Pool({
  connectionString: 'postgresql://your-username:your-password@your-host:5432/your-database'
});

async function sqlImport() {
  const client = await pool.connect();
  
  try {
    console.log('🔗 Connected to production database\n');
    
    // Load exported data
    const exportPath = path.join(__dirname, 'ingredients-basic-export.json');
    const ingredients = JSON.parse(fs.readFileSync(exportPath, 'utf8'));
    
    console.log(`📦 Loaded ${ingredients.length} ingredients\n`);
    
    let created = 0;
    let skipped = 0;
    
    for (const ing of ingredients) {
      // Check if exists
      const checkResult = await client.query(
        'SELECT id FROM ingredients WHERE name = $1',
        [ing.name]
      );
      
      if (checkResult.rows.length > 0) {
        skipped++;
        continue;
      }
      
      // Insert
      await client.query(
        `INSERT INTO ingredients (name, per, calories, protein, carbs, fat, fiber, sugar, category, aliases, "isActive")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          ing.name,
          ing.per || '100g',
          ing.calories,
          ing.protein,
          ing.carbs,
          ing.fat,
          ing.fiber || 0,
          ing.sugar || 0,
          ing.category || 'other',
          ing.aliases || [`Pure:${ing.name}`],
          ing.isActive !== undefined ? ing.isActive : true
        ]
      );
      
      created++;
      if (created % 50 === 0) {
        console.log(`   ✅ Created ${created} ingredients...`);
      }
    }
    
    console.log(`\n✅ Import complete! Created: ${created}, Skipped: ${skipped}\n`);
    
  } finally {
    client.release();
    await pool.end();
  }
}

sqlImport().catch(console.error);
*/

