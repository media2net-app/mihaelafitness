import { prisma } from '@/lib/prisma';

async function main() {
  const workoutId = process.argv[2];
  if (!workoutId) {
    console.error('Usage: npx tsx scripts/check-workout-videos.ts <workoutId>');
    process.exit(1);
  }

  const workout = await prisma.workout.findUnique({
    where: { id: workoutId },
    include: {
      workoutExercises: {
        include: { exercise: true },
        orderBy: [{ day: 'asc' }, { order: 'asc' }],
      },
    },
  });

  if (!workout) {
    console.error('Workout not found:', workoutId);
    process.exit(1);
  }

  console.log(`Workout: ${workout.name} (${workout.id})`);
  console.log('---');

  for (const we of workout.workoutExercises) {
    const ex = we.exercise;
    console.log(
      `Day ${we.day} #${we.order}: ${ex.name} | hasOwnVideo=${ex.hasOwnVideo} | videoUrl=${ex.videoUrl ?? ''}`
    );
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
