/**
 * 🚨 FINAL EMERGENCY MIGRATION - Alle resterende ontbrekende data
 */

const { PrismaClient } = require('@prisma/client');

const OLD_DB_URL = 'prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza183UkxGelFDMmU0bEIwdXVBZ0l6UlYiLCJhcGlfa2V5IjoiMDFLNjhZNTUzU0RaNUtNMkZEWTQzRkRLTTAiLCJ0ZW5hbnRfaWQiOiIyYzAxN2NiZWFmY2ZlOWUwNjViYzFjNDIyNGY2OGYxNTRjMDEyZmQxYWYzYThjZDNkMzcwNzc3ZDUzMTc4Y2FjIiwiaW50ZXJuYWxfc2VjcmV0IjoiMzBmNTc4YWMtODlhMy00MGUyLWJkMmQtZTRlMzExZDhmZjg4In0.CGXndBzIhhtw4jIGEGXEdrYI_DYOQ7mAEo3_J84GkM4';
const NEW_DB_URL = 'postgresql://postgres:h4ONFtzdiYONfX15@db.efpqeufpwnwuyzsuikhf.supabase.co:5432/postgres';

console.log('🚨 FINAL EMERGENCY MIGRATION - ALL remaining data\n');
console.log('=' .repeat(80));

async function migrateFinalMissingData() {
  const prismaOld = new PrismaClient({
    datasources: { db: { url: OLD_DB_URL } }
  });
  
  const prismaNew = new PrismaClient({
    datasources: { db: { url: NEW_DB_URL } }
  });
  
  const summary = {
    service: { imported: 0, skipped: 0, errors: 0 },
    nutritionCalculation: { imported: 0, skipped: 0, errors: 0 },
    todo: { imported: 0, skipped: 0, errors: 0 },
    payment: { imported: 0, skipped: 0, errors: 0 },
    recipe: { imported: 0, skipped: 0, errors: 0 },
    recipeIngredient: { imported: 0, skipped: 0, errors: 0 },
    launchNotification: { imported: 0, skipped: 0, errors: 0 }
  };
  
  try {
    // 1. SERVICE
    console.log('\n💼 Migrating Services...');
    const services = await prismaOld.service.findMany();
    console.log(`   Found ${services.length} services`);
    for (const s of services) {
      try {
        const existing = await prismaNew.service.findUnique({ where: { id: s.id } });
        if (existing) { summary.service.skipped++; continue; }
        
        await prismaNew.service.create({ data: s });
        summary.service.imported++;
        console.log(`   ✅ ${s.name} - €${s.basePrice}`);
      } catch (e) {
        summary.service.errors++;
        console.error(`   ❌ Error:`, e.message);
      }
    }

    // 2. NUTRITION CALCULATION
    console.log('\n📊 Migrating Nutrition Calculations...');
    const nutritionCalcs = await prismaOld.nutritionCalculation.findMany();
    console.log(`   Found ${nutritionCalcs.length} nutrition calculations`);
    for (const nc of nutritionCalcs) {
      try {
        const existing = await prismaNew.nutritionCalculation.findUnique({ where: { id: nc.id } });
        if (existing) { summary.nutritionCalculation.skipped++; continue; }
        
        await prismaNew.nutritionCalculation.create({
          data: {
            id: nc.id,
            customerId: nc.customerId,
            customerName: nc.customerName,
            gender: nc.gender,
            age: nc.age,
            height: nc.height,
            weight: nc.weight,
            activityLevel: nc.activityLevel,
            bmr: nc.bmr,
            maintenanceCalories: nc.maintenanceCalories,
            protein: nc.protein,
            carbs: nc.carbs,
            fat: nc.fat,
            createdAt: nc.createdAt,
          }
        });
        summary.nutritionCalculation.imported++;
        console.log(`   ✅ ${nc.customerName} - ${nc.maintenanceCalories} kcal`);
      } catch (e) {
        summary.nutritionCalculation.errors++;
        console.error(`   ❌ Error:`, e.message);
      }
    }

    // 3. TODOS
    console.log('\n✅ Migrating Todos...');
    const todos = await prismaOld.todo.findMany();
    console.log(`   Found ${todos.length} todos`);
    for (const todo of todos) {
      try {
        const existing = await prismaNew.todo.findUnique({ where: { id: todo.id } });
        if (existing) { summary.todo.skipped++; continue; }
        
        await prismaNew.todo.create({
          data: {
            id: todo.id,
            title: todo.title,
            description: todo.description,
            priority: todo.priority,
            deadline: todo.deadline,
            completed: todo.completed,
            completedAt: todo.completedAt,
            userId: todo.userId,
            createdAt: todo.createdAt,
            updatedAt: todo.updatedAt,
          }
        });
        summary.todo.imported++;
        console.log(`   ✅ ${todo.title}`);
      } catch (e) {
        summary.todo.errors++;
        console.error(`   ❌ Error:`, e.message);
      }
    }

    // 4. PAYMENTS (IMPORTANT!)
    console.log('\n💰 Migrating Payments (CRITICAL!)...');
    const payments = await prismaOld.payment.findMany({
      include: {
        customer: { select: { name: true } }
      }
    });
    console.log(`   Found ${payments.length} payments`);
    for (const payment of payments) {
      try {
        const existing = await prismaNew.payment.findUnique({ where: { id: payment.id } });
        if (existing) { summary.payment.skipped++; continue; }
        
        await prismaNew.payment.create({
          data: {
            id: payment.id,
            customerId: payment.customerId,
            amount: payment.amount,
            paymentMethod: payment.paymentMethod,
            paymentType: payment.paymentType,
            status: payment.status,
            notes: payment.notes,
            paymentDate: payment.paymentDate,
            createdAt: payment.createdAt,
            updatedAt: payment.updatedAt,
          }
        });
        summary.payment.imported++;
        console.log(`   ✅ ${payment.customer?.name || 'Unknown'} - €${payment.amount} (${payment.paymentMethod})`);
      } catch (e) {
        summary.payment.errors++;
        console.error(`   ❌ Error:`, e.message);
      }
    }

    // 5. RECIPES
    console.log('\n🍽️ Migrating Recipes...');
    const recipes = await prismaOld.recipe.findMany();
    console.log(`   Found ${recipes.length} recipes`);
    for (const recipe of recipes) {
      try {
        const existing = await prismaNew.recipe.findUnique({ where: { id: recipe.id } });
        if (existing) { summary.recipe.skipped++; continue; }
        
        await prismaNew.recipe.create({
          data: {
            id: recipe.id,
            name: recipe.name,
            description: recipe.description,
            prepTime: recipe.prepTime,
            servings: recipe.servings,
            instructions: recipe.instructions,
            totalCalories: recipe.totalCalories,
            totalProtein: recipe.totalProtein,
            totalCarbs: recipe.totalCarbs,
            totalFat: recipe.totalFat,
            status: recipe.status,
            createdAt: recipe.createdAt,
            updatedAt: recipe.updatedAt,
          }
        });
        summary.recipe.imported++;
        console.log(`   ✅ ${recipe.name}`);
      } catch (e) {
        summary.recipe.errors++;
        console.error(`   ❌ Error:`, e.message);
      }
    }

    // 6. RECIPE INGREDIENTS
    console.log('\n🥗 Migrating Recipe Ingredients...');
    const recipeIngredients = await prismaOld.recipeIngredient.findMany();
    console.log(`   Found ${recipeIngredients.length} recipe ingredients`);
    for (const ri of recipeIngredients) {
      try {
        const existing = await prismaNew.recipeIngredient.findUnique({ where: { id: ri.id } });
        if (existing) { summary.recipeIngredient.skipped++; continue; }
        
        await prismaNew.recipeIngredient.create({
          data: {
            id: ri.id,
            recipeId: ri.recipeId,
            name: ri.name,
            quantity: ri.quantity,
            unit: ri.unit,
            exists: ri.exists,
            availableInApi: ri.availableInApi,
            apiMatch: ri.apiMatch,
            createdAt: ri.createdAt,
            updatedAt: ri.updatedAt,
          }
        });
        summary.recipeIngredient.imported++;
        console.log(`   ✅ ${ri.name} - ${ri.quantity} ${ri.unit}`);
      } catch (e) {
        summary.recipeIngredient.errors++;
        console.error(`   ❌ Error:`, e.message);
      }
    }

    // 7. LAUNCH NOTIFICATIONS
    console.log('\n📧 Migrating Launch Notifications...');
    const notifications = await prismaOld.launchNotification.findMany();
    console.log(`   Found ${notifications.length} notifications`);
    for (const notif of notifications) {
      try {
        const existing = await prismaNew.launchNotification.findUnique({ where: { id: notif.id } });
        if (existing) { summary.launchNotification.skipped++; continue; }
        
        await prismaNew.launchNotification.create({
          data: {
            id: notif.id,
            name: notif.name,
            email: notif.email,
            interests: notif.interests,
            createdAt: notif.createdAt,
            updatedAt: notif.updatedAt,
          }
        });
        summary.launchNotification.imported++;
        console.log(`   ✅ ${notif.name} - ${notif.email}`);
      } catch (e) {
        summary.launchNotification.errors++;
        console.error(`   ❌ Error:`, e.message);
      }
    }

    await prismaOld.$disconnect();
    await prismaNew.$disconnect();

    // Print summary
    console.log('\n' + '='.repeat(80));
    console.log('📊 FINAL MIGRATION SUMMARY');
    console.log('='.repeat(80));
    
    Object.keys(summary).forEach(key => {
      const s = summary[key];
      console.log(`\n✅ ${key}:`);
      console.log(`   Imported: ${s.imported}`);
      console.log(`   Skipped: ${s.skipped}`);
      console.log(`   Errors: ${s.errors}`);
    });
    
    const totalImported = Object.values(summary).reduce((sum, s) => sum + s.imported, 0);
    const totalErrors = Object.values(summary).reduce((sum, s) => sum + s.errors, 0);
    
    console.log('\n' + '='.repeat(80));
    console.log(`🎉 TOTAL IMPORTED: ${totalImported} records`);
    if (totalErrors > 0) {
      console.log(`⚠️  TOTAL ERRORS: ${totalErrors}`);
    }
    console.log('='.repeat(80));
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    await prismaOld.$disconnect();
    await prismaNew.$disconnect();
    throw error;
  }
}

migrateFinalMissingData().catch(console.error);



