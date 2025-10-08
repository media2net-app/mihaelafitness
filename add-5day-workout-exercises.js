// Using built-in fetch (Node.js 18+)

const BASE_URL = 'http://localhost:3000';

async function add5DayWorkoutExercises() {
  try {
    console.log('🚀 Starting to add 5-Day Workout Plan exercises to database...');

    // Get the "5-Days Workout Plan" workout
    const workoutsResponse = await fetch(`${BASE_URL}/api/workouts`);
    const workouts = await workoutsResponse.json();
    
    const workout = workouts.find(w => w.name === '5-Days Workout Plan');
    
    if (!workout) {
      console.error('❌ 5-Days Workout Plan not found');
      return;
    }

    console.log(`✅ Found workout: ${workout.name} (ID: ${workout.id})`);

    // Get all available exercises from database
    const exercisesResponse = await fetch(`${BASE_URL}/api/exercises`);
    const allExercises = await exercisesResponse.json();

    console.log(`📋 Found ${allExercises.length} exercises in database`);

    // Define the exact exercises from the description
    const workoutExercises = {
      1: [ // Monday - Legs & Glutes (60 min)
        // Warm-up (5 min)
        { name: "Hip circles", sets: 2, reps: "10 each direction", weight: "bodyweight", restTime: "30 sec" },
        { name: "Bodyweight squats", sets: 2, reps: "15", weight: "bodyweight", restTime: "30 sec" },
        { name: "Side lunges", sets: 2, reps: "10 each side", weight: "bodyweight", restTime: "30 sec" },
        // Activation (5 min)
        { name: "Glute bridges", sets: 2, reps: "12", weight: "bodyweight", restTime: "30 sec" },
        { name: "Donkey kicks", sets: 2, reps: "12 each leg", weight: "bodyweight", restTime: "30 sec" },
        { name: "Banded side steps", sets: 2, reps: "10 each side", weight: "resistance band", restTime: "30 sec" },
        // Main Workout (40-45 min)
        { name: "Hip thrust", sets: 4, reps: "12", weight: "barbell", restTime: "60-90 sec" },
        { name: "Dumbbell squat", sets: 4, reps: "12", weight: "dumbbells", restTime: "60-90 sec" },
        { name: "Dumbbell lunges", sets: 4, reps: "12 each leg", weight: "dumbbells", restTime: "60-90 sec" },
        { name: "Romanian deadlift", sets: 4, reps: "12", weight: "barbell", restTime: "60-90 sec" },
        { name: "Leg press", sets: 4, reps: "15", weight: "machine", restTime: "60-90 sec" },
        { name: "Step-ups with dumbbells", sets: 4, reps: "10 each leg", weight: "dumbbells", restTime: "60-90 sec" }
      ],
      2: [ // Tuesday - Back / Triceps / Abs (60 min)
        // Warm-up (5 min)
        { name: "Shoulder rotations", sets: 2, reps: "15 each direction", weight: "bodyweight", restTime: "30 sec" },
        { name: "Scapular retractions", sets: 2, reps: "12", weight: "bodyweight", restTime: "30 sec" },
        { name: "Torso twists", sets: 2, reps: "15 each side", weight: "bodyweight", restTime: "30 sec" },
        // Activation (5 min)
        { name: "Light lat pull-down", sets: 2, reps: "12", weight: "cable", restTime: "30 sec" },
        { name: "Triceps kickbacks", sets: 2, reps: "12", weight: "dumbbell", restTime: "30 sec" },
        // Main Workout (40-45 min)
        { name: "Lat pulldown", sets: 4, reps: "12", weight: "cable", restTime: "60-90 sec" },
        { name: "Dumbbell row", sets: 4, reps: "12", weight: "dumbbell", restTime: "60-90 sec" },
        { name: "Triceps rope pushdown", sets: 4, reps: "12", weight: "cable", restTime: "60-90 sec" },
        { name: "Overhead triceps extension", sets: 4, reps: "12", weight: "dumbbell", restTime: "60-90 sec" },
        { name: "Face pull", sets: 4, reps: "12", weight: "cable", restTime: "60-90 sec" },
        // Abs
        { name: "Plank", sets: 3, reps: "30 sec", weight: "bodyweight", restTime: "30 sec" },
        { name: "Bicycle crunch", sets: 3, reps: "20 each side", weight: "bodyweight", restTime: "30 sec" },
        { name: "Hanging knee raise", sets: 3, reps: "12", weight: "bodyweight", restTime: "30 sec" }
      ],
      3: [ // Wednesday - Glutes (60 min)
        // Warm-up (5 min)
        { name: "Glute bridges", sets: 2, reps: "12", weight: "bodyweight", restTime: "30 sec" },
        { name: "Donkey kicks", sets: 2, reps: "12 each leg", weight: "bodyweight", restTime: "30 sec" },
        { name: "Clamshell with band", sets: 2, reps: "12 each side", weight: "resistance band", restTime: "30 sec" },
        // Activation (5 min)
        { name: "Hip abduction with band", sets: 2, reps: "12 each side", weight: "resistance band", restTime: "30 sec" },
        { name: "Single-leg glute bridge", sets: 2, reps: "10 each leg", weight: "bodyweight", restTime: "30 sec" },
        // Main Workout (45-50 min)
        { name: "Barbell hip thrust", sets: 4, reps: "12", weight: "barbell", restTime: "60-90 sec" },
        { name: "Bulgarian split squat", sets: 4, reps: "10 each leg", weight: "bodyweight", restTime: "60-90 sec" },
        { name: "Cable kickbacks", sets: 4, reps: "12 each leg", weight: "cable", restTime: "60-90 sec" },
        { name: "Romanian deadlift", sets: 4, reps: "12", weight: "barbell", restTime: "60-90 sec" },
        { name: "Glute-focused leg press", sets: 4, reps: "15", weight: "machine", restTime: "60-90 sec" }
      ],
      4: [ // Thursday - Chest / Shoulders / Biceps / Abs (60 min)
        // Warm-up (5 min)
        { name: "Arm swings", sets: 2, reps: "15 each direction", weight: "bodyweight", restTime: "30 sec" },
        { name: "Shoulder rolls", sets: 2, reps: "15 each direction", weight: "bodyweight", restTime: "30 sec" },
        { name: "Chest openers", sets: 2, reps: "12", weight: "bodyweight", restTime: "30 sec" },
        // Activation (5 min)
        { name: "Light dumbbell shoulder press", sets: 2, reps: "12", weight: "light dumbbells", restTime: "30 sec" },
        { name: "Light dumbbell curls", sets: 2, reps: "12", weight: "light dumbbells", restTime: "30 sec" },
        // Main Workout (40-45 min)
        { name: "Chest press machine", sets: 4, reps: "12", weight: "machine", restTime: "60-90 sec" },
        { name: "Pec deck", sets: 4, reps: "12", weight: "machine", restTime: "60-90 sec" },
        { name: "Dumbbell shoulder press", sets: 4, reps: "12", weight: "dumbbells", restTime: "60-90 sec" },
        { name: "Lateral raises", sets: 4, reps: "12", weight: "dumbbells", restTime: "60-90 sec" },
        { name: "Dumbbell biceps curls", sets: 4, reps: "12", weight: "dumbbells", restTime: "60-90 sec" },
        { name: "Hammer curls", sets: 4, reps: "12", weight: "dumbbells", restTime: "60-90 sec" },
        // Abs
        { name: "Side plank", sets: 3, reps: "20 sec each side", weight: "bodyweight", restTime: "30 sec" },
        { name: "Weighted crunch", sets: 3, reps: "15", weight: "dumbbell", restTime: "30 sec" },
        { name: "Leg raises", sets: 3, reps: "15", weight: "bodyweight", restTime: "30 sec" }
      ],
      5: [ // Friday - Legs (60 min)
        // Warm-up (5 min)
        { name: "Bodyweight squats", sets: 2, reps: "15", weight: "bodyweight", restTime: "30 sec" },
        { name: "Side lunges", sets: 2, reps: "10 each side", weight: "bodyweight", restTime: "30 sec" },
        { name: "Ankle mobility", sets: 2, reps: "10 each ankle", weight: "bodyweight", restTime: "30 sec" },
        // Activation (5 min)
        { name: "Glute bridges", sets: 2, reps: "12", weight: "bodyweight", restTime: "30 sec" },
        { name: "Donkey kicks", sets: 2, reps: "12 each leg", weight: "bodyweight", restTime: "30 sec" },
        // Main Workout (45-50 min)
        { name: "Barbell squat", sets: 4, reps: "12", weight: "barbell", restTime: "60-90 sec" },
        { name: "Romanian deadlift", sets: 4, reps: "12", weight: "barbell", restTime: "60-90 sec" },
        { name: "Leg press", sets: 4, reps: "15", weight: "machine", restTime: "60-90 sec" },
        { name: "Walking lunges with dumbbells", sets: 4, reps: "12 each leg", weight: "dumbbells", restTime: "60-90 sec" },
        { name: "Calf raises", sets: 4, reps: "15", weight: "bodyweight", restTime: "60-90 sec" }
      ]
    };

    // Clear existing workout exercises for this workout
    const existingExercisesResponse = await fetch(`${BASE_URL}/api/workout-exercises?workoutId=${workout.id}`);
    const existingExercises = await existingExercisesResponse.json();
    
    for (const exercise of existingExercises) {
      await fetch(`${BASE_URL}/api/workout-exercises/${exercise.id}`, {
        method: 'DELETE'
      });
    }

    console.log('🧹 Cleared existing workout exercises');

    // Add exercises for each day
    for (const [day, exercises] of Object.entries(workoutExercises)) {
      console.log(`\n📅 Adding exercises for Day ${day}...`);
      
      for (let i = 0; i < exercises.length; i++) {
        const exerciseData = exercises[i];
        
        // Find the exercise in the database (exact name match)
        let dbExercise = allExercises.find(ex => 
          ex.name.toLowerCase() === exerciseData.name.toLowerCase()
        );

        // If not found, try partial match
        if (!dbExercise) {
          dbExercise = allExercises.find(ex => 
            ex.name.toLowerCase().includes(exerciseData.name.toLowerCase()) ||
            exerciseData.name.toLowerCase().includes(ex.name.toLowerCase())
          );
        }

        if (dbExercise) {
          const response = await fetch(`${BASE_URL}/api/workout-exercises`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              workoutId: workout.id,
              exerciseId: dbExercise.id,
              day: parseInt(day),
              order: i + 1,
              sets: exerciseData.sets,
              reps: exerciseData.reps,
              weight: exerciseData.weight,
              restTime: exerciseData.restTime,
              notes: `5-Day Workout Plan - Day ${day}`
            })
          });

          if (response.ok) {
            console.log(`  ✅ Added: ${exerciseData.name} (${exerciseData.sets} sets, ${exerciseData.reps} reps)`);
          } else {
            console.log(`  ❌ Failed to add: ${exerciseData.name}`);
          }
        } else {
          console.log(`  ❌ Exercise not found in database: ${exerciseData.name}`);
        }
      }
    }

    // Update workout exercise count
    const totalExercises = Object.values(workoutExercises).flat().length;
    const updateResponse = await fetch(`${BASE_URL}/api/workouts/${workout.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        exercises: totalExercises
      })
    });

    if (updateResponse.ok) {
      console.log(`\n🎉 Successfully added ${totalExercises} exercises to database!`);
      console.log(`📊 Updated workout exercise count to ${totalExercises}`);
    } else {
      console.log('⚠️ Failed to update workout exercise count');
    }

  } catch (error) {
    console.error('❌ Error adding exercises to database:', error);
  }
}

add5DayWorkoutExercises();






