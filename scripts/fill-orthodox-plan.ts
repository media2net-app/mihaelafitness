/**
 * Fill nutrition plan cmlidieu10000dymsrt7097h1 with meals from similar plans.
 * Orthodox fasting: Wed & Fri no meat, fish, eggs, dairy, olive oil, alcohol.
 * - Non-fasting days: copy from a plan with similar kcal.
 * - Wed/Fri: copy from same source Monday then log that user must replace
 *   non-fasting ingredients manually, OR leave empty for manual fill.
 */
import { PrismaClient } from '@prisma/client';

const TARGET_PLAN_ID = 'cmlidieu10000dymsrt7097h1';
const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
const FASTING_DAYS = ['wednesday', 'friday'];
const KCAL_MARGIN = 200;

const prisma = new PrismaClient();

function hasDayContent(weekMenu: any, day: string): boolean {
  const dayMenu = weekMenu?.[day];
  if (!dayMenu || typeof dayMenu !== 'object') return false;
  const str = typeof dayMenu === 'object' && 'ingredients' in dayMenu
    ? (dayMenu as any).ingredients
    : String(dayMenu);
  return typeof str === 'string' && str.trim().length > 0;
}

async function main() {
  const target = await prisma.nutritionPlan.findUnique({
    where: { id: TARGET_PLAN_ID },
  });
  if (!target) {
    console.error('Target plan not found:', TARGET_PLAN_ID);
    process.exit(1);
  }
  const targetKcal = target.calories;
  console.log('Target plan:', target.name, '|', targetKcal, 'kcal | P:', target.protein, 'C:', target.carbs, 'F:', target.fat);

  const similar = await prisma.nutritionPlan.findMany({
    where: {
      id: { not: TARGET_PLAN_ID },
      calories: { gte: targetKcal - KCAL_MARGIN, lte: targetKcal + KCAL_MARGIN },
    },
    select: { id: true, name: true, calories: true, protein: true, carbs: true, fat: true, weekMenu: true },
    orderBy: { lastUsed: 'desc' },
    take: 20,
  });

  const withMenu = similar.filter((p) => p.weekMenu && typeof p.weekMenu === 'object');
  const weekMenuTarget = ((target.weekMenu as any) || {}) as Record<string, any>;

  const eligible = withMenu.filter((p) => {
    const wm = p.weekMenu as any;
    return hasDayContent(wm, 'monday') && hasDayContent(wm, 'tuesday') && hasDayContent(wm, 'thursday');
  }).sort((a, b) => Math.abs((a.calories ?? 0) - targetKcal) - Math.abs((b.calories ?? 0) - targetKcal));
  const sourcePlan = eligible[0] ?? null;

  if (!sourcePlan) {
    console.error('No similar plan found with filled monday/tuesday/thursday. Fill at least one plan with similar kcal first.');
    process.exit(1);
  }

  const srcMenu = sourcePlan.weekMenu as Record<string, any>;
  console.log('Using source plan:', sourcePlan.name, '|', sourcePlan.calories, 'kcal');

  for (const day of DAYS) {
    let sourceDay = day;
    if (FASTING_DAYS.includes(day)) {
      sourceDay = 'monday';
      if (!hasDayContent(srcMenu, sourceDay)) continue;
      const srcDayData = srcMenu[sourceDay];
      weekMenuTarget[day] = typeof srcDayData === 'object' ? { ...srcDayData } : srcDayData;
      const instrKey = `${sourceDay}_instructions`;
      if (srcMenu[instrKey]) {
        weekMenuTarget[`${day}_instructions`] = srcMenu[instrKey];
      }
      console.log(`  [${day}] copied from ${sourceDay} (FASTING DAY – please remove meat, fish, eggs, dairy, olive oil, alcohol in the UI)`);
    } else {
      if (!hasDayContent(srcMenu, day)) continue;
      const srcDayData = srcMenu[day];
      weekMenuTarget[day] = typeof srcDayData === 'object' ? { ...srcDayData } : srcDayData;
      const instrKey = `${day}_instructions`;
      if (srcMenu[instrKey]) {
        weekMenuTarget[instrKey] = srcMenu[instrKey];
      }
      console.log(`  [${day}] copied from source`);
    }
  }

  await prisma.nutritionPlan.update({
    where: { id: TARGET_PLAN_ID },
    data: { weekMenu: weekMenuTarget, lastUsed: new Date() },
  });

  console.log('\nDone. Open the plan in the admin and check the macro bars.');
  console.log('Woensdag en vrijdag: pas handmatig aan (geen vlees, vis, ei, zuivel, olijfolie, alcohol).');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
