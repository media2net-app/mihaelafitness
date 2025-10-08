// Using built-in fetch (Node.js 18+)

const BASE_URL = 'http://localhost:3000';

async function add1DayWorkoutExercises() {
  try {
    console.log('🚀 Starting to add 1-Day Workout Plan exercises to database...');

    // Get the "1-Days Workout Plan" workout
    const workoutsResponse = await fetch(`${BASE_URL}/api/workouts`);
    const workouts = await workoutsResponse.json();
    
    const workout = workouts.find(w => w.name === 'Full-Body Workout – 1 Day / Week');
    
    if (!workout) {
      console.error('❌ 1-Days Workout Plan not found');
      return;
    }

    console.log(`✅ Found workout: ${workout.name} (ID: ${workout.id})`);

    // Get all available exercises from database
    const exercisesResponse = await fetch(`${BASE_URL}/api/exercises`);
    const allExercises = await exercisesResponse.json();

    console.log(`📋 Found ${allExercises.length} exercises in database`);

    // Define the exact exercises from the description
    const workoutExercises = {
      1: [ // Full-Body Workout – 1 Day / Week (60 min)
        // Warm-up (10 min)
        { name: "Treadmill", sets: 1, reps: "5 min", weight: "light pace", restTime: "0 sec" },
        { name: "Shoulder circles", sets: 2, reps: "10-15", weight: "bodyweight", restTime: "30 sec" },
        { name: "Trunk rotations", sets: 2, reps: "10-12", weight: "bodyweight", restTime: "30 sec" },
        { name: "Bodyweight squats", sets: 2, reps: "12-15", weight: "bodyweight", restTime: "30 sec" },
        { name: "Side lunges", sets: 2, reps: "8-12 per leg", weight: "bodyweight", restTime: "30 sec" },
        // Full-Body Circuit (40 min) – 3 Rounds
        { name: "Squats", sets: 3, reps: "12", weight: "bodyweight/dumbbells", restTime: "60-90 sec" },
        { name: "Bent-over row", sets: 3, reps: "12", weight: "dumbbells/cable", restTime: "60-90 sec" },
        { name: "Chest press", sets: 3, reps: "12", weight: "machine/dumbbells", restTime: "60-90 sec" },
        { name: "Lateral raises", sets: 3, reps: "12", weight: "dumbbells", restTime: "60-90 sec" },
        { name: "Bicep curls", sets: 3, reps: "12", weight: "dumbbells/cable", restTime: "60-90 sec" },
        { name: "Triceps extensions", sets: 3, reps: "12", weight: "dumbbells/cable", restTime: "60-90 sec" },
        { name: "Plank", sets: 3, reps: "20-30 sec", weight: "bodyweight", restTime: "60-90 sec" },
        // Cardio / Conditioning (5–7 min)
        { name: "Jump rope", sets: 4, reps: "20 sec jump/40 sec rest", weight: "jump rope", restTime: "40 sec" },
        // Stretching & Cool Down (5 min)
        { name: "Stretch legs", sets: 1, reps: "1-2 min", weight: "bodyweight", restTime: "0 sec" },
        { name: "Stretch back", sets: 1, reps: "1-2 min", weight: "bodyweight", restTime: "0 sec" },
        { name: "Stretch chest & shoulders", sets: 1, reps: "1-2 min", weight: "bodyweight", restTime: "0 sec" }
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
              notes: `1-Day Workout Plan - Day ${day}`
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

add1DayWorkoutExercises();
