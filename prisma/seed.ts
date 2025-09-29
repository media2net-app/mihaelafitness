import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create initial users
  const user1 = await prisma.user.upsert({
    where: { email: 'demo@mihaelafitness.com' },
    update: {},
    create: {
      email: 'demo@mihaelafitness.com',
      name: 'Demo User',
      phone: '+40712345678',
      status: 'active',
      plan: 'Premium',
      trainingFrequency: 3,
      rating: 4.5,
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'mihaela@mihaelafitness.com' },
    update: {},
    create: {
      email: 'mihaela@mihaelafitness.com',
      name: 'Mihaela (Own Training)',
      phone: '+40712345679',
      status: 'active',
      plan: 'own-training',
      trainingFrequency: 5,
      rating: 5.0,
    },
  });

  const user3 = await prisma.user.upsert({
    where: { email: 'leca.georgiana@example.com' },
    update: {},
    create: {
      email: 'leca.georgiana@example.com',
      name: 'Leca Georgiana',
      phone: '+40712345680',
      status: 'active',
      plan: 'Premium',
      trainingFrequency: 3,
      rating: 4.8,
    },
  });

  console.log('✅ Users created');

  // Create services
  const service1 = await prisma.service.upsert({
    where: { id: 'personal-training-1-1' },
    update: {},
    create: {
      id: 'personal-training-1-1',
      name: 'Personal Training 1:1',
      basePrice: 50,
      description: '1-on-1 personal training session',
    },
  });

  console.log('✅ Services created');

  // Create exercise library
  const exercises = [
    // Chest exercises
    {
      name: 'Bench Press',
      description: 'Classic chest exercise performed with a barbell',
      muscleGroup: 'chest',
      equipment: 'barbell',
      difficulty: 'intermediate',
      category: 'strength',
      instructions: 'Lie on bench, grip bar slightly wider than shoulders, lower to chest, press up',
      tips: 'Keep feet flat on floor, maintain arch in back, control the weight',
    },
    {
      name: 'Incline Dumbbell Press',
      description: 'Upper chest focused pressing movement',
      muscleGroup: 'chest',
      equipment: 'dumbbell',
      difficulty: 'intermediate',
      category: 'strength',
      instructions: 'Set bench to 30-45 degree incline, press dumbbells up and together',
      tips: 'Focus on upper chest, keep core tight, control the negative',
    },
    {
      name: 'Push-ups',
      description: 'Bodyweight chest exercise',
      muscleGroup: 'chest',
      equipment: 'bodyweight',
      difficulty: 'beginner',
      category: 'strength',
      instructions: 'Start in plank position, lower chest to ground, push back up',
      tips: 'Keep body straight, engage core, full range of motion',
    },
    
    // Back exercises
    {
      name: 'Pull-ups',
      description: 'Bodyweight back exercise',
      muscleGroup: 'back',
      equipment: 'bodyweight',
      difficulty: 'advanced',
      category: 'strength',
      instructions: 'Hang from bar, pull body up until chin clears bar, lower slowly',
      tips: 'Engage lats, avoid swinging, full range of motion',
    },
    {
      name: 'Barbell Rows',
      description: 'Horizontal pulling exercise for back',
      muscleGroup: 'back',
      equipment: 'barbell',
      difficulty: 'intermediate',
      category: 'strength',
      instructions: 'Bend forward, pull bar to lower chest, squeeze shoulder blades',
      tips: 'Keep back straight, pull with elbows, control the weight',
    },
    {
      name: 'Lat Pulldown',
      description: 'Machine-based vertical pulling exercise',
      muscleGroup: 'back',
      equipment: 'machine',
      difficulty: 'beginner',
      category: 'strength',
      instructions: 'Pull bar to upper chest, squeeze lats, return slowly',
      tips: 'Lean back slightly, pull with lats not arms, full stretch',
    },
    
    // Shoulder exercises
    {
      name: 'Overhead Press',
      description: 'Vertical pressing movement for shoulders',
      muscleGroup: 'shoulders',
      equipment: 'barbell',
      difficulty: 'intermediate',
      category: 'strength',
      instructions: 'Press bar from shoulder height to overhead, lower with control',
      tips: 'Keep core tight, press straight up, full range of motion',
    },
    {
      name: 'Lateral Raises',
      description: 'Isolation exercise for side delts',
      muscleGroup: 'shoulders',
      equipment: 'dumbbell',
      difficulty: 'beginner',
      category: 'strength',
      instructions: 'Raise arms to sides until parallel to floor, lower slowly',
      tips: 'Slight bend in elbows, control the weight, avoid swinging',
    },
    {
      name: 'Rear Delt Flyes',
      description: 'Posterior deltoid isolation exercise',
      muscleGroup: 'shoulders',
      equipment: 'dumbbell',
      difficulty: 'beginner',
      category: 'strength',
      instructions: 'Bend forward, raise arms to sides, squeeze rear delts',
      tips: 'Keep slight bend in elbows, focus on rear delts, control movement',
    },
    
    // Arm exercises
    {
      name: 'Bicep Curls',
      description: 'Classic bicep isolation exercise',
      muscleGroup: 'arms',
      equipment: 'dumbbell',
      difficulty: 'beginner',
      category: 'strength',
      instructions: 'Curl weights up, squeeze biceps, lower slowly',
      tips: 'Keep elbows at sides, full range of motion, control the negative',
    },
    {
      name: 'Tricep Dips',
      description: 'Bodyweight tricep exercise',
      muscleGroup: 'arms',
      equipment: 'bodyweight',
      difficulty: 'intermediate',
      category: 'strength',
      instructions: 'Lower body using arms, push back up, keep elbows close',
      tips: 'Keep body upright, full range of motion, control the movement',
    },
    {
      name: 'Hammer Curls',
      description: 'Bicep exercise with neutral grip',
      muscleGroup: 'arms',
      equipment: 'dumbbell',
      difficulty: 'beginner',
      category: 'strength',
      instructions: 'Curl with neutral grip, squeeze biceps, lower slowly',
      tips: 'Keep wrists neutral, full range of motion, control the weight',
    },
    
    // Leg exercises
    {
      name: 'Squats',
      description: 'Fundamental leg exercise',
      muscleGroup: 'legs',
      equipment: 'barbell',
      difficulty: 'intermediate',
      category: 'strength',
      instructions: 'Lower until thighs parallel to floor, drive through heels to stand',
      tips: 'Keep chest up, knees track over toes, full depth',
    },
    {
      name: 'Romanian Deadlifts',
      description: 'Hip hinge movement for posterior chain',
      muscleGroup: 'legs',
      equipment: 'barbell',
      difficulty: 'intermediate',
      category: 'strength',
      instructions: 'Hinge at hips, lower bar along legs, return to standing',
      tips: 'Keep back straight, feel stretch in hamstrings, drive hips forward',
    },
    {
      name: 'Walking Lunges',
      description: 'Dynamic single leg exercise',
      muscleGroup: 'legs',
      equipment: 'bodyweight',
      difficulty: 'beginner',
      category: 'strength',
      instructions: 'Step forward into lunge, push back up, alternate legs',
      tips: 'Keep torso upright, full range of motion, control the movement',
    },
    {
      name: 'Leg Press',
      description: 'Machine-based leg exercise',
      muscleGroup: 'legs',
      equipment: 'machine',
      difficulty: 'beginner',
      category: 'strength',
      instructions: 'Push platform away, lower with control, drive through heels',
      tips: 'Keep knees aligned, full range of motion, control the weight',
    },
    
    // Glute exercises
    {
      name: 'Hip Thrusts',
      description: 'Primary glute strengthening exercise',
      muscleGroup: 'glutes',
      equipment: 'barbell',
      difficulty: 'intermediate',
      category: 'strength',
      instructions: 'Drive hips up, squeeze glutes, lower with control',
      tips: 'Keep core tight, drive through heels, full hip extension',
    },
    {
      name: 'Glute Bridges',
      description: 'Bodyweight glute exercise',
      muscleGroup: 'glutes',
      equipment: 'bodyweight',
      difficulty: 'beginner',
      category: 'strength',
      instructions: 'Lift hips up, squeeze glutes, lower slowly',
      tips: 'Keep feet close to glutes, drive through heels, squeeze at top',
    },
    {
      name: 'Bulgarian Split Squats',
      description: 'Single leg glute and quad exercise',
      muscleGroup: 'glutes',
      equipment: 'bodyweight',
      difficulty: 'intermediate',
      category: 'strength',
      instructions: 'Rear foot elevated, lower into lunge, drive up through front heel',
      tips: 'Keep torso upright, full range of motion, control the movement',
    },
    {
      name: 'Cable Kickbacks',
      description: 'Isolation exercise for glutes',
      muscleGroup: 'glutes',
      equipment: 'cable',
      difficulty: 'beginner',
      category: 'strength',
      instructions: 'Kick leg back, squeeze glute, return slowly',
      tips: 'Keep core tight, focus on glute contraction, control the movement',
    },
    
    // Core exercises
    {
      name: 'Plank',
      description: 'Isometric core strengthening exercise',
      muscleGroup: 'core',
      equipment: 'bodyweight',
      difficulty: 'beginner',
      category: 'strength',
      instructions: 'Hold straight line from head to heels, engage core',
      tips: 'Keep body straight, breathe normally, engage entire core',
    },
    {
      name: 'Dead Bug',
      description: 'Core stability exercise',
      muscleGroup: 'core',
      equipment: 'bodyweight',
      difficulty: 'beginner',
      category: 'strength',
      instructions: 'Lower opposite arm and leg, return to start, alternate',
      tips: 'Keep lower back pressed to floor, move slowly, maintain tension',
    },
    {
      name: 'Russian Twists',
      description: 'Rotational core exercise',
      muscleGroup: 'core',
      equipment: 'bodyweight',
      difficulty: 'beginner',
      category: 'strength',
      instructions: 'Rotate torso side to side, keep feet off ground',
      tips: 'Keep core tight, control the rotation, full range of motion',
    },
    
    // Cardio exercises
    {
      name: 'Box Jumps',
      description: 'Explosive plyometric exercise',
      muscleGroup: 'cardio',
      equipment: 'box',
      difficulty: 'advanced',
      category: 'plyometric',
      instructions: 'Jump onto box, step down, repeat',
      tips: 'Land softly, full hip extension, control the landing',
    },
    {
      name: 'Burpees',
      description: 'Full body cardio exercise',
      muscleGroup: 'cardio',
      equipment: 'bodyweight',
      difficulty: 'advanced',
      category: 'cardio',
      instructions: 'Drop to push-up, jump feet to hands, jump up',
      tips: 'Maintain form, control the movement, full range of motion',
    },
    {
      name: 'Mountain Climbers',
      description: 'Dynamic cardio exercise',
      muscleGroup: 'cardio',
      equipment: 'bodyweight',
      difficulty: 'intermediate',
      category: 'cardio',
      instructions: 'Alternate bringing knees to chest in plank position',
      tips: 'Keep core tight, maintain plank position, quick movements',
    },
  ];

  await prisma.exercise.createMany({
    data: exercises,
    skipDuplicates: true,
  });

  console.log('✅ Exercise library created');

  // Create workout schemas
  const workout1 = await prisma.workout.create({
    data: {
      name: '1x per week - Full Body',
      category: 'strength',
      difficulty: 'Beginner',
      duration: 60,
      exercises: 8,
      trainingType: 'Full Body',
      description: 'Complete full body workout for beginners',
    },
  });

  const workout2 = await prisma.workout.create({
    data: {
      name: '2x per week - Upper/Lower Split',
      category: 'strength',
      difficulty: 'Intermediate',
      duration: 45,
      exercises: 12,
      trainingType: 'Upper/Lower Split',
      description: 'Upper and lower body split for intermediate trainees',
    },
  });

  const workout3 = await prisma.workout.create({
    data: {
      name: '3x per week - Push/Pull/Legs',
      category: 'strength',
      difficulty: 'Intermediate',
      duration: 50,
      exercises: 15,
      trainingType: 'Push/Pull/Legs',
      description: 'Push, pull, and legs split for intermediate to advanced trainees',
    },
  });

  const workout4 = await prisma.workout.create({
    data: {
      name: '4x per week - Glutes Focus',
      category: 'strength',
      difficulty: 'Intermediate',
      duration: 55,
      exercises: 16,
      trainingType: 'Glutes Focus',
      description: 'Glutes and legs focused training for women',
    },
  });

  const workout5 = await prisma.workout.create({
    data: {
      name: '5x per week - Glutes Focus',
      category: 'strength',
      difficulty: 'Advanced',
      duration: 60,
      exercises: 20,
      trainingType: 'Glutes Focus',
      description: 'Advanced glutes and legs training with full body integration',
    },
  });

  console.log('✅ Workout schemas created');

  // Create workout exercises for 2x per week - Upper/Lower Split
  const upperLowerExercises = [
    // Day 1 - Upper Body
    { exerciseName: 'Bench Press', day: 1, order: 1, sets: 3, reps: '8-10', weight: 'moderate', restTime: '2 minutes' },
    { exerciseName: 'Incline Dumbbell Press', day: 1, order: 2, sets: 3, reps: '10-12', weight: 'moderate', restTime: '90 seconds' },
    { exerciseName: 'Overhead Press', day: 1, order: 3, sets: 3, reps: '8-10', weight: 'moderate', restTime: '90 seconds' },
    { exerciseName: 'Lateral Raises', day: 1, order: 4, sets: 3, reps: '12-15', weight: 'light', restTime: '60 seconds' },
    { exerciseName: 'Pull-ups/Lat Pulldown', day: 1, order: 5, sets: 3, reps: '8-10', weight: 'moderate', restTime: '2 minutes' },
    { exerciseName: 'Barbell Rows', day: 1, order: 6, sets: 3, reps: '10-12', weight: 'moderate', restTime: '90 seconds' },
    { exerciseName: 'Bicep Curls', day: 1, order: 7, sets: 3, reps: '12-15', weight: 'light', restTime: '60 seconds' },
    { exerciseName: 'Tricep Dips', day: 1, order: 8, sets: 3, reps: '10-12', weight: 'bodyweight', restTime: '60 seconds' },
    
    // Day 2 - Lower Body
    { exerciseName: 'Squats', day: 2, order: 1, sets: 4, reps: '8-10', weight: 'moderate', restTime: '2 minutes' },
    { exerciseName: 'Romanian Deadlifts', day: 2, order: 2, sets: 3, reps: '10-12', weight: 'moderate', restTime: '90 seconds' },
    { exerciseName: 'Bulgarian Split Squats', day: 2, order: 3, sets: 3, reps: '10 each leg', weight: 'bodyweight', restTime: '90 seconds' },
    { exerciseName: 'Hip Thrusts', day: 2, order: 4, sets: 3, reps: '12-15', weight: 'moderate', restTime: '90 seconds' },
    { exerciseName: 'Walking Lunges', day: 2, order: 5, sets: 3, reps: '12 each leg', weight: 'bodyweight', restTime: '60 seconds' },
    { exerciseName: 'Glute Bridges', day: 2, order: 6, sets: 3, reps: '15', weight: 'bodyweight', restTime: '60 seconds' },
    { exerciseName: 'Calf Raises', day: 2, order: 7, sets: 3, reps: '15-20', weight: 'bodyweight', restTime: '45 seconds' },
    { exerciseName: 'Plank', day: 2, order: 8, sets: 3, reps: '45-60 seconds', weight: 'bodyweight', restTime: '60 seconds' },
  ];

  for (const exerciseData of upperLowerExercises) {
    const exercise = await prisma.exercise.findFirst({
      where: { name: exerciseData.exerciseName },
    });
    
    if (exercise) {
      await prisma.workoutExercise.create({
        data: {
          workoutId: workout2.id,
          exerciseId: exercise.id,
          day: exerciseData.day,
          order: exerciseData.order,
          sets: exerciseData.sets,
          reps: exerciseData.reps,
          weight: exerciseData.weight,
          restTime: exerciseData.restTime,
        },
      });
    }
  }

  console.log('✅ Workout exercises created');

  // Create nutrition plan
  const nutritionPlan = await prisma.nutritionPlan.create({
    data: {
      name: 'Weight Loss Plan',
      goal: 'weight-loss',
      calories: 1500,
      protein: 120,
      carbs: 150,
      fat: 50,
      meals: 5,
      description: 'Comprehensive weight loss nutrition plan',
      weekMenu: {
        monday: {
          breakfast: 'Oatmeal with berries and protein powder',
          breakfastSnack: 'Greek yogurt with nuts',
          lunch: 'Grilled chicken salad with olive oil dressing',
          lunchSnack: 'Apple with almond butter',
          dinner: 'Baked salmon with steamed vegetables',
          dinnerSnack: 'Herbal tea'
        },
        tuesday: {
          breakfast: 'Scrambled eggs with spinach and whole grain toast',
          breakfastSnack: 'Protein smoothie',
          lunch: 'Turkey and avocado wrap',
          lunchSnack: 'Cottage cheese with cucumber',
          dinner: 'Lean beef stir-fry with brown rice',
          dinnerSnack: 'Chamomile tea'
        },
        wednesday: {
          breakfast: 'Protein pancakes with sugar-free syrup',
          breakfastSnack: 'Handful of almonds',
          lunch: 'Quinoa bowl with grilled vegetables',
          lunchSnack: 'Hard-boiled eggs',
          dinner: 'Baked cod with sweet potato',
          dinnerSnack: 'Green tea'
        },
        thursday: {
          breakfast: 'Greek yogurt parfait with granola',
          breakfastSnack: 'Protein bar',
          lunch: 'Chicken and vegetable soup',
          lunchSnack: 'Celery with hummus',
          dinner: 'Grilled shrimp with quinoa',
          dinnerSnack: 'Herbal tea'
        },
        friday: {
          breakfast: 'Smoothie bowl with protein powder',
          breakfastSnack: 'Walnuts',
          lunch: 'Salmon salad with mixed greens',
          lunchSnack: 'Berries with cottage cheese',
          dinner: 'Turkey meatballs with zucchini noodles',
          dinnerSnack: 'Chamomile tea'
        },
        saturday: {
          breakfast: 'Avocado toast with poached egg',
          breakfastSnack: 'Protein shake',
          lunch: 'Grilled chicken with roasted vegetables',
          lunchSnack: 'Greek yogurt',
          dinner: 'Baked fish with brown rice',
          dinnerSnack: 'Green tea'
        },
        sunday: {
          breakfast: 'Omelet with vegetables and cheese',
          breakfastSnack: 'Mixed nuts',
          lunch: 'Lean beef salad',
          lunchSnack: 'Cucumber slices',
          dinner: 'Grilled salmon with quinoa',
          dinnerSnack: 'Herbal tea'
        }
      }
    },
  });

  console.log('✅ Nutrition plan created');

  // Create pricing calculations
  await prisma.pricingCalculation.createMany({
    data: [
      {
        customerId: user3.id,
        customerName: user3.name,
        service: 'Personal Training 1:1',
        duration: 12,
        frequency: 3,
        discount: 20,
        finalPrice: 1200,
        includeNutritionPlan: true,
      },
    ],
  });

  console.log('✅ Pricing calculations created');

  // Create training sessions
  await prisma.trainingSession.createMany({
    data: [
      {
        customerId: user2.id,
        date: new Date('2025-09-29'),
        startTime: '08:30',
        endTime: '09:30',
        type: 'own-training',
        status: 'scheduled',
        notes: 'Mihaela\'s own training session',
      },
      {
        customerId: user3.id,
        date: new Date('2025-09-30'),
        startTime: '10:30',
        endTime: '11:30',
        type: 'client-training',
        status: 'scheduled',
        notes: 'Leca\'s training session',
      },
      {
        customerId: user3.id,
        date: new Date('2025-10-02'),
        startTime: '10:30',
        endTime: '11:30',
        type: 'client-training',
        status: 'scheduled',
        notes: 'Leca\'s training session',
      },
      {
        customerId: user3.id,
        date: new Date('2025-10-04'),
        startTime: '10:30',
        endTime: '11:30',
        type: 'client-training',
        status: 'scheduled',
        notes: 'Leca\'s training session',
      },
    ],
  });

  console.log('✅ Training sessions created');

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });