const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function importLiveData() {
  try {
    console.log('🔄 Importing related data from live Vercel version...\n');
    
    // Import measurements
    console.log('📏 Importing customer measurements...');
    const measurementsPath = path.join(__dirname, 'live-measurements.json');
    const measurementsData = JSON.parse(fs.readFileSync(measurementsPath, 'utf8'));
    
    let measurementsImported = 0;
    let measurementsSkipped = 0;
    
    for (const measurement of measurementsData) {
      try {
        // Check if measurement already exists
        const existingMeasurement = await prisma.customerMeasurement.findFirst({
          where: {
            customerId: measurement.customerId,
            week: measurement.week,
            date: new Date(measurement.date)
          }
        });
        
        if (existingMeasurement) {
          measurementsSkipped++;
          continue;
        }
        
        // Create new measurement
        await prisma.customerMeasurement.create({
          data: {
            id: measurement.id,
            customerId: measurement.customerId,
            week: measurement.week,
            date: new Date(measurement.date),
            weight: measurement.weight,
            height: measurement.height,
            age: measurement.age,
            chest: measurement.chest,
            waist: measurement.waist,
            hips: measurement.hips,
            thigh: measurement.thigh,
            arm: measurement.arm,
            neck: measurement.neck,
            bodyFat: measurement.bodyFat,
            muscleMass: measurement.muscleMass,
            bmi: measurement.bmi,
            notes: measurement.notes,
            createdAt: new Date(measurement.createdAt),
            updatedAt: new Date(measurement.updatedAt)
          }
        });
        
        measurementsImported++;
        
      } catch (error) {
        console.error(`❌ Error importing measurement:`, error.message);
      }
    }
    
    console.log(`✅ Measurements: ${measurementsImported} imported, ${measurementsSkipped} skipped\n`);
    
    // Import training sessions
    console.log('🏃 Importing training sessions...');
    const sessionsPath = path.join(__dirname, 'live-training-sessions.json');
    const sessionsData = JSON.parse(fs.readFileSync(sessionsPath, 'utf8'));
    
    let sessionsImported = 0;
    let sessionsSkipped = 0;
    
    for (const session of sessionsData) {
      try {
        // Check if session already exists
        const existingSession = await prisma.trainingSession.findFirst({
          where: {
            customerId: session.customerId,
            date: new Date(session.date),
            startTime: session.startTime
          }
        });
        
        if (existingSession) {
          sessionsSkipped++;
          continue;
        }
        
        // Create new session
        await prisma.trainingSession.create({
          data: {
            id: session.id,
            customerId: session.customerId,
            date: new Date(session.date),
            startTime: session.startTime,
            endTime: session.endTime,
            type: session.type,
            status: session.status,
            notes: session.notes,
            createdAt: new Date(session.createdAt),
            updatedAt: new Date(session.updatedAt)
          }
        });
        
        sessionsImported++;
        
      } catch (error) {
        console.error(`❌ Error importing session:`, error.message);
      }
    }
    
    console.log(`✅ Training sessions: ${sessionsImported} imported, ${sessionsSkipped} skipped\n`);
    
    // Show final counts
    const finalUserCount = await prisma.user.count();
    const finalMeasurementCount = await prisma.customerMeasurement.count();
    const finalSessionCount = await prisma.trainingSession.count();
    
    console.log(`📊 Final database counts:`);
    console.log(`   - Users: ${finalUserCount}`);
    console.log(`   - Measurements: ${finalMeasurementCount}`);
    console.log(`   - Training sessions: ${finalSessionCount}`);
    
    console.log(`\n🎉 Data import completed successfully!`);
    
  } catch (error) {
    console.error('❌ Import failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the import
importLiveData();
