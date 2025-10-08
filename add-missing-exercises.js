// Using built-in fetch (Node.js 18+)

const BASE_URL = 'http://localhost:3000';

async function addMissingExercises() {
  try {
    console.log('🚀 Adding missing exercises to database...');

    // Missing exercises that need to be added
    const missingExercises = [
      {
        name: "Leg swings",
        description: "Dynamic leg mobility exercise",
        muscleGroup: "Legs",
        equipment: "Bodyweight",
        difficulty: "Beginner",
        category: "Warm-up",
        instructions: "Stand next to wall, swing leg forward and backward in controlled motion",
        tips: "Keep core engaged, don't force the range of motion"
      },
      {
        name: "Banded lateral walks",
        description: "Lateral glute activation exercise",
        muscleGroup: "Glutes",
        equipment: "Resistance Band",
        difficulty: "Beginner",
        category: "Activation",
        instructions: "Place band around legs above knees, take lateral steps while maintaining tension",
        tips: "Keep tension on band, don't let knees cave in"
      },
      {
        name: "Clamshells with band",
        description: "Hip and glute activation with resistance band",
        muscleGroup: "Glutes",
        equipment: "Resistance Band",
        difficulty: "Beginner",
        category: "Activation",
        instructions: "Lie on side with band around knees, lift top knee up against resistance",
        tips: "Don't let hips roll back, focus on glute activation"
      },
      {
        name: "Standing calf raises",
        description: "Calf muscle strengthening exercise",
        muscleGroup: "Calves",
        equipment: "Bodyweight",
        difficulty: "Beginner",
        category: "Strength",
        instructions: "Stand on edge of step, raise up on toes, lower down below step level",
        tips: "Control the movement, feel stretch in calves"
      },
      {
        name: "Shoulder shrugs",
        description: "Upper trap and shoulder mobility exercise",
        muscleGroup: "Shoulders",
        equipment: "Bodyweight",
        difficulty: "Beginner",
        category: "Warm-up",
        instructions: "Lift shoulders up towards ears, roll them back and down",
        tips: "Move slowly and controlled, don't force range of motion"
      },
      {
        name: "Light dumbbell rows",
        description: "Light back activation exercise",
        muscleGroup: "Back",
        equipment: "Dumbbell",
        difficulty: "Beginner",
        category: "Warm-up",
        instructions: "Hold light dumbbells, row to sides focusing on shoulder blade movement",
        tips: "Keep movements controlled, focus on activation"
      },
      {
        name: "Dumbbell bicep curl",
        description: "Biceps isolation exercise with dumbbells",
        muscleGroup: "Biceps",
        equipment: "Dumbbell",
        difficulty: "Beginner",
        category: "Strength",
        instructions: "Hold dumbbells, curl up to shoulders, control descent",
        tips: "Keep elbows at sides, don't swing the weight"
      },
      {
        name: "Cable tricep pushdown",
        description: "Triceps isolation exercise with cable",
        muscleGroup: "Triceps",
        equipment: "Cable",
        difficulty: "Beginner",
        category: "Strength",
        instructions: "Stand at cable machine, push bar down extending arms, control return",
        tips: "Keep elbows at sides, don't swing the weight"
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

    console.log('\n🎉 Finished adding missing exercises!');

  } catch (error) {
    console.error('❌ Error adding missing exercises:', error);
  }
}

addMissingExercises();






