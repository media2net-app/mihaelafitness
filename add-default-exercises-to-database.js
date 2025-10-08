const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addDefaultExercisesToDatabase() {
  try {
    console.log('🚀 Starting to add default exercises to database...');

    // Get the "3x per week - Complete Body" workout
    const workout = await prisma.workout.findFirst({
      where: {
        name: '3x per week - Complete Body'
      }
    });

    if (!workout) {
      console.error('❌ Workout not found');
      return;
    }

    console.log(`✅ Found workout: ${workout.name} (ID: ${workout.id})`);

    // Get all available exercises from database
    const allExercises = await prisma.exercise.findMany({
      where: { isActive: true }
    });

    console.log(`📋 Found ${allExercises.length} exercises in database`);

    // Define the exact default exercises for each day
    const defaultExercises = {
      1: [ // Day 1: Legs & Glutes - 60 min
        // Warm-up
        { name: "Jumping Jacks", sets: 2, reps: "30 sec", weight: "bodyweight", restTime: "20-30 sec" },
        { name: "High Knees", sets: 2, reps: "30 sec", weight: "bodyweight", restTime: "20-30 sec" },
        { name: "Squats", sets: 2, reps: "15", weight: "bodyweight", restTime: "20-30 sec" },
        { name: "Walking Lunges", sets: 2, reps: "12 each leg", weight: "bodyweight", restTime: "20-30 sec" },
        // Glute activation
        { name: "Glute Bridges", sets: 2, reps: "12", weight: "bodyweight", restTime: "30 sec" },
        { name: "Clam Shells", sets: 2, reps: "12 each side", weight: "bodyweight", restTime: "30 sec" },
        { name: "Monster Walks", sets: 2, reps: "10 each side", weight: "resistance band", restTime: "30 sec" },
        // Main workout
        { name: "Hip Thrusts", sets: 4, reps: "12", weight: "barbell", restTime: "60-90 sec" },
        { name: "Squats", sets: 4, reps: "12", weight: "barbell", restTime: "60-90 sec" },
        { name: "Romanian Deadlifts", sets: 4, reps: "12", weight: "barbell", restTime: "60-90 sec" },
        { name: "Bulgarian Split Squats", sets: 4, reps: "10 each leg", weight: "dumbbells", restTime: "60-90 sec" },
        { name: "Glute Kickbacks", sets: 4, reps: "12 each leg", weight: "cable", restTime: "60-90 sec" },
        { name: "Abductor Machine", sets: 4, reps: "15", weight: "machine", restTime: "60-90 sec" },
        // Finisher
        { name: "Squats", sets: 3, reps: "15", weight: "bodyweight", restTime: "30 sec" },
        { name: "Hip Thrusts", sets: 3, reps: "15", weight: "bodyweight", restTime: "30 sec" },
        { name: "Plank", sets: 3, reps: "30 sec", weight: "bodyweight", restTime: "30 sec" },
        // Cardio
        { name: "Jump Rope", sets: 2, reps: "30 sec on/15 sec rest", weight: "jump rope", restTime: "30 sec" }
      ],
      2: [ // Day 2: Back + Triceps + Abs - 60 min
        // Warm-up
        { name: "Jumping Jacks", sets: 2, reps: "30 sec", weight: "bodyweight", restTime: "20-30 sec" },
        { name: "Arm Circles", sets: 2, reps: "15 each direction", weight: "bodyweight", restTime: "20-30 sec" },
        { name: "Push-ups", sets: 2, reps: "10", weight: "bodyweight", restTime: "20-30 sec" },
        { name: "Inchworm Walkouts", sets: 2, reps: "8", weight: "bodyweight", restTime: "20-30 sec" },
        // Muscle activation
        { name: "Scapula Retractions", sets: 2, reps: "12", weight: "bodyweight", restTime: "30 sec" },
        { name: "Resistance Band Face Pulls", sets: 2, reps: "12", weight: "resistance band", restTime: "30 sec" },
        { name: "Triceps Pushdowns", sets: 2, reps: "12", weight: "cable", restTime: "30 sec" },
        // Main workout
        { name: "Lat Pulldown", sets: 4, reps: "12", weight: "cable", restTime: "60-90 sec" },
        { name: "Seated Row", sets: 4, reps: "12", weight: "cable", restTime: "60-90 sec" },
        { name: "Single-Arm Row", sets: 4, reps: "10 each arm", weight: "dumbbell", restTime: "60-90 sec" },
        { name: "Triceps Pushdowns", sets: 4, reps: "12", weight: "cable", restTime: "60-90 sec" },
        { name: "Overhead Triceps Extension", sets: 4, reps: "12", weight: "dumbbell", restTime: "60-90 sec" },
        { name: "Tricep Dips", sets: 4, reps: "10", weight: "bodyweight", restTime: "60-90 sec" },
        // Abs
        { name: "Bicycle Crunches", sets: 3, reps: "20 each side", weight: "bodyweight", restTime: "30 sec" },
        { name: "Leg Raises", sets: 3, reps: "15", weight: "bodyweight", restTime: "30 sec" },
        { name: "Russian Twists", sets: 3, reps: "20 each side", weight: "bodyweight", restTime: "30 sec" },
        { name: "Plank", sets: 3, reps: "30 sec", weight: "bodyweight", restTime: "30 sec" }
      ],
      3: [ // Day 3: Chest + Shoulders + Biceps + Abs - 60 min
        // Warm-up
        { name: "Arm Swings", sets: 2, reps: "15 each direction", weight: "bodyweight", restTime: "20-30 sec" },
        { name: "Shoulder Rolls", sets: 2, reps: "15 each direction", weight: "bodyweight", restTime: "20-30 sec" },
        { name: "Dynamic Chest Opener", sets: 2, reps: "10", weight: "bodyweight", restTime: "20-30 sec" },
        { name: "Light Jogging", sets: 2, reps: "30 sec", weight: "bodyweight", restTime: "20-30 sec" },
        // Muscle activation
        { name: "Band Pull-aparts", sets: 2, reps: "12", weight: "resistance band", restTime: "30 sec" },
        { name: "Front Raises", sets: 2, reps: "12", weight: "light dumbbells", restTime: "30 sec" },
        { name: "Biceps Curls", sets: 2, reps: "12", weight: "light dumbbells", restTime: "30 sec" },
        // Main workout
        { name: "Chest Press Machine", sets: 4, reps: "12", weight: "machine", restTime: "60-90 sec" },
        { name: "Pec Deck", sets: 4, reps: "12", weight: "machine", restTime: "60-90 sec" },
        { name: "Shoulder Press", sets: 4, reps: "12", weight: "dumbbells", restTime: "60-90 sec" },
        { name: "Lateral Raises", sets: 4, reps: "12", weight: "dumbbells", restTime: "60-90 sec" },
        { name: "Arnold Press", sets: 4, reps: "12", weight: "dumbbells", restTime: "60-90 sec" },
        { name: "Biceps Curls", sets: 4, reps: "12", weight: "dumbbells", restTime: "60-90 sec" },
        { name: "Hammer Curls", sets: 4, reps: "12", weight: "dumbbells", restTime: "60-90 sec" },
        // Abs
        { name: "Crunches", sets: 3, reps: "20", weight: "bodyweight", restTime: "30 sec" },
        { name: "Heel Touches", sets: 3, reps: "20 each side", weight: "bodyweight", restTime: "30 sec" },
        { name: "Reverse Crunches", sets: 3, reps: "15", weight: "bodyweight", restTime: "30 sec" },
        { name: "Plank", sets: 3, reps: "30 sec", weight: "bodyweight", restTime: "30 sec" },
        { name: "Mountain Climbers", sets: 3, reps: "20 each leg", weight: "bodyweight", restTime: "30 sec" }
      ]
    };

    // Clear existing workout exercises for this workout
    await prisma.workoutExercise.deleteMany({
      where: { workoutId: workout.id }
    });

    console.log('🧹 Cleared existing workout exercises');

    // Add exercises for each day
    for (const [day, exercises] of Object.entries(defaultExercises)) {
      console.log(`\n📅 Adding exercises for Day ${day}...`);
      
      for (let i = 0; i < exercises.length; i++) {
        const exerciseData = exercises[i];
        
        // Find the exercise in the database
        const dbExercise = allExercises.find(ex => 
          ex.name.toLowerCase().includes(exerciseData.name.toLowerCase()) ||
          exerciseData.name.toLowerCase().includes(ex.name.toLowerCase())
        );

        if (dbExercise) {
          await prisma.workoutExercise.create({
            data: {
              workoutId: workout.id,
              exerciseId: dbExercise.id,
              day: parseInt(day),
              order: i + 1,
              sets: exerciseData.sets,
              reps: exerciseData.reps,
              weight: exerciseData.weight,
              restTime: exerciseData.restTime,
              notes: `Default exercise for Day ${day}`
            }
          });
          console.log(`  ✅ Added: ${exerciseData.name} (${exerciseData.sets} sets, ${exerciseData.reps} reps)`);
        } else {
          console.log(`  ❌ Exercise not found in database: ${exerciseData.name}`);
        }
      }
    }

    // Update workout exercise count
    const totalExercises = Object.values(defaultExercises).flat().length;
    await prisma.workout.update({
      where: { id: workout.id },
      data: { exercises: totalExercises }
    });

    console.log(`\n🎉 Successfully added ${totalExercises} exercises to database!`);
    console.log(`📊 Updated workout exercise count to ${totalExercises}`);

  } catch (error) {
    console.error('❌ Error adding exercises to database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addDefaultExercisesToDatabase();






