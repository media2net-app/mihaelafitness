import * as fs from 'fs';

async function findAndreeaPlanInBackup() {
  try {
    const backupPath = '/Users/gebruiker/Downloads/db_cluster-10-11-2025@23-30-29.backup';
    
    console.log('🔍 Zoeken naar Andreea Radulescu in backup van 10 november...\n');

    const content = fs.readFileSync(backupPath, 'utf-8');

    // Search for all customer IDs that might be Andreea Radulescu
    // Pattern: cmgziq5zr000ijp04wig5wn...
    console.log('🔍 Zoeken naar alle customer IDs die lijken op Andreea Radulescu...\n');
    const customerIdPattern = /cmgziq5zr000ijp04wig5wn[a-z0-9]+/gi;
    const customerIds = [...new Set(content.match(customerIdPattern) || [])];
    
    console.log(`✅ Gevonden ${customerIds.length} mogelijke customer ID(s):`);
    customerIds.forEach(id => console.log(`   - ${id}`));

    // For each customer ID, find their assignments
    for (const customerId of customerIds) {
      console.log(`\n\n📋 Zoeken naar assignments voor customer ID: ${customerId}...\n`);
      
      // Find COPY statement for customer_nutrition_plans
      const assignmentPattern = new RegExp(
        `(${customerId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]{0,200})`,
        'gi'
      );
      
      const assignmentMatches = content.match(assignmentPattern);
      if (assignmentMatches) {
        console.log(`✅ Gevonden ${assignmentMatches.length} assignment(s):\n`);
        assignmentMatches.slice(0, 10).forEach((match, index) => {
          console.log(`   ${index + 1}. ${match.substring(0, 200)}`);
        });
      }

      // Extract plan IDs from assignments
      const planIdPattern = new RegExp(
        `${customerId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s+([a-z0-9]{25})`,
        'gi'
      );
      
      const planIdMatches = [...content.matchAll(planIdPattern)];
      const planIds = [...new Set(planIdMatches.map(m => m[1]))];
      
      if (planIds.length > 0) {
        console.log(`\n📋 Gevonden plan ID(s) voor deze customer:`);
        planIds.forEach(planId => {
          console.log(`   - ${planId}`);
          
          // Now search for this plan in the nutrition_plans table
          console.log(`\n   🔍 Zoeken naar plan ${planId} in nutrition_plans...`);
          
          // Search for COPY statement for nutrition_plans with this ID
          const planPattern = new RegExp(
            `(${planId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]{0,10000})`,
            'gi'
          );
          
          const planMatches = content.match(planPattern);
          if (planMatches) {
            planMatches.forEach((match, idx) => {
              // Check if this is in the nutrition_plans COPY section
              if (match.includes('nutrition_plans') || idx === 0) {
                console.log(`\n   ✅ PLAN GEVONDEN!`);
                console.log(`\n   📄 Plan data (eerste 3000 karakters):`);
                console.log(match.substring(0, 3000));
                
                // Try to extract weekMenu
                const weekMenuMatch = match.match(/weekMenu[^\\t\\n]*?([\\t\\s]+)([^\\t\\n]+)/);
                if (weekMenuMatch) {
                  console.log(`\n   📋 WEEKMENU DATA:`);
                  console.log(weekMenuMatch[2].substring(0, 2000));
                }
                
                // Look for JSON in the match
                const jsonMatch = match.match(/({[^{}]{100,50000}})/);
                if (jsonMatch) {
                  console.log(`\n   📋 JSON DATA GEVONDEN:`);
                  console.log(jsonMatch[1].substring(0, 5000));
                }
              }
            });
          }
        });
      }
    }

    // Also search for "Radulescu" in user names
    console.log(`\n\n🔍 Zoeken naar "Radulescu" in user data...\n`);
    const radulescuPattern = /Radulescu[\\s\\S]{0,500}/gi;
    const radulescuMatches = content.match(radulescuPattern);
    
    if (radulescuMatches && radulescuMatches.length > 0) {
      console.log(`✅ Gevonden ${radulescuMatches.length} match(es) met "Radulescu":\n`);
      radulescuMatches.slice(0, 10).forEach((match, index) => {
        console.log(`   ${index + 1}. ${match.substring(0, 300)}`);
      });
    }

    // Search for nutrition_plans COPY statement and find plans around the date
    console.log(`\n\n🔍 Zoeken naar nutrition_plans COPY statement...\n`);
    const nutritionPlansCopyPattern = /COPY[\\s\\S]{0,200}nutrition_plans[\\s\\S]{0,500000}/gi;
    const nutritionPlansMatches = content.match(nutritionPlansCopyPattern);
    
    if (nutritionPlansMatches && nutritionPlansMatches.length > 0) {
      console.log(`✅ Nutrition plans COPY statement gevonden!\n`);
      console.log(`   Lengte: ${nutritionPlansMatches[0].length} karakters\n`);
      
      // Search for plans created around November
      const novemberPlanPattern = /2025-11-[\\s\\S]{0,2000}/gi;
      const novemberMatches = nutritionPlansMatches[0].match(novemberPlanPattern);
      
      if (novemberMatches) {
        console.log(`✅ Gevonden ${novemberMatches.length} plan(nen) met november datum:\n`);
        novemberMatches.slice(0, 20).forEach((match, index) => {
          console.log(`   ${index + 1}. ${match.substring(0, 500)}`);
        });
      }
    }

  } catch (error) {
    console.error('❌ Fout:', error);
  }
}

findAndreeaPlanInBackup();






