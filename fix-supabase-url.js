const fs = require('fs');

// CORRECT Supabase URL with postgres.PROJECT_ID as username
const correctUrl = 'DATABASE_URL="postgres://postgres.efpqeufpwnwuyzsuikhf:ETxEgx2E6UDUfwLt@db.efpqeufpwnwuyzsuikhf.supabase.co:5432/postgres"';

console.log('🔧 Fixing Supabase DATABASE_URL...\n');

// Update .env
try {
  let envContent = fs.readFileSync('.env', 'utf8');
  const lines = envContent.split('\n');
  const updatedLines = lines.map(line => {
    if (line.trim().startsWith('DATABASE_URL=')) {
      return correctUrl;
    }
    return line;
  });
  
  if (!updatedLines.some(line => line.includes('DATABASE_URL='))) {
    updatedLines.unshift(correctUrl);
  }
  
  fs.writeFileSync('.env', updatedLines.join('\n'));
  console.log('✅ .env updated');
} catch (error) {
  console.log('⚠️  .env error:', error.message);
}

// Update .env.local
try {
  let envLocalContent = fs.readFileSync('.env.local', 'utf8');
  const lines = envLocalContent.split('\n');
  const updatedLines = lines.map(line => {
    if (line.trim().startsWith('DATABASE_URL=')) {
      return correctUrl;
    }
    return line;
  });
  
  if (!updatedLines.some(line => line.includes('DATABASE_URL='))) {
    updatedLines.unshift(correctUrl);
  }
  
  fs.writeFileSync('.env.local', updatedLines.join('\n'));
  console.log('✅ .env.local updated');
} catch (error) {
  console.log('⚠️  .env.local error:', error.message);
}

console.log('\n📋 Correct URL (note the username format):');
console.log('   postgres://postgres.PROJECT_ID:PASSWORD@HOST:5432/postgres');
console.log('   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^');
console.log('   Username must be: postgres.efpqeufpwnwuyzsuikhf\n');
console.log('✅ Ready! Run: node import-from-backup.js');

