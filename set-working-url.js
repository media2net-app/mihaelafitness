const fs = require('fs');

const workingUrl = 'DATABASE_URL="postgresql://postgres:h4ONFtzdiYONfX15@db.efpqeufpwnwuyzsuikhf.supabase.co:5432/postgres"';

console.log('✅ Setting WORKING Supabase URL...\n');

// Update .env
let envContent = fs.readFileSync('.env', 'utf8');
let lines = envContent.split('\n');
lines = lines.map(line => line.trim().startsWith('DATABASE_URL=') ? workingUrl : line);
if (!lines.some(line => line.includes('DATABASE_URL='))) lines.unshift(workingUrl);
fs.writeFileSync('.env', lines.join('\n'));
console.log('✅ .env updated');

// Update .env.local
let envLocalContent = fs.readFileSync('.env.local', 'utf8');
lines = envLocalContent.split('\n');
lines = lines.map(line => line.trim().startsWith('DATABASE_URL=') ? workingUrl : line);
if (!lines.some(line => line.includes('DATABASE_URL='))) lines.unshift(workingUrl);
fs.writeFileSync('.env.local', lines.join('\n'));
console.log('✅ .env.local updated');

console.log('\n🎉 Working URL set! Ready for migration!\n');

