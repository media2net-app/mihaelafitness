const fs = require('fs');

// CORRECT Supabase URL with real password
const correctUrl = 'DATABASE_URL="postgresql://postgres.efpqeufpwnwuyzsuikhf:h4ONFtzdiYONfX15@db.efpqeufpwnwuyzsuikhf.supabase.co:5432/postgres"';

console.log('🔧 Setting correct Supabase DATABASE_URL with password...\n');

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

console.log('\n📋 Connection string set:');
console.log('   postgresql://postgres.efpqeufpwnwuyzsuikhf:h4ONFtzd...@db.efpqeufpwnwuyzsuikhf.supabase.co:5432/postgres');
console.log('\n✅ Ready! Run: node test-supabase-connection.js');

