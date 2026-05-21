/**
 * Adds the "Lazarescu Denisa" training plan to the database.
 * Run from project root: node scripts/add-lazarescu-denisa-plan.js
 * Or: npx tsx scripts/add-lazarescu-denisa-plan.js (if tsx preferred)
 */
require('dotenv').config();
require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const WORKOUT_NAME = 'Lazarescu Denisa';
const WORKOUT_DESCRIPTION = `🔥 3-day plan: Day 1 – Glutes + Posterior Chain | Day 2 – Upper Body (Back + Shoulders + Arms + Core) | Day 3 – Glutes + Legs. Beginner friendly. Tempo: 2 sec up / 2 sec down. Rest: 60–90 sec.`;

/** Find exercise by one or more possible names (case-insensitive, partial match) */
async function findExercise(possibleNames) {
  const names = Array.isArray(possibleNames) ? possibleNames : [possibleNames];
  const all = await prisma.exercise.findMany({ where: { isActive: true }, select: { id: true, name: true } });
  const lower = (s) => (s || '').toLowerCase().trim();
  for (const name of names) {
    const n = lower(name);
    const found = all.find((e) => lower(e.name) === n || lower(e.name).includes(n) || n.includes(lower(e.name)));
    if (found) return found;
  }
  return null;
}

const PLAN = [
  // DAY 1 – GLUTES + POSTERIOR CHAIN
  { day: 1, order: 1, name: ['Hip Thrust', 'Hip thrust', 'Hip Thrusts'], sets: 4, reps: '10-12', notes: 'Upper back on bench. Feet shoulder-width. Push through heels. Squeeze glutes 1 sec at top. Do not overarch lower back.' },
  { day: 1, order: 2, name: ['Romanian Deadlift', 'Romanian deadlift', 'RDL', 'Romanian Deadlifts'], sets: 3, reps: '10', notes: 'Back straight. Dumbbells close to legs. Push hips back. Movement from hips, not knees.' },
  { day: 1, order: 3, name: ['Bulgarian Split Squat', 'Bulgarian split squat', 'Bulgarian Split Squats'], sets: 3, reps: '10/leg', notes: 'One foot elevated behind. Front knee ~90°. Push through front heel. Knee not past toes.' },
  { day: 1, order: 4, name: ['Abductor', 'Hip abduction', 'Clamshell', 'abductor machine'], sets: 3, reps: '15', notes: 'Back against seat. Open knees controlled. Hold 1 sec at top.' },
  { day: 1, order: 5, name: ['Cable Kickback', 'Kickback', 'Cable Kickbacks'], sets: 3, reps: '12', notes: 'Light hold for balance. Kick leg back without arching. Squeeze glute at top.' },
  { day: 1, order: 6, name: ['Plank'], sets: 3, reps: '30-40 sec', notes: 'Elbows under shoulders. Straight line. Engage core and glutes. Do not let hips drop.' },
  // DAY 2 – UPPER BODY
  { day: 2, order: 1, name: ['Lat Pulldown', 'Lat pull-down', 'lat pulldown'], sets: 4, reps: '10', notes: 'Grip slightly wider than shoulders. Pull to upper chest. Chest lifted, shoulders down. Do not pull behind neck.' },
  { day: 2, order: 2, name: ['Seated Row', 'Seated Cable Row', 'cable row'], sets: 3, reps: '12', notes: 'Sit tall, back straight. Pull to lower ribs. Squeeze shoulder blades. No momentum.' },
  { day: 2, order: 3, name: ['Lateral Raises', 'Lateral raise'], sets: 3, reps: '15', notes: 'Light dumbbells. Raise to shoulder height. Slight bend in elbows. Do not swing.' },
  { day: 2, order: 4, name: ['Face Pull', 'Face pull', 'Resistance Band Face Pulls'], sets: 3, reps: '12', notes: 'Rope at face height. Pull toward face. Elbows back. Squeeze upper back.' },
  { day: 2, order: 5, name: ['Biceps Curl', 'Dumbbell Biceps Curl', 'Dumbbell bicep curl', 'Bicep curl'], sets: 3, reps: '12', notes: 'Elbows close to body. Curl to shoulders. No swing.' },
  { day: 2, order: 6, name: ['Triceps Pushdown', 'Cable tricep pushdown', 'Triceps Pushdowns'], sets: 3, reps: '12', notes: 'Elbows at sides. Push down until arms extended. Control on way back.' },
  { day: 2, order: 7, name: ['Cable Crunch', 'Weighted crunch', 'Crunch'], sets: 3, reps: '15', notes: 'Kneel facing machine. Rope at forehead. Curl down with abs. Contract core, not arms.' },
  { day: 2, order: 8, name: ['Mountain Climbers'], sets: 3, reps: '30 sec', notes: 'Plank position. Knees to chest alternately. Core tight, hips stable.' },
  // DAY 3 – GLUTES + LEGS
  { day: 3, order: 1, name: ['Squat', 'Squats'], sets: 4, reps: '8-10', notes: 'Feet slightly wider than shoulders. Knees slightly out. Drive through heels. Back straight.' },
  { day: 3, order: 2, name: ['Leg Press'], sets: 3, reps: '12', notes: 'Feet shoulder-width on platform. Lower to 90°. Push through heels. Do not lock knees.' },
  { day: 3, order: 3, name: ['Step-up', 'Step-ups', 'Step-ups with dumbbells'], sets: 3, reps: '10', notes: 'Full foot on bench. Step up controlled. Lower slowly. Do not push off back leg.' },
  { day: 3, order: 4, name: ['Hip Thrust', 'Hip thrust', 'Hip Thrusts'], sets: 3, reps: '12', notes: 'Pause 2 sec at top. Squeeze glutes hard. Control over weight.' },
  { day: 3, order: 5, name: ['Abductor', 'Hip abduction', 'Clamshell', 'abductor machine'], sets: 3, reps: '15', notes: 'Same as Day 1. Hold 1 sec at top.' },
  { day: 3, order: 6, name: ['Glute Bridge', 'Glute bridge march', 'Single-leg glute bridge', 'Glute Bridges'], sets: 2, reps: '20', notes: 'On floor. Lift hips, short pulses at top. Feel contraction in glutes.' },
];

async function main() {
  console.log('Adding plan:', WORKOUT_NAME, '...\n');

  const allExercises = await prisma.exercise.findMany({ where: { isActive: true }, select: { id: true, name: true } });
  console.log('Exercises in DB:', allExercises.length);

  const workout = await prisma.workout.create({
    data: {
      name: WORKOUT_NAME,
      category: 'strength',
      difficulty: 'Beginner',
      duration: 55,
      exercises: PLAN.length,
      trainingType: 'Glutes + Upper + Legs',
      description: WORKOUT_DESCRIPTION,
      status: 'active',
    },
  });
  console.log('Created workout:', workout.id, workout.name);

  let added = 0;
  let missed = [];

  for (const item of PLAN) {
    const exercise = await findExercise(item.name);
    if (!exercise) {
      missed.push({ day: item.day, order: item.order, search: item.name[0] });
      console.log('  ⚠ No match for:', item.name[0]);
      continue;
    }
    await prisma.workoutExercise.create({
      data: {
        workoutId: workout.id,
        exerciseId: exercise.id,
        day: item.day,
        order: item.order,
        sets: item.sets,
        reps: item.reps,
        restTime: '60-90 sec',
        notes: item.notes,
      },
    });
    added++;
    console.log(`  Day ${item.day} #${item.order}: ${exercise.name} – ${item.sets}x${item.reps}`);
  }

  await prisma.workout.update({
    where: { id: workout.id },
    data: { exercises: added },
  });

  console.log('\nSummary:');
  console.log('  Added', added, 'exercises to workout', workout.id);
  if (missed.length) console.log('  Missed (no matching exercise):', missed.length, missed);
  console.log('\nDone. Plan is available at /admin/v2/training-schedules');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
