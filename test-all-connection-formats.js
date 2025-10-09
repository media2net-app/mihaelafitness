const { PrismaClient } = require('@prisma/client');

const password = 'h4ONFtzdiYONfX15';
const projectRef = 'efpqeufpwnwuyzsuikhf';

// Different connection string formats to try
const connectionStrings = [
  {
    name: 'Format 1: Direct connection (postgres user)',
    url: `postgresql://postgres:${password}@db.${projectRef}.supabase.co:5432/postgres`
  },
  {
    name: 'Format 2: Direct connection (postgres.project user)',
    url: `postgresql://postgres.${projectRef}:${password}@db.${projectRef}.supabase.co:5432/postgres`
  },
  {
    name: 'Format 3: Pooler Session Mode (postgres user)',
    url: `postgresql://postgres:${password}@aws-0-eu-central-1.pooler.supabase.com:5432/postgres`
  },
  {
    name: 'Format 4: Pooler Transaction Mode (port 6543)',
    url: `postgresql://postgres.${projectRef}:${password}@aws-0-eu-central-1.pooler.supabase.com:6543/postgres`
  },
  {
    name: 'Format 5: Pooler with pgbouncer',
    url: `postgresql://postgres.${projectRef}:${password}@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true`
  }
];

async function testConnection(name, url) {
  console.log(`\n🔍 Testing: ${name}`);
  console.log(`   URL: ${url.replace(password, '***')}`);
  
  const prisma = new PrismaClient({
    datasources: { db: { url } },
    log: ['error']
  });
  
  try {
    const result = await prisma.$queryRaw`SELECT current_database(), current_user`;
    console.log(`   ✅ SUCCESS!`);
    console.log(`   📊 Result:`, result);
    await prisma.$disconnect();
    return { success: true, url, name };
  } catch (error) {
    console.log(`   ❌ Failed: ${error.message.split('\n')[0]}`);
    await prisma.$disconnect();
    return { success: false, error: error.message };
  }
}

async function testAll() {
  console.log('🚀 Testing all Supabase connection formats...');
  console.log('=' .repeat(70));
  
  const results = [];
  
  for (const config of connectionStrings) {
    const result = await testConnection(config.name, config.url);
    results.push(result);
  }
  
  console.log('\n' + '=' .repeat(70));
  console.log('📊 SUMMARY:');
  console.log('=' .repeat(70));
  
  const successful = results.filter(r => r.success);
  
  if (successful.length > 0) {
    console.log('\n✅ Working connection string(s):');
    successful.forEach(r => {
      console.log(`\n   ${r.name}`);
      console.log(`   ${r.url}`);
    });
    console.log('\n🎉 Use this URL in your .env file!');
  } else {
    console.log('\n❌ None of the formats worked.');
    console.log('\n💡 Please provide the exact connection string from Supabase Dashboard:');
    console.log('   Settings → Database → Connection string → URI');
  }
}

testAll();

