// Using built-in fetch (Node.js 18+)

const BASE_URL = 'http://localhost:3000';

async function addMissing5DayExercises() {
  try {
    console.log('🚀 Adding missing 5-Day Workout Plan exercises to database...');

    // Missing exercises that need to be added
    const missingExercises = [
      {
        name: "Hip circles",
        description: "Hip mobility warm-up exercise",
        muscleGroup: "Hips",
        equipment: "Bodyweight",
        difficulty: "Beginner",
        category: "Warm-up",
        instructions: "Stand on one leg, make circles with the other leg, switch sides",
        tips: "Keep movements controlled, don't force range of motion"
      },
      {
        name: "Side lunges",
        description: "Lateral lunge movement",
        muscleGroup: "Legs",
        equipment: "Bodyweight",
        difficulty: "Beginner",
        category: "Warm-up",
        instructions: "Step to the side, lower into lunge position, return to center",
        tips: "Keep chest up, don't let knee cave in"
      },
      {
        name: "Donkey kicks",
        description: "Glute activation exercise",
        muscleGroup: "Glutes",
        equipment: "Bodyweight",
        difficulty: "Beginner",
        category: "Activation",
        instructions: "Start on hands and knees, kick one leg back and up, return",
        tips: "Keep core engaged, don't arch back"
      },
      {
        name: "Banded side steps",
        description: "Lateral glute activation with band",
        muscleGroup: "Glutes",
        equipment: "Resistance Band",
        difficulty: "Beginner",
        category: "Activation",
        instructions: "Place band around legs, take lateral steps while maintaining tension",
        tips: "Keep tension on band, don't let knees cave in"
      },
      {
        name: "Dumbbell lunges",
        description: "Lunge exercise with dumbbells",
        muscleGroup: "Legs",
        equipment: "Dumbbell",
        difficulty: "Intermediate",
        category: "Strength",
        instructions: "Hold dumbbells, step forward into lunge, return to start",
        tips: "Keep torso upright, don't let front knee go past toes"
      },
      {
        name: "Step-ups with dumbbells",
        description: "Step-up exercise with dumbbells",
        muscleGroup: "Legs",
        equipment: "Dumbbell",
        difficulty: "Intermediate",
        category: "Strength",
        instructions: "Hold dumbbells, step up onto platform, step down",
        tips: "Control the movement, don't use momentum"
      },
      {
        name: "Shoulder rotations",
        description: "Shoulder mobility exercise",
        muscleGroup: "Shoulders",
        equipment: "Bodyweight",
        difficulty: "Beginner",
        category: "Warm-up",
        instructions: "Rotate shoulders forward and backward in circular motion",
        tips: "Move slowly and controlled"
      },
      {
        name: "Scapular retractions",
        description: "Shoulder blade activation exercise",
        muscleGroup: "Back",
        equipment: "Bodyweight",
        difficulty: "Beginner",
        category: "Warm-up",
        instructions: "Squeeze shoulder blades together and back",
        tips: "Focus on bringing shoulder blades together"
      },
      {
        name: "Torso twists",
        description: "Spinal rotation warm-up",
        muscleGroup: "Core",
        equipment: "Bodyweight",
        difficulty: "Beginner",
        category: "Warm-up",
        instructions: "Stand with feet hip-width apart, rotate torso side to side",
        tips: "Keep hips facing forward, rotate from the spine"
      },
      {
        name: "Light lat pull-down",
        description: "Light back activation exercise",
        muscleGroup: "Back",
        equipment: "Cable",
        difficulty: "Beginner",
        category: "Activation",
        instructions: "Light weight lat pulldown focusing on activation",
        tips: "Keep movements controlled, focus on activation"
      },
      {
        name: "Triceps kickbacks",
        description: "Triceps isolation exercise",
        muscleGroup: "Triceps",
        equipment: "Dumbbell",
        difficulty: "Beginner",
        category: "Activation",
        instructions: "Bend over, extend arms back, squeeze triceps",
        tips: "Keep elbows at sides, don't swing the weight"
      },
      {
        name: "Triceps rope pushdown",
        description: "Triceps isolation with rope attachment",
        muscleGroup: "Triceps",
        equipment: "Cable",
        difficulty: "Beginner",
        category: "Strength",
        instructions: "Stand at cable machine with rope, push down extending arms",
        tips: "Keep elbows at sides, don't swing the weight"
      },
      {
        name: "Clamshell with band",
        description: "Hip and glute activation with resistance band",
        muscleGroup: "Glutes",
        equipment: "Resistance Band",
        difficulty: "Beginner",
        category: "Activation",
        instructions: "Lie on side with band around knees, lift top knee up",
        tips: "Don't let hips roll back, focus on glute activation"
      },
      {
        name: "Hip abduction with band",
        description: "Hip abductor activation with band",
        muscleGroup: "Hip Abductors",
        equipment: "Resistance Band",
        difficulty: "Beginner",
        category: "Activation",
        instructions: "Place band around legs, abduct legs against resistance",
        tips: "Keep tension on band, control the movement"
      },
      {
        name: "Single-leg glute bridge",
        description: "Unilateral glute bridge exercise",
        muscleGroup: "Glutes",
        equipment: "Bodyweight",
        difficulty: "Intermediate",
        category: "Activation",
        instructions: "Lie on back, lift one leg, bridge up with other leg",
        tips: "Keep core engaged, don't let hips drop"
      },
      {
        name: "Chest openers",
        description: "Chest and shoulder mobility exercise",
        muscleGroup: "Chest",
        equipment: "Bodyweight",
        difficulty: "Beginner",
        category: "Warm-up",
        instructions: "Extend arms to sides, bring them forward and back",
        tips: "Feel stretch across chest"
      },
      {
        name: "Light dumbbell curls",
        description: "Light bicep activation exercise",
        muscleGroup: "Biceps",
        equipment: "Dumbbell",
        difficulty: "Beginner",
        category: "Activation",
        instructions: "Hold light dumbbells, curl up to shoulders",
        tips: "Keep movements controlled, focus on activation"
      },
      {
        name: "Weighted crunch",
        description: "Abdominal exercise with weight",
        muscleGroup: "Abs",
        equipment: "Dumbbell",
        difficulty: "Intermediate",
        category: "Strength",
        instructions: "Hold weight to chest, perform crunches",
        tips: "Keep lower back pressed to ground"
      },
      {
        name: "Ankle mobility",
        description: "Ankle range of motion exercise",
        muscleGroup: "Ankles",
        equipment: "Bodyweight",
        difficulty: "Beginner",
        category: "Warm-up",
        instructions: "Move ankle in circles and up/down motions",
        tips: "Move slowly, don't force range of motion"
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

    console.log('\n🎉 Finished adding missing 5-Day Workout Plan exercises!');

  } catch (error) {
    console.error('❌ Error adding missing exercises:', error);
  }
}

addMissing5DayExercises();






