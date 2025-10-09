const fs = require('fs');

const newDatabaseUrl = 'DATABASE_URL="postgres://postgres.efpqeufpwnwuyzsuikhf:ETxEgx2E6UDUfwLt@db.efpqeufpwnwuyzsuikhf.supabase.co:5432/postgres"';

// Update .env
try {
  let envContent = fs.readFileSync('.env', 'utf8');
  const lines = envContent.split('\n');
  const updatedLines = lines.map(line => {
    if (line.trim().startsWith('DATABASE_URL=')) {
      return newDatabaseUrl;
    }
    return line;
  });
  
  // If DATABASE_URL not found, add it
  if (!updatedLines.some(line => line.includes('DATABASE_URL='))) {
    updatedLines.unshift(newDatabaseUrl);
  }
  
  fs.writeFileSync('.env', updatedLines.join('\n'));
  console.log('✅ .env updated with Supabase URL (direct connection)');
} catch (error) {
  console.log('⚠️  .env not found or error:', error.message);
}

// Update .env.local
try {
  let envLocalContent = fs.readFileSync('.env.local', 'utf8');
  const lines = envLocalContent.split('\n');
  const updatedLines = lines.map(line => {
    if (line.trim().startsWith('DATABASE_URL=')) {
      return newDatabaseUrl;
    }
    return line;
  });
  
  // If DATABASE_URL not found, add it at the top
  if (!updatedLines.some(line => line.includes('DATABASE_URL='))) {
    updatedLines.unshift(newDatabaseUrl);
  }
  
  fs.writeFileSync('.env.local', updatedLines.join('\n'));
  console.log('✅ .env.local updated with Supabase URL (direct connection)');
} catch (error) {
  console.log('⚠️  .env.local not found or error:', error.message);
}

console.log('\n📋 New DATABASE_URL:');
console.log('   postgres://postgres.efpqeufpwnwuyzsuikhf:ETxEgx2E6UDUfwLt@db.efpqeufpwnwuyzsuikhf.supabase.co:5432/postgres');
console.log('\n✅ Ready to migrate! Run: node migrate-to-supabase.js');

