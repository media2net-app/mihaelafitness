const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addExercisesToSchema() {
  try {
    console.log('🔍 Finding Push/Pull/Legs schema...');
    
    // Find the Push/Pull/Legs schema
    const schema = await prisma.workout.findFirst({
      where: {
        trainingType: {
          contains: 'push/pull/legs',
          mode: 'insensitive'
        }
      }
    });
    
    if (!schema) {
      console.log('❌ No Push/Pull/Legs schema found');
      return;
    }
    
    console.log(`✅ Found schema: ${schema.name} (${schema.id})`);
    
    // Get all exercises
    const exercises = await prisma.exercise.findMany({
      where: { isActive: true }
    });
    
    console.log(`📊 Found ${exercises.length} exercises`);
    
    // Define exercises for each day
    const dayExercises = {
      1: [ // Day 1: Legs & Glutes
        'Squat', 'Romanian Deadlift', 'Bulgarian Split Squat', 'Hip Thrust', 'Walking Lunge'
      ],
      2: [ // Day 2: Back + Triceps + Abs
        'Pull-up', 'Bent-over Row', 'Lat Pulldown', 'Close-grip Bench Press', 'Tricep Dips', 'Plank'
      ],
      3: [ // Day 3: Chest + Shoulders + Biceps + Abs
        'Bench Press', 'Incline Dumbbell Press', 'Shoulder Press', 'Lateral Raise', 'Bicep Curl', 'Russian Twist'
      ]
    };
    
    let addedCount = 0;
    
    for (const [day, exerciseNames] of Object.entries(dayExercises)) {
      const dayNum = parseInt(day);
      console.log(`\n📅 Adding exercises for Day ${dayNum}:`);
      
      for (let i = 0; i < exerciseNames.length; i++) {
        const exerciseName = exerciseNames[i];
        
        // Find the exercise
        const exercise = exercises.find(ex => 
          ex.name.toLowerCase().includes(exerciseName.toLowerCase()) ||
          exerciseName.toLowerCase().includes(ex.name.toLowerCase())
        );
        
        if (exercise) {
          // Check if exercise already exists for this day
          const existing = await prisma.workoutExercise.findFirst({
            where: {
              workoutId: schema.id,
              exerciseId: exercise.id,
              day: dayNum
            }
          });
          
          if (!existing) {
            await prisma.workoutExercise.create({
              data: {
                workoutId: schema.id,
                exerciseId: exercise.id,
                day: dayNum,
                order: i + 1,
                sets: 3,
                reps: dayNum === 1 ? '8-12' : dayNum === 2 ? '10-15' : '6-10',
                weight: 'Bodyweight',
                restTime: '60-90s',
                notes: `Day ${dayNum} exercise`
              }
            });
            
            console.log(`  ✅ Added: ${exercise.name} (${exercise.muscleGroup})`);
            addedCount++;
          } else {
            console.log(`  ⚠️  Already exists: ${exercise.name}`);
          }
        } else {
          console.log(`  ❌ Exercise not found: ${exerciseName}`);
        }
      }
    }
    
    console.log(`\n🎯 Total exercises added: ${addedCount}`);
    
    // Show final count
    const finalCount = await prisma.workoutExercise.count({
      where: { workoutId: schema.id }
    });
    
    console.log(`📊 Total exercises in schema: ${finalCount}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addExercisesToSchema();
