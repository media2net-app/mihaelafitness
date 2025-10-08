const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function optimizeDatabase() {
  console.log('🚀 Starting database optimization...');

  try {
    // Add database indexes for better query performance
    console.log('📊 Adding database indexes...');
    
    // Index for user queries
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_users_email ON "User" (email);
    `;
    
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_users_name ON "User" (name);
    `;
    
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_users_status ON "User" (status);
    `;
    
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_users_created_at ON "User" ("createdAt");
    `;

    // Index for training sessions
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_training_sessions_customer_id ON "TrainingSession" ("customerId");
    `;
    
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_training_sessions_status ON "TrainingSession" (status);
    `;
    
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_training_sessions_date ON "TrainingSession" (date);
    `;

    // Index for pricing calculations
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_pricing_calculations_customer_id ON "PricingCalculation" ("customerId");
    `;
    
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_pricing_calculations_created_at ON "PricingCalculation" ("createdAt");
    `;

    // Index for customer workouts
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_customer_workouts_customer_id ON "CustomerWorkout" ("customerId");
    `;
    
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_customer_workouts_workout_id ON "CustomerWorkout" ("workoutId");
    `;

    // Index for schedule assignments
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_schedule_assignments_customer_id ON "ScheduleAssignment" ("customerId");
    `;
    
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_schedule_assignments_is_active ON "ScheduleAssignment" ("isActive");
    `;

    // Index for nutrition plans
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_nutrition_plans_goal ON "NutritionPlan" (goal);
    `;
    
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_nutrition_plans_created_at ON "NutritionPlan" ("createdAt");
    `;

    // Index for nutrition calculations
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_nutrition_calculations_customer_id ON "NutritionCalculation" ("customerId");
    `;
    
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_nutrition_calculations_created_at ON "NutritionCalculation" ("createdAt");
    `;

    // Index for ingredients
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_ingredients_name ON "Ingredient" (name);
    `;
    
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_ingredients_category ON "Ingredient" (category);
    `;
    
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_ingredients_is_active ON "Ingredient" ("isActive");
    `;

    // Index for workouts
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_workouts_training_type ON "Workout" ("trainingType");
    `;
    
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_workouts_created_at ON "Workout" ("createdAt");
    `;

    console.log('✅ Database indexes added successfully!');
    
    // Analyze query performance
    console.log('📈 Analyzing query performance...');
    
    const userCount = await prisma.user.count();
    const trainingSessionCount = await prisma.trainingSession.count();
    const pricingCalculationCount = await prisma.pricingCalculation.count();
    
    console.log('📊 Database Statistics:');
    console.log(`   - Users: ${userCount}`);
    console.log(`   - Training Sessions: ${trainingSessionCount}`);
    console.log(`   - Pricing Calculations: ${pricingCalculationCount}`);
    
    // Test query performance
    console.log('⚡ Testing query performance...');
    
    const startTime = Date.now();
    const users = await prisma.user.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' }
    });
    const queryTime = Date.now() - startTime;
    
    console.log(`✅ User query (20 records): ${queryTime}ms`);
    
    if (queryTime < 100) {
      console.log('🚀 Excellent performance!');
    } else if (queryTime < 500) {
      console.log('✅ Good performance');
    } else {
      console.log('⚠️ Performance could be improved');
    }

  } catch (error) {
    console.error('❌ Error optimizing database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

optimizeDatabase();




