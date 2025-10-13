/**
 * 🚨 EMERGENCY: Migreer Customer Photos naar Supabase
 */

const { PrismaClient } = require('@prisma/client');

// OLD DATABASE (Prisma Accelerate)
const OLD_DB_URL = 'prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza183UkxGelFDMmU0bEIwdXVBZ0l6UlYiLCJhcGlfa2V5IjoiMDFLNjhZNTUzU0RaNUtNMkZEWTQzRkRLTTAiLCJ0ZW5hbnRfaWQiOiIyYzAxN2NiZWFmY2ZlOWUwNjViYzFjNDIyNGY2OGYxNTRjMDEyZmQxYWYzYThjZDNkMzcwNzc3ZDUzMTc4Y2FjIiwiaW50ZXJuYWxfc2VjcmV0IjoiMzBmNTc4YWMtODlhMy00MGUyLWJkMmQtZTRlMzExZDhmZjg4In0.CGXndBzIhhtw4jIGEGXEdrYI_DYOQ7mAEo3_J84GkM4';

// NEW DATABASE (Supabase)
const NEW_DB_URL = 'postgresql://postgres:h4ONFtzdiYONfX15@db.efpqeufpwnwuyzsuikhf.supabase.co:5432/postgres';

console.log('🚨 EMERGENCY: Migreer Customer Photos\n');
console.log('=' .repeat(80));

async function migrateCustomerPhotos() {
  const prismaOld = new PrismaClient({
    datasources: { db: { url: OLD_DB_URL } }
  });
  
  const prismaNew = new PrismaClient({
    datasources: { db: { url: NEW_DB_URL } }
  });
  
  try {
    console.log('\n📸 Fetching Customer Photos from old database...');
    
    const oldPhotos = await prismaOld.customerPhoto.findMany({
      include: {
        customer: {
          select: { name: true }
        }
      },
      orderBy: [
        { customerId: 'asc' },
        { week: 'asc' },
        { position: 'asc' }
      ]
    });
    
    console.log(`✅ Found ${oldPhotos.length} customer photos in old database`);
    
    if (oldPhotos.length === 0) {
      console.log('⚠️  No customer photos found in old database');
      await prismaOld.$disconnect();
      await prismaNew.$disconnect();
      return;
    }
    
    console.log('\n📋 Photo breakdown:');
    const photosByCustomer = {};
    oldPhotos.forEach(photo => {
      const customerName = photo.customer?.name || 'Unknown';
      if (!photosByCustomer[customerName]) {
        photosByCustomer[customerName] = [];
      }
      photosByCustomer[customerName].push(photo);
    });
    
    Object.keys(photosByCustomer).forEach(customerName => {
      const photos = photosByCustomer[customerName];
      console.log(`   • ${customerName}: ${photos.length} photos`);
    });
    
    console.log(`\n📥 Importing ${oldPhotos.length} photos to Supabase...`);
    
    let imported = 0;
    let skipped = 0;
    let errors = 0;
    
    for (const photo of oldPhotos) {
      try {
        const existing = await prismaNew.customerPhoto.findUnique({
          where: { id: photo.id }
        });
        
        if (existing) {
          console.log(`   ⏭️  Photo ${photo.id} already exists, skipping...`);
          skipped++;
          continue;
        }
        
        await prismaNew.customerPhoto.create({
          data: {
            id: photo.id,
            customerId: photo.customerId,
            week: photo.week,
            position: photo.position,
            date: photo.date,
            imageUrl: photo.imageUrl,
            notes: photo.notes,
            createdAt: photo.createdAt,
            updatedAt: photo.updatedAt,
          }
        });
        
        imported++;
        console.log(`   ✅ Week ${photo.week} - ${photo.position} | ${photo.customer?.name || 'Unknown'}`);
        
      } catch (error) {
        errors++;
        console.error(`   ❌ Error importing photo ${photo.id}:`, error.message);
      }
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('📊 MIGRATION SUMMARY:');
    console.log('=' .repeat(80));
    console.log(`✅ Successfully imported: ${imported}`);
    console.log(`⏭️  Already existed (skipped): ${skipped}`);
    console.log(`❌ Errors: ${errors}`);
    console.log(`📋 Total in old DB: ${oldPhotos.length}`);
    
    // Verify in Supabase
    console.log('\n🔍 Verifying in Supabase...');
    const supabasePhotos = await prismaNew.customerPhoto.findMany();
    console.log(`✅ Total photos now in Supabase: ${supabasePhotos.length}`);
    
    // Show breakdown by customer
    const supabasePhotosByCustomer = {};
    for (const photo of supabasePhotos) {
      const customer = await prismaNew.user.findUnique({
        where: { id: photo.customerId },
        select: { name: true }
      });
      const customerName = customer?.name || 'Unknown';
      if (!supabasePhotosByCustomer[customerName]) {
        supabasePhotosByCustomer[customerName] = 0;
      }
      supabasePhotosByCustomer[customerName]++;
    }
    
    console.log('\n📸 Photos per customer in Supabase:');
    Object.keys(supabasePhotosByCustomer).forEach(customerName => {
      console.log(`   • ${customerName}: ${supabasePhotosByCustomer[customerName]} photos`);
    });
    
    await prismaOld.$disconnect();
    await prismaNew.$disconnect();
    
    console.log('\n🎉 CUSTOMER PHOTOS MIGRATION COMPLETE!');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    await prismaOld.$disconnect();
    await prismaNew.$disconnect();
    throw error;
  }
}

// Run migration
migrateCustomerPhotos().catch(console.error);


