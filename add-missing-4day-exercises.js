// Using built-in fetch (Node.js 18+)

const BASE_URL = 'http://localhost:3000';

async function addMissing4DayExercises() {
  try {
    console.log('🚀 Adding missing 4-Day Workout Plan exercises to database...');

    // Missing exercises that need to be added
    const missingExercises = [
      {
        name: "Overhead dumbbell tricep extension",
        description: "Triceps isolation exercise with dumbbell overhead",
        muscleGroup: "Triceps",
        equipment: "Dumbbell",
        difficulty: "Intermediate",
        category: "Strength",
        instructions: "Hold dumbbell overhead with both hands, lower behind head, extend back up",
        tips: "Keep elbows pointing forward, don't flare them out"
      },
      {
        name: "Hanging knee raises",
        description: "Lower ab exercise hanging from bar",
        muscleGroup: "Abs",
        equipment: "Pull-up Bar",
        difficulty: "Intermediate",
        category: "Strength",
        instructions: "Hang from bar, bring knees up to chest, lower with control",
        tips: "Keep core engaged, don't swing the legs"
      },
      {
        name: "Glute bridge march",
        description: "Dynamic glute bridge with alternating leg lifts",
        muscleGroup: "Glutes",
        equipment: "Bodyweight",
        difficulty: "Intermediate",
        category: "Strength",
        instructions: "Start in glute bridge position, lift one leg up, lower and alternate",
        tips: "Keep hips up throughout, don't let them drop"
      },
      {
        name: "Light dumbbell chest press",
        description: "Light chest activation exercise",
        muscleGroup: "Chest",
        equipment: "Dumbbell",
        difficulty: "Beginner",
        category: "Warm-up",
        instructions: "Hold light dumbbells, press up and out, control descent",
        tips: "Keep movements controlled, focus on activation"
      },
      {
        name: "Dumbbell chest press",
        description: "Chest strengthening exercise with dumbbells",
        muscleGroup: "Chest",
        equipment: "Dumbbell",
        difficulty: "Intermediate",
        category: "Strength",
        instructions: "Lie on bench, press dumbbells up from chest, control descent",
        tips: "Keep shoulder blades back, don't let shoulders roll forward"
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

    console.log('\n🎉 Finished adding missing 4-Day Workout Plan exercises!');

  } catch (error) {
    console.error('❌ Error adding missing exercises:', error);
  }
}

addMissing4DayExercises();






