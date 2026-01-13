import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

// Debug: Check if prisma client has the model
if (typeof prisma.dailyTaskCompletion === 'undefined') {
  console.error('❌ prisma.dailyTaskCompletion is undefined!');
  console.error('Available models:', Object.keys(prisma).filter(k => !k.startsWith('_') && !k.startsWith('$')));
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const runtime = 'nodejs';

// GET - Fetch daily tasks for a customer
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 GET /api/daily-tasks called');
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    console.log('🔍 Auth header:', authHeader ? 'Present' : 'Missing');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
      console.log('🔍 Token decoded, userId:', decoded.userId);
    } catch (error) {
      console.error('❌ Token verification failed:', error);
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const userId = decoded.userId;
    console.log('🔍 Fetching data for userId:', userId);
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date'); // Optional: specific date, defaults to today

    // Get user info for training frequency
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { trainingFrequency: true }
    });

    // Get active daily tasks for this customer
    const tasks = await prisma.dailyTask.findMany({
      where: {
        customerId: userId,
        isActive: true
      },
      orderBy: {
        order: 'asc'
      }
    });

    // Get today's date (or specified date)
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);

    // Get completions for this date (exact date match)
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    const completions = await prisma.dailyTaskCompletion.findMany({
      where: {
        customerId: userId,
        date: {
          gte: startOfDay,
          lte: endOfDay
        }
      }
    });

    // Get nutrition tracking for this date
    const nutritionTracking = await prisma.dailyNutritionTracking.findFirst({
      where: {
        customerId: userId,
        date: {
          gte: startOfDay,
          lte: endOfDay
        }
      }
    });

    // Get meal completions for this date
    let mealCompletions: any[] = [];
    try {
      mealCompletions = await prisma.dailyMealCompletion.findMany({
        where: {
          customerId: userId,
          date: {
            gte: startOfDay,
            lte: endOfDay
          }
        }
      });
      console.log('🔍 Meal completions found:', mealCompletions.length);
    } catch (error: any) {
      console.error('❌ Error fetching meal completions:', error?.message);
      // Continue without meal completions if table doesn't exist yet
      mealCompletions = [];
    }

    // Get active nutrition plan for this customer
    const nutritionPlanAssignment = await prisma.customerNutritionPlan.findFirst({
      where: {
        customerId: userId,
        status: 'active'
      },
      include: {
        nutritionPlan: {
          select: {
            id: true,
            name: true,
            weekMenu: true
          }
        }
      }
    });

    // Get today's meals from nutrition plan
    let todayMeals: any[] = [];
    let nutritionPlanInfo: any = null;
    
    if (nutritionPlanAssignment) {
      nutritionPlanInfo = {
        id: nutritionPlanAssignment.nutritionPlan.id,
        name: nutritionPlanAssignment.nutritionPlan.name
      };
      
      if (nutritionPlanAssignment.nutritionPlan.weekMenu) {
        const today = new Date();
        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const todayDayName = dayNames[today.getDay()];
        const weekMenu = nutritionPlanAssignment.nutritionPlan.weekMenu as any;
        
        console.log('🍽️ Nutrition plan found:', {
          planId: nutritionPlanAssignment.nutritionPlan.id,
          planName: nutritionPlanAssignment.nutritionPlan.name,
          todayDayName,
          hasWeekMenu: !!weekMenu,
          weekMenuKeys: weekMenu ? Object.keys(weekMenu) : []
        });
        
        // Try multiple variations of day name (case-insensitive)
        const todayMenu = weekMenu[todayDayName] || 
                         weekMenu[todayDayName.toLowerCase()] || 
                         weekMenu[todayDayName.charAt(0).toUpperCase() + todayDayName.slice(1)] ||
                         weekMenu[Object.keys(weekMenu).find(key => key.toLowerCase() === todayDayName.toLowerCase()) || ''] ||
                         {};
        
        console.log('🍽️ Today menu:', {
          todayDayName,
          todayMenuKeys: Object.keys(todayMenu),
          todayMenu
        });
        
        const mealTypes = ['breakfast', 'morning-snack', 'lunch', 'afternoon-snack', 'dinner', 'evening-snack'];
        const mealLabels: { [key: string]: string } = {
          'breakfast': 'Ontbijt',
          'morning-snack': 'Ochtendsnack',
          'lunch': 'Lunch',
          'afternoon-snack': 'Middagsnack',
          'dinner': 'Avondeten',
          'evening-snack': 'Avondsnack'
        };

        // Helper function to parse meal string into individual items
        const parseMealIntoItems = (mealText: string): string[] => {
          if (!mealText || typeof mealText !== 'string') return [];
          // Split by comma, "en", or "and"
          return mealText
            .split(/,| en | and /i)
            .map(item => item.trim())
            .filter(item => item.length > 0);
        };

        todayMeals = mealTypes.map(mealType => {
          const mealData = todayMenu[mealType];
          const mealCompletion = mealCompletions.find(mc => mc.mealType === mealType);
          const hasMeal = !!mealData && (typeof mealData === 'string' ? mealData.trim() !== '' : true);
          
          // Parse meal into items
          let items: any[] = [];
          if (hasMeal && typeof mealData === 'string') {
            const itemTexts = parseMealIntoItems(mealData);
            // Get meal items from database if meal completion exists
            const dbItems = mealCompletion?.mealItems || [];
            
            // Merge parsed items with database items
            items = itemTexts.map((itemText, index) => {
              // Try to find matching database item
              const dbItem = dbItems.find((di: any) => di.order === index || di.itemText === itemText);
              return {
                id: dbItem?.id || `temp-${mealType}-${index}`,
                text: itemText,
                completed: dbItem?.completed || false,
                order: index,
                mealItemId: dbItem?.id || null
              };
            });
          }
          
          return {
            type: mealType,
            label: mealLabels[mealType] || mealType,
            hasMeal: hasMeal,
            mealText: typeof mealData === 'string' ? mealData : '',
            completed: mealCompletion?.completed || false,
            mealId: mealCompletion?.id || null,
            items: items
          };
        }).filter(m => m.hasMeal);
        
        console.log('🍽️ Today meals after filtering:', {
          count: todayMeals.length,
          meals: todayMeals.map(m => ({ 
            type: m.type, 
            label: m.label, 
            completed: m.completed,
            itemsCount: m.items?.length || 0,
            items: m.items
          }))
        });
      } else {
        console.log('🍽️ Nutrition plan found but no weekMenu');
      }
    } else {
      console.log('🍽️ No nutrition plan assignment found');
    }

    // Get water tracking for this date
    const waterTracking = await prisma.dailyWaterTracking.findFirst({
      where: {
        customerId: userId,
        date: {
          gte: startOfDay,
          lte: endOfDay
        }
      }
    });

    // Combine tasks with their completion status
    const tasksWithCompletion = tasks.map(task => {
      const completion = completions.find(c => c.dailyTaskId === task.id);
      return {
        ...task,
        completed: completion?.completed || false,
        value: completion?.value || null,
        notes: completion?.notes || null,
        completionId: completion?.id || null
      };
    });

    // Calculate weekly stats
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    // Get all nutrition tracking for this week
    const weekNutrition = await prisma.dailyNutritionTracking.findMany({
      where: {
        customerId: userId,
        date: {
          gte: startOfWeek,
          lte: endOfWeek
        },
        followed: true
      }
    });

    // Get all water tracking for this week
    const weekWater = await prisma.dailyWaterTracking.findMany({
      where: {
        customerId: userId,
        date: {
          gte: startOfWeek,
          lte: endOfWeek
        }
      }
    });
    const waterDaysMet = weekWater.filter(w => w.amount >= w.target).length;

    // Get all task completions for this week
    const weekCompletions = await prisma.dailyTaskCompletion.findMany({
      where: {
        customerId: userId,
        date: {
          gte: startOfWeek,
          lte: endOfWeek
        },
        completed: true
      }
    });

    // Get training sessions for this week
    const weekTrainingSessions = await prisma.trainingSession.findMany({
      where: {
        customerId: userId,
        date: {
          gte: startOfWeek,
          lte: endOfWeek
        },
        status: 'completed'
      }
    });

    // Calculate consistency score (average of all metrics)
    const trainingFrequency = user?.trainingFrequency || 3;
    const nutritionScore = (weekNutrition.length / 7) * 100;
    const waterScore = (waterDaysMet / 7) * 100;
    const taskScore = tasks.length > 0 ? (weekCompletions.length / (tasks.length * 7)) * 100 : 0;
    const trainingScore = (weekTrainingSessions.length / trainingFrequency) * 100;
    const consistencyScore = Math.round((nutritionScore + waterScore + taskScore + Math.min(100, trainingScore)) / 4);

    // Get daily data for each day of the week for calendar view
    const weekDaysData = [];
    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(startOfWeek);
      dayDate.setDate(startOfWeek.getDate() + i);
      dayDate.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayDate);
      dayEnd.setHours(23, 59, 59, 999);

      // Get nutrition for this day
      const dayNutrition = weekNutrition.find(n => {
        const nDate = new Date(n.date);
        nDate.setHours(0, 0, 0, 0);
        return nDate.getTime() === dayDate.getTime();
      });

      // Get water for this day
      const dayWater = weekWater.find(w => {
        const wDate = new Date(w.date);
        wDate.setHours(0, 0, 0, 0);
        return wDate.getTime() === dayDate.getTime();
      });

      // Get task completions for this day
      const dayTaskCompletions = weekCompletions.filter(c => {
        const cDate = new Date(c.date);
        cDate.setHours(0, 0, 0, 0);
        return cDate.getTime() === dayDate.getTime();
      });

      // Check if all tasks are completed for this day
      const allTasksCompleted = tasks.length > 0 && dayTaskCompletions.length === tasks.length;

      weekDaysData.push({
        date: dayDate.toISOString().split('T')[0],
        dayName: dayDate.toLocaleDateString('nl-NL', { weekday: 'short' }),
        dayNumber: dayDate.getDate(),
        isToday: dayDate.toDateString() === new Date().toDateString(),
        nutrition: dayNutrition?.followed || false,
        water: dayWater ? dayWater.amount >= dayWater.target : false,
        tasks: allTasksCompleted,
        allComplete: (dayNutrition?.followed || false) && (dayWater ? dayWater.amount >= dayWater.target : false) && allTasksCompleted
      });
    }

    return NextResponse.json({
      tasks: tasksWithCompletion,
      nutrition: nutritionTracking || { followed: false, notes: null },
      water: waterTracking || { amount: 0, target: 2.0 },
      meals: todayMeals,
      nutritionPlan: nutritionPlanInfo,
      weeklyStats: {
        nutritionDays: weekNutrition.length,
        waterDays: waterDaysMet,
        taskCompletions: weekCompletions.length,
        trainingSessions: weekTrainingSessions.length,
        consistencyScore
      },
      weekCalendar: weekDaysData
    });

  } catch (error: any) {
    console.error('❌ Error fetching daily tasks:', error);
    console.error('❌ Error message:', error?.message);
    console.error('❌ Error stack:', error?.stack);
    console.error('❌ Error code:', error?.code);
    console.error('❌ Error meta:', error?.meta);
    return NextResponse.json(
      { error: 'Failed to fetch daily tasks', details: error?.message, code: error?.code },
      { status: 500 }
    );
  }
}

// POST - Complete a daily task or update nutrition/water
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const userId = decoded.userId;
    const body = await request.json();
    const { type, taskId, completed, value, date, nutrition, water, mealItemId, itemText, itemOrder } = body;

    console.log('📝 POST /api/daily-tasks:', { type, taskId, completed, value, date, nutrition, water, mealItemId, itemText, itemOrder, userId });

    // Normalize date to start of day (00:00:00) for consistent storage
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);
    targetDate.setMinutes(0, 0);
    targetDate.setSeconds(0, 0);
    targetDate.setMilliseconds(0);
    
    console.log('📅 Target date:', targetDate.toISOString());

    if (type === 'task') {
      if (!taskId) {
        return NextResponse.json(
          { error: 'taskId is required for task type' },
          { status: 400 }
        );
      }

      // Update or create task completion
      if (completed) {
        console.log('✅ Creating/updating task completion');
        try {
          // First try to find existing completion
          const existing = await prisma.dailyTaskCompletion.findFirst({
            where: {
              dailyTaskId: taskId,
              customerId: userId,
              date: {
                gte: new Date(targetDate.getTime()),
                lt: new Date(targetDate.getTime() + 24 * 60 * 60 * 1000)
              }
            }
          });

          if (existing) {
            // Update existing
            await prisma.dailyTaskCompletion.update({
              where: { id: existing.id },
              data: {
                completed: true,
                value: value ? Number(value) : null,
                updatedAt: new Date()
              }
            });
            console.log('✅ Task completion updated');
          } else {
            // Create new
            await prisma.dailyTaskCompletion.create({
              data: {
                dailyTaskId: taskId,
                customerId: userId,
                date: targetDate,
                completed: true,
                value: value ? Number(value) : null
              }
            });
            console.log('✅ Task completion created');
          }
        } catch (error: any) {
          console.error('❌ Error in upsert:', error);
          // Fallback: try delete and create
          await prisma.dailyTaskCompletion.deleteMany({
            where: {
              dailyTaskId: taskId,
              customerId: userId,
              date: {
                gte: new Date(targetDate.getTime()),
                lt: new Date(targetDate.getTime() + 24 * 60 * 60 * 1000)
              }
            }
          });
            await prisma.dailyTaskCompletion.create({
              data: {
                dailyTaskId: taskId,
                customerId: userId,
                date: targetDate,
                completed: true,
                value: value ? Number(value) : null
              }
            });
            console.log('✅ Task completion created (fallback)');
        }
      } else {
        // Delete completion if unchecking
        console.log('❌ Deleting task completion');
        await prisma.dailyTaskCompletion.deleteMany({
          where: {
            dailyTaskId: taskId,
            customerId: userId,
            date: {
              gte: new Date(targetDate.getTime()),
              lt: new Date(targetDate.getTime() + 24 * 60 * 60 * 1000)
            }
          }
        });
        console.log('✅ Task completion deleted');
      }
    } else if (type === 'nutrition') {
      // Update nutrition tracking
      console.log('🍎 Updating nutrition tracking');
      if (!nutrition) {
        return NextResponse.json(
          { error: 'nutrition data is required for nutrition type' },
          { status: 400 }
        );
      }
      await prisma.dailyNutritionTracking.upsert({
        where: {
          customerId_date: {
            customerId: userId,
            date: targetDate
          }
        },
        update: {
          followed: nutrition.followed || false,
          notes: nutrition.notes || null,
          updatedAt: new Date()
        },
        create: {
          customerId: userId,
          date: targetDate,
          followed: nutrition.followed || false,
          notes: nutrition.notes || null
        }
      });
      console.log('✅ Nutrition tracking saved');
    } else if (type === 'meal') {
      // Update meal completion
      console.log('🍽️ Updating meal completion');
      const { mealType, completed } = body;
      if (!mealType) {
        return NextResponse.json(
          { error: 'mealType is required for meal type' },
          { status: 400 }
        );
      }
      
      // Ensure nutrition tracking exists first
      await prisma.dailyNutritionTracking.upsert({
        where: {
          customerId_date: {
            customerId: userId,
            date: targetDate
          }
        },
        update: {},
        create: {
          customerId: userId,
          date: targetDate,
          followed: false
        }
      });

      // Update or create meal completion
      await prisma.dailyMealCompletion.upsert({
        where: {
          customerId_date_mealType: {
            customerId: userId,
            date: targetDate,
            mealType: mealType
          }
        },
        update: {
          completed: completed !== undefined ? completed : true,
          updatedAt: new Date()
        },
        create: {
          customerId: userId,
          date: targetDate,
          mealType: mealType,
          completed: completed !== undefined ? completed : true
        }
      });

      // If updating a specific meal item
      const { mealItemId, itemText, itemOrder } = body;
      console.log('🍽️ Meal item update:', { mealItemId, itemText, itemOrder, completed, mealType });
      
      if (mealItemId || (itemText !== undefined && itemOrder !== undefined)) {
        // Get meal completion (we already created it above)
        const mealCompletion = await prisma.dailyMealCompletion.findUnique({
          where: {
            customerId_date_mealType: {
              customerId: userId,
              date: targetDate,
              mealType: mealType
            }
          }
        });

        if (!mealCompletion) {
          console.error('❌ Meal completion not found');
          return NextResponse.json(
            { error: 'Meal completion not found' },
            { status: 404 }
          );
        }

        console.log('🍽️ Found meal completion:', mealCompletion.id);

        if (mealItemId && mealItemId.startsWith('temp-')) {
          // Create new meal item for temp ID
          console.log('🍽️ Creating new meal item for temp ID');
          const newItem = await prisma.dailyMealItem.create({
            data: {
              mealCompletionId: mealCompletion.id,
              itemText: itemText || '',
              completed: completed !== undefined ? completed : true,
              order: itemOrder !== undefined ? itemOrder : 0
            }
          });
          console.log('✅ Created meal item:', newItem.id);
        } else if (mealItemId) {
          // Try to find existing item by ID first
          const existingItem = await prisma.dailyMealItem.findUnique({
            where: { id: mealItemId }
          });

          if (existingItem) {
            // Update existing meal item
            console.log('🍽️ Updating existing meal item:', mealItemId);
            const updatedItem = await prisma.dailyMealItem.update({
              where: { id: mealItemId },
              data: {
                completed: completed !== undefined ? completed : true,
                updatedAt: new Date()
              }
            });
            console.log('✅ Updated meal item:', updatedItem.id, 'completed:', updatedItem.completed);
          } else {
            // Create new item if it doesn't exist
            console.log('🍽️ Meal item not found, creating new one');
            const newItem = await prisma.dailyMealItem.create({
              data: {
                mealCompletionId: mealCompletion.id,
                itemText: itemText || '',
                completed: completed !== undefined ? completed : true,
                order: itemOrder !== undefined ? itemOrder : 0
              }
            });
            console.log('✅ Created meal item:', newItem.id);
          }
        } else if (itemText !== undefined && itemOrder !== undefined) {
          // Create new item if only text and order provided
          console.log('🍽️ Creating new meal item from text and order');
          const newItem = await prisma.dailyMealItem.create({
            data: {
              mealCompletionId: mealCompletion.id,
              itemText: itemText,
              completed: completed !== undefined ? completed : true,
              order: itemOrder
            }
          });
          console.log('✅ Created meal item:', newItem.id);
        }

        // Update meal completion status based on all items
        const mealItems = await prisma.dailyMealItem.findMany({
          where: {
            mealCompletionId: mealCompletion.id
          }
        });
        const allItemsCompleted = mealItems.length > 0 && mealItems.every(item => item.completed);
        
        await prisma.dailyMealCompletion.update({
          where: {
            id: mealCompletion.id
          },
          data: {
            completed: allItemsCompleted
          }
        });
      }

      // Update nutrition tracking followed status based on all meals
      const allMeals = await prisma.dailyMealCompletion.findMany({
        where: {
          customerId: userId,
          date: targetDate
        }
      });
      const allCompleted = allMeals.length > 0 && allMeals.every(m => m.completed);
      
      await prisma.dailyNutritionTracking.update({
        where: {
          customerId_date: {
            customerId: userId,
            date: targetDate
          }
        },
        data: {
          followed: allCompleted,
          updatedAt: new Date()
        }
      });

      console.log('✅ Meal completion saved');
    } else if (type === 'water') {
      // Update water tracking
      console.log('💧 Updating water tracking');
      if (!water) {
        return NextResponse.json(
          { error: 'water data is required for water type' },
          { status: 400 }
        );
      }
      await prisma.dailyWaterTracking.upsert({
        where: {
          customerId_date: {
            customerId: userId,
            date: targetDate
          }
        },
        update: {
          amount: water.amount || 0,
          target: water.target || 2.0,
          updatedAt: new Date()
        },
        create: {
          customerId: userId,
          date: targetDate,
          amount: water.amount || 0,
          target: water.target || 2.0
        }
      });
      console.log('✅ Water tracking saved');
    } else {
      return NextResponse.json(
        { error: 'Invalid type. Must be "task", "nutrition", or "water"' },
        { status: 400 }
      );
    }

    console.log('✅ All updates completed successfully');
    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('❌ Error updating daily task:', error);
    console.error('❌ Error stack:', error?.stack);
    console.error('❌ Error code:', error?.code);
    console.error('❌ Error meta:', error?.meta);
    return NextResponse.json(
      { 
        error: 'Failed to update daily task', 
        details: error?.message,
        code: error?.code,
        meta: error?.meta
      },
      { status: 500 }
    );
  }
}

