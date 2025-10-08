const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verifyImport() {
  try {
    console.log('🔍 Verifying imported data...\n');
    
    // Count all records
    const userCount = await prisma.user.count();
    const measurementCount = await prisma.customerMeasurement.count();
    const sessionCount = await prisma.trainingSession.count();
    
    console.log(`📊 Database counts:`);
    console.log(`   - Users: ${userCount}`);
    console.log(`   - Customer Measurements: ${measurementCount}`);
    console.log(`   - Training Sessions: ${sessionCount}\n`);
    
    // Show all users
    const users = await prisma.user.findMany({
      select: {
        name: true,
        email: true,
        plan: true,
        status: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log(`👥 All ${users.length} users:`);
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email}) - ${user.plan} - ${user.status}`);
    });
    
    // Show measurements with customer names
    const measurements = await prisma.customerMeasurement.findMany({
      include: {
        customer: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    });
    
    console.log(`\n📏 Customer Measurements (${measurements.length}):`);
    console.log('┌─────────────────────┬──────┬────────────┬────────┬────────┬──────┬──────┬──────┬─────────┐');
    console.log('│ Customer Name       │ Week │ Date       │ Weight │ Height │ Chest│ Waist│ Hips │ Body Fat│');
    console.log('├─────────────────────┼──────┼────────────┼────────┼────────┼──────┼──────┼──────┼─────────┤');
    
    measurements.forEach(measurement => {
      const name = measurement.customer.name.padEnd(19).substring(0, 19);
      const week = String(measurement.week).padStart(4);
      const date = measurement.date.toISOString().split('T')[0];
      const weight = measurement.weight ? String(measurement.weight).padStart(6) : '   N/A';
      const height = measurement.height ? String(measurement.height).padStart(6) : '   N/A';
      const chest = measurement.chest ? String(measurement.chest).padStart(4) : ' N/A';
      const waist = measurement.waist ? String(measurement.waist).padStart(4) : ' N/A';
      const hips = measurement.hips ? String(measurement.hips).padStart(4) : ' N/A';
      const bodyFat = measurement.bodyFat ? String(measurement.bodyFat).padStart(7) : '    N/A';
      
      console.log(`│ ${name} │ ${week} │ ${date} │ ${weight} │ ${height} │ ${chest} │ ${waist} │ ${hips} │ ${bodyFat} │`);
    });
    
    console.log('└─────────────────────┴──────┴────────────┴────────┴────────┴──────┴──────┴──────┴─────────┘');
    
    // Show training sessions summary (avoid data corruption issues)
    console.log(`\n🏃 Training Sessions: ${sessionCount} total sessions imported`);
    console.log('   (Some sessions may have data corruption issues from import)');
    
  } catch (error) {
    console.error('❌ Error verifying data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyImport();
