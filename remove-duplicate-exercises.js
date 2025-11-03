const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function removeDuplicateExercises() {
  try {
    console.log('Searching for duplicate exercises...\n');

    // Get all exercises
    const allExercises = await prisma.exercise.findMany({
      orderBy: [
        { createdAt: 'asc' },
        { id: 'asc' }
      ]
    });

    console.log(`Total exercises: ${allExercises.length}\n`);

    // Group by name (case-insensitive)
    const exerciseMap = new Map();
    const duplicates = [];

    for (const exercise of allExercises) {
      const normalizedName = exercise.name.trim().toLowerCase();
      
      if (!exerciseMap.has(normalizedName)) {
        exerciseMap.set(normalizedName, [exercise]);
      } else {
        exerciseMap.get(normalizedName).push(exercise);
      }
    }

    // Find duplicates
    for (const [name, exercises] of exerciseMap.entries()) {
      if (exercises.length > 1) {
        duplicates.push({
          name: exercises[0].name,
          count: exercises.length,
          exercises: exercises
        });
      }
    }

    if (duplicates.length === 0) {
      console.log('No duplicate exercises found!');
      return;
    }

    console.log(`Found ${duplicates.length} groups of duplicate exercises:\n`);

    let totalToDelete = 0;
    let totalDeleted = 0;

    for (const group of duplicates) {
      console.log(`\n"${group.name}" - ${group.count} duplicates:`);
      
      // Sort by creation date (keep the oldest) and by ID
      group.exercises.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        if (dateA !== dateB) return dateA - dateB;
        return a.id.localeCompare(b.id);
      });

      // Keep the first one, delete the rest
      const toKeep = group.exercises[0];
      const toDelete = group.exercises.slice(1);

      console.log(`  ✓ Keeping: ${toKeep.id} (created: ${toKeep.createdAt || 'N/A'}, has video: ${toKeep.videoUrl ? 'Yes' : 'No'})`);
      
      for (const exercise of toDelete) {
        console.log(`  ✗ Deleting: ${exercise.id} (created: ${exercise.createdAt || 'N/A'}, has video: ${exercise.videoUrl ? 'Yes' : 'No'})`);
        totalToDelete++;
      }

      // Check if any of the exercises to delete have a video but the one to keep doesn't
      const hasVideoToKeep = !!toKeep.videoUrl;
      const hasVideoToDelete = toDelete.some(ex => !!ex.videoUrl);

      if (!hasVideoToKeep && hasVideoToDelete) {
        // Find the first one with a video and transfer it
        const exerciseWithVideo = toDelete.find(ex => !!ex.videoUrl);
        if (exerciseWithVideo) {
          console.log(`  ⚠ Transferring video from ${exerciseWithVideo.id} to ${toKeep.id}`);
          await prisma.exercise.update({
            where: { id: toKeep.id },
            data: { videoUrl: exerciseWithVideo.videoUrl }
          });
        }
      }

      // Delete duplicates
      for (const exercise of toDelete) {
        try {
          // First check if exercise is used in workouts
          const workoutExercises = await prisma.workoutExercise.findMany({
            where: { exerciseId: exercise.id }
          });

          if (workoutExercises.length > 0) {
            console.log(`  ⚠ Exercise ${exercise.id} is used in ${workoutExercises.length} workout(s), updating to use ${toKeep.id}...`);
            
            // Update workout exercises to use the kept exercise
            for (const we of workoutExercises) {
              await prisma.workoutExercise.update({
                where: { id: we.id },
                data: { exerciseId: toKeep.id }
              });
            }
          }

          await prisma.exercise.delete({
            where: { id: exercise.id }
          });
          
          totalDeleted++;
          console.log(`  ✓ Deleted: ${exercise.id}`);
        } catch (error) {
          console.error(`  ✗ Error deleting ${exercise.id}:`, error.message);
        }
      }
    }

    console.log(`\n\n=== Summary ===`);
    console.log(`Total duplicate groups found: ${duplicates.length}`);
    console.log(`Total duplicates to delete: ${totalToDelete}`);
    console.log(`Successfully deleted: ${totalDeleted}`);
    
    // Final count
    const finalCount = await prisma.exercise.count();
    console.log(`\nFinal exercise count: ${finalCount}`);

  } catch (error) {
    console.error('Error removing duplicates:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
removeDuplicateExercises();






