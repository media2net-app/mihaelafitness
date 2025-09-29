'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Apple, Utensils, Scale, Clock, Users, Calendar, Copy, Share2, Download } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRouter } from 'next/navigation';
import IngredientBreakdown from '@/components/IngredientBreakdown';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface NutritionPlanDetailClientProps {
  params: Promise<{ id: string }>;
}

export default function NutritionPlanDetailClient({ params }: NutritionPlanDetailClientProps) {
  const { t } = useLanguage();
  const router = useRouter();
  const [planId, setPlanId] = useState<string>('');
  const [planData, setPlanData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeDay, setActiveDay] = useState<string>('monday');
  const [dailyTotals, setDailyTotals] = useState<any>(null);
  const [loadingTotals, setLoadingTotals] = useState(false);
  const [mealMacros, setMealMacros] = useState<{[key: string]: any}>({});
  const [loadingMealMacros, setLoadingMealMacros] = useState<{[key: string]: boolean}>({});
  
  // Shopping list state
  const [activeTab, setActiveTab] = useState<'menu' | 'shopping'>('menu');
  const [shoppingList, setShoppingList] = useState<Array<{
    name: string;
    quantity: string;
    unit: string;
    purchased: boolean;
  }>>([]);
  const [loadingShoppingList, setLoadingShoppingList] = useState(false);

  // Resolve params and fetch plan data
  useEffect(() => {
    const resolveParamsAndFetchData = async () => {
      try {
        const resolvedParams = await params;
        const id = resolvedParams.id;
        setPlanId(id);
        
        // Fetch plan data from API
        const response = await fetch(`/api/nutrition-plans/${id}`, {
          cache: 'no-store'
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch nutrition plan');
        }
        
        const data = await response.json();
        setPlanData(data);
      } catch (error) {
        console.error('Error fetching nutrition plan:', error);
        setError('Failed to load nutrition plan');
      } finally {
        setLoading(false);
      }
    };

    resolveParamsAndFetchData();
  }, [params]);

  // Improved parsing function for meal descriptions (same as IngredientBreakdown)
  const parseMealDescription = (mealDescription: string): string[] => {
    console.log('Parsing meal description:', mealDescription);
    
    // Remove cooking instructions and descriptions
    let cleaned = mealDescription
      .replace(/\. Cook.*$/i, '') // Remove "Cook pancakes and serve with yogurt + berries"
      .replace(/\. Serve.*$/i, '') // Remove serving instructions
      .replace(/\. Mix.*$/i, '') // Remove mixing instructions
      .trim();
    
    console.log('Cleaned description:', cleaned);
    
    // Handle specific patterns like "Pancakes: 60g oats, 2 eggs, 1 banana"
    if (cleaned.includes(':')) {
      const afterColon = cleaned.split(':')[1]?.trim();
      if (afterColon) {
        // Split on commas and clean up
        const ingredients = afterColon.split(',').map(ing => ing.trim()).filter(ing => ing.length > 0);
        console.log('Parsed ingredients from colon:', ingredients);
        return ingredients;
      }
    }
    
    // Handle patterns like "60g oats, 2 eggs, 1 banana" (without colon)
    if (cleaned.includes(',')) {
      const ingredients = cleaned.split(',').map(ing => ing.trim()).filter(ing => ing.length > 0);
      console.log('Parsed ingredients from comma:', ingredients);
      return ingredients;
    }
    
    // For other patterns, split on + but be more careful about context
    const parts = cleaned.split(/\s*\+\s*/);
    
    // Clean up each part
    const ingredients = parts
      .map(part => part.trim())
      .filter(part => part.length > 0);
      
    console.log('Parsed ingredients from plus:', ingredients);
    return ingredients;
  };

  // Day order for consistent display - match database format (lowercase)
  const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const dayNames = {
    monday: 'Monday',
    tuesday: 'Tuesday', 
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday'
  };

  // Meal order for consistent display
  const mealOrder = ['breakfast', 'snack', 'lunch', 'dinner'];

  // Calculate daily totals when activeDay or planData changes
  useEffect(() => {
    const calculateTotals = async () => {
      if (planData && planData.weekMenu && planData.weekMenu[activeDay]) {
        setLoadingTotals(true);
        try {
          const totals = await calculateDailyTotals(planData.weekMenu[activeDay]);
          setDailyTotals(totals);
        } catch (error) {
          console.error('Error calculating daily totals:', error);
          setDailyTotals({ calories: 0, protein: 0, carbs: 0, fat: 0 });
        } finally {
          setLoadingTotals(false);
        }
      }
    };

    calculateTotals();
  }, [activeDay, planData]);

  // Calculate meal macros when activeDay changes
  useEffect(() => {
    const calculateMealMacros = async () => {
      if (planData && planData.weekMenu && planData.weekMenu[activeDay]) {
        const dayData = planData.weekMenu[activeDay];
        const newMealMacros: {[key: string]: any} = {};
        const newLoadingState: {[key: string]: boolean} = {};
        
        for (const mealType of mealOrder) {
          if (dayData[mealType]) {
            newLoadingState[mealType] = true;
            setLoadingMealMacros(prev => ({ ...prev, [mealType]: true }));
            
            try {
              const meal = dayData[mealType];
              console.log(`🔍 Processing ${mealType}:`, meal);
              
              // Check if meal has calories in parentheses
              const extractedCalories = extractCalories(meal);
              if (extractedCalories > 0) {
                console.log(`   Using extracted calories: ${extractedCalories}`);
                newMealMacros[mealType] = {
                  calories: extractedCalories,
                  protein: Math.round(extractedCalories * 0.25 / 4),
                  carbs: Math.round(extractedCalories * 0.45 / 4),
                  fat: Math.round(extractedCalories * 0.30 / 9)
                };
              } else {
                const ingredientMacros = await calculateMealMacrosFromIngredients(meal, mealType);
                newMealMacros[mealType] = ingredientMacros;
              }
            } catch (error) {
              console.error(`Error calculating macros for ${mealType}:`, error);
              newMealMacros[mealType] = { calories: 0, protein: 0, carbs: 0, fat: 0 };
            } finally {
              newLoadingState[mealType] = false;
              setLoadingMealMacros(prev => ({ ...prev, [mealType]: false }));
            }
          }
        }
        
        setMealMacros(newMealMacros);
      }
    };

    calculateMealMacros();
  }, [activeDay, planData]);

  const handleBack = () => {
    router.push('/admin/voedingsplannen');
  };

  const handleCopy = () => {
    if (planData) {
      navigator.clipboard.writeText(JSON.stringify(planData, null, 2));
      // You could add a toast notification here
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: planData.name,
        text: planData.description,
        url: window.location.href
      });
    } else {
      // Fallback to copying URL
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleDownload = async () => {
    if (!planData) return;

    try {
      // Create a new PDF document
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPosition = 20;

      // Add title
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text(planData.name || 'Nutrition Plan', 20, yPosition);
      yPosition += 15;

      // Add description
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      const description = planData.description || 'Weekly meal plan with balanced nutrition';
      pdf.text(description, 20, yPosition);
      yPosition += 20;

      // Add nutrition summary
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Weekly Nutrition Summary', 20, yPosition);
      yPosition += 10;

      // Calculate total weekly calories
      let totalWeeklyCalories = 0;
      if (planData.days) {
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        days.forEach(day => {
          const dayData = planData.days[day];
          if (dayData) {
            const mealOrder = ['breakfast', 'snack', 'lunch', 'dinner'];
            mealOrder.forEach(mealType => {
              const meal = dayData[mealType];
              if (meal && meal.calories) {
                totalWeeklyCalories += meal.calories;
              }
            });
          }
        });
      }

      // Add macro cards with calculated values
      const macroData = [
        { label: 'Total Calories', value: totalWeeklyCalories, color: [255, 165, 0] },
        { label: 'Daily Average', value: Math.round(totalWeeklyCalories / 7), color: [0, 123, 255] },
        { label: 'Protein', value: `${planData.protein || 0}g`, color: [40, 167, 69] },
        { label: 'Fat', value: `${planData.fat || 0}g`, color: [108, 117, 125] }
      ];

      macroData.forEach((macro, index) => {
        const x = 20 + (index * 45);
        const y = yPosition;
        
        // Draw box
        pdf.setFillColor(macro.color[0], macro.color[1], macro.color[2]);
        pdf.rect(x, y, 40, 25, 'F');
        
        // Add text
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        pdf.text(macro.label, x + 2, y + 8);
        
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text(macro.value.toString(), x + 2, y + 18);
      });

      yPosition += 40;

      // Add daily meal plans
      if (planData.days) {
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        
        days.forEach((day, dayIndex) => {
          const dayData = planData.days[day];
          if (!dayData) return;

          // Check if we need a new page
          if (yPosition > pageHeight - 80) {
            pdf.addPage();
            yPosition = 20;
          }

          // Add day header with total calories
          pdf.setFontSize(16);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(0, 0, 0);
          const dayName = day.charAt(0).toUpperCase() + day.slice(1);
          
          // Calculate total daily calories
          let totalDailyCalories = 0;
          const mealOrder = ['breakfast', 'snack', 'lunch', 'dinner'];
          mealOrder.forEach(mealType => {
            const meal = dayData[mealType];
            if (meal && meal.calories) {
              totalDailyCalories += meal.calories;
            }
          });

          pdf.text(`${dayName} - ${totalDailyCalories} kcal`, 20, yPosition);
          yPosition += 10;

          // Add meals with individual calories
          mealOrder.forEach(mealType => {
            const meal = dayData[mealType];
            if (!meal) return;

            // Check if we need a new page
            if (yPosition > pageHeight - 30) {
              pdf.addPage();
              yPosition = 20;
            }

            // Add meal with calories
            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'bold');
            const mealCalories = meal.calories || 0;
            const mealName = mealType.charAt(0).toUpperCase() + mealType.slice(1);
            pdf.text(`${mealName} - ${mealCalories} kcal`, 25, yPosition);
            yPosition += 6;

            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'normal');
            const description = meal.description || '';
            const lines = pdf.splitTextToSize(description, pageWidth - 50);
            lines.forEach((line: string) => {
              if (yPosition > pageHeight - 20) {
                pdf.addPage();
                yPosition = 20;
              }
              pdf.text(line, 30, yPosition);
              yPosition += 5;
            });
            yPosition += 5;
          });
          yPosition += 10;
        });
      }

      // Add shopping list if available
      if (shoppingList.length > 0) {
        // Check if we need a new page
        if (yPosition > pageHeight - 40) {
          pdf.addPage();
          yPosition = 20;
        }

        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Shopping List', 20, yPosition);
        yPosition += 10;

        shoppingList.forEach(item => {
          if (yPosition > pageHeight - 20) {
            pdf.addPage();
            yPosition = 20;
          }

          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');
          const itemText = `• ${item.name}: ${item.quantity}${item.unit}`;
          pdf.text(itemText, 25, yPosition);
          yPosition += 6;
        });
      }

      // Save the PDF
      pdf.save(`${planData.name || 'nutrition-plan'}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  // Function to extract calories from meal description
  const extractCalories = (mealDescription: string): number => {
    const match = mealDescription.match(/\((\d+)\s*cal\)/);
    return match ? parseInt(match[1]) : 0;
  };

  // Function to get predefined macros for Georgiana's meals
  const getPredefinedMealMacros = (mealDescription: string, mealType: string, currentDay: string): { calories: number; protein: number; carbs: number; fat: number } => {
    // Define the exact macros for each meal based on the provided data
    const mealMacros: { [key: string]: { [key: string]: { calories: number; protein: number; carbs: number; fat: number } } } = {
      monday: {
        breakfast: { calories: 280, protein: 22, carbs: 30, fat: 8 },
        lunch: { calories: 450, protein: 40, carbs: 50, fat: 12 },
        snack: { calories: 200, protein: 15, carbs: 20, fat: 8 },
        dinner: { calories: 470, protein: 45, carbs: 35, fat: 15 }
      },
      tuesday: {
        breakfast: { calories: 360, protein: 22, carbs: 45, fat: 10 },
        lunch: { calories: 480, protein: 42, carbs: 55, fat: 12 },
        snack: { calories: 220, protein: 20, carbs: 22, fat: 5 },
        dinner: { calories: 470, protein: 42, carbs: 40, fat: 15 }
      },
      wednesday: {
        breakfast: { calories: 300, protein: 12, carbs: 50, fat: 6 },
        lunch: { calories: 480, protein: 42, carbs: 50, fat: 13 },
        snack: { calories: 200, protein: 14, carbs: 15, fat: 10 },
        dinner: { calories: 470, protein: 42, carbs: 40, fat: 14 }
      },
      thursday: {
        breakfast: { calories: 340, protein: 22, carbs: 42, fat: 8 },
        lunch: { calories: 460, protein: 42, carbs: 45, fat: 12 },
        snack: { calories: 250, protein: 18, carbs: 12, fat: 13 },
        dinner: { calories: 470, protein: 42, carbs: 40, fat: 13 }
      },
      friday: {
        breakfast: { calories: 280, protein: 24, carbs: 18, fat: 9 },
        lunch: { calories: 450, protein: 42, carbs: 50, fat: 12 },
        snack: { calories: 250, protein: 20, carbs: 30, fat: 9 },
        dinner: { calories: 470, protein: 42, carbs: 40, fat: 11 }
      },
      saturday: {
        breakfast: { calories: 340, protein: 22, carbs: 42, fat: 9 },
        lunch: { calories: 450, protein: 42, carbs: 45, fat: 10 },
        snack: { calories: 230, protein: 18, carbs: 15, fat: 10 },
        dinner: { calories: 470, protein: 45, carbs: 38, fat: 14 }
      },
      sunday: {
        breakfast: { calories: 300, protein: 16, carbs: 40, fat: 7 },
        lunch: { calories: 460, protein: 42, carbs: 50, fat: 12 },
        snack: { calories: 250, protein: 16, carbs: 5, fat: 18 },
        dinner: { calories: 460, protein: 42, carbs: 40, fat: 10 }
      }
    };

    // Get the current day
    const dayKey = currentDay.toLowerCase();
    const dayMacros = mealMacros[dayKey];
    
    if (dayMacros && dayMacros[mealType]) {
      return dayMacros[mealType];
    }

    // Fallback to estimation if not found
    return { calories: 0, protein: 0, carbs: 0, fat: 0 };
  };

  // Function to calculate macros from ingredients using the API
  const calculateMealMacrosFromIngredients = async (mealDescription: string, mealType: string): Promise<{ calories: number; protein: number; carbs: number; fat: number }> => {
    try {
      // First try to get predefined macros
      const predefinedMacros = getPredefinedMealMacros(mealDescription, mealType, selectedDay);
      if (predefinedMacros.calories > 0) {
        console.log('✅ Using predefined macros:', predefinedMacros);
        return predefinedMacros;
      }

      console.log('🔍 Calculating macros for meal:', mealDescription);
      
      // Use the same improved parsing logic as IngredientBreakdown component
      const ingredients = parseMealDescription(mealDescription);
      
      // Call API to calculate macros
      const response = await fetch('/api/calculate-macros', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ingredients }),
      });

      if (!response.ok) {
        throw new Error('Failed to calculate macros');
      }

      const data = await response.json();
      const results = data.results;

      // Calculate total macros
      const total = results.reduce((acc: any, result: any) => ({
        calories: acc.calories + (result.macros.calories || 0),
        protein: acc.protein + (result.macros.protein || 0),
        carbs: acc.carbs + (result.macros.carbs || 0),
        fat: acc.fat + (result.macros.fat || 0)
      }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

      // Round to whole numbers
      const roundedTotal = {
        calories: Math.round(total.calories),
        protein: Math.round(total.protein),
        carbs: Math.round(total.carbs),
        fat: Math.round(total.fat)
      };

      console.log('✅ Calculated macros:', roundedTotal);
      return roundedTotal;
    } catch (error) {
      console.error('❌ Error calculating meal macros:', error);
      return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    }
  };

  // Function to estimate calories based on meal content
  const estimateMealCalories = (mealDescription: string, mealType: string): number => {
    // Base calories by meal type
    const baseCalories = {
      breakfast: 400,
      snack: 200,
      lunch: 500,
      dinner: 600
    };

    let estimatedCalories = baseCalories[mealType as keyof typeof baseCalories] || 300;

    // Adjust based on content keywords
    const content = mealDescription.toLowerCase();
    
    // High calorie indicators
    if (content.includes('oats') || content.includes('pancakes')) estimatedCalories += 100;
    if (content.includes('rice') || content.includes('pasta')) estimatedCalories += 150;
    if (content.includes('sweet potato') || content.includes('potato')) estimatedCalories += 100;
    if (content.includes('nuts') || content.includes('walnuts')) estimatedCalories += 200;
    if (content.includes('cheese') || content.includes('dairy')) estimatedCalories += 100;
    if (content.includes('beef') || content.includes('steak')) estimatedCalories += 150;
    if (content.includes('salmon') || content.includes('fish')) estimatedCalories += 100;
    
    // Low calorie indicators
    if (content.includes('salad') || content.includes('vegetables')) estimatedCalories -= 50;
    if (content.includes('cucumber') || content.includes('lettuce')) estimatedCalories -= 30;

    return Math.max(estimatedCalories, 100); // Minimum 100 calories
  };

  // Function to calculate daily totals
  const calculateDailyTotals = async (dayData: any): Promise<{ calories: number; protein: number; carbs: number; fat: number }> => {
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    console.log('🔍 Calculating daily totals for:', activeDay);
    console.log('📊 Day data:', dayData);

    for (const mealType of mealOrder) {
      if (dayData[mealType]) {
        const meal = dayData[mealType];
        console.log(`🍽️ Processing ${mealType}:`, meal);
        
        // Check if meal has calories in parentheses
        const extractedCalories = extractCalories(meal);
        if (extractedCalories > 0) {
          console.log(`   Using extracted calories: ${extractedCalories}`);
          totalCalories += extractedCalories;
          totalProtein += Math.round(extractedCalories * 0.25 / 4);
          totalCarbs += Math.round(extractedCalories * 0.45 / 4);
          totalFat += Math.round(extractedCalories * 0.30 / 9);
        } else {
          // Use ingredient database for accurate calculation
          try {
            console.log(`   Calculating macros from ingredients for ${mealType}...`);
            const macros = await calculateMealMacrosFromIngredients(meal, mealType);
            console.log(`   Calculated macros:`, macros);
            totalCalories += macros.calories;
            totalProtein += macros.protein;
            totalCarbs += macros.carbs;
            totalFat += macros.fat;
          } catch (error) {
            console.error(`Error calculating macros for ${mealType}:`, error);
            // Fallback to estimation
            const estimatedCalories = estimateMealCalories(meal, mealType);
            totalCalories += estimatedCalories;
            totalProtein += Math.round(estimatedCalories * 0.25 / 4);
            totalCarbs += Math.round(estimatedCalories * 0.45 / 4);
            totalFat += Math.round(estimatedCalories * 0.30 / 9);
          }
        }
      }
    }

    const totals = {
      calories: Math.round(totalCalories),
      protein: Math.round(totalProtein),
      carbs: Math.round(totalCarbs),
      fat: Math.round(totalFat)
    };

    console.log('✅ Daily totals calculated:', totals);
    return totals;
  };

  const getMealIcon = (mealType: string) => {
    switch (mealType) {
      case 'breakfast': return '🌅';
      case 'snack': return '🍎';
      case 'lunch': return '🍽️';
      case 'dinner': return '🌙';
      default: return '🍽️';
    }
  };

  // Function to extract and aggregate ingredients from weekly menu
  const generateShoppingList = async () => {
    if (!planData?.weekMenu) return;

    setLoadingShoppingList(true);
    
    try {
      const ingredientMap = new Map<string, { quantity: number; unit: string; name: string }>();
      
      // Process each day and meal
      Object.values(planData.weekMenu).forEach((dayMenu: any) => {
        Object.values(dayMenu).forEach((meal: string) => {
          const ingredients = parseMealDescription(meal);
          
          ingredients.forEach(ingredient => {
            // Parse ingredient (e.g., "120g chicken" -> quantity: 120, unit: "g", name: "chicken")
            const match = ingredient.match(/^(\d+(?:\.\d+)?)\s*([a-zA-Z]+)\s+(.+)$/);
            if (match) {
              const [, quantityStr, unit, name] = match;
              const quantity = parseFloat(quantityStr);
              const normalizedName = name.toLowerCase().trim();
              
              if (ingredientMap.has(normalizedName)) {
                const existing = ingredientMap.get(normalizedName)!;
                existing.quantity += quantity;
              } else {
                ingredientMap.set(normalizedName, {
                  quantity,
                  unit,
                  name: name.trim()
                });
              }
            }
          });
        });
      });
      
      // Convert to array and sort
      const shoppingList = Array.from(ingredientMap.values())
        .map(item => ({
          name: item.name,
          quantity: item.quantity.toString(),
          unit: item.unit,
          purchased: false
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
      
      setShoppingList(shoppingList);
    } catch (error) {
      console.error('Error generating shopping list:', error);
    } finally {
      setLoadingShoppingList(false);
    }
  };

  // Function to toggle purchased status
  const togglePurchased = (index: number) => {
    setShoppingList(prev => prev.map((item, i) => 
      i === index ? { ...item, purchased: !item.purchased } : item
    ));
  };

  // Function to copy shopping list to clipboard
  const copyShoppingList = () => {
    const listText = shoppingList
      .map(item => `- ${item.quantity}${item.unit} ${item.name}`)
      .join('\n');
    
    navigator.clipboard.writeText(listText).then(() => {
      alert('Shopping list copied to clipboard!');
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading nutrition plan...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !planData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-800 mb-4">Plan Not Found</h1>
              <p className="text-gray-600">{error || 'The nutrition plan you\'re looking for doesn\'t exist.'}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
              <button
                onClick={handleBack}
                className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-gray-600" />
              </button>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-800 break-words">{planData.name}</h1>
                <p className="text-xs sm:text-sm lg:text-base text-gray-600 mt-1 break-words">{planData.description}</p>
              </div>
            </div>
            <div className="flex gap-1 sm:gap-2">
              <button
                onClick={handleCopy}
                className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Copy Plan Data"
              >
                <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-gray-600" />
              </button>
              <button
                onClick={handleShare}
                className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Share Plan"
              >
                <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-gray-600" />
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors text-sm font-medium"
                title="Download PDF"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </button>
            </div>
          </div>
        </div>

        {/* Plan Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">
          <div className="bg-white rounded-lg sm:rounded-xl lg:rounded-2xl p-2 sm:p-3 lg:p-6 shadow-sm">
            <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3 mb-1.5 sm:mb-2 lg:mb-4">
              <div className="p-1 sm:p-1.5 lg:p-2 bg-orange-100 rounded-lg">
                <Apple className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-6 lg:h-6 text-orange-600" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-xs sm:text-sm font-semibold text-gray-800">Calories</h3>
                <p className="text-sm sm:text-lg lg:text-2xl font-bold text-orange-600">{planData.calories}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg sm:rounded-xl lg:rounded-2xl p-2 sm:p-3 lg:p-6 shadow-sm">
            <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3 mb-1.5 sm:mb-2 lg:mb-4">
              <div className="p-1 sm:p-1.5 lg:p-2 bg-blue-100 rounded-lg">
                <Scale className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-6 lg:h-6 text-blue-600" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-xs sm:text-sm font-semibold text-gray-800">Protein</h3>
                <p className="text-sm sm:text-lg lg:text-2xl font-bold text-blue-600">{planData.protein}g</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg sm:rounded-xl lg:rounded-2xl p-2 sm:p-3 lg:p-6 shadow-sm">
            <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3 mb-1.5 sm:mb-2 lg:mb-4">
              <div className="p-1 sm:p-1.5 lg:p-2 bg-green-100 rounded-lg">
                <Utensils className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-6 lg:h-6 text-green-600" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-xs sm:text-sm font-semibold text-gray-800">Carbs</h3>
                <p className="text-sm sm:text-lg lg:text-2xl font-bold text-green-600">{planData.carbs}g</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg sm:rounded-xl lg:rounded-2xl p-2 sm:p-3 lg:p-6 shadow-sm">
            <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3 mb-1.5 sm:mb-2 lg:mb-4">
              <div className="p-1 sm:p-1.5 lg:p-2 bg-purple-100 rounded-lg">
                <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-6 lg:h-6 text-purple-600" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-xs sm:text-sm font-semibold text-gray-800">Fat</h3>
                <p className="text-sm sm:text-lg lg:text-2xl font-bold text-purple-600">{planData.fat}g</p>
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Menu Schedule */}
        <div className="bg-white rounded-lg sm:rounded-xl lg:rounded-2xl shadow-sm p-3 sm:p-4 lg:p-6 xl:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 lg:mb-6">
            <h2 className="text-base sm:text-lg lg:text-xl font-bold text-gray-800">Weekly Menu Schedule</h2>
            
            {/* Main Tabs */}
            <div className="flex gap-1 mt-2 sm:mt-0">
              <button
                onClick={() => setActiveTab('menu')}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'menu'
                    ? 'bg-rose-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                📅 Menu
              </button>
              <button
                onClick={() => {
                  setActiveTab('shopping');
                  if (shoppingList.length === 0) {
                    generateShoppingList();
                  }
                }}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'shopping'
                    ? 'bg-rose-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                🛒 Shopping List
              </button>
            </div>
          </div>
          
          {/* Content based on active tab */}
          {activeTab === 'menu' ? (
            <>
          {/* Day Tabs */}
          <div className="mb-3 sm:mb-4 lg:mb-6">
            <div className="flex gap-1 sm:gap-2 border-b border-gray-200 overflow-x-auto pb-1">
              {planData.weekMenu && dayOrder.filter(day => planData.weekMenu[day]).map((dayKey) => (
                <button
                  key={dayKey}
                  onClick={() => setActiveDay(dayKey)}
                  className={`px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap flex-shrink-0 ${
                    activeDay === dayKey
                      ? 'bg-rose-500 text-white border-b-2 border-rose-500'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {dayNames[dayKey as keyof typeof dayNames]}
                </button>
              ))}
            </div>
          </div>

          {/* Daily Menu Table */}
          {planData.weekMenu && planData.weekMenu[activeDay] && (
            <div className="space-y-6">
              {/* Daily Totals Header */}
              <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6 border border-rose-200">
                <h3 className="text-sm sm:text-base lg:text-lg font-bold text-gray-800 mb-2 sm:mb-3 lg:mb-4 text-center">
                  {dayNames[activeDay as keyof typeof dayNames]} - Daily Overview
                </h3>
                {loadingTotals ? (
                  <div className="flex items-center justify-center py-4 sm:py-6 lg:py-8">
                    <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 border-b-2 border-rose-500"></div>
                    <span className="ml-2 text-xs sm:text-sm lg:text-base text-gray-600">Calculating totals...</span>
                  </div>
                ) : dailyTotals ? (
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
                    <div className="text-center">
                      <div className="text-sm sm:text-lg lg:text-2xl font-bold text-orange-600">{dailyTotals.calories}</div>
                      <div className="text-xs sm:text-sm text-gray-600">Calories</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm sm:text-lg lg:text-2xl font-bold text-blue-600">{dailyTotals.protein}g</div>
                      <div className="text-xs sm:text-sm text-gray-600">Protein</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm sm:text-lg lg:text-2xl font-bold text-green-600">{dailyTotals.carbs}g</div>
                      <div className="text-xs sm:text-sm text-gray-600">Carbs</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm sm:text-lg lg:text-2xl font-bold text-purple-600">{dailyTotals.fat}g</div>
                      <div className="text-xs sm:text-sm text-gray-600">Fat</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-xs sm:text-sm lg:text-base text-gray-500">No data available</div>
                )}
              </div>

              {/* Meals Table */}
              <div className="overflow-x-auto -mx-2 sm:-mx-4 lg:mx-0">
                <table className="w-full text-xs sm:text-sm min-w-[500px] sm:min-w-[600px]">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-1 sm:px-2 lg:px-3 py-2 sm:py-3 lg:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Meal
                      </th>
                      <th className="px-1 sm:px-2 lg:px-3 py-2 sm:py-3 lg:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-1 sm:px-2 py-2 sm:py-3 lg:py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Calories
                      </th>
                      <th className="px-1 sm:px-2 py-2 sm:py-3 lg:py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Protein
                      </th>
                      <th className="px-1 sm:px-2 py-2 sm:py-3 lg:py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Carbs
                      </th>
                      <th className="px-1 sm:px-2 py-2 sm:py-3 lg:py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fat
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {mealOrder.filter(mealType => planData.weekMenu[activeDay][mealType]).map((mealType) => {
                      const meal = planData.weekMenu[activeDay][mealType];
                      const macros = mealMacros[mealType] || { calories: 0, protein: 0, carbs: 0, fat: 0 };
                      const isLoading = loadingMealMacros[mealType] || false;
                      
                      return (
                        <tr key={mealType} className="hover:bg-gray-50">
                          <td className="px-1 sm:px-2 lg:px-3 py-2 sm:py-3 lg:py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <span className="text-sm sm:text-lg lg:text-xl mr-1 sm:mr-2">{getMealIcon(mealType)}</span>
                              <div>
                                <div className="text-xs sm:text-sm font-medium text-gray-900">
                                  {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-1 sm:px-2 lg:px-3 py-2 sm:py-3 lg:py-4">
                            <div className="text-xs sm:text-sm text-gray-900 max-w-[200px] sm:max-w-xs lg:max-w-md break-words">
                              {meal}
                            </div>
                          </td>
                          <td className="px-1 sm:px-2 py-2 sm:py-3 lg:py-4 whitespace-nowrap text-center">
                            {isLoading ? (
                              <div className="animate-pulse bg-gray-200 h-3 sm:h-4 lg:h-5 w-6 sm:w-8 lg:w-12 rounded mx-auto"></div>
                            ) : (
                              <span className="inline-flex items-center px-1 sm:px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                {macros.calories}
                              </span>
                            )}
                          </td>
                          <td className="px-1 sm:px-2 py-2 sm:py-3 lg:py-4 whitespace-nowrap text-center">
                            {isLoading ? (
                              <div className="animate-pulse bg-gray-200 h-3 sm:h-4 lg:h-5 w-5 sm:w-6 lg:w-10 rounded mx-auto"></div>
                            ) : (
                              <span className="inline-flex items-center px-1 sm:px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {macros.protein}g
                              </span>
                            )}
                          </td>
                          <td className="px-1 sm:px-2 py-2 sm:py-3 lg:py-4 whitespace-nowrap text-center">
                            {isLoading ? (
                              <div className="animate-pulse bg-gray-200 h-3 sm:h-4 lg:h-5 w-5 sm:w-6 lg:w-10 rounded mx-auto"></div>
                            ) : (
                              <span className="inline-flex items-center px-1 sm:px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                {macros.carbs}g
                              </span>
                            )}
                          </td>
                          <td className="px-1 sm:px-2 py-2 sm:py-3 lg:py-4 whitespace-nowrap text-center">
                            {isLoading ? (
                              <div className="animate-pulse bg-gray-200 h-3 sm:h-4 lg:h-5 w-5 sm:w-6 lg:w-10 rounded mx-auto"></div>
                            ) : (
                              <span className="inline-flex items-center px-1 sm:px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                {macros.fat}g
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Ingredient Breakdown */}
              {planData.weekMenu[activeDay] && (
                <div className="mt-4 sm:mt-6 lg:mt-8">
                  {mealOrder.filter(mealType => planData.weekMenu[activeDay][mealType]).map((mealType) => {
                    const meal = planData.weekMenu[activeDay][mealType];
                    return (
                      <IngredientBreakdown
                        key={mealType}
                        mealDescription={meal}
                        mealType={mealType.charAt(0).toUpperCase() + mealType.slice(1)}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          )}
            </>
          ) : (
            /* Shopping List Content */
            <div className="space-y-6">
              {/* Shopping List Header */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6 border border-green-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-sm sm:text-base lg:text-lg font-bold text-gray-800 mb-2">
                      🛒 Shopping List
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600">
                      All ingredients needed for this weekly meal plan
                    </p>
                  </div>
                  <div className="flex gap-2 mt-2 sm:mt-0">
                    <button
                      onClick={copyShoppingList}
                      className="px-3 py-2 bg-green-500 text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-green-600 transition-colors"
                    >
                      📋 Copy List
                    </button>
                    <button
                      onClick={generateShoppingList}
                      className="px-3 py-2 bg-gray-500 text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      🔄 Regenerate
                    </button>
                  </div>
                </div>
              </div>

              {/* Shopping List Items */}
              {loadingShoppingList ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                  <span className="ml-3 text-sm text-gray-600">Generating shopping list...</span>
                </div>
              ) : shoppingList.length > 0 ? (
                <div className="space-y-3">
                  {shoppingList.map((item, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-3 sm:p-4 bg-white rounded-lg border-2 transition-all duration-200 ${
                        item.purchased
                          ? 'border-green-200 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => togglePurchased(index)}
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                            item.purchased
                              ? 'bg-green-500 border-green-500 text-white'
                              : 'border-gray-300 hover:border-green-400'
                          }`}
                        >
                          {item.purchased && '✓'}
                        </button>
                        <div className="flex-1">
                          <div className={`text-sm sm:text-base font-medium ${
                            item.purchased ? 'text-gray-500 line-through' : 'text-gray-800'
                          }`}>
                            {item.name}
                          </div>
                          <div className="text-xs sm:text-sm text-gray-500">
                            {item.quantity}{item.unit}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Summary */}
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">
                        Total items: {shoppingList.length}
                      </span>
                      <span className="text-gray-600">
                        Purchased: {shoppingList.filter(item => item.purchased).length}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-4xl mb-4">🛒</div>
                  <p className="text-gray-500">No shopping list generated yet</p>
                  <button
                    onClick={generateShoppingList}
                    className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    Generate Shopping List
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
