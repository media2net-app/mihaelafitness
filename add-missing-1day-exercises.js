// Using built-in fetch (Node.js 18+)

const BASE_URL = 'http://localhost:3000';

async function addMissing1DayExercises() {
  try {
    console.log('🚀 Adding missing 1-Day Workout Plan exercises to database...');

    // Missing exercises that need to be added
    const missingExercises = [
      {
        name: "Treadmill",
        description: "Cardio exercise on treadmill",
        muscleGroup: "Full Body",
        equipment: "Treadmill",
        difficulty: "Beginner",
        category: "Cardio",
        instructions: "Walk or run on treadmill at light pace",
        tips: "Maintain steady pace, focus on breathing"
      },
      {
        name: "Shoulder circles",
        description: "Shoulder mobility warm-up exercise",
        muscleGroup: "Shoulders",
        equipment: "Bodyweight",
        difficulty: "Beginner",
        category: "Warm-up",
        instructions: "Rotate shoulders forward and backward in circular motion",
        tips: "Move slowly and controlled"
      },
      {
        name: "Trunk rotations",
        description: "Spinal rotation warm-up exercise",
        muscleGroup: "Core",
        equipment: "Bodyweight",
        difficulty: "Beginner",
        category: "Warm-up",
        instructions: "Stand with feet hip-width apart, rotate torso side to side",
        tips: "Keep hips facing forward, rotate from the spine"
      },
      {
        name: "Bent-over row",
        description: "Back strengthening exercise",
        muscleGroup: "Back",
        equipment: "Dumbbell",
        difficulty: "Intermediate",
        category: "Strength",
        instructions: "Bend over, row dumbbells to sides, squeeze shoulder blades together",
        tips: "Keep core engaged, don't round back"
      },
      {
        name: "Triceps extensions",
        description: "Triceps isolation exercise",
        muscleGroup: "Triceps",
        equipment: "Dumbbell",
        difficulty: "Beginner",
        category: "Strength",
        instructions: "Hold dumbbell overhead, lower behind head, extend back up",
        tips: "Keep elbows pointing forward, don't flare them out"
      },
      {
        name: "Stretch legs",
        description: "Leg stretching exercise",
        muscleGroup: "Legs",
        equipment: "Bodyweight",
        difficulty: "Beginner",
        category: "Stretching",
        instructions: "Stretch hamstrings, quads, and calves",
        tips: "Hold each stretch for 30-60 seconds"
      },
      {
        name: "Stretch back",
        description: "Back stretching exercise",
        muscleGroup: "Back",
        equipment: "Bodyweight",
        difficulty: "Beginner",
        category: "Stretching",
        instructions: "Perform cat-cow or seated twist stretches",
        tips: "Move slowly and breathe deeply"
      },
      {
        name: "Stretch chest & shoulders",
        description: "Chest and shoulder stretching exercise",
        muscleGroup: "Chest",
        equipment: "Bodyweight",
        difficulty: "Beginner",
        category: "Stretching",
        instructions: "Perform chest opener and shoulder stretches",
        tips: "Feel stretch across chest and shoulders"
      }
    ];

    // Add each missing exercise to the database
    for (const exercise of missingExercises) {
      try {
        const response = await fetch(`${BASE_URL}/api/exercises`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(exercise)
        });

        if (response.ok) {
          const newExercise = await response.json();
          console.log(`✅ Added: ${exercise.name} (ID: ${newExercise.id})`);
        } else {
          console.log(`❌ Failed to add: ${exercise.name}`);
        }
      } catch (error) {
        console.log(`❌ Error adding ${exercise.name}:`, error.message);
      }
    }

    console.log('\n🎉 Finished adding missing 1-Day Workout Plan exercises!');

  } catch (error) {
    console.error('❌ Error adding missing exercises:', error);
  }
}

addMissing1DayExercises();






