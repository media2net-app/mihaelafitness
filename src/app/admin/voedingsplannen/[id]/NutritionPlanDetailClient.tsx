'use client';

import { calculateDailyTotalsV2 } from '@/utils/dailyTotalsV2';
import { calculateDailyTotalsV3 } from '@/utils/dailyTotalsV3';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { FiArrowLeft, FiHeart, FiCoffee, FiActivity, FiClock, FiUsers, FiCalendar, FiCopy, FiShare2, FiDownload, FiEye, FiSunrise, FiMoon } from 'react-icons/fi';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRouter } from 'next/navigation';
import IngredientBreakdown from '@/components/IngredientBreakdown';
import IngredientSelector from '@/components/IngredientSelector';
import CookingInstructions from '@/components/CookingInstructions';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface NutritionPlanDetailClientProps {
  params: { id: string };
}

interface Ingredient {
  id: string;
  name: string;
  per: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  category?: string;
  aliases: string[];
}

export default function NutritionPlanDetailClient({ params }: NutritionPlanDetailClientProps) {
  const { t } = useLanguage();
  const router = useRouter();
  const [planData, setPlanData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // PDF preview modal
  const [pdfPreviewOpen, setPdfPreviewOpen] = useState(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [activeDay, setActiveDay] = useState<string>('monday');
  
  // PDF generation progress modal
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [pdfProgress, setPdfProgress] = useState<string[]>([]);
  const [planId, setPlanId] = useState<string>('');
  const [dailyTotals, setDailyTotals] = useState<any>(null);
  const [mealMacros, setMealMacros] = useState<{[key: string]: any}>({});
  const [forceTableUpdate, setForceTableUpdate] = useState(0);
  
  // Shopping list state
  const [activeTab, setActiveTab] = useState<'menu' | 'shopping' | 'ingredients'>('menu');
  const [shoppingList, setShoppingList] = useState<Array<{
    name: string;
    quantity: number | string;
    unit: string;
    purchased?: boolean;
  }>>([]);
  const [loadingShoppingList, setLoadingShoppingList] = useState(false);
  
  
  // Ingredients analysis state
  const [ingredientsAnalysis, setIngredientsAnalysis] = useState<any>(null);
  const [loadingIngredients, setLoadingIngredients] = useState(false);

  // ChatGPT input modal state

  const overviewRef = useRef<HTMLDivElement | null>(null);
  const progressLogRef = useRef<HTMLDivElement | null>(null);
  const templatesCacheRef = useRef<any[] | null>(null); // Cache templates to avoid reloading
  const [showSticky, setShowSticky] = useState(false);
  const [assignedCustomer, setAssignedCustomer] = useState<{ id: string; name: string } | null>(null);
  const [trainingWeekdays, setTrainingWeekdays] = useState<number[]>([]); // 1=Mon .. 7=Sun
  
  // Auto-scroll progress log to bottom
  useEffect(() => {
    if (progressLogRef.current) {
      progressLogRef.current.scrollTop = progressLogRef.current.scrollHeight;
    }
  }, [pdfProgress]);

  // Function to fetch plan data
  const fetchPlanData = async (id: string) => {
    try {
      setLoading(true);
      const url = `/api/nutrition-plans/${id}`;
      const response = await fetch(url);
      if (!response.ok) {
        let bodyText = '';
        try { bodyText = await response.text(); } catch {}
        console.error('[NutritionPlanDetailClient] fetch error body:', bodyText);
        setError(`Failed to load nutrition plan (${response.status})`);
        setLoading(false);
        return;
      }
      const data = await response.json();
      setPlanData(data);
      // Also try to load assigned customer for this plan
      try {
        const r = await fetch(`/api/nutrition-plans/${id}/customer`);
        if (r.ok) {
          const cj = await r.json();
          if (cj?.customer) {
            setAssignedCustomer({ id: cj.customer.id, name: cj.customer.name || 'Customer' });
          }
        }
      } catch {}
    } catch (error) {
      console.error('[NutritionPlanDetailClient] exception while fetching plan:', error);
      setError('Failed to load nutrition plan');
    } finally {
      setLoading(false);
    }
  };

  const dayKeyToWeekday = (key: string): number => {
    const map: Record<string, number> = { monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6, sunday: 7 };
    return map[key] || 0;
  };

  // Resolve params and fetch plan data
  const extractId = async (p: any): Promise<string | undefined> => {
    try {
      if (!p) return undefined;
      // Plain object { id }
      if (typeof p === 'object' && typeof p.id === 'string') return p.id;
      // ReactPromise-like with a JSON value string
      if (typeof p?.value === 'string') {
        try { const obj = JSON.parse(p.value); if (obj?.id) return obj.id; } catch {}
      }
      // Thenable (Promise)
      if (typeof p?.then === 'function') {
        const r = await p;
        if (r?.id) return r.id;
        if (typeof r === 'string') {
          try { const obj = JSON.parse(r); if (obj?.id) return obj.id; } catch {}
        }
      }
    } catch {}
    return undefined;
  };

  // Small UI pill helper (like Tailwind badges)
  const drawPill = (pdf: jsPDF, x: number, y: number, text: string, bg: [number, number, number], fg: [number, number, number]) => {
    const padX = 2.2;
    const padY = 1.5;
    pdf.setFontSize(8);
    const w = pdf.getTextWidth(text) + padX * 2;
    const h = 5; // approximate height
    pdf.setFillColor(bg[0], bg[1], bg[2]);
    pdf.roundedRect(x, y - h + 4.5, w, h, 2, 2, 'F');
    pdf.setTextColor(fg[0], fg[1], fg[2]);
    pdf.text(text, x + padX, y);
    // reset text color to dark
    pdf.setTextColor(33);
    return w;
  };

  // Generate a dataURL for the homepage gradient and paint it as page background
  const createGradientDataUrl = async (wPx: number, hPx: number): Promise<string> => {
    const canvas = document.createElement('canvas');
    canvas.width = wPx;
    canvas.height = hPx;
    const ctx = canvas.getContext('2d')!;
    // Gradient direction: to bottom-right like homepage
    const grad = ctx.createLinearGradient(0, 0, wPx, hPx);
    // Using tailwind-ish colors similar to homepage gradient
    grad.addColorStop(0, '#ffe4ec'); // rose tint
    grad.addColorStop(0.5, '#ffc4e0'); // pink tint
    grad.addColorStop(1, '#e6d8ff'); // purple tint
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, wPx, hPx);
    return canvas.toDataURL('image/png');
  };

  const paintGradientBackground = async (pdf: jsPDF) => {
    const w = pdf.internal.pageSize.getWidth();
    const h = pdf.internal.pageSize.getHeight();
    // Use a fixed pixel width for crispness and scale by aspect
    const targetPxW = 1200;
    const aspect = h / w;
    const targetPxH = Math.round(targetPxW * aspect);
    const dataUrl = await createGradientDataUrl(targetPxW, targetPxH);
    console.log('[PDF] Painting gradient background', { w, h, targetPxW, targetPxH });
    pdf.addImage(dataUrl, 'PNG', 0, 0, w, h);
  };

  // Load hero woman image (transparent PNG) from public
  const loadHeroDataUrl = async (): Promise<string | null> => {
    try {
      const url = '/media/mihaela-vrijstaand.png';
      const res = await fetch(url);
      if (!res.ok) return null;
      const blob = await res.blob();
      return await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => resolve('');
        reader.readAsDataURL(blob);
      });
    } catch { return null; }
  };

  // Cache hero once loaded
  // Hero image removed - no longer showing Mihaela image in PDF
  let cachedHeroDataUrl: string | null = null;
  const drawHeroBottomRight = async (pdf: jsPDF) => {
    // Function disabled - hero image removed from PDF
    return;
  };

  // After all pages are drawn and footer added, overlay hero on each page
  const overlayHeroOnAllPages = async (pdf: jsPDF) => {
    const total = pdf.getNumberOfPages();
    for (let i = 1; i <= total; i++) {
      pdf.setPage(i);
      await drawHeroBottomRight(pdf);
    }
  };

  useEffect(() => {
    const run = async () => {
      try {
        const id = await extractId(params as any);
        if (!id) {
          setError('Plan Not Found');
          setLoading(false);
          return;
        }
        setPlanId(id);
        await fetchPlanData(id);
      } catch (error) {
        console.error('[NutritionPlanDetailClient] exception while fetching plan:', error);
        setError('Failed to load nutrition plan');
      }
    };
    run();
  }, [params?.id]);

  // When assigned customer is known, fetch training weekdays once
  useEffect(() => {
    const loadWeekdays = async () => {
      if (!assignedCustomer?.id) return;
      try {
        const r = await fetch(`/api/customers/${assignedCustomer.id}/schedule-assignments`);
        if (r.ok) {
          const arr = await r.json();
          const days = Array.isArray(arr) ? arr.map((a: any) => Number(a.weekday)).filter((n: number) => Number.isFinite(n)) : [];
          setTrainingWeekdays(days);
        }
      } catch {}
    };
    loadWeekdays();
  }, [assignedCustomer?.id]);

  // Cleanup preview URL when closing or changing
  useEffect(() => {
    return () => {
      if (pdfPreviewUrl && pdfPreviewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(pdfPreviewUrl);
      }
    };
  }, [pdfPreviewUrl]);
  // New function to get ingredient data using the same API as the web page
  const getIngredientDataFromAPI = async (mealDescription: string) => {
    try {
      if (!mealDescription || mealDescription.trim() === '') {
        return [];
      }

      // Check if meal is JSON string (new format) - use directly
      if (mealDescription.startsWith('[') && mealDescription.endsWith(']')) {
        try {
          const jsonIngredients = JSON.parse(mealDescription);
          if (Array.isArray(jsonIngredients)) {
            return jsonIngredients.map((ingredient: any) => {
              const quantity = ingredient.quantity || 0;
              const per = ingredient.per || '100g';
              
              // Parse the per field to get the base amount
              let baseAmount = 100;
              let multiplier = 1;
              
              if (per === '100g') {
                baseAmount = 100;
                multiplier = quantity / baseAmount;
              } else if (per === '100ml') {
                baseAmount = 100;
                multiplier = quantity / baseAmount;
              } else if (per === '1') {
                multiplier = 1;
              } else {
                const perMatch = per.match(/(\d+(?:\.\d+)?)/);
                if (perMatch) {
                  baseAmount = parseFloat(perMatch[1]);
                  multiplier = quantity / baseAmount;
                } else {
                  baseAmount = 100;
                  multiplier = quantity / baseAmount;
                }
              }
              
              const calculatedMacros = {
                calories: Math.round((ingredient.calories || 0) * multiplier),
                protein: Math.round((ingredient.protein || 0) * multiplier),
                carbs: Math.round((ingredient.carbs || 0) * multiplier),
                fat: Math.round((ingredient.fat || 0) * multiplier),
                fiber: Math.round((ingredient.fiber || 0) * multiplier)
              };
              
              // Create portion string
              let portion = '';
              if (ingredient.unit === 'g' || ingredient.unit === 'ml') {
                portion = `${quantity}${ingredient.unit}`;
              } else if (ingredient.unit === 'tsp' || ingredient.unit === 'tbsp') {
                portion = `${quantity} ${ingredient.unit}`;
              } else if (ingredient.unit === 'slice') {
                portion = `${quantity} slice${quantity !== 1 ? 's' : ''}`;
              } else {
                portion = `${quantity} ${ingredient.unit}`;
              }
              
              return {
                name: ingredient.name,
                portion: portion,
                calories: calculatedMacros.calories,
                protein: calculatedMacros.protein,
                carbs: calculatedMacros.carbs,
                fat: calculatedMacros.fat,
                fiber: calculatedMacros.fiber
              };
            });
          }
        } catch (error) {
          console.log('Failed to parse JSON meal:', mealDescription);
        }
      }

      // Fallback to string parsing and API call
      const ingredients = parseMealDescription(mealDescription);
      
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

      // Process results with the same logic as IngredientBreakdown
      const ingredientResults = results.map((result: any) => {
        // Extract clean ingredient name (remove quantities and IDs)
        let cleanName = result.ingredient;
        
        // Remove DB id pipes if present (e.g., "cmg123|Milk" -> "Milk")
        if (cleanName.includes('|')) {
          const parts = cleanName.split('|');
          cleanName = parts[parts.length - 1].trim();
        }
        
        // Remove common quantity patterns
        cleanName = cleanName
          .replace(/^\d+(?:\.\d+)?\s*(?:g|gram|grams|ml|milliliter|milliliters|cup|cups|tbsp|tablespoon|tablespoons|tsp|teaspoon|teaspoons|slice|slices)\s*/i, '')
          .replace(/^\d+(?:\.\d+)?\s*(?:piece|pieces)\s*/i, '')
          .replace(/^\d+(?:\.\d+)?\s*/i, '')
          .replace(/^(\d+\/\d+|\d+)\s*/i, '')
          .replace(/^\([^)]*\)\s*/g, '')
          .replace(/^[^a-zA-Z]*/, '')
          .replace(/\)$/, '')
          .trim();

        // Create portion string using parsed amount and unit from API
        let portion = '';
        
        if (result.unit === 'g' && result.amount) {
          portion = `${Math.round(result.amount)} g`;
        } else if (result.unit === 'ml' && result.amount) {
          portion = `${Math.round(result.amount)} ml`;
        } else if (result.unit === 'tsp' && result.amount) {
          portion = `${result.amount} tsp`;
        } else if (result.unit === 'tbsp' && result.amount) {
          portion = `${result.amount} tbsp`;
        } else if (result.unit === 'piece' && result.pieces) {
          if (result.pieces === 0.5) {
            portion = '1/2 piece';
          } else if (result.pieces === 0.25) {
            portion = '1/4 piece';
          } else if (result.pieces === 0.33) {
            portion = '1/3 piece';
          } else if (result.pieces === 1) {
            portion = '1 piece';
          } else {
            portion = `${result.pieces} pieces`;
          }
        } else if (result.amount) {
          portion = `${Math.round(result.amount)} ${result.unit || 'g'}`;
        } else {
          portion = '1 piece';
        }

        return {
          name: cleanName,
          portion: portion,
          calories: Math.round(result.macros.calories),
          protein: Math.round(result.macros.protein),
          carbs: Math.round(result.macros.carbs),
          fat: Math.round(result.macros.fat),
          fiber: Math.round(result.macros.fiber || 0)
        };
      });

      return ingredientResults;
    } catch (error) {
      console.error('Error getting ingredient data from API:', error);
      return [];
    }
  };

  const drawMealIngredientsTable = (pdf: jsPDF, startY: number, mealName: string, rows: Array<{ ingredient: string; portion: string; calories: number; protein: number; carbs: number; fat: number; fiber?: number }>) => {
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let y = startY;
    const tableX = 15; // Increased left margin
    const tableW = pageWidth - 30; // Better margins
    // Pre-compute card height with wider columns
    let totalRowsHeight = 10; // header
    const computedHeights = rows.map(r => {
      const nameLines = pdf.splitTextToSize(r.ingredient, 65); // Wider ingredient column
      const portionLines = pdf.splitTextToSize(r.portion, 50); // Adjusted portion column
      const rowH = Math.max(8, Math.max(nameLines.length, portionLines.length) * 5) + 2;
      return rowH;
    });
    totalRowsHeight += computedHeights.reduce((a,b)=>a+b,0);
    // White card
    pdf.setFillColor(255,255,255);
    pdf.roundedRect(tableX, y - 4, tableW, Math.min(totalRowsHeight + 10, pageHeight - y - 20), 4, 4, 'F');
    // Meal title
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    pdf.setTextColor(THEME.textDark.r, THEME.textDark.g, THEME.textDark.b);
    pdf.text(mealName, tableX + 5, y);
    y += 5;
    // Header
    pdf.setFillColor(THEME.grayLight.r, THEME.grayLight.g, THEME.grayLight.b);
    pdf.rect(tableX, y, tableW, 10, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.setTextColor(55);
    pdf.text('Ingredient', tableX + 5, y + 7);
    pdf.text('Portion', tableX + 75, y + 7);
    pdf.text('Cal', tableX + tableW - 65, y + 7);
    pdf.text('P',   tableX + tableW - 48, y + 7);
    pdf.text('C',   tableX + tableW - 35, y + 7);
    pdf.text('Fi',  tableX + tableW - 22, y + 7);
    pdf.text('F',   tableX + tableW - 10, y + 7);
    y += 12;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8); // Slightly smaller font for better fit
    pdf.setTextColor(33);
    for (const r of rows) {
      const nameLines = pdf.splitTextToSize(r.ingredient, 65); // Wider ingredient column
      const portionLines = pdf.splitTextToSize(r.portion, 50); // Adjusted portion column
      const rowH = Math.max(8, Math.max(nameLines.length, portionLines.length) * 5);
      if (y + rowH > pageHeight - 25) {
        pdf.addPage();
        addFooter(pdf, pdf.getNumberOfPages());
        y = 28;
      }
      // text cells - all within table bounds
      nameLines.forEach((ln: string, i: number) => pdf.text(ln, tableX + 5, y + 6 + i * 5));
      portionLines.forEach((ln: string, i: number) => pdf.text(ln, tableX + 75, y + 6 + i * 5));
      pdf.text(String(r.calories || 0), tableX + tableW - 60, y + 6, { align: 'right' });
      pdf.text(`${r.protein || 0}g`,    tableX + tableW - 43, y + 6, { align: 'right' });
      pdf.text(`${r.carbs || 0}g`,      tableX + tableW - 30, y + 6, { align: 'right' });
      pdf.text(`${r.fiber || 0}g`,      tableX + tableW - 17, y + 6, { align: 'right' });
      pdf.text(`${r.fat || 0}g`,        tableX + tableW - 5, y + 6, { align: 'right' });
      y += rowH + 2;
      pdf.setDrawColor(240);
      pdf.line(tableX + 2, y, tableX + tableW - 2, y);
      y += 3;
    }
    return y;
  };

  const parseMealDescLocal = (desc: string): string[] => {
    if (!desc) return [];
    return desc
      .split(/[\,\n]/)
      .map(p => p.trim())
      .filter(Boolean)
      .map(p => p.replace(/^[^0-9a-zA-Z(]+/, '').trim());
  };

  // Clean a single ingredient token: remove leading qty/unit and any DB id pipe (e.g., "cmg123|Apple" -> "Apple")
  const cleanIngredientToken = (s: string): string => {
    let name = String(s || '');
    // remove leading qty + optional unit
    name = name.replace(/^\s*\d+(?:\.\d+)?\s*(g|gram|grams|ml|milliliter|milliliters|cup|cups|tbsp|tablespoon|tablespoons|tsp|teaspoon|teaspoons|slice|slices|piece|pieces)?\s*/i, '');
    // remove any leading count like "1 Apple"
    name = name.replace(/^\s*\d+\s+/, '');
    // strip ID pipes
    if (name.includes('|')) {
      const parts = name.split('|');
      name = parts[parts.length - 1].trim();
    }
    return name.trim();
  };

  // Sanitize a meal description string so it prints nicely in PDF/overview lists
  const sanitizeMealDescription = (desc: string): string => {
    if (!desc) return '';
    const tokens = desc
      .split(/[\,\n]/)
      .map(p => p.trim())
      .filter(Boolean)
      .map(cleanIngredientToken);
    return tokens.join(', ');
  };

  // Progress color helpers based on deviation from 100% (works for >100% too)
  const getBarColor = (current: number, target: number, fallback: string) => {
    if (!target || target <= 0) return fallback;
    const pct = (current / target) * 100;
    if (!Number.isFinite(pct)) return fallback;
    const diff = Math.abs(100 - pct);
    if (diff < 5) return 'bg-green-500';
    if (diff < 10) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getTextColor = (current: number, target: number, fallback: string) => {
    if (!target || target <= 0) return fallback;
    const pct = (current / target) * 100;
    if (!Number.isFinite(pct)) return fallback;
    const diff = Math.abs(100 - pct);
    if (diff < 5) return 'text-green-600';
    if (diff < 10) return 'text-orange-600';
    return 'text-red-600';
  };

  // Helper: safely get a meal string from day menu supporting both old and new structure
  const getMealString = (dayMenu: any, mealType: string): string => {
    if (!dayMenu || typeof dayMenu !== 'object') return '';
    
    const mealData = dayMenu[mealType];
    
    // New structure: { ingredients: string, cookingInstructions: string }
    if (mealData && typeof mealData === 'object' && mealData.ingredients) {
      return mealData.ingredients;
    }
    
    // Old structure: direct string
    if (typeof mealData === 'string') {
      return mealData;
    }
    
    // Fallback: try capitalized key
    const capKey = mealType.charAt(0).toUpperCase() + mealType.slice(1);
    const capVal = dayMenu[capKey];
    if (capVal && typeof capVal === 'object' && capVal.ingredients) {
      return capVal.ingredients;
    }
    if (typeof capVal === 'string') {
      return capVal;
    }
    
    return '';
  };

  // Helper: get cooking instructions from day menu
  const getCookingInstructions = (dayMenu: any, mealType: string): string => {
    if (!dayMenu || typeof dayMenu !== 'object') return '';
    
    const mealData = dayMenu[mealType];
    
    // New structure: { ingredients: string, cookingInstructions: string }
    if (mealData && typeof mealData === 'object' && mealData.cookingInstructions) {
      return mealData.cookingInstructions;
    }
    
    // Fallback: try capitalized key
    const capKey = mealType.charAt(0).toUpperCase() + mealType.slice(1);
    const capVal = dayMenu[capKey];
    if (capVal && typeof capVal === 'object' && capVal.cookingInstructions) {
      return capVal.cookingInstructions;
    }
    
    return '';
  };

  // Helper: get cooking instructions from the new instructions structure
  const getCookingInstructionsFromStructure = (weekMenu: any, dayKey: string, mealType: string): string => {
    if (!weekMenu || typeof weekMenu !== 'object') return '';
    
    const instructionsKey = `${dayKey}_instructions`;
    const dayInstructions = weekMenu[instructionsKey];
    
    if (dayInstructions && typeof dayInstructions === 'object' && dayInstructions[mealType]) {
      return dayInstructions[mealType];
    }
    
    return '';
  };

  // Improved parsing function for meal descriptions (align with IngredientBreakdown)
  const parseMealDescription = (mealDescription: string): string[] => {
    // Handle RECIPE format: [RECIPE:Recipe Name] ingredient1, ingredient2, ...
    if (mealDescription.includes('[RECIPE:')) {
      // Extract recipe name and ingredients
      const recipeMatch = mealDescription.match(/\[RECIPE:([^\]]+)\]\s*(.*)/);
      if (recipeMatch) {
        const recipeName = recipeMatch[1];
        const recipeIngredients = recipeMatch[2];
        // Parse ingredients from recipe
        if (recipeIngredients) {
          const ingredients = recipeIngredients.split(',').map(ing => ing.trim()).filter(ing => ing.length > 0);
          return ingredients;
        }
      }
    }
    
    // Remove cooking instructions and descriptions
    let cleaned = mealDescription
      .replace(/\. Cook.*$/i, '') // Remove "Cook pancakes and serve with yogurt + berries"
      .replace(/\. Serve.*$/i, '') // Remove serving instructions
      .replace(/\. Mix.*$/i, '') // Remove mixing instructions
      .trim();
    // Filter out placeholder/descriptive text like in IngredientBreakdown
    const placeholderPatterns = [
      /personalized breakfast based on your goals/i,
      /healthy snack to support your nutrition goals/i,
      /balanced lunch with optimal macronutrients/i,
      /nutritious dinner to complete your daily intake/i,
      /personalized.*based on.*goals/i,
      /healthy.*to support.*nutrition/i,
      /balanced.*with optimal.*macronutrients/i,
      /nutritious.*to complete.*daily/i
    ];
    if (placeholderPatterns.some(p => p.test(cleaned))) {
      return [];
    }
    
    // Handle specific patterns like "Pancakes: 60g oats, 2 eggs, 1 banana"
    if (cleaned.includes(':')) {
      const afterColon = cleaned.split(':')[1]?.trim();
      if (afterColon) {
        // Split on commas and clean up, removing IDs
        const ingredients = afterColon.split(',').map(ing => {
          let cleaned = ing.trim();
          
          // Remove DB id pipes if present (e.g., "cmg123|Milk" -> "Milk")
          if (cleaned.includes('|')) {
            const pipeParts = cleaned.split('|');
            cleaned = pipeParts[pipeParts.length - 1].trim();
          }
          
          return cleaned;
        }).filter(ing => ing.length > 0);
        return ingredients;
      }
    }
    
    // Handle patterns like "60g oats, 2 eggs, 1 banana" (without colon)
    if (cleaned.includes(',')) {
      const ingredients = cleaned.split(',').map(ing => {
        let cleaned = ing.trim();
        
        // Remove DB id pipes if present (e.g., "cmg123|Milk" -> "Milk")
        if (cleaned.includes('|')) {
          const pipeParts = cleaned.split('|');
          cleaned = pipeParts[pipeParts.length - 1].trim();
        }
        
        return cleaned;
      }).filter(ing => ing.length > 0);
      return ingredients;
    }
    
    // For other patterns, split on + but be more careful about context
    const parts = cleaned.split(/\s*\+\s*/);
    
    // Clean up each part and remove IDs
    const ingredients = parts
      .map(part => {
        let cleaned = part.trim();
        
        // Remove DB id pipes if present (e.g., "cmg123|Milk" -> "Milk")
        if (cleaned.includes('|')) {
          const pipeParts = cleaned.split('|');
          cleaned = pipeParts[pipeParts.length - 1].trim();
        }
        
        return cleaned;
      })
      .filter(part => part.length > 0);
      
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
  const mealOrder = ['breakfast', 'morning-snack', 'lunch', 'afternoon-snack', 'dinner', 'evening-snack'];

  // Utility: shallow compare two plain objects
  const shallowEqual = (a: any, b: any) => {
    if (a === b) return true;
    if (!a || !b || typeof a !== 'object' || typeof b !== 'object') return false;
    const ka = Object.keys(a);
    const kb = Object.keys(b);
    if (ka.length !== kb.length) return false;
    for (const k of ka) {
      if (a[k] !== b[k]) return false;
    }
    return true;
  };

  // Refs to cache last applied macros per meal and daily totals to avoid redundant updates
  const lastMealMacrosRef = useRef<Record<string, any>>({});
  const lastDailyTotalsRef = useRef<any>(null);
  const planDataRef = useRef<any>(null);
  const activeDayRef = useRef<string>(activeDay);

  // keep refs in sync
  useEffect(() => { planDataRef.current = planData; }, [planData]);
  useEffect(() => { activeDayRef.current = activeDay; }, [activeDay]);

  // Observe overview section; when out of view, show sticky compact summary
  useEffect(() => {
    const node = overviewRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowSticky(!entry.isIntersecting);
      },
      { root: null, threshold: 0 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [overviewRef.current]);

  // Stable onMacrosUpdate handlers per meal to avoid re-render loops in children
  const onMealMacrosUpdateMap = useMemo(() => {
    const map: Record<string, (macros: any) => Promise<void>> = {};
    for (const mealType of mealOrder) {
      map[mealType] = async (macros: any) => {
        // Skip if macros didn't change for this meal
        const lastForMeal = lastMealMacrosRef.current[mealType];
        if (lastForMeal && shallowEqual(lastForMeal, macros)) {
          return;
        }

        // Update specific meal macros
        setMealMacros(prev => {
          const next = { ...prev, [mealType]: macros };
          lastMealMacrosRef.current[mealType] = macros;
          return next;
        });

        // Recalculate daily totals and avoid redundant set
        try {
          const pd = planDataRef.current;
          const ad = activeDayRef.current;
          const updatedDayData = pd?.weekMenu?.[ad];
          const newDailyTotals = await calculateDailyTotalsV3(updatedDayData);
          if (!shallowEqual(lastDailyTotalsRef.current, newDailyTotals)) {
            setDailyTotals(newDailyTotals);
            lastDailyTotalsRef.current = newDailyTotals;
          }
        } catch (error) {
          console.error('❌ Error recalculating daily totals:', error);
        }
      };
    }
    return map;
  }, []);

  // Keep refs in sync
  useEffect(() => { planDataRef.current = planData; }, [planData]);
  useEffect(() => { activeDayRef.current = activeDay; }, [activeDay]);

  // Fallback: Recalculate daily totals when planData changes (in case onPlanUpdated doesn't fire)
  // DISABLED: This was causing race conditions with the onPlanUpdated callback
  // useEffect(() => {
  //   if (!planData || !planData.weekMenu || !planData.weekMenu[activeDay]) {
  //     return;
  //   }

  //   const recalculateTotals = async () => {
  //     try {
  //       console.log('🔄 Fallback: Recalculating daily totals due to planData change');
  //       setLoadingTotals(true);
  //       const dayData = planData.weekMenu[activeDay];
  //       const totals = await calculateDailyTotals(dayData, true);
  //       setDailyTotals(totals);
  //       console.log('🔄 Fallback: Daily totals recalculated:', totals);
  //     } catch (error) {
  //       console.error('❌ Fallback: Error recalculating daily totals:', error);
  //     } finally {
  //       setLoadingTotals(false);
  //     }
  //   };

  //   // Debounce to avoid too many recalculations
  //   const timeoutId = setTimeout(recalculateTotals, 1000);
  //   return () => clearTimeout(timeoutId);
  // }, [planData, activeDay]);

  // (removed duplicate handleAddIngredient; using the unified version later in the file)

  // Calculate meal macros AND daily totals when activeDay changes (combined to prevent race condition)
  useEffect(() => {
    console.log('🔔 [DEBUG] useEffect triggered for activeDay/planData change');
    console.log('🔔 [DEBUG] activeDay:', activeDay);
    console.log('🔔 [DEBUG] planData?.weekMenu?.[activeDay]:', planData?.weekMenu?.[activeDay]);
    console.log('🔔 [DEBUG] Current dailyTotals:', dailyTotals);
    
    const calculateAllMacros = async () => {
      // Use the same logic as PDF: prefer weekMenu, fallback to days
      let dayData = null;
      if (planData?.weekMenu?.[activeDay]) {
        dayData = planData.weekMenu[activeDay];
      } else if (planData?.days?.[activeDay]) {
        dayData = planData.days[activeDay];
      }
      
      console.log('🔔 [DEBUG] dayData extracted in useEffect:', dayData);
      
      if (!dayData) {
        return;
      }

      // Reset macros to avoid showing stale values
      setMealMacros({});
      
      try {
        // Don't call calculateMealMacrosAndTotalsV2 - it uses old data from the API
        // The IngredientBreakdown components will update the DOM with new values
        // Just wait for DOM to update, then read from DOM
        setTimeout(() => {
          console.log('🔔 [DEBUG] useEffect: setTimeout fired, recalculating totals from DOM');
          const totals = calculateDailyTotalsFromDOM();
          console.log('🔔 [DEBUG] useEffect: Totals calculated from DOM:', totals);
          setDailyTotals(prev => {
            console.log('🔔 [DEBUG] useEffect: setDailyTotals called with prev:', prev, 'new:', totals);
            return {...totals};
          });
        }, 500); // Longer delay to ensure IngredientBreakdown components have rendered and updated the DOM
        
      } catch (error) {
        console.error('Error calculating macros:', error);
        setDailyTotals({ calories: 0, protein: 0, carbs: 0, fat: 0 });
      }
    };

    calculateAllMacros();
  }, [activeDay, planData]);

  const handleBack = () => {
    router.push('/admin/voedingsplannen');
  };

  // Generation log modal state
  const [genLogOpen, setGenLogOpen] = useState(false);
  const [genLog, setGenLog] = useState<string[]>([]);
  const logContainerRef = useRef<HTMLDivElement | null>(null);
  // Preferences modal state
  const categoryOptions = ['proteins','carbohydrates','fruits','vegetables','healthy-fats','dairy','nuts-seeds','other'] as const;
  type Category = typeof categoryOptions[number];
  type MealKey = 'breakfast'|'morning-snack'|'lunch'|'afternoon-snack'|'dinner'|'evening-snack';
  const [prefsOpen, setPrefsOpen] = useState(false);
  const [mealPrefs, setMealPrefs] = useState<Record<MealKey, Set<Category>>>(
    {
      breakfast: new Set<Category>(['dairy','carbohydrates','fruits','nuts-seeds']),
      'morning-snack': new Set<Category>(['dairy','carbohydrates','fruits','nuts-seeds']),
      lunch: new Set<Category>(['carbohydrates','proteins','vegetables','healthy-fats']),
      'afternoon-snack': new Set<Category>(['dairy','carbohydrates','fruits','nuts-seeds']),
      dinner: new Set<Category>(['carbohydrates','proteins','vegetables','healthy-fats']),
      'evening-snack': new Set<Category>(['dairy','carbohydrates','fruits','nuts-seeds'])
    }
  );
  const togglePref = (meal: MealKey, cat: Category) => {
    setMealPrefs(prev => {
      const next = { ...prev } as Record<MealKey, Set<Category>>;
      const s = new Set(next[meal]);
      if (s.has(cat)) s.delete(cat); else s.add(cat);
      next[meal] = s;
      return next;
    });
  };

  useEffect(() => {
    if (genLogOpen && logContainerRef.current) {
      const el = logContainerRef.current;
      el.scrollTo({
        top: el.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [genLog, genLogOpen]);

  const mealDisplayNames: Record<MealKey, string> = {
    breakfast: 'Breakfast',
    'morning-snack': 'Morning Snack',
    lunch: 'Lunch',
    'afternoon-snack': 'Afternoon Snack',
    dinner: 'Dinner',
    'evening-snack': 'Evening Snack'
  };

  const mealDistributionWeights: Record<MealKey, number> = {
    breakfast: 0.2,
    'morning-snack': 0.1,
    lunch: 0.25,
    'afternoon-snack': 0.1,
    dinner: 0.25,
    'evening-snack': 0.1
  };

  const createEmptyDayStructure = (): Record<MealKey, { ingredients: string; cookingInstructions: string }> => ({
    breakfast: { ingredients: '', cookingInstructions: '' },
    'morning-snack': { ingredients: '', cookingInstructions: '' },
    lunch: { ingredients: '', cookingInstructions: '' },
    'afternoon-snack': { ingredients: '', cookingInstructions: '' },
    dinner: { ingredients: '', cookingInstructions: '' },
    'evening-snack': { ingredients: '', cookingInstructions: '' }
  });

  const macroTolerance = { min: 0.95, max: 1.05 };
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiMealSelection, setAiMealSelection] = useState<Record<MealKey, boolean>>({
    breakfast: true,
    'morning-snack': true,
    lunch: true,
    'afternoon-snack': true,
    dinner: true,
    'evening-snack': true
  });
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiGenerationError, setAiGenerationError] = useState<string | null>(null);
  const [recipeLibrary, setRecipeLibrary] = useState<any[] | null>(null);
  
  // Templates modal state
  const [templatesModalOpen, setTemplatesModalOpen] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [importingTemplate, setImportingTemplate] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<{ templateId: string; day: string } | null>(null);
  
  // Meal-specific template modal state (must be declared before allMealsForSelectedType)
  const [mealTemplateModalOpen, setMealTemplateModalOpen] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<string | null>(null);
  const [mealTemplatesLoaded, setMealTemplatesLoaded] = useState<{ total: number; loaded: number }>({ total: 0, loaded: 0 });
  
  // Calculate all meals for selected meal type
  const allMealsForSelectedType = useMemo(() => {
    if (!selectedMealType || !mealTemplateModalOpen) return [];
    
    const meals: Array<{ templateId: string; templateName: string; day: string; dayName: string; meal: any; mealDescription: string; globalIndex: number }> = [];
    let globalIndex = 0;
    
    templates.forEach((template) => {
      const templateWeekMenu = (template.weekMenu as any) || {};
      
      dayOrder.forEach(day => {
        const dayData = templateWeekMenu[day];
        if (!dayData) return;
        
        const meal = dayData[selectedMealType];
        if (!meal) return;
        
        let mealDescription = '';
        if (typeof meal === 'string') {
          mealDescription = meal;
        } else if (meal && typeof meal === 'object') {
          mealDescription = meal.description || meal.ingredients || '';
        }
        
        if (mealDescription && mealDescription.trim() !== '') {
          meals.push({
            templateId: template.id,
            templateName: template.name,
            day,
            dayName: dayNames[day as keyof typeof dayNames],
            meal,
            mealDescription,
            globalIndex: globalIndex++
          });
        }
      });
    });
    
    return meals;
  }, [templates, selectedMealType, dayNames, mealTemplateModalOpen]);
  
  // Update total count when meals change
  useEffect(() => {
    if (mealTemplateModalOpen && allMealsForSelectedType.length > 0) {
      setMealTemplatesLoaded(prev => {
        if (prev.total !== allMealsForSelectedType.length) {
          console.log(`[Meal Templates] Setting total to ${allMealsForSelectedType.length}`);
          return { total: allMealsForSelectedType.length, loaded: 0 };
        }
        return prev;
      });
    } else if (!mealTemplateModalOpen) {
      // Reset when modal closes
      setMealTemplatesLoaded({ total: 0, loaded: 0 });
    }
  }, [allMealsForSelectedType.length, mealTemplateModalOpen]);
  
  // Stable callback for macro calculation progress
  const handleMacroCalculated = useCallback(() => {
    setMealTemplatesLoaded(prev => {
      const newLoaded = prev.loaded + 1;
      console.log(`[Meal Templates] Macro calculated: ${newLoaded}/${prev.total}`);
      return { ...prev, loaded: newLoaded };
    });
  }, []);

  const selectedAiMeals = useMemo(
    () => (Object.keys(aiMealSelection) as MealKey[]).filter((meal) => aiMealSelection[meal]),
    [aiMealSelection]
  );

  const aiMealDistribution = useMemo(() => {
    if (!selectedAiMeals.length) return {};
    const totalWeight = selectedAiMeals.reduce((sum, meal) => sum + (mealDistributionWeights[meal] ?? 1), 0);
    const distribution: Partial<Record<MealKey, number>> = {};
    selectedAiMeals.forEach((meal) => {
      const weight = mealDistributionWeights[meal] ?? 1;
      distribution[meal] = weight / (totalWeight || selectedAiMeals.length);
    });
    return distribution;
  }, [selectedAiMeals]);

  const toggleAiMealSelection = (meal: MealKey) => {
    setAiMealSelection((prev) => ({
      ...prev,
      [meal]: !prev[meal]
    }));
  };

  const ensureRecipeLibrary = async (): Promise<any[]> => {
    if (recipeLibrary && recipeLibrary.length > 0) {
      return recipeLibrary;
    }
    const response = await fetch('/api/recipes');
    if (!response.ok) {
      throw new Error('Kon recepten niet laden. Controleer de verbinding en probeer opnieuw.');
    }
    const data = await response.json();
    setRecipeLibrary(data);
    return data;
  };

  const clearActiveDayMeals = async (options?: { silent?: boolean }) => {
    if (!planId) return false;
    try {
      const res = await fetch(`/api/nutrition-plans/${planId}/clear-day`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dayKey: activeDay })
      });

      if (!res.ok) {
        throw new Error('Failed to clear day');
      }

      const data = await res.json();
      if (data?.plan) {
        setPlanData(data.plan);
      } else {
        setPlanData((prev: any) => ({
          ...(prev || {}),
          weekMenu: {
            ...(prev?.weekMenu || {}),
            [activeDay]: createEmptyDayStructure()
          }
        }));
      }

      setMealMacros({});
      setDailyTotals({ calories: 0, protein: 0, carbs: 0, fat: 0 });
      return true;
    } catch (error) {
      console.error('Error clearing day', error);
      if (!options?.silent) {
        alert('Er ging iets mis bij het leegmaken van de dag. Probeer opnieuw.');
      }
      return false;
    }
  };

  const handleClearDayClick = async () => {
    if (!planId) return;
    const ok = window.confirm('Weet je zeker dat je ALLE ingrediënten van deze dag wilt verwijderen? Dit kan niet ongedaan gemaakt worden.');
    if (!ok) return;
    await clearActiveDayMeals();
  };

  // Load templates (other nutrition plans)
  const loadTemplates = useCallback(async () => {
    // Return cached templates if available
    if (templatesCacheRef.current) {
      setTemplates(templatesCacheRef.current);
      return;
    }
    
    try {
      setLoadingTemplates(true);
      const response = await fetch(`/api/nutrition-plans/templates?excludePlanId=${planId}`);
      if (response.ok) {
        const templates = await response.json();
        templatesCacheRef.current = templates; // Cache the result
        setTemplates(templates);
      } else {
        // Fallback to old endpoint if new one fails
        const fallbackResponse = await fetch(`/api/nutrition-plans?includeWeekMenu=true`);
        if (fallbackResponse.ok) {
          const allPlans = await fallbackResponse.json();
          const otherPlans = allPlans.filter((plan: any) => plan.id !== planId);
          templatesCacheRef.current = otherPlans; // Cache the result
          setTemplates(otherPlans);
        }
      }
    } catch (error) {
      console.error('[loadTemplates] Error loading templates:', error);
      // Fallback to old endpoint
      try {
        const fallbackResponse = await fetch(`/api/nutrition-plans?includeWeekMenu=true`);
        if (fallbackResponse.ok) {
          const allPlans = await fallbackResponse.json();
          const otherPlans = allPlans.filter((plan: any) => plan.id !== planId);
          templatesCacheRef.current = otherPlans; // Cache the result
          setTemplates(otherPlans);
        }
      } catch (fallbackError) {
        console.error('[loadTemplates] Fallback also failed:', fallbackError);
      }
    } finally {
      setLoadingTemplates(false);
    }
  }, [planId]);

  // Import template (copy day from another plan)
  const handleImportTemplate = async (templatePlanId: string, templateDay: string) => {
    if (!planId) return;
    
    try {
      setImportingTemplate(true);
      const response = await fetch(`/api/nutrition-plans/${planId}/import-day`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          sourcePlanId: templatePlanId,
          sourceDay: templateDay,
          targetDay: activeDay
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.plan) {
          // Update plan data directly - no need to reload entire page
          setPlanData(data.plan);
          setLoading(false); // Ensure loading state is cleared
          setTemplatesModalOpen(false);
          // Clear templates cache so it refreshes next time
          templatesCacheRef.current = null;
          alert(`Template imported! ${dayNames[activeDay as keyof typeof dayNames]} has been copied from the selected plan.`);
        }
      } else {
        const error = await response.json();
        alert(`Error importing: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error importing template:', error);
      alert('Error importing template');
    } finally {
      setImportingTemplate(false);
    }
  };

  // Import meal template (copy only a specific meal from another plan)
  const handleImportMealTemplate = async (templatePlanId: string, templateDay: string, mealType: string) => {
    if (!planId || !selectedMealType) {
      console.error('[handleImportMealTemplate] Missing planId or selectedMealType');
      return;
    }
    
    try {
      setImportingTemplate(true);
      
      // Direct import via API
      const response = await fetch(`/api/nutrition-plans/${planId}/import-meal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourcePlanId: templatePlanId,
          sourceDay: templateDay,
          targetDay: activeDay,
          mealType: mealType
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to import meal');
      }
      
      const data = await response.json();
      if (data.plan) {
        // Update plan data directly - no need to reload entire page
        setPlanData(data.plan);
        setLoading(false); // Ensure loading state is cleared
        setMealTemplateModalOpen(false);
        setSelectedMealType(null);
        // Clear templates cache so it refreshes next time
        templatesCacheRef.current = null;
      }
    } catch (error) {
      console.error('[handleImportMealTemplate] Error:', error);
      alert(error instanceof Error ? error.message : 'Error importing meal template');
    } finally {
      setImportingTemplate(false);
    }
  };

  const handleCopyLog = async () => {
    if (!genLog.length) {
      alert('Geen logregels om te kopiëren.');
      return;
    }
    try {
      await navigator.clipboard.writeText(genLog.join('\n'));
      alert('Generation log gekopieerd naar klembord.');
    } catch (error) {
      console.error('Failed to copy generation log', error);
      alert('Kopiëren mislukt. Probeer opnieuw.');
    }
  };

  const runAiGenerator = async () => {
    if (!planId) return;
    if (!selectedAiMeals.length) {
      setAiGenerationError('Selecteer minimaal één maaltijd om te genereren.');
      return;
    }

    setAiGenerating(true);
    setAiGenerationError(null);
    setGenLog([]);
    setGenLogOpen(true);
    addGenLog('🤖 AI generator gestart', { day: activeDay, meals: selectedAiMeals.length });

    try {
      const recipes = await ensureRecipeLibrary();
      addGenLog('📚 Beschikbare recepten geladen', { count: recipes.length });
      const usableRecipes = recipes.filter((recipe: any) =>
        typeof recipe.totalCalories === 'number' &&
        typeof recipe.totalProtein === 'number' &&
        typeof recipe.totalCarbs === 'number' &&
        typeof recipe.totalFat === 'number' &&
        recipe.totalCalories > 0
      );

      if (!usableRecipes.length) {
        throw new Error('Geen recepten met macro informatie beschikbaar in de bibliotheek.');
      }

      const macroTargets = {
        calories: Number(planData?.calories || 0),
        protein: Number(planData?.protein || 0),
        carbs: Number(planData?.carbs || 0),
        fat: Number(planData?.fat || 0)
      };

      const logMacroComparison = (label: string, totals: typeof macroTargets) => {
        const summary = (['calories', 'protein', 'carbs', 'fat'] as Array<keyof typeof macroTargets>).reduce(
          (acc, macro) => {
            const target = macroTargets[macro] || 0;
            const actual = totals[macro] || 0;
            return {
              ...acc,
              [macro]: {
                actual,
                target,
                diff: Math.round((actual - target) * 10) / 10,
                ratio: target ? Number((actual / target).toFixed(3)) : null
              }
            };
          },
          {} as Record<keyof typeof macroTargets, { actual: number; target: number; diff: number; ratio: number | null }>
        );
        addGenLog(label, summary);
      };

      const refreshTotalsFromServer = async (label?: string) => {
        if (!planId) return null;
        try {
          const response = await fetch(`/api/nutrition-plans/${planId}`);
          if (!response.ok) return null;
          const freshPlan = await response.json();
          let dayData = freshPlan?.weekMenu?.[activeDay] ?? freshPlan?.days?.[activeDay];
          if (!dayData) return null;
          setPlanData(freshPlan);
          const { mealMacros: newMealMacros } = await calculateMealMacrosAndTotalsV2(dayData);
          setMealMacros(newMealMacros);
          const totals = await calculateDailyTotalsV3(dayData);
          setDailyTotals({ ...totals });
          if (label) {
            logMacroComparison(label, totals);
          }
          return { plan: freshPlan, totals };
        } catch (error) {
          console.error('Error refreshing plan totals during AI generation', error);
          return null;
        }
      };

      const pickBestRecipe = (
        target: { calories: number; protein: number; carbs: number; fat: number },
        usedIds: Set<string>,
        allowReuse = false,
        focusMacro?: keyof typeof macroTargets
      ) => {
        let bestRecipe: any = null;
        let bestScore = Infinity;

        for (const recipe of usableRecipes) {
          if (!allowReuse && usedIds.has(recipe.id)) continue;

          const calories = Number(recipe.totalCalories) || 0;
          const protein = Number(recipe.totalProtein) || 0;
          const carbs = Number(recipe.totalCarbs) || 0;
          const fat = Number(recipe.totalFat) || 0;

          const score =
            Math.abs((Number(recipe.totalCalories) || 0) - target.calories) / Math.max(target.calories, 1) * 0.4 +
            Math.abs((Number(recipe.totalProtein) || 0) - target.protein) / Math.max(target.protein, 1) * 0.3 +
            Math.abs((Number(recipe.totalCarbs) || 0) - target.carbs) / Math.max(target.carbs, 1) * 0.2 +
            Math.abs((Number(recipe.totalFat) || 0) - target.fat) / Math.max(target.fat, 1) * 0.1;

          const macroValue =
            focusMacro === 'calories'
              ? calories
              : focusMacro === 'protein'
              ? protein
              : focusMacro === 'carbs'
              ? carbs
              : focusMacro === 'fat'
              ? fat
              : null;

          const macroPenalty =
            macroValue !== null && focusMacro
              ? Math.max(0, target[focusMacro] - macroValue) / Math.max(target[focusMacro], 1) * 0.2
              : 0;

          if (score < bestScore) {
            bestScore = score + macroPenalty;
            bestRecipe = recipe;
          }
        }

        return bestRecipe;
      };

      const buildSelection = (allowReuse = false) => {
        const selections: Partial<Record<MealKey, any>> = {};
        const planEntries: Array<{ meal: MealKey; recipe: any; source: 'base' | 'top-off' }> = [];
        const usedRecipeIds = new Set<string>();
        const totals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
        const remainingTargets = { ...macroTargets };
        let remainingWeight = selectedAiMeals.reduce(
          (sum, meal) => sum + (mealDistributionWeights[meal] ?? 1),
          0
        );

        selectedAiMeals.forEach((meal, index) => {
          const mealWeight = mealDistributionWeights[meal] ?? 1;
          const share =
            remainingWeight > 0
              ? mealWeight / remainingWeight
              : 1 / Math.max(1, selectedAiMeals.length - index);

          const target = {
            calories: Math.max(120, Math.round(remainingTargets.calories * share)),
            protein: Math.max(8, Math.round(remainingTargets.protein * share)),
            carbs: Math.max(8, Math.round(remainingTargets.carbs * share)),
            fat: Math.max(5, Math.round(remainingTargets.fat * share))
          };

          const recipe = pickBestRecipe(target, usedRecipeIds, allowReuse || selectedAiMeals.length === 1);
          if (!recipe) {
            return;
          }

          selections[meal] = recipe;
          usedRecipeIds.add(recipe.id);
          planEntries.push({ meal, recipe, source: 'base' });

          const macros = {
            calories: Number(recipe.totalCalories) || 0,
            protein: Number(recipe.totalProtein) || 0,
            carbs: Number(recipe.totalCarbs) || 0,
            fat: Number(recipe.totalFat) || 0
          };

          totals.calories += macros.calories;
          totals.protein += macros.protein;
          totals.carbs += macros.carbs;
          totals.fat += macros.fat;

          remainingTargets.calories = Math.max(0, remainingTargets.calories - macros.calories);
          remainingTargets.protein = Math.max(0, remainingTargets.protein - macros.protein);
          remainingTargets.carbs = Math.max(0, remainingTargets.carbs - macros.carbs);
          remainingTargets.fat = Math.max(0, remainingTargets.fat - macros.fat);

          remainingWeight = Math.max(0, remainingWeight - mealWeight);

          addGenLog('🎯 Target voor maaltijd', {
            meal,
            target,
            selectedRecipe: recipe.name,
            macros
          });
        });

        return { selections, totals, planEntries, usedRecipeIds };
      };

      const isWithinTolerance = (totals: typeof macroTargets) => {
        const checks: Array<keyof typeof macroTargets> = ['calories', 'protein', 'carbs', 'fat'];
        return checks.every((key) => {
          const target = macroTargets[key];
          if (!target) return true;
          const ratio = totals[key] / target;
          return ratio >= macroTolerance.min && ratio <= macroTolerance.max;
        });
      };

      let selectionResult = buildSelection(false);
      if (!Object.keys(selectionResult.selections).length) {
        selectionResult = buildSelection(true);
      }

      if (!Object.keys(selectionResult.selections).length) {
        throw new Error('AI kon geen passende recepten vinden.');
      }

      const getDeficits = (totals: typeof macroTargets) => {
        const items: Array<{
          macro: keyof typeof macroTargets;
          deficit: number;
          ratio: number;
        }> = [];

        (['calories', 'protein', 'carbs', 'fat'] as Array<keyof typeof macroTargets>).forEach((macro) => {
          const target = macroTargets[macro];
          if (!target) return;
          const value = totals[macro];
          const ratio = value / target;
          if (ratio < macroTolerance.min) {
            items.push({
              macro,
              deficit: target * macroTolerance.min - value,
              ratio
            });
          }
        });

        return items.sort((a, b) => b.deficit - a.deficit);
      };

      const projectTotals = (totals: typeof macroTargets, recipe: any) => ({
        calories: totals.calories + (Number(recipe.totalCalories) || 0),
        protein: totals.protein + (Number(recipe.totalProtein) || 0),
        carbs: totals.carbs + (Number(recipe.totalCarbs) || 0),
        fat: totals.fat + (Number(recipe.totalFat) || 0)
      });

      const withinUpperBounds = (totals: typeof macroTargets) => {
        return (['calories', 'protein', 'carbs', 'fat'] as Array<keyof typeof macroTargets>).every((macro) => {
          const target = macroTargets[macro];
          if (!target) return true;
          const ratio = totals[macro] / target;
          return ratio <= macroTolerance.max;
        });
      };

      let deficitAttempts = 0;
      while (!isWithinTolerance(selectionResult.totals) && deficitAttempts < 8) {
        const deficits = getDeficits(selectionResult.totals);
        if (!deficits.length) break;
        const focus = deficits[0];
        const target = {
          calories: focus.macro === 'calories' ? focus.deficit : selectionResult.totals.calories,
          protein: focus.macro === 'protein' ? focus.deficit : selectionResult.totals.protein,
          carbs: focus.macro === 'carbs' ? focus.deficit : selectionResult.totals.carbs,
          fat: focus.macro === 'fat' ? focus.deficit : selectionResult.totals.fat
        };

        const booster = pickBestRecipe(
          {
            calories: Math.max(80, target.calories),
            protein: Math.max(6, target.protein),
            carbs: Math.max(6, target.carbs),
            fat: Math.max(4, target.fat)
          },
          selectionResult.usedRecipeIds,
          true,
          focus.macro
        );

        if (!booster) {
          addGenLog('⚠️ Geen recept gevonden voor extra aanvulling', { focus: focus.macro });
          break;
        }

        const projected = projectTotals(selectionResult.totals, booster);
        if (!withinUpperBounds(projected)) {
          selectionResult.usedRecipeIds.add(booster.id);
          deficitAttempts += 1;
          addGenLog('↩️ Booster overgeslagen (zou macro\'s overschrijden)', {
            recipe: booster.name,
            projected
          });
          continue;
        }

        const boosterMeal =
          selectedAiMeals[selectedAiMeals.length - 1] || selectedAiMeals[0] || ('dinner' as MealKey);

        selectionResult.planEntries.push({ meal: boosterMeal, recipe: booster, source: 'top-off' });
        selectionResult.usedRecipeIds.add(booster.id);
        selectionResult.totals = projected;
        addGenLog('➕ Top-off recept toegevoegd', {
          meal: boosterMeal,
          recipe: booster.name,
          focus: focus.macro,
          projected
        });
        deficitAttempts += 1;
      }

      if (!isWithinTolerance(selectionResult.totals)) {
        addGenLog('⚠️ Resultaat buiten toleranties, probeer opnieuw met recipe-reuse.');
        const retryResult = buildSelection(true);
        if (Object.keys(retryResult.selections).length) {
          selectionResult = retryResult;
        }
      }

      const selections = selectionResult.selections;

      await clearActiveDayMeals({ silent: true });

      const planEntries = selectionResult.planEntries;
      for (const entry of planEntries) {
        const recipe = entry.recipe;
        if (!recipe) continue;
        addGenLog('➕ Voeg recept toe', {
          meal: entry.meal,
          recipe: recipe.name,
          bron: entry.source,
          macros: {
            calories: recipe.totalCalories,
            protein: recipe.totalProtein,
            carbs: recipe.totalCarbs,
            fat: recipe.totalFat
          }
        });
        await handleAddRecipe(recipe, entry.meal);
      }

      const refreshedResult = await refreshTotalsFromServer('📊 Resultaten vs target (na AI)');
      const actualTotals = refreshedResult?.totals || selectionResult.totals;
      if (!refreshedResult) {
        logMacroComparison('📊 Resultaten (geschat op receptdata)', selectionResult.totals);
      }

      if (actualTotals) {
        logMacroComparison('🏁 Finale macros vs target', actualTotals);
        const finalWithin = isWithinTolerance(actualTotals);
        if (!finalWithin) {
          addGenLog('⚠️ Waarschuwing', {
            message: 'Resultaat net buiten 95%-105%. Pas handmatig aan indien nodig.'
          });
        } else {
          addGenLog('✅ Macro doelen behaald binnen toleranties.');
        }
      }

      setAiModalOpen(false);
    } catch (error: any) {
      console.error('AI day plan error:', error);
      setAiGenerationError(error?.message || 'Kon dagplan niet genereren. Probeer het later opnieuw.');
    } finally {
      setAiGenerating(false);
    }
  };

  const addGenLog = (msg: string, data?: any) => {
    const line = data !== undefined ? `${msg} ${JSON.stringify(data)}` : msg;
    console.log('[Generator]', msg, data ?? '');
    setGenLog((prev) => [...prev, line]);
  };

  // Generate a realistic weight-gain day using only DB ingredients
  const generateDayPlan = async () => {
    if (!planId) return;
    setGenLog([]);
    setGenLogOpen(true);
    addGenLog('Start generate for day', activeDay);
    const day = activeDay;
    try {
      // 1) Load all active ingredients
      const res = await fetch('/api/ingredients');
      if (!res.ok) throw new Error('Failed to fetch ingredients');
      const all: any[] = await res.json();
      addGenLog('Loaded ingredients count', all.length);

      // Helper finders (prefer exact match first, then substring)
      const byName = (name: string) => {
        const lower = name.toLowerCase();
        return all.find(i => String(i.name || '').toLowerCase() === lower) ||
               all.find(i => String(i.name || '').toLowerCase().includes(lower));
      };
      const byCategory = (cat: string) => all.find(i => (i.category || '').toLowerCase() === cat.toLowerCase());
      const prefer = (...names: string[]) => names.map(byName).find(Boolean) || null;
      const isAllowed = (meal: MealKey, ing: any) => mealPrefs[meal].has(String(ing?.category || '').toLowerCase() as Category);
      const preferFor = (meal: MealKey, ...names: string[]) => {
        const cand = names.map(byName).filter(Boolean).find(i => isAllowed(meal, i));
        return cand || null;
      };
      const byCategoryFor = (meal: MealKey, cat: string) => {
        const it = all.find(i => (i.category || '').toLowerCase() === cat.toLowerCase());
        return it && isAllowed(meal, it) ? it : null;
      };

      // Pick staples from DB (fallback by category)
      const oats = prefer('Oats', 'Haver', 'Oatmeal') || byCategory('carbohydrates');
      const milk = prefer('Milk', 'Yogurt', 'Greek Yogurt') || byCategory('dairy');
      const peanut = prefer('Peanut Butter', 'Peanut', 'Pinda') || byCategory('nuts-seeds');
      const banana = prefer('Banana') || byCategory('fruits');
      const rice = prefer('White Rice', 'Basmati Rice', 'Brown Rice') || byCategory('carbohydrates');
      const pasta = prefer('Cup Cooked Pasta', 'Pasta', 'Whole Wheat Pasta') || byCategory('carbohydrates');
      const chicken = prefer('Chicken Breast', 'Chicken Thigh') || byCategory('proteins');
      const beef = prefer('1 Beef Steak', 'Beef Steak') || byCategory('proteins');
      const bellPepper = prefer('Bell Pepper') || byCategory('vegetables');
      const avocado = prefer('Avocado') || byCategory('healthy-fats');
      const granola = prefer('Granola') || byCategory('carbohydrates');
      const yogurt = prefer('Greek Yogurt', 'Yogurt') || byCategory('dairy');
      addGenLog('Selected staples', {
        oats: oats?.name, milk: milk?.name, peanut: peanut?.name, banana: banana?.name,
        rice: rice?.name, pasta: pasta?.name, chicken: chicken?.name, beef: beef?.name,
        bellPepper: bellPepper?.name, avocado: avocado?.name, granola: granola?.name, yogurt: yogurt?.name
      });

      // Utilities
      const qty = (x: number, unit: 'g'|'ml'|'piece' = 'g') => unit === 'piece' ? `${Math.round(x)}` : `${Math.round(x)}${unit}`;
      const parseBase = (perStr: string, aliases?: string[]): { amount: number; unit: 'g'|'ml'|'piece'|'cup' } => {
        const g = perStr?.match(/(\d+(?:\.\d+)?)\s*g/i); if (g) return { amount: parseFloat(g[1]), unit: 'g' };
        const ml = perStr?.match(/(\d+(?:\.\d+)?)\s*ml/i); if (ml) return { amount: parseFloat(ml[1]), unit: 'ml' };
        const cup = perStr?.match(/(\d+(?:\.\d+)?)\s*(cup|cups)/i); if (cup) return { amount: parseFloat(cup[1]), unit: 'cup' };
        const pc = perStr?.match(/(\d+(?:\.\d+)?)\s*(piece|pieces|slice|slices|stuks)/i); if (pc) return { amount: parseFloat(pc[1]), unit: 'piece' };
        const numOnly = perStr?.match(/^\s*(\d+(?:\.\d+)?)\s*$/);
        if (numOnly) {
          // Infer from aliases TYPE:
          const t = (() => {
            try {
              const aliasesArray = typeof aliases === 'string' ? JSON.parse(aliases) : aliases;
              return Array.isArray(aliasesArray) ? aliasesArray.join(' ').toLowerCase() : '';
            } catch {
              return '';
            }
          })();
          if (t.includes('type:gram')) return { amount: parseFloat(numOnly[1]), unit: 'g' };
          if (t.includes('type:ml')) return { amount: parseFloat(numOnly[1]), unit: 'ml' };
          if (t.includes('type:cup')) return { amount: parseFloat(numOnly[1]), unit: 'cup' };
          if (t.includes('type:piece') || t.includes('type:stuks')) return { amount: parseFloat(numOnly[1]), unit: 'piece' };
          // default to grams if unknown
          return { amount: parseFloat(numOnly[1]), unit: 'g' };
        }
        // Fallback: try aliases only
        const t = (() => {
          try {
            const aliasesArray = typeof aliases === 'string' ? JSON.parse(aliases) : aliases;
            return Array.isArray(aliasesArray) ? aliasesArray.join(' ').toLowerCase() : '';
          } catch {
            return '';
          }
        })();
        if (t.includes('type:gram')) return { amount: 100, unit: 'g' };
        if (t.includes('type:ml')) return { amount: 100, unit: 'ml' };
        if (t.includes('type:cup')) return { amount: 1, unit: 'cup' };
        if (t.includes('type:piece') || t.includes('type:stuks')) return { amount: 1, unit: 'piece' };
        return { amount: 1, unit: 'piece' };
      };
      const perIsPiece = (ing: any) => {
        const b = parseBase(ing?.per || '', ing?.aliases);
        return b.unit === 'piece' || b.unit === 'cup';
      };
      // Keep exact DB name for matching in macro API/DB
      const normalizeName = (name: string) => name;
      // Always express quantity using the DB base per
      const formatIngredient = (ing: any, desiredAmountApprox: number) => {
        if (!ing) return '';
        const base = parseBase(ing.per || '', ing.aliases);
        const name = String(ing.name || '');
        const baseName = normalizeName(name);
        // For piece/cup bases use integer counts; for g/ml use exact grams/ml
        let count = 1;
        if (base.amount > 0) count = Math.max(0, Math.round(desiredAmountApprox / Math.max(1, base.amount)));
        if (base.unit === 'piece') {
          if (count <= 0) return '';
          return `${qty(count,'piece')} piece ${baseName}`;
        }
        if (base.unit === 'cup') {
          if (count <= 0) return '';
          return `${qty(count,'piece')} cup ${baseName}`; // emit 'cup' keyword explicitly
        }
        // g or ml: use desired amount directly (rounded), allow any value >= 0
        const total = Math.round(desiredAmountApprox);
        if (total <= 0) return '';
        return `${qty(total, base.unit)} ${baseName}`;
      };

      // Choose realistic desired amount per base type
      const desiredFor = (ing: any, gramsTarget: number, mlTarget: number = gramsTarget) => {
        if (!ing) return gramsTarget;
        const b = parseBase(ing.per || '', ing.aliases);
        if (b.unit === 'piece' || b.unit === 'cup') {
          // Keep it to 1 by default for piece/cup items (can tune later)
          return 1;
        }
        if (b.unit === 'ml') return mlTarget;
        return gramsTarget; // grams
      };

      // 2) Compose baseline params (grams/ml for g/ml bases; 1 piece for piece/cup)
      let params = {
        oatsG: 80,
        milkMl: 250,
        peanutG: 30,
        bananaG: 120,
        yogurtG: 200,
        granolaG: 40,
        riceG: 150,
        chickenG: 160,
        bellPepperG: 100,
        dinnerCarbG: 150, // pasta or rice
        dinnerProteinG: 140, // beef or chicken
        avocadoG: 60,
        // piece/cup counts (0..2)
        oatsCup: 1,
        milkCup: 1,
        yogurtCup: 1,
        pastaCup: 1,
        chickenPiece: 1,
        beefPiece: 1,
        bellPepperPiece: 1,
        avocadoPiece: 1,
      };

      const buildMeals = () => {
        const breakfast = [
          // if base is cup/piece, use count param; else grams/ml param
          formatIngredient(oats, parseBase(oats?.per||'', oats?.aliases).unit === 'cup' ? params.oatsCup : params.oatsG),
          formatIngredient(milk, parseBase(milk?.per||'', milk?.aliases).unit === 'cup' ? params.milkCup : params.milkMl),
          formatIngredient(peanut, desiredFor(peanut, params.peanutG)),
          formatIngredient(banana, desiredFor(banana, params.bananaG))
        ].filter(Boolean).join(', ');

        const snack = [
          formatIngredient(yogurt, parseBase(yogurt?.per||'', yogurt?.aliases).unit === 'cup' ? params.yogurtCup : params.yogurtG),
          formatIngredient(granola, desiredFor(granola, params.granolaG))
        ].filter(Boolean).join(', ');

        const lunch = [
          formatIngredient(rice, desiredFor(rice, params.riceG)),
          formatIngredient(chicken, parseBase(chicken?.per||'', chicken?.aliases).unit === 'piece' ? params.chickenPiece : params.chickenG),
          formatIngredient(bellPepper, parseBase(bellPepper?.per||'', bellPepper?.aliases).unit === 'piece' ? params.bellPepperPiece : params.bellPepperG)
        ].filter(Boolean).join(', ');

        const dinner = [
          formatIngredient((pasta||rice), parseBase((pasta||rice)?.per||'', (pasta||rice)?.aliases).unit === 'cup' ? params.pastaCup : params.dinnerCarbG),
          formatIngredient((beef||chicken), parseBase((beef||chicken)?.per||'', (beef||chicken)?.aliases).unit === 'piece' ? params.beefPiece : params.dinnerProteinG),
          formatIngredient(avocado, parseBase(avocado?.per||'', avocado?.aliases).unit === 'piece' ? params.avocadoPiece : params.avocadoG)
        ].filter(Boolean).join(', ');

        return { breakfast, 'morning-snack': snack, lunch, 'afternoon-snack': '', dinner, 'evening-snack': '' };
      };

      // Helper to compute totals by calling calculate-macros once with all ingredients
      const computeTotals = async (meals: {breakfast: string; 'morning-snack': string; lunch: string; 'afternoon-snack': string; dinner: string; 'evening-snack': string;}) => {
        const list = [meals.breakfast, meals['morning-snack'], meals.lunch, meals['afternoon-snack'], meals.dinner, meals['evening-snack']]
          .filter(Boolean)
          .flatMap(s => s.split(',').map(x => x.trim()).filter(Boolean));
        const res = await fetch('/api/calculate-macros', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ingredients: list })
        });
        if (!res.ok) throw new Error('calculate-macros failed');
        const data = await res.json();
        const results: any[] = data?.results || [];
        return results.reduce((acc, r) => ({
          calories: acc.calories + (r?.macros?.calories || 0),
          protein: acc.protein + (r?.macros?.protein || 0),
          carbs: acc.carbs + (r?.macros?.carbs || 0),
          fat: acc.fat + (r?.macros?.fat || 0),
        }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
      };

      // 3) Balance loop to fit within ±5% targets
      const target = { calories: planData.calories, protein: planData.protein, carbs: planData.carbs, fat: planData.fat } as any;
      let meals = buildMeals();
      addGenLog('Initial meals', meals);
      let totals = await computeTotals(meals);
      addGenLog('Initial totals', totals);
      const within = (totals: any) => (
        Math.abs(totals.calories - target.calories) <= target.calories * 0.05 &&
        Math.abs(totals.protein - target.protein)   <= target.protein   * 0.05 &&
        Math.abs(totals.carbs - target.carbs)       <= target.carbs     * 0.05 &&
        Math.abs(totals.fat - target.fat)           <= target.fat       * 0.05
      );

      let iter = 0;
      while (!within(totals) && iter < 16) {
        // Compute relative errors
        const errCal = (totals.calories - target.calories) / Math.max(1, target.calories);
        const errPro = (totals.protein  - target.protein)  / Math.max(1, target.protein);
        const errCar = (totals.carbs    - target.carbs)    / Math.max(1, target.carbs);
        const errFat = (totals.fat      - target.fat)      / Math.max(1, target.fat);
        addGenLog(`Iter ${iter} errors`, { errCal, errPro, errCar, errFat });

        // Adjust gram-based knobs proportionally, clamp between 0.5x..1.5x of baseline
        const adjust = (v: number, delta: number, min: number, max: number) => Math.min(max, Math.max(min, Math.round(v * delta)));
        const down = (x:number) => (x > 0 ? Math.max(1, Math.round(x * 0.9)) : x);
        const up   = (x:number) => Math.round(x * 1.1);

        if (errCal > 0.05 || errCar > 0.05) {
          // too high calories/carbs → reduce carb-heavy
          params.oatsG       = adjust(params.oatsG, 0.85, 0, 200);
          params.riceG       = adjust(params.riceG, 0.85, 0, 300);
          params.dinnerCarbG = adjust(params.dinnerCarbG, 0.85, 0, 300);
          params.granolaG    = adjust(params.granolaG, 0.85, 0, 120);
          params.milkMl      = adjust(params.milkMl, 0.85, 0, 500);
          params.bananaG     = adjust(params.bananaG, 0.85, 0, 200);
          params.oatsCup     = Math.max(0, params.oatsCup - 1);
          params.milkCup     = Math.max(0, params.milkCup - 1);
          params.yogurtCup   = Math.max(0, params.yogurtCup - 1);
          params.pastaCup    = Math.max(0, params.pastaCup - 1);
        } else if (errCal < -0.05 || errCar < -0.05) {
          // too low → increase carb-heavy
          params.oatsG       = adjust(params.oatsG, 1.1, 0, 300);
          params.riceG       = adjust(params.riceG, 1.1, 0, 400);
          params.dinnerCarbG = adjust(params.dinnerCarbG, 1.1, 0, 400);
          params.granolaG    = adjust(params.granolaG, 1.1, 0, 150);
          params.milkMl      = adjust(params.milkMl, 1.1, 0, 600);
          params.bananaG     = adjust(params.bananaG, 1.1, 0, 250);
          params.oatsCup     = Math.min(2, params.oatsCup + 1);
          params.milkCup     = Math.min(2, params.milkCup + 1);
          params.yogurtCup   = Math.min(2, params.yogurtCup + 1);
          params.pastaCup    = Math.min(2, params.pastaCup + 1);
        }

        if (errPro > 0.05) {
          // protein too high → reduce meat/yogurt
          params.chickenG        = adjust(params.chickenG, 0.85, 0, 240);
          params.dinnerProteinG  = adjust(params.dinnerProteinG, 0.85, 0, 240);
          params.yogurtG         = adjust(params.yogurtG, 0.85, 0, 250);
          params.chickenPiece    = Math.max(0, params.chickenPiece - 1);
          params.beefPiece       = Math.max(0, params.beefPiece - 1);
        } else if (errPro < -0.05) {
          // protein too low → increase meat/yogurt
          params.chickenG        = adjust(params.chickenG, 1.1, 0, 300);
          params.dinnerProteinG  = adjust(params.dinnerProteinG, 1.1, 0, 300);
          params.yogurtG         = adjust(params.yogurtG, 1.1, 0, 300);
          params.chickenPiece    = Math.min(2, params.chickenPiece + 1);
          params.beefPiece       = Math.min(2, params.beefPiece + 1);
        }

        if (errFat > 0.05) {
          // fat too high → reduce peanut/avocado
          params.peanutG  = adjust(params.peanutG, 0.8, 0, 60);
          params.avocadoG = adjust(params.avocadoG, 0.8, 0, 120);
          params.avocadoPiece = Math.max(0, params.avocadoPiece - 1);
        } else if (errFat < -0.05) {
          // fat too low → increase peanut/avocado
          params.peanutG  = adjust(params.peanutG, 1.15, 0, 80);
          params.avocadoG = adjust(params.avocadoG, 1.15, 0, 150);
          params.avocadoPiece = Math.min(2, params.avocadoPiece + 1);
        }

        meals = buildMeals();
        addGenLog(`Iter ${iter} params`, params);
        totals = await computeTotals(meals);
        addGenLog(`Iter ${iter} totals`, totals);
        iter++;
      }
      // Final scaling phase: re-fetch plan to ensure latest targets, then scale grams to close gaps
      try {
        addGenLog('Final scaling: fetching latest plan targets');
        const planRes = await fetch(`/api/nutrition-plans/${planId}`);
        if (planRes.ok) {
          const planJson = await planRes.json();
          const latest = planJson?.plan || planJson;
          if (latest?.calories && latest?.protein && latest?.carbs && latest?.fat) {
            target.calories = latest.calories;
            target.protein = latest.protein;
            target.carbs = latest.carbs;
            target.fat = latest.fat;
            addGenLog('Final scaling: latest targets', target);
          }
        }
      } catch {}

      const clamp = (v:number,min:number,max:number)=>Math.min(max,Math.max(min,v));
      const scaleSet = (keys: Array<keyof typeof params>, factor:number, min:number, max:number) => {
        keys.forEach(k => {
          // only scale gram/ml based knobs
          // piece/cup counters are left as-is in final scaling
          // @ts-ignore
          params[k] = Math.round(clamp((params[k] as number) * factor, min, max));
        });
      };

      for (let pass=0; pass<3; pass++) {
        const calRatio = target.calories > 0 ? clamp(target.calories / Math.max(1, totals.calories), 0.6, 1.4) : 1;
        const proRatio = target.protein  > 0 ? clamp(target.protein  / Math.max(1, totals.protein), 0.5, 1.5) : 1;
        const carbRatio= target.carbs    > 0 ? clamp(target.carbs    / Math.max(1, totals.carbs),   0.5, 1.5) : 1;
        const fatRatio = target.fat      > 0 ? clamp(target.fat      / Math.max(1, totals.fat),     0.5, 1.5) : 1;
        addGenLog(`Final scaling pass ${pass}`, { calRatio, proRatio, carbRatio, fatRatio });

        // First align protein and fat using their knobs
        scaleSet(['chickenG','dinnerProteinG','yogurtG'], proRatio, 0, 400);
        scaleSet(['peanutG','avocadoG'], fatRatio, 0, 200);
        // Then align carbs (and calories) using carb knobs
        scaleSet(['oatsG','riceG','dinnerCarbG','granolaG','bananaG','milkMl'], carbRatio * calRatio, 0, 600);

        meals = buildMeals();
        totals = await computeTotals(meals);
        addGenLog(`Final scaling pass ${pass} totals`, totals);
        if (within(totals)) break;
      }

      // Micro calorie pass: if still outside ±5% on calories, scale carb knobs slightly
      if (!within(totals)) {
        const calRatio = target.calories > 0 ? clamp(target.calories / Math.max(1, totals.calories), 0.85, 1.15) : 1;
        if (Math.abs(1 - calRatio) > 0.02) {
          addGenLog('Final micro calorie scaling', { calRatio });
          scaleSet(['oatsG','riceG','dinnerCarbG','granolaG','bananaG','milkMl'], calRatio, 0, 600);
          meals = buildMeals();
          totals = await computeTotals(meals);
          addGenLog('Final micro calorie totals', totals);
        }
      }

      addGenLog('Final meals', meals);
      addGenLog('Final totals', totals);

      // 4) Save to plan via API
      const saveMeal = async (mealType: string, text: string) => {
        await fetch(`/api/nutrition-plans/${planId}/set-meal`, {
          method: 'POST', headers: { 'Content-Type':'application/json' },
          body: JSON.stringify({ dayKey: day, mealType, mealText: text })
        });
      };
      await saveMeal('breakfast', meals.breakfast);
      await saveMeal('morning-snack', meals['morning-snack']);
      await saveMeal('lunch', meals.lunch);
      await saveMeal('afternoon-snack', meals['afternoon-snack']);
      await saveMeal('dinner', meals.dinner);
      await saveMeal('evening-snack', meals['evening-snack']);

      // 4) Refresh UI state and recalc totals
      const planRes = await fetch(`/api/nutrition-plans/${planId}`);
      if (planRes.ok) {
        const updated = await planRes.json();
        setPlanData(updated);
        const totals = await calculateDailyTotalsV3((updated.weekMenu || {})[day] || {});
        setDailyTotals({...totals});
      }
      addGenLog('Done and UI refreshed');
    } catch (e) {
      console.error('[Generator] Failed to generate plan', e);
      alert('Failed to generate plan');
      addGenLog('Error', String(e));
    }
  };

  // Function to handle adding ingredient to meal
  const handleAddIngredient = async (ingredient: Ingredient, quantity: number, mealType: string) => {
    try {
      const response = await fetch(`/api/nutrition-plans/${planId}/add-ingredient`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ingredientId: ingredient.id,
          quantity,
          dayKey: activeDay,
          mealType: mealType
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add ingredient');
      }

      const data = await response.json();
      
      // Update the plan data with the new meal description
      setPlanData(data.plan);
      
      // Force re-render by updating the plan data
      const updatedPlan = data.plan;
      
      // Use V3 function for optimized calculation
      const dayData = updatedPlan.weekMenu[activeDay];
      const totals = await calculateDailyTotalsV3(dayData);
      
      setDailyTotals({...totals});
      
    } catch (error) {
      console.error('Error adding ingredient:', error);
      alert('Failed to add ingredient. Please try again.');
    }
  };

  // Function to handle adding recipe to meal
  const handleAddRecipe = async (recipe: any, mealType: string) => {
    try {
      // Add recipe as a grouped item using the new API endpoint
      const response = await fetch(`/api/nutrition-plans/${planId}/add-recipe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipeId: recipe.id,
          dayKey: activeDay,
          mealType: mealType
        }),
      });

      if (!response.ok) {
        let errorData: any;
        try {
          errorData = await response.json();
        } catch (e) {
          const errorText = await response.text().catch(() => 'Unknown error');
          console.error('[handleAddRecipe] Response error:', {
            status: response.status,
            statusText: response.statusText,
            body: errorText
          });
          throw new Error(`Failed to add recipe (${response.status}): ${errorText}`);
        }
        console.error('[handleAddRecipe] API error response:', errorData);
        throw new Error(errorData.error || errorData.details || 'Failed to add recipe');
      }

      const data = await response.json();
      console.log('[handleAddRecipe] Success response:', { success: data.success, hasPlan: !!data.plan });
      
      // Refresh plan data from database to ensure we have the latest state
      if (planId) {
        await fetchPlanData(planId);
      } else {
        // Fallback: use the returned plan data
        setPlanData(data.plan);
        const updatedPlan = data.plan;
        const dayData = updatedPlan.weekMenu[activeDay];
        const totals = await calculateDailyTotalsV3(dayData);
        setDailyTotals({...totals});
      }
      
      console.log('✅ Recipe added successfully:', recipe.name);
    } catch (error) {
      console.error('Error adding recipe:', error);
      alert(`Failed to add recipe: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleClearMeal = async (mealType: string) => {
    if (!planId) return;
    
    const mealDisplayName = mealDisplayNames[mealType as MealKey] || mealType;
    const ok = window.confirm(`Weet je zeker dat je alle ingrediënten van ${mealDisplayName} wilt verwijderen?`);
    if (!ok) return;

    try {
      const response = await fetch(`/api/nutrition-plans/${planId}/set-meal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dayKey: activeDay,
          mealType: mealType,
          mealText: '' // Clear the meal
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to clear meal');
      }

      const data = await response.json();
      
      // Update the plan data
      setPlanData(data.plan);
      
      // Recalculate totals
      const updatedPlan = data.plan;
      const dayData = updatedPlan.weekMenu[activeDay];
      const totals = await calculateDailyTotalsV3(dayData);
      setDailyTotals({...totals});
      
      // Also update meal macros
      const { mealMacros: newMealMacros } = await calculateMealMacrosAndTotalsV2(dayData);
      setMealMacros(newMealMacros);
      
      console.log('✅ Meal cleared successfully:', mealType);
    } catch (error) {
      console.error('Error clearing meal:', error);
      alert(`Failed to clear meal: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
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


  // Helpers for PDF branding
  const THEME = {
    pink: { r: 236, g: 72, b: 153 }, // tailwind pink-500
    pinkLight: { r: 251, g: 207, b: 232 },
    textDark: { r: 31, g: 41, b: 55 },
    grayLight: { r: 243, g: 244, b: 246 },
  };

  // Use system fonts (Arial/Helvetica) for better readability and consistency
  const ensureSystemFonts = async (pdf: jsPDF) => {
    try {
      console.log('[PDF][Fonts] Using system fonts (Arial/Helvetica) for better readability');
      // Arial is available by default in jsPDF, no need to load custom fonts
      return true;
    } catch (error) {
      console.warn('[PDF][Fonts] Font setup failed:', error);
      return false;
    }
  };

  const addFooter = (pdf: jsPDF, page: number) => {
    const w = pdf.internal.pageSize.getWidth();
    const h = pdf.internal.pageSize.getHeight();
    pdf.setDrawColor(230);
    pdf.line(15, h - 15, w - 15, h - 15);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(120);
    pdf.text(`Page ${page}`, w - 30, h - 10);
  };

  // Tries to rasterize an SVG (public path) to PNG data URL
  const loadLogoDataUrl = async (): Promise<string | null> => {
    try {
      const url = '/logo/Middel 4.svg';
      const svgText = await fetch(url).then(r => r.text());
      const svgBlob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
      const DOMURL = window.URL || (window as any).webkitURL;
      const urlObj = DOMURL.createObjectURL(svgBlob);
      const img = new Image();
      const dataUrl: string = await new Promise((resolve, reject) => {
        img.onload = () => {
          const canvas = document.createElement('canvas');
          // scale rasterization for quality
          const scale = 2;
          canvas.width = img.width * scale || 320;
          canvas.height = img.height * scale || 80;
          const ctx = canvas.getContext('2d');
          if (!ctx) return resolve('');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const out = canvas.toDataURL('image/png');
          DOMURL.revokeObjectURL(urlObj);
          resolve(out);
        };
        img.onerror = () => resolve('');
        img.src = urlObj;
      });
      return dataUrl || null;
    } catch {
      return null;
    }
  };

  const drawHeader = async (pdf: jsPDF, title: string, subtitle?: string) => {
    const pageW = pdf.internal.pageSize.getWidth();
    const headerH = 28;
    const marginX = 12;
    const gutter = 6;
    const contentW = pageW - (marginX * 2) - gutter;
    const leftColW = contentW * 0.25;  // logo
    const rightColW = contentW * 0.75; // title/subtitle

    // Header bar background
    pdf.setFillColor(THEME.pink.r, THEME.pink.g, THEME.pink.b);
    pdf.rect(0, 0, pageW, headerH, 'F');

    // Left column: logo, centered vertically in header, max height 18 and max width leftColW
    const logo = await loadLogoDataUrl();
    if (logo) {
      try {
        const img = new Image();
        await new Promise<void>((resolve) => { img.onload = () => resolve(); img.onerror = () => resolve(); img.src = logo; });
        const maxH = 18;
        const maxW = leftColW; // keep inside column
        let drawW = 30;
        let drawH = 12;
        if (img.naturalWidth && img.naturalHeight) {
          const ratio = img.naturalWidth / img.naturalHeight;
          // Fit within maxW x maxH while preserving aspect
          drawH = Math.min(maxH, maxW / ratio);
          drawW = drawH * ratio;
        } else {
          drawH = 16;
          drawW = 40;
        }
        const logoX = marginX + (leftColW - drawW) / 2;
        const logoY = (headerH - drawH) / 2;
        pdf.addImage(logo, 'PNG', logoX, logoY, drawW, drawH);
      } catch {}
    }

    // Right column: title and subtitle
    const textX = marginX + leftColW + gutter;
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(16);
    pdf.text(title, textX, 14);
    if (subtitle) {
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.text(subtitle, textX, 20);
    }
  };

  const drawBadge = (pdf: jsPDF, x: number, y: number, label: string, value: string, color: [number, number, number]) => {
    // Compact modern card design - similar to platform UI
    const cardWidth = 40;
    const cardHeight = 20;
    const borderRadius = 4;
    
    // Subtle shadow for depth
    pdf.setFillColor(0, 0, 0, 0.08);
    pdf.roundedRect(x + 0.5, y + 0.5, cardWidth, cardHeight, borderRadius, borderRadius, 'F');
    
    // Main card with gradient-like color
    pdf.setFillColor(color[0], color[1], color[2]);
    pdf.roundedRect(x, y, cardWidth, cardHeight, borderRadius, borderRadius, 'F');
    
    // White text for contrast
    pdf.setTextColor(255, 255, 255);
    
    // Compact label
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(6);
    pdf.text(label, x + 4, y + 7);
    
    // Prominent value
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    pdf.text(value, x + 4, y + 16);
  };

  const drawDayTable = (pdf: jsPDF, startY: number, dayName: string, meals: Array<{ name: string; description: string; calories: number; cookingInstructions?: string }>) => {
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let y = startY;
    const left = 15, right = pageWidth - 15;
    // Pre-compute height for card with better column sizing
    let estimated = 6 /*title*/ + 10 /*header*/;
    const descriptionWidth = pageWidth - 110; // Better width for description (from x=60 to pageWidth-50)
    const tmpLinesHeights = meals.map(row => {
      const lines = pdf.splitTextToSize(row.description || '', descriptionWidth);
      const rowHeight = Math.max(8, lines.length * 5);
      return rowHeight + 2; // +divider space
    });
    estimated += tmpLinesHeights.reduce((a, b) => a + b, 0);
    // White card background
    pdf.setFillColor(255, 255, 255);
    pdf.roundedRect(left, y - 4, right - left, Math.min(estimated, pageHeight - y - 20), 4, 4, 'F');
    // Day title
    pdf.setTextColor(THEME.textDark.r, THEME.textDark.g, THEME.textDark.b);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(13);
    pdf.text(dayName, 20, y);
    y += 6;
    // Table header
    pdf.setFillColor(THEME.grayLight.r, THEME.grayLight.g, THEME.grayLight.b);
    pdf.rect(20, y, pageWidth - 40, 8, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.setTextColor(55);
    pdf.text('Meal', 23, y + 6);
    pdf.text('Description', 60, y + 6);
    pdf.text('Calories', pageWidth - 45, y + 6);
    y += 10;
    pdf.setFont('Ubuntu', 'normal');
    pdf.setFontSize(8); // Slightly smaller for better fit
    pdf.setTextColor(33);
    let dailyTotal = 0;
    for (const row of meals) {
      const lines = pdf.splitTextToSize(row.description || '', descriptionWidth);
      const rowHeight = Math.max(8, lines.length * 5);
      if (y + rowHeight > pageHeight - 25) {
        pdf.addPage();
        addFooter(pdf, pdf.getNumberOfPages());
        y = 28;
      }
      pdf.text(row.name, 23, y + 5);
      lines.forEach((line: string, i: number) => pdf.text(line, 60, y + 5 + i * 5));
      pdf.text(String(row.calories || 0), pageWidth - 45, y + 5, { align: 'right' });
      y += rowHeight;
      dailyTotal += row.calories || 0;
      
      // Add cooking instructions if available
      if (row.cookingInstructions && row.cookingInstructions.trim()) {
        const instructionLines = pdf.splitTextToSize(`👨‍🍳 ${row.cookingInstructions}`, descriptionWidth);
        const instructionHeight = Math.max(6, instructionLines.length * 4);
        if (y + instructionHeight > pageHeight - 25) {
          pdf.addPage();
          addFooter(pdf, pdf.getNumberOfPages());
          y = 28;
        }
        pdf.setFontSize(7);
        pdf.setTextColor(100, 100, 100);
        instructionLines.forEach((line: string, i: number) => pdf.text(line, 60, y + 3 + i * 4));
        y += instructionHeight + 2;
        pdf.setFontSize(8);
        pdf.setTextColor(33);
      }
      // divider
      pdf.setDrawColor(240);
      pdf.line(20, y, pageWidth - 20, y);
      y += 2;
    }
    // Daily total badge removed - was showing incorrect values
    return y;
  };

  // Build the PDF and return the jsPDF instance
  const buildPdf = async (type: 'week' = 'week'): Promise<jsPDF | null> => {
    if (!planData) return null;

    try {
      // Create a new PDF document
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      // Gradient background (homepage style)
      await paintGradientBackground(pdf);
      await ensureSystemFonts(pdf);
      let yPosition = 36; // below header

      // Header with branding (always 7-day plan now)
      await drawHeader(pdf, planData.name || 'Nutrition Plan', '7-Day Meal Plan');

      // Weekly summary section title
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(12);
      pdf.setTextColor(THEME.textDark.r, THEME.textDark.g, THEME.textDark.b);
      pdf.text('Weekly Nutrition Plan', 15, yPosition);
      yPosition += 10;

      // Add daily meal plans (support both "days" and legacy "weekMenu")
      let renderedAny = false;
      if (planData.days) {
        console.log('[PDF] Rendering 7-day plan from planData.days');
        const allDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        
        for (const day of allDays) {
          const dayData = planData.days[day];
          
          // ALWAYS start each new day on a new page (except Monday which is the first day)
          if (day !== 'monday') {
            pdf.addPage();
            await paintGradientBackground(pdf);
            await drawHeader(pdf, planData.name || 'Nutrition Plan', '7-Day Meal Plan');
            yPosition = 36;
          }

          // Draw day header with background
          pdf.setFillColor(236, 72, 153); // Pink color
          pdf.roundedRect(15, yPosition - 4, 180, 12, 2, 2, 'F');
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(14);
          pdf.setTextColor(255, 255, 255); // White text
          const dayName = day.charAt(0).toUpperCase() + day.slice(1);
          pdf.text(dayName, 20, yPosition + 4);
          yPosition += 18; // Extra padding after day header for breathing room

          // Calculate and show daily totals for this day (only if dayData exists)
      let dayTotals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
          if (dayData) {
            try {
        dayTotals = await calculateDailyTotalsV3(dayData);
            } catch {}
          }
          
          // Show badges for day totals
          if (!dayData) {
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(10);
            pdf.setTextColor(100, 100, 100);
            pdf.text(`No meal plan for this day`, 20, yPosition);
            yPosition += 8;
          } else {
            // Draw compact badges with responsive spacing
      const yRow = yPosition;
            const badgeSpacing = 45; // Space between badges
            const leftMargin = 15;
            
            drawBadge(pdf, leftMargin, yRow, 'Day Calories', `${dayTotals.calories}`, [255, 165, 0]);
            drawBadge(pdf, leftMargin + badgeSpacing, yRow, 'Day Protein', `${dayTotals.protein}g`, [0, 123, 255]);
            drawBadge(pdf, leftMargin + (badgeSpacing * 2), yRow, 'Day Carbs', `${dayTotals.carbs}g`, [34, 197, 94]);
            drawBadge(pdf, leftMargin + (badgeSpacing * 3), yRow, 'Day Fat', `${dayTotals.fat}g`, [168, 85, 247]);
            
            // Add generous padding after badges (badge height 20 + 15 padding)
            yPosition += 35;
          }

          // Skip rendering meals if no data for this day
          if (!dayData) {
            yPosition += 10;
            continue;
          }

          const mealOrder = ['breakfast', 'morning-snack', 'lunch', 'afternoon-snack', 'dinner', 'evening-snack'];
          const rows: Array<{ name: string; description: string; calories: number }> = [];
          for (const mealType of mealOrder) {
            const meal = dayData[mealType];
            const rawDesc = meal?.description || '';
            const description = sanitizeMealDescription(rawDesc);
            let calories = 0;
            if (description) {
              try {
                const macros = await calculateMealMacrosFromIngredients(description, mealType);
                calories = macros.calories || 0;
              } catch { calories = 0; }
            }
            rows.push({
              name: mealType.charAt(0).toUpperCase() + mealType.slice(1),
              description,
              calories,
            });
          }

          // Use dayName from above (already declared at line 1666)
          yPosition = drawDayTable(pdf, yPosition, dayName, rows);
          yPosition += 6;
          // For each meal, draw ingredient table with macros
          for (const mealRow of rows) {
            // Use the new API function to get accurate ingredient data
            const ingredientData = await getIngredientDataFromAPI(mealRow.description || '');
            
            console.log('[PDF] Got ingredient data for', mealRow.name, ingredientData);
            // If nothing parsed, still render a placeholder table
            if (!ingredientData || ingredientData.length === 0) {
              const placeholderRows = [{ ingredient: 'No ingredients', portion: '', calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }];
              if (yPosition > pageHeight - 70) {
                pdf.addPage();
                await paintGradientBackground(pdf);
                await drawHeader(pdf, planData.name || 'Nutrition Plan');
                yPosition = 36;
              }
              yPosition = drawMealIngredientsTable(pdf, yPosition, `${mealRow.name} ingredients`, placeholderRows);
              yPosition += 6;
              if (yPosition > pageHeight - 40) {
                pdf.addPage();
                pdf.setFillColor(THEME.pink.r, THEME.pink.g, THEME.pink.b);
                pdf.rect(0, 0, pageWidth, pageHeight, 'F');
                await drawHeader(pdf, planData.name || 'Nutrition Plan');
                await drawHeroBottomRight(pdf);
                yPosition = 36;
              }
              continue;
            }

            // Fetch macros
            // Convert to the format expected by drawMealIngredientsTable
            const rowsIng = ingredientData.map((ing: any) => ({
              ingredient: ing.name,
              portion: ing.portion,
              calories: ing.calories,
              protein: ing.protein,
              carbs: ing.carbs,
              fat: ing.fat,
              fiber: ing.fiber
            }));

            // Pre-break if close to bottom before drawing the table
            if (yPosition > pageHeight - 70) {
              pdf.addPage();
              await paintGradientBackground(pdf);
              await drawHeader(pdf, planData.name || 'Nutrition Plan');
              yPosition = 36;
            }

            yPosition = drawMealIngredientsTable(pdf, yPosition, `${mealRow.name} ingredients`, rowsIng);
            yPosition += 6;
            if (yPosition > pageHeight - 40) { // new page when close to bottom
              pdf.addPage();
              // repaint background and header on new page
              await paintGradientBackground(pdf);
              await drawHeader(pdf, planData.name || 'Nutrition Plan');
              yPosition = 36;
            }
          }
        }
      } else if (planData.weekMenu) {
        console.log('[PDF] Rendering 7-day plan from planData.weekMenu');
        addGenLog('📄 Starting PDF generation for all 7 days...');
        const allDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        
        for (const dayKey of allDays) {
          addGenLog(`📅 Processing ${dayKey.toUpperCase()}...`);
        const dayMenu = planData.weekMenu[dayKey] || {};
          
          // ALWAYS start each new day on a new page (except Monday which is the first day)
          if (dayKey !== 'monday') {
            pdf.addPage();
            addGenLog(`📄 Creating new page for ${dayKey}`);
            await paintGradientBackground(pdf);
            await drawHeader(pdf, planData.name || 'Nutrition Plan', '7-Day Meal Plan');
            yPosition = 36;
          }

          // Draw day header with background
          pdf.setFillColor(236, 72, 153); // Pink color
          pdf.roundedRect(15, yPosition - 4, 180, 12, 2, 2, 'F');
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(14);
          pdf.setTextColor(255, 255, 255); // White text
          const dayName = dayKey.charAt(0).toUpperCase() + dayKey.slice(1);
          pdf.text(dayName, 20, yPosition + 4);
          yPosition += 18; // Extra padding after day header for breathing room

          // Calculate and show daily totals for this day
          let dayTotals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
          if (dayMenu && Object.keys(dayMenu).length > 0) {
            try {
              dayTotals = await calculateDailyTotalsV3(dayMenu);
            } catch {}
          }
          
          // Check if this day has any meals
          const hasMeals = Object.values(dayMenu).some((meal: any) => {
            if (typeof meal === 'string') return meal.trim().length > 0;
            if (meal && typeof meal === 'object') return (meal.description || meal.ingredients || '').trim().length > 0;
            return false;
          });

          // Show badges for day totals or "no meal plan" message
          if (!hasMeals) {
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(10);
            pdf.setTextColor(100, 100, 100);
            pdf.text(`No meal plan for this day`, 20, yPosition);
            yPosition += 18;
            continue;
          } else {
            // Draw compact badges with responsive spacing
            const yRow = yPosition;
            const badgeSpacing = 45; // Space between badges
            const leftMargin = 15;
            
            drawBadge(pdf, leftMargin, yRow, 'Day Calories', `${dayTotals.calories}`, [255, 165, 0]);
            drawBadge(pdf, leftMargin + badgeSpacing, yRow, 'Day Protein', `${dayTotals.protein}g`, [0, 123, 255]);
            drawBadge(pdf, leftMargin + (badgeSpacing * 2), yRow, 'Day Carbs', `${dayTotals.carbs}g`, [34, 197, 94]);
            drawBadge(pdf, leftMargin + (badgeSpacing * 3), yRow, 'Day Fat', `${dayTotals.fat}g`, [168, 85, 247]);
            
            // Add generous padding after badges (badge height 20 + 15 padding)
            yPosition += 35;
          }

        const mealOrder = ['breakfast', 'morning-snack', 'lunch', 'afternoon-snack', 'dinner', 'evening-snack'];
        const rows: Array<{ name: string; description: string; calories: number; cookingInstructions?: string }> = [];
          
        for (const mealType of mealOrder) {
          const mealData = dayMenu[mealType];
          let description = '';
          let cookingInstructions = '';
          
          if (typeof mealData === 'string') {
            // Old structure
            description = sanitizeMealDescription(mealData);
          } else if (mealData && typeof mealData === 'object') {
              // New structure - check both 'description' and 'ingredients' fields
              description = sanitizeMealDescription(mealData.description || mealData.ingredients || '');
            cookingInstructions = mealData.cookingInstructions || '';
          }
          
          let calories = 0;
          if (description) {
            try {
              const ingredientData = await getIngredientDataFromAPI(description);
              if (ingredientData && ingredientData.length > 0) {
                const mealTotals = ingredientData.reduce((acc: any, ing: any) => ({
                  calories: acc.calories + (ing.calories || 0),
                  protein: acc.protein + (ing.protein || 0),
                  carbs: acc.carbs + (ing.carbs || 0),
                  fat: acc.fat + (ing.fat || 0)
                }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
                calories = mealTotals.calories;
              }
            } catch { calories = 0; }
          }
          rows.push({ 
            name: mealType.charAt(0).toUpperCase() + mealType.slice(1), 
            description, 
            calories,
            cookingInstructions
          });
        }
          
          yPosition = drawDayTable(pdf, yPosition, dayName, rows);
        yPosition += 6;
          
        for (const mealRow of rows) {
            // Skip empty meals
            if (!mealRow.description) continue;
            
            addGenLog(`   🍽️  Rendering ${mealRow.name} table for ${dayKey}...`);
            
            // CRITICAL: Read ingredient data directly from the DOM to ensure 1:1 accuracy with UI
            let ingredientData: any[] = [];
            
            // Try to find the ingredient breakdown component in the DOM for this day and meal
            const mealTypeKey = mealRow.name.toLowerCase().replace(' ', '-');
            const domSelector = `[data-day="${dayKey}"][data-meal-type="${mealTypeKey}"]`;
            const mealElement = document.querySelector(domSelector);
            
            if (mealElement) {
              try {
                const ingredientsJson = mealElement.getAttribute('data-ingredients');
                if (ingredientsJson) {
                  ingredientData = JSON.parse(ingredientsJson);
                  addGenLog(`   📋 Read ${ingredientData.length} ingredients directly from DOM for ${mealRow.name}`);
                  // Log the actual portions to verify correctness
                  const portions = ingredientData.map((ing: any) => `${ing.name}: ${ing.portion}`).join(', ');
                  addGenLog(`   📊 Portions: ${portions}`);
                }
              } catch (err) {
                addGenLog(`   ⚠️  Failed to parse DOM data for ${mealRow.name}, falling back to API`);
              }
            }
            
            // Fallback: Use API if DOM data not available
            if (ingredientData.length === 0) {
              addGenLog(`   🔄 Falling back to API for ${mealRow.name}...`);
              ingredientData = await getIngredientDataFromAPI(mealRow.description);
            }
          
          if (!ingredientData || ingredientData.length === 0) {
              addGenLog(`   ⚠️  No ingredients found for ${mealRow.name}`);
              continue; // Skip meals with no ingredients
            }
            
            addGenLog(`   ✅ Found ${ingredientData.length} ingredients for ${mealRow.name}`);
          
          // Convert to the format expected by drawMealIngredientsTable
          const rowsIng = ingredientData.map((ing: any) => ({
            ingredient: ing.name,
            portion: ing.portion,
            calories: ing.calories,
            protein: ing.protein,
            carbs: ing.carbs,
            fat: ing.fat,
            fiber: ing.fiber
          }));
          
            if (yPosition > pageHeight - 70) { 
              pdf.addPage();
              addGenLog(`📄 Creating new page for ${mealRow.name} of ${dayKey}`);
              await paintGradientBackground(pdf); 
              await drawHeader(pdf, planData.name || 'Nutrition Plan', '7-Day Meal Plan'); 
              yPosition = 36; 
            }
          yPosition = drawMealIngredientsTable(pdf, yPosition, `${mealRow.name} ingredients`, rowsIng);
          yPosition += 6;
        }
          
          addGenLog(`✅ Completed ${dayKey.toUpperCase()}`);
        }
        
        addGenLog('🎉 PDF generation complete! Total pages: ' + pdf.getNumberOfPages());
      }

      // Add shopping list if available
      if (shoppingList.length > 0) {
        pdf.addPage();
        // repaint background and header
        await paintGradientBackground(pdf);
        await drawHeader(pdf, planData.name || 'Nutrition Plan');
        yPosition = 36;
        
        // Shopping List title with Ubuntu font
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(14);
        pdf.setTextColor(THEME.textDark.r, THEME.textDark.g, THEME.textDark.b);
        pdf.text('Boodschappenlijst', 15, yPosition);
        yPosition += 12;
        
        // Create beautiful white table for shopping list
        const tableWidth = pageWidth - 30;
        const rowHeight = 12;
        const headerHeight = 10;
        
        // Table header background
        pdf.setFillColor(248, 249, 250); // Light gray background
        pdf.roundedRect(15, yPosition, tableWidth, headerHeight, 2, 2, 'F');
        
        // Header text
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(10);
        pdf.setTextColor(55, 65, 81); // Gray-700
        pdf.text('Ingrediënt', 18, yPosition + 7);
        pdf.text('Hoeveelheid', 120, yPosition + 7);
        pdf.text('Eenheid', 160, yPosition + 7);
        
        yPosition += headerHeight;
        
        // Table rows
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);
        pdf.setTextColor(17, 24, 39); // Gray-900
        
        for (let i = 0; i < shoppingList.length; i++) {
          const item = shoppingList[i];
          
          // Check if we need a new page
          if (yPosition > pageHeight - 30) {
            pdf.addPage();
            await paintGradientBackground(pdf);
            await drawHeader(pdf, planData.name || 'Nutrition Plan');
            yPosition = 36;
            
            // Redraw table header
            pdf.setFillColor(248, 249, 250);
            pdf.roundedRect(15, yPosition, tableWidth, headerHeight, 2, 2, 'F');
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(10);
            pdf.setTextColor(55, 65, 81);
            pdf.text('Ingrediënt', 18, yPosition + 7);
            pdf.text('Hoeveelheid', 120, yPosition + 7);
            pdf.text('Eenheid', 160, yPosition + 7);
            yPosition += headerHeight;
            
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(9);
            pdf.setTextColor(17, 24, 39);
          }
          
          // Row background (alternating colors)
          if (i % 2 === 0) {
            pdf.setFillColor(255, 255, 255); // White
          } else {
            pdf.setFillColor(249, 250, 251); // Gray-50
          }
          pdf.rect(15, yPosition, tableWidth, rowHeight, 'F');
          
          // Row content
          pdf.text(item.name || 'Onbekend', 18, yPosition + 8);
          pdf.text(String(item.quantity || '-'), 120, yPosition + 8);
          pdf.text(item.unit || '-', 160, yPosition + 8);
          
          yPosition += rowHeight;
        }
        
        // Table border
        pdf.setDrawColor(209, 213, 219); // Gray-300
        pdf.setLineWidth(0.5);
        pdf.roundedRect(15, yPosition - (shoppingList.length * rowHeight), tableWidth, headerHeight + (shoppingList.length * rowHeight), 2, 2, 'S');
      }

      // Footer on last page
      addFooter(pdf, pdf.getNumberOfPages());

      // Ensure hero is on TOP layer on every page (draw last)
      await overlayHeroOnAllPages(pdf);

      // Save the PDF
      return pdf;
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
      return null;
    }
  };

  const handleDownload = async () => {
    // Directly download 7-day plan (no modal needed)
    const pdf = await buildPdf('week');
    if (!pdf) return;
    const safeName = (planData?.name || 'nutrition-plan').replace(/\s+/g, ' ').trim();
    pdf.save(`${safeName}-7-days.pdf`);
  };

  // Helper function to add progress log
  const addProgressLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setPdfProgress(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  // Function to ensure all 7 days data is loaded
  const ensureAllDaysLoaded = async () => {
    const allDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    addProgressLog('🚀 Starting PDF generation process...');
    addProgressLog(`📋 Plan: ${planData?.name || 'Nutrition Plan'}`);
    addProgressLog('');
    
    // Check which days have data
    let daysWithData = 0;
    let daysWithoutData = 0;
    
    for (const day of allDays) {
      const dayData = planData?.weekMenu?.[day];
      const hasMeals = dayData && Object.keys(dayData).some(key => {
        const mealData = dayData[key];
        return ['breakfast', 'lunch', 'dinner', 'morning-snack', 'afternoon-snack', 'evening-snack'].includes(key) &&
          (typeof mealData === 'string' ? mealData.trim() !== '' : (mealData?.description || mealData?.ingredients));
      });
      
      if (hasMeals) {
        daysWithData++;
        addProgressLog(`✅ ${day.charAt(0).toUpperCase() + day.slice(1)}: Meals configured`);
      } else {
        daysWithoutData++;
        addProgressLog(`⚪ ${day.charAt(0).toUpperCase() + day.slice(1)}: No meals`);
      }
    }
    
    addProgressLog('');
    addProgressLog(`📊 Summary: ${daysWithData} days with meals, ${daysWithoutData} days empty`);
    addProgressLog('');
    
    // Simulate processing time for each day
    for (const day of allDays) {
      const dayData = planData?.weekMenu?.[day];
      const dayName = day.charAt(0).toUpperCase() + day.slice(1);
      
      if (dayData) {
        addProgressLog(`⚙️ Processing ${dayName}...`);
        
        // Count meals for this day
        const mealTypes = ['breakfast', 'morning-snack', 'lunch', 'afternoon-snack', 'dinner', 'evening-snack'];
        const mealsCount = mealTypes.filter(meal => {
          const mealData = dayData[meal];
          return typeof mealData === 'string' ? mealData.trim() !== '' : (mealData?.description || mealData?.ingredients);
        }).length;
        
        if (mealsCount > 0) {
          addProgressLog(`   📝 Found ${mealsCount} meal(s) for ${dayName}`);
        }
        
        // Small delay to show progress
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    addProgressLog('');
    addProgressLog('🎨 Generating PDF layout...');
    await new Promise(resolve => setTimeout(resolve, 200));
    
    addProgressLog('📄 Creating pages for all 7 days...');
    addProgressLog('   ℹ️  Each day starts on a new page for clarity');
    await new Promise(resolve => setTimeout(resolve, 200));
    
    addProgressLog('✨ Adding styling and formatting...');
    await new Promise(resolve => setTimeout(resolve, 200));
    
    addProgressLog('🖼️ Rendering ingredient tables...');
    await new Promise(resolve => setTimeout(resolve, 200));
    
    addProgressLog('');
    addProgressLog('✅ PDF generation complete!');
    
    return true;
  };

  const handlePreview = async () => {
    try {
      // Reset progress and show modal
      setPdfProgress([]);
      setPdfGenerating(true);
      
      // Small delay to ensure modal is visible
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Ensure all days are loaded
      await ensureAllDaysLoaded();
      
      addProgressLog('🔍 Opening preview...');
      await new Promise(resolve => setTimeout(resolve, 300));
      
      console.log('[Preview] Building PDF...');
      const pdf = await buildPdf('week'); // Preview shows full 7-day plan
      if (!pdf) {
        console.error('[Preview] buildPdf() returned null');
        setPdfGenerating(false);
        alert('Preview failed: PDF could not be generated. Check console for details.');
        return;
      }
      try {
        const blob = pdf.output('blob');
        const url = URL.createObjectURL(blob);
        console.log('[Preview] Blob URL created:', url);
        setPdfPreviewUrl(url);
        
        // Close progress modal and open preview
        setPdfGenerating(false);
        setPdfPreviewOpen(true);
      } catch (e) {
        console.warn('[Preview] Blob creation failed, using data URI fallback', e);
        const dataUri = pdf.output('datauristring');
        setPdfPreviewUrl(dataUri);
        
        // Close progress modal and open preview
        setPdfGenerating(false);
        setPdfPreviewOpen(true);
      }
    } catch (err) {
      console.error('[Preview] Unexpected error generating preview:', err);
      setPdfGenerating(false);
      alert('Preview failed due to an unexpected error. See console for details.');
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
        'morning-snack': { calories: 100, protein: 8, carbs: 10, fat: 4 },
        lunch: { calories: 450, protein: 40, carbs: 50, fat: 12 },
        'afternoon-snack': { calories: 100, protein: 7, carbs: 10, fat: 4 },
        dinner: { calories: 470, protein: 45, carbs: 35, fat: 15 },
        'evening-snack': { calories: 0, protein: 0, carbs: 0, fat: 0 }
      },
      tuesday: {
        breakfast: { calories: 360, protein: 22, carbs: 45, fat: 10 },
        'morning-snack': { calories: 110, protein: 10, carbs: 11, fat: 3 },
        lunch: { calories: 480, protein: 42, carbs: 55, fat: 12 },
        'afternoon-snack': { calories: 110, protein: 10, carbs: 11, fat: 2 },
        dinner: { calories: 470, protein: 42, carbs: 40, fat: 15 },
        'evening-snack': { calories: 0, protein: 0, carbs: 0, fat: 0 }
      },
      wednesday: {
        breakfast: { calories: 300, protein: 12, carbs: 50, fat: 6 },
        'morning-snack': { calories: 100, protein: 7, carbs: 8, fat: 5 },
        lunch: { calories: 480, protein: 42, carbs: 50, fat: 13 },
        'afternoon-snack': { calories: 100, protein: 7, carbs: 7, fat: 5 },
        dinner: { calories: 470, protein: 42, carbs: 40, fat: 14 },
        'evening-snack': { calories: 0, protein: 0, carbs: 0, fat: 0 }
      },
      thursday: {
        breakfast: { calories: 340, protein: 22, carbs: 42, fat: 8 },
        'morning-snack': { calories: 125, protein: 9, carbs: 6, fat: 7 },
        lunch: { calories: 460, protein: 42, carbs: 45, fat: 12 },
        'afternoon-snack': { calories: 125, protein: 9, carbs: 6, fat: 6 },
        dinner: { calories: 470, protein: 42, carbs: 40, fat: 13 },
        'evening-snack': { calories: 0, protein: 0, carbs: 0, fat: 0 }
      },
      friday: {
        breakfast: { calories: 280, protein: 24, carbs: 18, fat: 9 },
        'morning-snack': { calories: 125, protein: 10, carbs: 15, fat: 5 },
        lunch: { calories: 450, protein: 42, carbs: 50, fat: 12 },
        'afternoon-snack': { calories: 125, protein: 10, carbs: 15, fat: 4 },
        dinner: { calories: 470, protein: 42, carbs: 40, fat: 11 },
        'evening-snack': { calories: 0, protein: 0, carbs: 0, fat: 0 }
      },
      saturday: {
        breakfast: { calories: 340, protein: 22, carbs: 42, fat: 9 },
        'morning-snack': { calories: 115, protein: 9, carbs: 8, fat: 5 },
        lunch: { calories: 450, protein: 42, carbs: 45, fat: 10 },
        'afternoon-snack': { calories: 115, protein: 9, carbs: 7, fat: 5 },
        dinner: { calories: 470, protein: 45, carbs: 38, fat: 14 },
        'evening-snack': { calories: 0, protein: 0, carbs: 0, fat: 0 }
      },
      sunday: {
        breakfast: { calories: 300, protein: 16, carbs: 40, fat: 7 },
        'morning-snack': { calories: 125, protein: 8, carbs: 3, fat: 9 },
        lunch: { calories: 460, protein: 42, carbs: 50, fat: 12 },
        'afternoon-snack': { calories: 125, protein: 8, carbs: 2, fat: 9 },
        dinner: { calories: 460, protein: 42, carbs: 40, fat: 10 },
        'evening-snack': { calories: 0, protein: 0, carbs: 0, fat: 0 }
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
      console.log('🔍 Calculating macros for meal:', mealDescription);
      
      // Check if mealDescription is a JSON string (from Text Converter)
      if (mealDescription.startsWith('[') && mealDescription.endsWith(']')) {
        try {
          const jsonIngredients = JSON.parse(mealDescription);
          if (Array.isArray(jsonIngredients)) {
            console.log('🔍 Processing JSON ingredients for meal macros:', jsonIngredients);
            
            // Calculate macros directly from JSON ingredients (same logic as IngredientBreakdown)
            let totalCalories = 0, totalProtein = 0, totalCarbs = 0, totalFat = 0;
            
            for (const ingredient of jsonIngredients) {
              const quantity = ingredient.quantity || 0;
              const per = ingredient.per || '100g';
              
              // Parse the per field to get the base amount
              let baseAmount = 100;
              let multiplier = 1;
              
              if (per === '100g') {
                baseAmount = 100;
                multiplier = quantity / baseAmount;
              } else if (per === '100ml') {
                baseAmount = 100;
                multiplier = quantity / baseAmount;
              } else if (per === '1') {
                // per: "1" means the nutritional values are already for the full amount
                // No multiplication needed
                multiplier = 1;
              } else {
                const perMatch = per.match(/(\d+(?:\.\d+)?)/);
                if (perMatch) {
                  baseAmount = parseFloat(perMatch[1]);
                  multiplier = quantity / baseAmount;
                } else {
                  // Fallback: assume per 100g
                  baseAmount = 100;
                  multiplier = quantity / baseAmount;
                }
              }
              
              totalCalories += Math.round((ingredient.calories || 0) * multiplier);
              totalProtein += Math.round((ingredient.protein || 0) * multiplier);
              totalCarbs += Math.round((ingredient.carbs || 0) * multiplier);
              totalFat += Math.round((ingredient.fat || 0) * multiplier);
            }
            
            console.log('🔍 JSON ingredients total:', { totalCalories, totalProtein, totalCarbs, totalFat });
            return { calories: totalCalories, protein: totalProtein, carbs: totalCarbs, fat: totalFat };
          }
        } catch (error) {
          console.log('🔍 Failed to parse JSON ingredients, falling back to string parsing:', error);
        }
      }
      
      // Use the same improved parsing logic as IngredientBreakdown component
      let ingredients = parseMealDescription(mealDescription);
      // Sanitize and normalize like IngredientBreakdown
      ingredients = ingredients.map((ing: string) => ing.replace(/^[^0-9a-zA-Z(]+/, '').trim());
      ingredients = ingredients.map((ing: string) => {
        const m = ing.match(/^\s*(\d+(?:\.\d+)?)\s*g\s+(\d+)\s+(.+)$/i);
        if (m) {
          const qty = m[1];
          const name = m[3];
          return `${qty}g ${name}`;
        }
        return ing;
      });
      if (!ingredients || ingredients.length === 0) {
        return { calories: 0, protein: 0, carbs: 0, fat: 0 };
      }
      
      // Call API to calculate macros
      let response;
      try {
        response = await fetch('/api/calculate-macros', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ingredients }),
        });
      } catch (fetchError: any) {
        console.error('[calculateMealMacrosFromIngredients] Fetch error:', fetchError);
        throw new Error(`Failed to fetch: ${fetchError?.message || 'Network error'}`);
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[calculateMealMacrosFromIngredients] API error:', response.status, errorText);
        throw new Error(`Failed to calculate macros: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      const resultsRaw = data?.results;
      if (!Array.isArray(resultsRaw)) {
        console.warn('⚠️ Unexpected results shape from /api/calculate-macros. Expected array.', resultsRaw);
      }
      const results = Array.isArray(resultsRaw) ? resultsRaw : [];

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

  // V3: Callback for when meal macros change - debounced to prevent excessive recalculations
  const macrosUpdateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onMacrosUpdatedCallback = useCallback(() => {
    console.log('🔔 [DEBUG] onMacrosUpdatedCallback called');
    // Debounce DOM reads to avoid excessive recalculations
    if (macrosUpdateTimerRef.current) {
      clearTimeout(macrosUpdateTimerRef.current);
    }
    macrosUpdateTimerRef.current = setTimeout(() => {
      console.log('🔔 [DEBUG] onMacrosUpdatedCallback timeout fired, calculating totals from DOM');
      const totals = calculateDailyTotalsFromDOM();
      console.log('🔔 [DEBUG] Totals calculated from DOM in onMacrosUpdatedCallback:', totals);
      setDailyTotals(prev => {
        console.log('🔔 [DEBUG] Current dailyTotals before update in onMacrosUpdatedCallback:', prev);
        console.log('🔔 [DEBUG] Setting new dailyTotals to:', totals);
        return {...totals};
      });
      setForceTableUpdate(prev => prev + 1);
    }, 150); // Small debounce to batch multiple updates
  }, []);

  // V3: Get individual meal macros from DOM
  const getMealMacrosFromDOM = (mealType: string): { calories: number; protein: number; carbs: number; fat: number } => {
    try {
      // Get calories
      const caloriesElement = document.querySelector(`.totalcalories-${mealType}`);
      const calories = caloriesElement ? parseInt(caloriesElement.textContent || '0') : 0;

      // Get protein
      const proteinElement = document.querySelector(`.totalprotein-${mealType}`);
      const proteinText = proteinElement?.textContent || '0g';
      const protein = parseFloat(proteinText.replace('g', '')) || 0;

      // Get fat
      const fatElement = document.querySelector(`.totalfat-${mealType}`);
      const fatText = fatElement?.textContent || '0g';
      const fat = parseFloat(fatText.replace('g', '')) || 0;

      // Get carbs
      const carbsElement = document.querySelector(`.totalcarbs-${mealType}`);
      const carbsText = carbsElement?.textContent || '0g';
      const carbs = parseFloat(carbsText.replace('g', '')) || 0;

      return {
        calories: Math.round(calories),
        protein: Math.round(protein * 10) / 10,
        carbs: Math.round(carbs * 10) / 10,
        fat: Math.round(fat * 10) / 10,
      };
    } catch (error) {
      console.error(`❌ [V3] Error reading ${mealType} macros from DOM:`, error);
      return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    }
  };

  // V3: Calculate daily totals by reading actual values from DOM (from IngredientBreakdown components)
  const calculateDailyTotalsFromDOM = (): { calories: number; protein: number; carbs: number; fat: number } => {
    console.log('🔔 [DEBUG] calculateDailyTotalsFromDOM called');
    const mealOrder = ['breakfast', 'morning-snack', 'lunch', 'afternoon-snack', 'dinner', 'evening-snack'];
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    // Helper function to get the most recent/visible value from multiple elements
    const getValueFromElements = (elements: NodeListOf<Element>, isNumeric: boolean = false): number => {
      if (elements.length === 0) return 0;
      
      // Try to find visible element first (not hidden)
      for (const el of Array.from(elements)) {
        const style = window.getComputedStyle(el);
        if (style.display !== 'none' && style.visibility !== 'hidden') {
          const text = el.textContent || '0';
          if (isNumeric) {
            return parseInt(text) || 0;
          } else {
            return parseFloat(text.replace('g', '')) || 0;
          }
        }
      }
      
      // Fallback to last element (most likely to be updated)
      const lastEl = elements[elements.length - 1];
      const text = lastEl.textContent || '0';
      if (isNumeric) {
        return parseInt(text) || 0;
      } else {
        return parseFloat(text.replace('g', '')) || 0;
      }
    };

    for (const mealType of mealOrder) {
      try {
        // Get calories - prefer visible elements
        const caloriesElements = document.querySelectorAll(`.totalcalories-${mealType}`);
        if (caloriesElements.length > 0) {
          const calories = getValueFromElements(caloriesElements, true);
          console.log(`🔔 [DEBUG] ${mealType} calories: found ${caloriesElements.length} element(s), using value:`, calories);
          totalCalories += calories;
        } else {
          console.log(`🔔 [DEBUG] ${mealType} calories: NO ELEMENT FOUND with selector .totalcalories-${mealType}`);
        }

        // Get protein
        const proteinElements = document.querySelectorAll(`.totalprotein-${mealType}`);
        if (proteinElements.length > 0) {
          const protein = getValueFromElements(proteinElements, false);
          console.log(`🔔 [DEBUG] ${mealType} protein: found ${proteinElements.length} element(s), using value:`, protein);
          totalProtein += protein;
        } else {
          console.log(`🔔 [DEBUG] ${mealType} protein: NO ELEMENT FOUND with selector .totalprotein-${mealType}`);
        }

        // Get fat
        const fatElements = document.querySelectorAll(`.totalfat-${mealType}`);
        if (fatElements.length > 0) {
          const fat = getValueFromElements(fatElements, false);
          console.log(`🔔 [DEBUG] ${mealType} fat: found ${fatElements.length} element(s), using value:`, fat);
          totalFat += fat;
        } else {
          console.log(`🔔 [DEBUG] ${mealType} fat: NO ELEMENT FOUND with selector .totalfat-${mealType}`);
        }

        // Get carbs
        const carbsElements = document.querySelectorAll(`.totalcarbs-${mealType}`);
        if (carbsElements.length > 0) {
          const carbs = getValueFromElements(carbsElements, false);
          console.log(`🔔 [DEBUG] ${mealType} carbs: found ${carbsElements.length} element(s), using value:`, carbs);
          totalCarbs += carbs;
        } else {
          console.log(`🔔 [DEBUG] ${mealType} carbs: NO ELEMENT FOUND with selector .totalcarbs-${mealType}`);
        }
      } catch (error) {
        console.error(`❌ [V3] Error reading ${mealType} from DOM:`, error);
      }
    }

    const totals = {
      calories: Math.round(totalCalories),
      protein: Math.round(totalProtein * 10) / 10,
      carbs: Math.round(totalCarbs * 10) / 10,
      fat: Math.round(totalFat * 10) / 10,
    };
    
    console.log('🔔 [DEBUG] calculateDailyTotalsFromDOM final totals:', totals);
    console.log('🔔 [DEBUG] Breakdown: Calories=' + totalCalories + ', Protein=' + totalProtein + ', Carbs=' + totalCarbs + ', Fat=' + totalFat);
    return totals;
  };

  // V2: Calculate both meal macros and daily totals using the same logic
  const calculateMealMacrosAndTotalsV2 = async (dayData: any) => {
    const mealOrder = ['breakfast', 'morning-snack', 'lunch', 'afternoon-snack', 'dinner', 'evening-snack'];
    const newMealMacros: {[key: string]: any} = {};
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    for (const mealType of mealOrder) {
      const meal = getMealString(dayData, mealType);
      
      if (!meal || meal.trim() === '') {
        newMealMacros[mealType] = { calories: 0, protein: 0, carbs: 0, fat: 0 };
        continue;
      }

      try {
        // Parse ingredients from meal description
        const ingredients = parseMealDescription(meal);
        
        if (ingredients.length === 0) {
          newMealMacros[mealType] = { calories: 0, protein: 0, carbs: 0, fat: 0 };
          continue;
        }

        // Get ingredient data from API - same as V2 daily totals
        const ingredientData = await getIngredientDataFromAPI(meal);
        
        if (ingredientData && ingredientData.length > 0) {
          // Calculate meal totals
          const mealTotals = ingredientData.reduce((acc: any, ing: any) => ({
            calories: acc.calories + (ing.calories || 0),
            protein: acc.protein + (ing.protein || 0),
            carbs: acc.carbs + (ing.carbs || 0),
            fat: acc.fat + (ing.fat || 0)
          }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
          
          newMealMacros[mealType] = {
            calories: Math.round(mealTotals.calories),
            protein: Math.round(mealTotals.protein * 10) / 10,
            carbs: Math.round(mealTotals.carbs * 10) / 10,
            fat: Math.round(mealTotals.fat * 10) / 10,
          };
          
          // Add to daily totals
          totalCalories += newMealMacros[mealType].calories;
          totalProtein += newMealMacros[mealType].protein;
          totalCarbs += newMealMacros[mealType].carbs;
          totalFat += newMealMacros[mealType].fat;
        } else {
          newMealMacros[mealType] = { calories: 0, protein: 0, carbs: 0, fat: 0 };
        }
      } catch (error) {
        console.error(`❌ [V2] Error calculating ${mealType}:`, error);
        newMealMacros[mealType] = { calories: 0, protein: 0, carbs: 0, fat: 0 };
      }
    }

    const dailyTotals = {
      calories: Math.round(totalCalories),
      protein: Math.round(totalProtein * 10) / 10,
      carbs: Math.round(totalCarbs * 10) / 10,
      fat: Math.round(totalFat * 10) / 10,
    };
    
    return { mealMacros: newMealMacros, dailyTotals };
  };

  // Keep old function for backward compatibility but mark as deprecated
  const calculateDailyTotals = async (
    dayData: any, 
    ignoreCache: boolean = false
  ): Promise<{ calories: number; protein: number; carbs: number; fat: number }> => {
    return calculateDailyTotalsV2(dayData);
  };

  const getMealIcon = (mealType: string) => {
    const iconClass = "w-4 h-4 sm:w-5 sm:h-5 text-gray-700";
    switch (mealType) {
      case 'breakfast': return <FiSunrise className={iconClass} />;
      case 'morning-snack': return <FiCoffee className={iconClass} />;
      case 'lunch': return <FiActivity className={iconClass} />;
      case 'afternoon-snack': return <FiCoffee className={iconClass} />;
      case 'dinner': return <FiMoon className={iconClass} />;
      case 'evening-snack': return <FiHeart className={iconClass} />;
      default: return <FiActivity className={iconClass} />;
    }
  };

  // Function to extract and aggregate ingredients from weekly menu
  const generateShoppingList = async () => {
    if (!planData?.weekMenu) return;

    setLoadingShoppingList(true);
    
    try {
      const ingredientMap = new Map<string, { quantity: number; unit: string; name: string }>();
      
      // Process each day and meal
      Object.values(planData.weekMenu as Record<string, any>).forEach((dayMenu: any) => {
        Object.values(dayMenu as Record<string, any>).forEach((val: any) => {
          const meal = typeof val === 'string' ? val : '';
          if (!meal) return;
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

  // Function to fetch ingredients analysis
  const fetchIngredientsAnalysis = async () => {
    if (!planId) return;
    
    setLoadingIngredients(true);
    try {
      const response = await fetch(`/api/nutrition-plans/${planId}/ingredients`);
      if (response.ok) {
        const data = await response.json();
        setIngredientsAnalysis(data);
      } else {
        console.error('Failed to fetch ingredients analysis');
      }
    } catch (error) {
      console.error('Error fetching ingredients analysis:', error);
    } finally {
      setLoadingIngredients(false);
    }
  };







  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-500 mx-auto mb-4"></div>
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

  // Preview Modal Content Component
  const PreviewModalContent = ({
    template,
    previewDay,
    activeDay,
    dayNames,
    mealOrder,
    parseMealDescription,
    calculateMealMacrosFromIngredients,
    loadingTemplates,
    importingTemplate,
    onClose,
    onImport
  }: {
    template: any;
    previewDay: string;
    activeDay: string;
    dayNames: any;
    mealOrder: string[];
    parseMealDescription: (desc: string) => string[];
    calculateMealMacrosFromIngredients: (desc: string, mealType: string) => Promise<{ calories: number; protein: number; carbs: number; fat: number }>;
    loadingTemplates: boolean;
    importingTemplate: boolean;
    onClose: () => void;
    onImport: (templateId: string, day: string) => void;
  }) => {
    const [mealMacros, setMealMacros] = useState<Record<string, { calories: number; protein: number; carbs: number; fat: number }>>({});
    const [loadingMacros, setLoadingMacros] = useState(true);

    const mealNames: Record<string, string> = {
      'breakfast': 'Breakfast',
      'morning-snack': 'Morning Snack',
      'lunch': 'Lunch',
      'afternoon-snack': 'Afternoon Snack',
      'dinner': 'Dinner',
      'evening-snack': 'Evening Snack'
    };

    // Format ingredient string - remove IDs and format nicely
    const formatIngredient = (ing: string): string => {
      if (!ing) return '';
      
      // Remove DB IDs (e.g., "30 cmgdx7ow300267sfkl6m7qfaf|Protein Powder" -> "30g Protein Powder")
      let cleaned = ing.trim();
      
      // Handle pattern: "quantity id|name" -> "quantity name"
      const idPattern = /(\d+(?:\.\d+)?)\s+[a-z0-9]+\|(.+)/i;
      const idMatch = cleaned.match(idPattern);
      if (idMatch) {
        const quantity = idMatch[1];
        const name = idMatch[2].trim();
        // Try to detect unit
        if (!/^(g|gram|grams|ml|piece|pieces|cup|cups|tbsp|tsp|scoop|scoops|buc|felie|lgț)/i.test(name)) {
          // Add 'g' if no unit detected and it's a number
          return `${quantity}g ${name}`;
        }
        return `${quantity} ${name}`;
      }
      
      // Handle pattern: "quantity name" (already clean)
      return cleaned;
    };

    useEffect(() => {
      if (!template || !template.weekMenu) {
        setLoadingMacros(false);
        return;
      }

      const templateWeekMenu = (template.weekMenu as any) || {};
      const dayData = templateWeekMenu[previewDay];
      if (!dayData) {
        setLoadingMacros(false);
        return;
      }

      const calculateMacros = async () => {
        setLoadingMacros(true);
        const macros: Record<string, { calories: number; protein: number; carbs: number; fat: number }> = {};

        for (const mealType of mealOrder) {
          const meal = dayData[mealType];
          if (!meal) continue;

          let mealDescription = '';
          if (typeof meal === 'string') {
            mealDescription = meal;
          } else if (meal && typeof meal === 'object') {
            mealDescription = meal.description || meal.ingredients || '';
          }

          if (mealDescription && mealDescription.trim()) {
            try {
              const mealMacro = await calculateMealMacrosFromIngredients(mealDescription, mealType);
              macros[mealType] = mealMacro;
            } catch (error) {
              console.error(`Error calculating macros for ${mealType}:`, error);
              macros[mealType] = { calories: 0, protein: 0, carbs: 0, fat: 0 };
            }
          }
        }

        setMealMacros(macros);
        setLoadingMacros(false);
      };

      calculateMacros();
    }, [template, previewDay, mealOrder, calculateMealMacrosFromIngredients]);

    if (!template) {
      return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={onClose} />
          <div className="relative bg-white w-[95vw] max-w-3xl max-h-[85vh] overflow-auto rounded-lg shadow-xl border border-gray-200 p-4 sm:p-6">
            <div className="text-gray-500">Template not found.</div>
          </div>
        </div>
      );
    }

    const templateWeekMenu = (template.weekMenu as any) || {};
    const dayData = templateWeekMenu[previewDay];
    
    if (!dayData) {
      return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={onClose} />
          <div className="relative bg-white w-[95vw] max-w-3xl max-h-[85vh] overflow-auto rounded-lg shadow-xl border border-gray-200 p-4 sm:p-6">
            <div className="text-gray-500">No data available for this day.</div>
          </div>
        </div>
      );
    }

    // Calculate daily totals
    const dailyTotals = Object.values(mealMacros).reduce(
      (acc, macro) => ({
        calories: acc.calories + (macro?.calories || 0),
        protein: acc.protein + (macro?.protein || 0),
        carbs: acc.carbs + (macro?.carbs || 0),
        fat: acc.fat + (macro?.fat || 0)
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center">
        <div className="absolute inset-0 bg-black/50" onClick={onClose} />
        <div className="relative bg-white w-[95vw] max-w-3xl max-h-[85vh] overflow-auto rounded-lg shadow-xl border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-lg font-bold text-gray-800">Preview</h4>
              <p className="text-sm text-gray-600 mt-1">
                {dayNames[previewDay as keyof typeof dayNames]} from "{template.name}"
              </p>
            </div>
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-sm bg-gray-200 rounded hover:bg-gray-300"
            >
              Close
            </button>
          </div>

          {loadingTemplates || loadingMacros ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-700"></div>
              <span className="ml-3 text-gray-600">Loading...</span>
            </div>
          ) : (
            <>
              {/* Daily Totals */}
              <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h5 className="text-sm font-semibold text-gray-700 mb-2">Daily Total</h5>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                  <div>
                    <div className="text-xs text-gray-500">Calories</div>
                    <div className="font-bold text-orange-600">{dailyTotals.calories} kcal</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Protein</div>
                    <div className="font-bold text-blue-600">{dailyTotals.protein}g</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Carbs</div>
                    <div className="font-bold text-green-600">{dailyTotals.carbs}g</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Fat</div>
                    <div className="font-bold text-purple-600">{dailyTotals.fat}g</div>
                  </div>
                </div>
              </div>

              {/* Meals */}
              <div className="space-y-4">
                {mealOrder.map((mealType) => {
                  const meal = dayData[mealType];
                  if (!meal) return null;

                  let mealDescription = '';
                  if (typeof meal === 'string') {
                    mealDescription = meal;
                  } else if (meal && typeof meal === 'object') {
                    mealDescription = meal.description || meal.ingredients || '';
                  }

                  if (!mealDescription || mealDescription.trim() === '') return null;

                  const parsedIngredients = parseMealDescription(mealDescription);
                  const macros = mealMacros[mealType] || { calories: 0, protein: 0, carbs: 0, fat: 0 };

                  return (
                    <div key={mealType} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <h5 className="font-semibold text-gray-800">
                          {mealNames[mealType] || mealType}
                        </h5>
                        <div className="text-right">
                          <div className="text-sm font-bold text-orange-600">{macros.calories} kcal</div>
                          <div className="text-xs text-gray-600">
                            P: {macros.protein}g | C: {macros.carbs}g | F: {macros.fat}g
                          </div>
                        </div>
                      </div>
                      
                      {parsedIngredients.length > 0 && (
                        <div className="mt-2">
                          <div className="text-xs font-medium text-gray-600 mb-1">Ingredients:</div>
                          <ul className="text-sm text-gray-700 space-y-1">
                            {parsedIngredients.map((ing, idx) => (
                              <li key={idx} className="flex items-start">
                                <span className="mr-2">•</span>
                                <span>{formatIngredient(ing)}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  );
                }).filter(Boolean)}
              </div>
            </>
          )}

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={() => onImport(template.id, previewDay)}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={importingTemplate}
            >
              {importingTemplate ? 'Importing...' : 'Import'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Meal Template Row Component
  const MealTemplateRow = ({
    mealData,
    cleanDescription,
    selectedMealType,
    activeDay,
    dayNames,
    calculateMealMacrosFromIngredients,
    onImport,
    importingTemplate,
    onMacrosCalculated
  }: {
    mealData: { templateId: string; templateName: string; day: string; dayName: string; meal: any; mealDescription: string; globalIndex: number };
    cleanDescription: string;
    selectedMealType: string;
    activeDay: string;
    dayNames: any;
    calculateMealMacrosFromIngredients: (desc: string, mealType: string) => Promise<{ calories: number; protein: number; carbs: number; fat: number }>;
    onImport: (templateId: string, day: string, mealType: string) => void;
    importingTemplate: boolean;
    onMacrosCalculated?: () => void;
  }) => {
    const [mealMacros, setMealMacros] = useState<{ calories: number; protein: number; carbs: number; fat: number } | null>(null);
    const [loadingMacros, setLoadingMacros] = useState(true);
    const hasCalculatedRef = useRef(false);
    const onMacrosCalculatedRef = useRef(onMacrosCalculated);
    
    // Update ref when callback changes
    useEffect(() => {
      onMacrosCalculatedRef.current = onMacrosCalculated;
    }, [onMacrosCalculated]);
    
    // Debug: Log state changes
    useEffect(() => {
      console.log(`[MealTemplateRow] State changed for row ${mealData.globalIndex}:`, {
        loadingMacros,
        mealMacros,
        hasMacros: !!mealMacros,
        calories: mealMacros?.calories
      });
    }, [mealMacros, loadingMacros, mealData.globalIndex]);

    // Calculate macros immediately when component mounts
    useEffect(() => {
      if (hasCalculatedRef.current) {
        console.log(`[MealTemplateRow] Already calculated for row ${mealData.globalIndex}, skipping`);
        return;
      }
      hasCalculatedRef.current = true;
      
      const calculateMacros = async () => {
        setLoadingMacros(true);
        try {
          console.log(`[MealTemplateRow] Starting calculation for row ${mealData.globalIndex}`, {
            description: mealData.mealDescription.substring(0, 50),
            mealType: selectedMealType
          });
          
          const macros = await calculateMealMacrosFromIngredients(mealData.mealDescription, selectedMealType);
          
          console.log(`[MealTemplateRow] Macros received for row ${mealData.globalIndex}:`, macros);
          console.log(`[MealTemplateRow] Macros type check:`, {
            isObject: typeof macros === 'object',
            hasCalories: macros && 'calories' in macros,
            caloriesType: macros && typeof macros.calories,
            caloriesValue: macros && macros.calories
          });
          
          // Update state - ensure we have valid macros
          if (macros && typeof macros === 'object' && typeof macros.calories === 'number') {
            const macroState = {
              calories: macros.calories || 0,
              protein: macros.protein || 0,
              carbs: macros.carbs || 0,
              fat: macros.fat || 0
            };
            console.log(`[MealTemplateRow] Setting mealMacros state for row ${mealData.globalIndex}:`, macroState);
            setMealMacros(macroState);
            // Force a small delay to ensure state update is processed
            setTimeout(() => {
              console.log(`[MealTemplateRow] State should be updated now for row ${mealData.globalIndex}`);
            }, 10);
          } else {
            console.warn(`[MealTemplateRow] Invalid macros received for row ${mealData.globalIndex}:`, macros);
            const fallbackMacros = { calories: 0, protein: 0, carbs: 0, fat: 0 };
            setMealMacros(fallbackMacros);
            console.log(`[MealTemplateRow] Set fallback macros for row ${mealData.globalIndex}:`, fallbackMacros);
          }
          
          if (onMacrosCalculatedRef.current) {
            console.log(`[MealTemplateRow] Calling onMacrosCalculated for row ${mealData.globalIndex}`);
            onMacrosCalculatedRef.current();
          } else {
            console.warn(`[MealTemplateRow] onMacrosCalculated is not defined for row ${mealData.globalIndex}`);
          }
        } catch (error: any) {
          console.error(`[MealTemplateRow] Error calculating meal macros for row ${mealData.globalIndex}:`, error);
          console.error(`[MealTemplateRow] Error details:`, {
            message: error?.message,
            stack: error?.stack,
            description: mealData.mealDescription.substring(0, 50)
          });
          const errorMacros = { calories: 0, protein: 0, carbs: 0, fat: 0 };
          setMealMacros(errorMacros);
          console.log(`[MealTemplateRow] Set error macros for row ${mealData.globalIndex}:`, errorMacros);
          // Still call onMacrosCalculated even on error to update progress
          if (onMacrosCalculatedRef.current) {
            onMacrosCalculatedRef.current();
          }
        } finally {
          console.log(`[MealTemplateRow] Setting loadingMacros to false for row ${mealData.globalIndex}`);
          setLoadingMacros(false);
        }
      };
      
      // Stagger requests to avoid overwhelming API (20ms delay per row for faster loading)
      const delay = mealData.globalIndex * 20;
      console.log(`[MealTemplateRow] Scheduling calculation for row ${mealData.globalIndex} with delay ${delay}ms`);
      const timer = setTimeout(calculateMacros, delay);
      return () => {
        clearTimeout(timer);
        // Reset ref when component unmounts so it can recalculate if needed
        hasCalculatedRef.current = false;
      };
    }, [mealData.mealDescription, selectedMealType, calculateMealMacrosFromIngredients, mealData.globalIndex]);

    // Helper to render macro value
    const renderMacroValue = (value: number | undefined, color: string, unit: string = 'g') => {
      if (loadingMacros) {
        return <span className="text-gray-400">...</span>;
      }
      if (mealMacros && value !== undefined && value !== null && typeof value === 'number') {
        return <span className={`font-medium ${color}`}>{value}{unit}</span>;
      }
      return <span className="text-gray-400">-</span>;
    };

    return (
      <tr className="hover:bg-gray-50">
        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
          {mealData.templateName}
        </td>
        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
          {mealData.dayName}
        </td>
        <td className="px-4 py-3 text-sm text-gray-700 max-w-md">
          <div className="truncate" title={cleanDescription}>
            {cleanDescription}
          </div>
        </td>
        <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-gray-600">
          {renderMacroValue(mealMacros?.calories, 'text-orange-600', ' kcal')}
        </td>
        <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-gray-600">
          {renderMacroValue(mealMacros?.protein, 'text-blue-600')}
        </td>
        <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-gray-600">
          {renderMacroValue(mealMacros?.carbs, 'text-green-600')}
        </td>
        <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-gray-600">
          {renderMacroValue(mealMacros?.fat, 'text-gray-700')}
        </td>
        <td className="px-4 py-3 whitespace-nowrap text-center">
          <button
            onClick={() => onImport(mealData.templateId, mealData.day, selectedMealType)}
            className="px-3 py-1 text-xs font-medium rounded bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={importingTemplate}
          >
            Import
          </button>
        </td>
      </tr>
    );
  };

  // Day Button Component with Calories
  const DayButtonWithCalories = ({
    day,
    dayName,
    dayData,
    mealOrder,
    calculateMealMacrosAndTotalsV2,
    onClick,
    disabled
  }: {
    day: string;
    dayName: string;
    dayData: any;
    mealOrder: string[];
    calculateMealMacrosAndTotalsV2: (dayData: any) => Promise<{ mealMacros: any; dailyTotals: { calories: number; protein: number; carbs: number; fat: number } }>;
    onClick: () => void;
    disabled: boolean;
  }) => {
    const [dayCalories, setDayCalories] = useState<number | null>(null);
    const [loadingCalories, setLoadingCalories] = useState(true);

    useEffect(() => {
      const calculateCalories = async () => {
        setLoadingCalories(true);
        if (!dayData) {
          setDayCalories(0);
          setLoadingCalories(false);
          return;
        }

        try {
          const { dailyTotals } = await calculateMealMacrosAndTotalsV2(dayData);
          setDayCalories(dailyTotals.calories);
        } catch (error) {
          console.error(`Error calculating calories for ${dayName}:`, error);
          setDayCalories(0);
        } finally {
          setLoadingCalories(false);
        }
      };

      calculateCalories();
    }, [dayData, calculateMealMacrosAndTotalsV2, dayName]);

    return (
      <div className="flex flex-col items-center gap-0.5 min-w-[60px]">
        <button
          onClick={onClick}
          className="px-2 py-1 text-xs font-medium rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap w-full"
          disabled={disabled}
        >
          {dayName}
        </button>
        {loadingCalories ? (
          <div className="text-[9px] text-gray-400 h-3 flex items-center">...</div>
        ) : dayCalories !== null && dayCalories > 0 ? (
          <div className="text-[10px] text-gray-600 font-medium text-center">
            {dayCalories} kcal
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
              <button
                onClick={handleBack}
                className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-gray-600" />
              </button>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-800 break-words">{planData.name}</h1>
                <p className="text-xs sm:text-sm lg:text-base text-gray-600 mt-1 break-words">{planData.description}</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex gap-1 sm:gap-2">
                <button
                  onClick={handleCopy}
                  className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Copy Plan Data"
                >
                  <FiCopy className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-gray-600" />
                </button>
                <button
                  onClick={handleShare}
                  className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Share Plan"
                >
                  <FiShare2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-gray-600" />
                </button>
              </div>
              <div className="flex gap-1 sm:gap-2">
                <button
                  onClick={handlePreview}
                  className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 bg-white text-gray-700 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-xs sm:text-sm font-medium"
                  title="Preview PDF"
                >
                  <FiEye className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Preview</span>
                </button>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors text-xs sm:text-sm font-medium"
                  title="Download PDF"
                >
                  <FiDownload className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Download</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Share Link */}
        <div className="mb-4 sm:mb-6 bg-white border border-gray-200 rounded-xl p-3 sm:p-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                🔗 Persoonlijke Link{assignedCustomer ? ` voor ${assignedCustomer.name}` : ' voor Voedingsplan'}
              </p>
              <p className="text-xs text-gray-600 font-mono bg-white rounded px-2 sm:px-3 py-2 border border-gray-200 break-all">
                {typeof window !== 'undefined' && `${window.location.origin}/my-plan/${planData?.id || ''}`}
              </p>
            </div>
            <button
              onClick={() => {
                const personalLink = `${window.location.origin}/my-plan/${planData?.id || ''}`;
                navigator.clipboard.writeText(personalLink);
                alert('Link gekopieerd! Je kunt deze nu delen.');
              }}
              className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors text-xs sm:text-sm font-medium whitespace-nowrap"
              title="Kopieer persoonlijke link"
            >
              <FiCopy className="w-3 h-3 sm:w-4 sm:h-4" />
              Kopieer Link
            </button>
          </div>
        </div>

        {/* Plan Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">
          <div className="bg-white rounded-lg sm:rounded-xl lg:rounded-2xl p-2 sm:p-3 lg:p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3 mb-1.5 sm:mb-2 lg:mb-4">
              <div className="p-1 sm:p-1.5 lg:p-2 bg-gray-100 rounded-lg">
                <FiHeart className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-6 lg:h-6 text-gray-700" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-xs sm:text-sm font-semibold text-gray-800">Calories</h3>
                <p className="text-sm sm:text-lg lg:text-2xl font-bold text-gray-900">{planData.calories}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg sm:rounded-xl lg:rounded-2xl p-2 sm:p-3 lg:p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3 mb-1.5 sm:mb-2 lg:mb-4">
              <div className="p-1 sm:p-1.5 lg:p-2 bg-gray-100 rounded-lg">
                <FiActivity className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-6 lg:h-6 text-gray-700" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-xs sm:text-sm font-semibold text-gray-800">Protein</h3>
                <p className="text-sm sm:text-lg lg:text-2xl font-bold text-gray-900">{planData.protein}g</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg sm:rounded-xl lg:rounded-2xl p-2 sm:p-3 lg:p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3 mb-1.5 sm:mb-2 lg:mb-4">
              <div className="p-1 sm:p-1.5 lg:p-2 bg-gray-100 rounded-lg">
                <FiCoffee className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-6 lg:h-6 text-gray-700" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-xs sm:text-sm font-semibold text-gray-800">Carbs</h3>
                <p className="text-sm sm:text-lg lg:text-2xl font-bold text-gray-900">{planData.carbs}g</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg sm:rounded-xl lg:rounded-2xl p-2 sm:p-3 lg:p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3 mb-1.5 sm:mb-2 lg:mb-4">
              <div className="p-1 sm:p-1.5 lg:p-2 bg-gray-100 rounded-lg">
                <FiClock className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-6 lg:h-6 text-gray-700" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-xs sm:text-sm font-semibold text-gray-800">Fat</h3>
                <p className="text-sm sm:text-lg lg:text-2xl font-bold text-gray-900">{planData.fat}g</p>
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Menu Schedule */}
        <div className="bg-white rounded-lg sm:rounded-xl lg:rounded-2xl shadow-sm border border-gray-100 p-3 sm:p-4 lg:p-6 xl:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 lg:mb-6">
            <h2 className="text-base sm:text-lg lg:text-xl font-bold text-gray-800">Weekly Menu Schedule</h2>
            
            {/* Main Tabs */}
            <div className="flex gap-1 mt-2 sm:mt-0 overflow-x-auto pb-1">
              <button
                onClick={() => setActiveTab('menu')}
                className={`px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap flex-shrink-0 ${
                  activeTab === 'menu'
                    ? 'bg-gray-700 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                📅 Menu
              </button>
              <button
                onClick={() => {
                  setActiveTab('ingredients');
                  if (!ingredientsAnalysis) {
                    fetchIngredientsAnalysis();
                  }
                }}
                className={`px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap flex-shrink-0 ${
                  activeTab === 'ingredients'
                    ? 'bg-gray-700 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                🥗 Ingredients
              </button>
              <button
                onClick={() => {
                  setActiveTab('shopping');
                  if (shoppingList.length === 0) {
                    generateShoppingList();
                  }
                }}
                className={`px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap flex-shrink-0 ${
                  activeTab === 'shopping'
                    ? 'bg-gray-700 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                🛒 Shopping List
              </button>
            </div>
          </div>
          
          {/* Content based on active tab */}
          {activeTab === 'menu' && (
            <>
          {/* Sticky compact overview when main overview is out of view */}
          {showSticky && dailyTotals && (
            <div className="fixed top-2 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-1rem)] max-w-4xl">
              <div className="bg-white/90 backdrop-blur rounded-xl shadow-lg border border-gray-200 px-3 py-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-semibold text-sm text-gray-800 flex items-center gap-2">
                    {dayNames[activeDay as keyof typeof dayNames]} – Daily Overview
                    {trainingWeekdays.includes(dayKeyToWeekday(activeDay)) && (
                      <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-gray-100 text-gray-700 border border-gray-200">Training Day</span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] sm:text-xs">
                    <div className={`px-2 py-1 rounded bg-white border text-center ${getTextColor(dailyTotals.calories, planData.calories, 'text-gray-800')} ${getTextColor(dailyTotals.calories, planData.calories, 'border-gray-200').replace('text-','border-')}`}>
                      {dailyTotals.calories}/{planData.calories} kcal
                    </div>
                    <div className={`px-2 py-1 rounded bg-white border text-center ${getTextColor(dailyTotals.protein, planData.protein, 'text-gray-800')} ${getTextColor(dailyTotals.protein, planData.protein, 'border-gray-200').replace('text-','border-')}`}>
                      {dailyTotals.protein}g/{planData.protein}g P
                    </div>
                    <div className={`px-2 py-1 rounded bg-white border text-center ${getTextColor(dailyTotals.carbs, planData.carbs, 'text-gray-800')} ${getTextColor(dailyTotals.carbs, planData.carbs, 'border-gray-200').replace('text-','border-')}`}>
                      {dailyTotals.carbs}g/{planData.carbs}g C
                    </div>
                    <div className={`px-2 py-1 rounded bg-white border text-center ${getTextColor(dailyTotals.fat, planData.fat, 'text-gray-800')} ${getTextColor(dailyTotals.fat, planData.fat, 'border-gray-200').replace('text-','border-')}`}>
                      {dailyTotals.fat}g/{planData.fat}g F
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Day Tabs + Generate */}
          <div className="mb-3 sm:mb-4 lg:mb-6">
            <div className="flex items-center justify-between gap-2 flex-wrap">
    <div className="flex gap-1 sm:gap-2 border-b border-gray-200 overflow-x-auto pb-1">
      {planData.weekMenu && dayOrder.map((dayKey) => (
        <button
          key={dayKey}
          onClick={() => setActiveDay(dayKey)}
          className={`px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap flex-shrink-0 flex items-center gap-2 ${
            activeDay === dayKey
              ? 'bg-gray-700 text-white border-b-2 border-gray-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <span>{dayNames[dayKey as keyof typeof dayNames]}</span>
          {trainingWeekdays.includes(dayKeyToWeekday(dayKey)) && (
            <span className={`px-2 py-0.5 rounded-full text-[10px] border ${activeDay === dayKey ? 'bg-white/20 border-white/40 text-white' : 'bg-gray-50 border-gray-200 text-gray-700'}`}>Training</span>
          )}
        </button>
      ))}
    </div>
                <div className="flex items-center gap-2 flex-wrap justify-end">
                  <button
                    onClick={() => {
                      setTemplatesModalOpen(true);
                      // Only load if not cached
                      if (!templatesCacheRef.current) {
                        loadTemplates();
                      }
                    }}
                    className="px-3 py-2 text-xs sm:text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 whitespace-nowrap"
                  >
                    Templates
                  </button>
                  <button
                    onClick={handleClearDayClick}
                    className="px-3 py-2 text-xs sm:text-sm font-medium rounded-lg bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-300 whitespace-nowrap"
                >
                  Leeg plan
                </button>
              </div>
            </div>
          </div>

          {/* Preferences Modal */}
          {prefsOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/40" onClick={() => setPrefsOpen(false)} />
              <div className="relative bg-white w-[95vw] max-w-4xl max-h-[85vh] overflow-auto rounded-lg shadow-xl border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-base font-bold text-gray-800">Select ingredient preferences per meal</h4>
                  <button onClick={()=>setPrefsOpen(false)} className="px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300">Close</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(['breakfast','morning-snack','lunch','afternoon-snack','dinner','evening-snack'] as MealKey[]).map(meal => (
                    <div key={meal} className="border rounded-lg p-3">
                      <div className="font-semibold mb-2">
                        {meal === 'morning-snack' ? 'Morning Snack' : 
                         meal === 'afternoon-snack' ? 'Afternoon Snack' : 
                         meal === 'evening-snack' ? 'Evening Snack' : 
                         meal.charAt(0).toUpperCase() + meal.slice(1)}
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {categoryOptions.map(cat => (
                          <label key={cat} className={`flex items-center gap-2 text-xs border rounded px-2 py-1 cursor-pointer ${mealPrefs[meal].has(cat) ? 'bg-gray-50 border-gray-300' : 'bg-white border-gray-200'}`}>
                            <input type="checkbox" checked={mealPrefs[meal].has(cat)} onChange={()=>togglePref(meal, cat)} />
                            <span className="capitalize">{cat.replace('-', ' ')}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex justify-end gap-2">
                  <button className="px-3 py-2 text-xs rounded border" onClick={()=>setPrefsOpen(false)}>Cancel</button>
                  <button className="px-3 py-2 text-xs rounded bg-gray-700 text-white hover:bg-gray-800" onClick={()=>{ setPrefsOpen(false); generateDayPlan(); }}>Use preferences & Generate</button>
                </div>
              </div>
            </div>
          )}

          {/* AI Generator Modal */}
          {aiModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div
                className="absolute inset-0 bg-black/40"
                onClick={() => {
                  if (!aiGenerating) {
                    setAiModalOpen(false);
                  }
                }}
              />
              <div className="relative bg-white w-[95vw] max-w-3xl max-h-[85vh] overflow-auto rounded-lg shadow-xl border border-gray-200 p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-bold text-gray-800">Generate Day Plan (AI)</h4>
                    <p className="text-sm text-gray-600">
                      Kies welke maaltijden je voor deze dag wil laten invullen. AI matcht recepten uit je bibliotheek
                      op basis van de kcal en macro-doelen van dit plan.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (!aiGenerating) setAiModalOpen(false);
                    }}
                    className="px-3 py-1.5 text-xs bg-gray-200 rounded-lg hover:bg-gray-300"
                    disabled={aiGenerating}
                  >
                    Close
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {mealOrder.map((meal) => {
                    const typedMeal = meal as MealKey;
                    const isSelected = aiMealSelection[typedMeal];
                    const share = aiMealDistribution[typedMeal] || 0;
                    const targetCalories = Math.round((planData?.calories || 0) * share);
                    const targetProtein = Math.round((planData?.protein || 0) * share);
                    const targetCarbs = Math.round((planData?.carbs || 0) * share);
                    const targetFat = Math.round((planData?.fat || 0) * share);

                    return (
                      <button
                        key={meal}
                        onClick={() => toggleAiMealSelection(typedMeal)}
                        className={`text-left border rounded-xl p-3 transition-all ${
                          isSelected ? 'border-gray-400 bg-gray-50' : 'border-gray-200 bg-white'
                        }`}
                        disabled={aiGenerating}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-gray-800">{mealDisplayNames[typedMeal]}</span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              isSelected ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {isSelected ? 'Geselecteerd' : 'Overslaan'}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 space-y-1">
                          <div>± {targetCalories || 0} kcal</div>
                          <div>
                            {targetProtein || 0}g P • {targetCarbs || 0}g C • {targetFat || 0}g F
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-4 bg-gray-50 border border-dashed border-gray-200 rounded-xl p-3 text-sm text-gray-600">
                  <div className="font-medium text-gray-800 mb-1">
                    Geselecteerde maaltijden: {selectedAiMeals.length || 0}
                  </div>
                  <p>
                    AI verdeelt automatisch de dagelijkse macro&apos;s (kcal, eiwitten, koolhydraten, vetten) over de
                    gekozen maaltijden. De recepten met de beste match worden toegevoegd aan het huidige{' '}
                    {dayNames[activeDay as keyof typeof dayNames]} menu.
                  </p>
                </div>

                {aiGenerationError && (
                  <div className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">
                    {aiGenerationError}
                  </div>
                )}

                <div className="mt-4 flex justify-end gap-2">
                  <button
                    onClick={() => {
                      if (!aiGenerating) setAiModalOpen(false);
                    }}
                    className="px-4 py-2 rounded-lg border text-sm text-gray-600 hover:bg-gray-50"
                    disabled={aiGenerating}
                  >
                    Annuleer
                  </button>
                  <button
                    onClick={runAiGenerator}
                    className="px-4 py-2 rounded-lg bg-gray-700 text-white text-sm font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={aiGenerating || selectedAiMeals.length === 0}
                  >
                    {aiGenerating ? 'AI genereert...' : 'Generate with AI'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Templates Modal */}
          {templatesModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div
                className="absolute inset-0 bg-black/40"
                onClick={() => {
                  if (!importingTemplate) {
                    setTemplatesModalOpen(false);
                  }
                }}
              />
              <div className="relative bg-white w-[95vw] max-w-4xl max-h-[85vh] overflow-auto rounded-lg shadow-xl border border-gray-200 p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-bold text-gray-800">Templates</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Select a nutrition plan and day to import {dayNames[activeDay as keyof typeof dayNames]} as a template
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (!importingTemplate) setTemplatesModalOpen(false);
                    }}
                    className="px-3 py-1.5 text-sm bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                    disabled={importingTemplate}
                  >
                    Close
                  </button>
                </div>

                {loadingTemplates ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-700"></div>
                    <span className="ml-3 text-gray-600">Loading templates...</span>
                  </div>
                ) : templates.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    No other nutrition plans found to use as templates.
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                    {templates.map((template) => {
                      // Get available days from template
                      const templateWeekMenu = (template.weekMenu as any) || {};
                      const availableDays = dayOrder.filter(day => templateWeekMenu[day]);
                      
                      return (
                        <div
                          key={template.id}
                          className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-start justify-between flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                              <h5 className="font-semibold text-gray-800 mb-2">{template.name}</h5>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm text-gray-600">
                                <div>
                                  <span className="font-medium">Calories:</span> {template.calories} kcal
                                </div>
                                <div>
                                  <span className="font-medium">Protein:</span> {template.protein}g
                                </div>
                                <div>
                                  <span className="font-medium">Carbs:</span> {template.carbs}g
                                </div>
                                <div>
                                  <span className="font-medium">Fat:</span> {template.fat}g
                                </div>
                              </div>
                              {template.goal && (
                                <div className="mt-2 text-xs text-gray-500">
                                  Goal: {template.goal}
                                </div>
                              )}
                              {availableDays.length > 0 && (
                                <div className="mt-3">
                                  <div className="text-xs font-medium text-gray-700 mb-1">Available days:</div>
                                  <div className="flex flex-wrap gap-2">
                                    {availableDays.map((day) => (
                                      <DayButtonWithCalories
                                        key={day}
                                        day={day}
                                        dayName={dayNames[day as keyof typeof dayNames]}
                                        dayData={templateWeekMenu[day]}
                                        mealOrder={mealOrder}
                                        calculateMealMacrosAndTotalsV2={calculateMealMacrosAndTotalsV2}
                                        onClick={() => {
                                          setPreviewTemplate({ templateId: template.id, day });
                                        }}
                                        disabled={importingTemplate}
                                      />
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {importingTemplate && (
                  <div className="mt-4 flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-600">Importing template...</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Meal Template Modal */}
          {mealTemplateModalOpen && selectedMealType && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div
                className="absolute inset-0 bg-black/40"
                onClick={() => {
                  if (!importingTemplate) {
                    setMealTemplateModalOpen(false);
                    setSelectedMealType(null);
                  }
                }}
              />
              <div className="relative bg-white w-[95vw] max-w-4xl max-h-[85vh] overflow-auto rounded-lg shadow-xl border border-gray-200 p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-bold text-gray-800">Meal Templates</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Select a template to import {selectedMealType === 'morning-snack' ? 'Morning Snack' : 
                        selectedMealType === 'afternoon-snack' ? 'Afternoon Snack' : 
                        selectedMealType === 'evening-snack' ? 'Evening Snack' : 
                        selectedMealType.charAt(0).toUpperCase() + selectedMealType.slice(1)} for {dayNames[activeDay as keyof typeof dayNames]}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (!importingTemplate) {
                        setMealTemplateModalOpen(false);
                        setSelectedMealType(null);
                      }
                    }}
                    className="px-3 py-1.5 text-sm bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                    disabled={importingTemplate}
                  >
                    Close
                  </button>
                </div>

                {loadingTemplates && templates.length === 0 ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-700"></div>
                    <span className="ml-3 text-gray-600">Loading templates...</span>
                  </div>
                ) : templates.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    No other nutrition plans found to use as templates.
                  </div>
                ) : (
                  <div className="max-h-[60vh] overflow-y-auto">
                    {mealTemplatesLoaded.total > 0 && mealTemplatesLoaded.loaded < mealTemplatesLoaded.total && (
                      <div className="sticky top-0 bg-blue-50 border-b border-blue-200 px-4 py-2 text-sm text-blue-700 z-10 shadow-sm">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            <span className="font-medium">Loading macros: {mealTemplatesLoaded.loaded}/{mealTemplatesLoaded.total}</span>
                          </div>
                          <div className="text-xs text-blue-600">
                            {Math.round((mealTemplatesLoaded.loaded / mealTemplatesLoaded.total) * 100)}%
                          </div>
                        </div>
                      </div>
                    )}
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Day</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Calories</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Protein</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Carbs</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Fat</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {allMealsForSelectedType.map((mealData) => {
                            // Parse description to show clean ingredients
                            const parsedIngredients = parseMealDescription(mealData.mealDescription);
                            const cleanDescription = parsedIngredients
                              .map(ing => {
                                // Remove DB IDs
                                if (ing.includes('|')) {
                                  const parts = ing.split('|');
                                  return parts[parts.length - 1].trim();
                                }
                                return ing.trim();
                              })
                              .filter(ing => ing.length > 0)
                              .join(', ') || mealData.mealDescription.substring(0, 100);
                            
                            return (
                              <MealTemplateRow
                                key={`${mealData.templateId}-${mealData.day}-${mealData.globalIndex}`}
                                mealData={mealData}
                                cleanDescription={cleanDescription}
                                selectedMealType={selectedMealType}
                                activeDay={activeDay}
                                dayNames={dayNames}
                                calculateMealMacrosFromIngredients={calculateMealMacrosFromIngredients}
                                onImport={(templateId, day, mealType) => {
                                  if (window.confirm(`Import ${mealType} from ${dayNames[day as keyof typeof dayNames]} of "${mealData.templateName}"? This will replace the current ${mealType} for ${dayNames[activeDay as keyof typeof dayNames]}.`)) {
                                    handleImportMealTemplate(templateId, day, mealType);
                                  }
                                }}
                                importingTemplate={importingTemplate}
                                onMacrosCalculated={handleMacroCalculated}
                              />
                            );
                          })}
                      </tbody>
                    </table>
                    {allMealsForSelectedType.length === 0 && !loadingTemplates && (
                      <div className="text-center py-12 text-gray-500">
                        No {selectedMealType} meals found in any templates.
                      </div>
                    )}
                  </div>
                )}

                {importingTemplate && (
                  <div className="mt-4 flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                    <span className="ml-3 text-gray-600">Importing meal template...</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Preview Modal */}
          {previewTemplate && (
            <PreviewModalContent
              template={templates.find(t => t.id === previewTemplate.templateId)}
              previewDay={previewTemplate.day}
              activeDay={activeDay}
              dayNames={dayNames}
              mealOrder={mealOrder}
              parseMealDescription={parseMealDescription}
              calculateMealMacrosFromIngredients={calculateMealMacrosFromIngredients}
              loadingTemplates={loadingTemplates}
              importingTemplate={importingTemplate}
              onClose={() => setPreviewTemplate(null)}
              onImport={(templateId, day) => {
                if (window.confirm(`Are you sure you want to import ${dayNames[day as keyof typeof dayNames]} to ${dayNames[activeDay as keyof typeof dayNames]}? This will overwrite all current meals for ${dayNames[activeDay as keyof typeof dayNames]}.`)) {
                  handleImportTemplate(templateId, day);
                  setPreviewTemplate(null);
                }
              }}
            />
          )}

          {/* Generation Log Modal */}
          {genLogOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
              <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={() => setGenLogOpen(false)} />
              <div className="relative w-full max-w-4xl max-h-[85vh] bg-slate-900 text-white rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-6 py-5 bg-gradient-to-r from-gray-500/20 via-gray-500/10 to-gray-500/20 border-b border-white/10">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.3em] text-gray-200">Live Feed</p>
                    <h4 className="text-xl font-semibold text-white">AI Generation Log</h4>
                    <p className="text-sm text-slate-200">{genLog.length ? `${genLog.length} events geregistreerd` : 'Nog geen activiteit'}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCopyLog}
                      className="px-3 py-2 rounded-lg border border-white/20 text-xs font-semibold text-white hover:bg-white/10 transition-colors"
                    >
                      Kopieer log
                    </button>
                    <button
                      onClick={() => setGenLogOpen(false)}
                      className="px-3 py-2 rounded-lg bg-white text-slate-900 text-xs font-semibold hover:bg-slate-100 transition-colors"
                    >
                      Sluiten
                    </button>
                  </div>
                </div>
                <div
                  ref={logContainerRef}
                  className="px-6 py-5 space-y-3 overflow-y-auto max-h-[calc(85vh-130px)] bg-slate-950/80 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent"
                >
                  {genLog.length ? (
                    <div className="space-y-4">
                      {genLog.map((entry, index) => (
                        <div key={`${entry}-${index}`} className="relative pl-6">
                          <span className="absolute left-0 top-4 w-3 h-3 rounded-full bg-gray-400 shadow-[0_0_12px_rgba(156,163,175,0.8)]"></span>
                          <div className="bg-white/5 border border-white/10 rounded-2xl p-3 sm:p-4 backdrop-blur-sm shadow-lg">
                            <div className="text-[11px] uppercase tracking-wide text-gray-200 mb-1 flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded-full bg-gray-500/20 text-gray-200">Step {index + 1}</span>
                              <span className="text-slate-400 font-medium">AI Action</span>
                            </div>
                            <p className="font-mono text-[11px] sm:text-xs text-slate-100 whitespace-pre-wrap break-words">
                              {entry}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-slate-400 text-sm py-12">
                      Nog geen logregels. Start een AI generatie om live updates te zien.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Daily Menu Table */}
      {planData.weekMenu && (
        <div className="space-y-6">
              {/* Daily Totals Header with Progress Indicators */}
              <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6 border border-gray-200">
                <h3 className="text-sm sm:text-base lg:text-lg font-bold text-gray-800 mb-2 sm:mb-3 lg:mb-4 text-center">
                  {dayNames[activeDay as keyof typeof dayNames]} - Daily Overview
                </h3>
                {dailyTotals ? (
                  <div ref={overviewRef} className="space-y-4">
                    {/* Progress Indicators */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                      {/* Calories Progress */}
                      <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">Calories</span>
                          <span className="text-sm font-bold text-orange-600">{dailyTotals.calories} / {planData.calories}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3">
                          <div
                            className={`h-2 sm:h-3 rounded-full transition-all duration-300 ${getBarColor(dailyTotals.calories, planData.calories, 'bg-orange-500')}`}
                            style={{ width: `${Math.min((dailyTotals.calories / planData.calories) * 100, 100)}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-xs text-gray-500">
                            {Math.round((dailyTotals.calories / planData.calories) * 100)}%
                          </span>
                          <span className={`text-xs font-medium ${getTextColor(dailyTotals.calories, planData.calories, 'text-orange-600')}`}>
                            {dailyTotals.calories >= planData.calories ? 
                              `+${dailyTotals.calories - planData.calories}` : 
                              `${planData.calories - dailyTotals.calories} to go`
                            }
                          </span>
                        </div>
                      </div>

                      {/* Protein Progress */}
                      <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">Protein</span>
                          <span className="text-sm font-bold text-blue-600">{dailyTotals.protein}g / {planData.protein}g</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3">
                          <div
                            className={`h-2 sm:h-3 rounded-full transition-all duration-300 ${getBarColor(dailyTotals.protein, planData.protein, 'bg-blue-500')}`}
                            style={{ width: `${Math.min((dailyTotals.protein / planData.protein) * 100, 100)}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-xs text-gray-500">
                            {Math.round((dailyTotals.protein / planData.protein) * 100)}%
                          </span>
                          <span className={`text-xs font-medium ${getTextColor(dailyTotals.protein, planData.protein, 'text-blue-600')}`}>
                            {dailyTotals.protein >= planData.protein ? 
                              `+${dailyTotals.protein - planData.protein}g` : 
                              `${planData.protein - dailyTotals.protein}g to go`
                            }
                          </span>
                        </div>
                      </div>

                      {/* Carbs Progress */}
                      <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">Carbs</span>
                          <span className="text-sm font-bold text-green-600">{dailyTotals.carbs}g / {planData.carbs}g</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3">
                          <div
                            className={`h-2 sm:h-3 rounded-full transition-all duration-300 ${getBarColor(dailyTotals.carbs, planData.carbs, 'bg-green-500')}`}
                            style={{ width: `${Math.min((dailyTotals.carbs / planData.carbs) * 100, 100)}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-xs text-gray-500">
                            {Math.round((dailyTotals.carbs / planData.carbs) * 100)}%
                          </span>
                          <span className={`text-xs font-medium ${getTextColor(dailyTotals.carbs, planData.carbs, 'text-green-600')}`}>
                            {dailyTotals.carbs >= planData.carbs ? 
                              `+${dailyTotals.carbs - planData.carbs}g` : 
                              `${planData.carbs - dailyTotals.carbs}g to go`
                            }
                          </span>
                        </div>
                      </div>

                      {/* Fat Progress */}
                      <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">Fat</span>
                          <span className="text-sm font-bold text-gray-900">{dailyTotals.fat}g / {planData.fat}g</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3">
                          <div
                            className={`h-2 sm:h-3 rounded-full transition-all duration-300 ${getBarColor(dailyTotals.fat, planData.fat, 'bg-purple-500')}`}
                            style={{ width: `${Math.min((dailyTotals.fat / planData.fat) * 100, 100)}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-xs text-gray-500">
                            {Math.round((dailyTotals.fat / planData.fat) * 100)}%
                          </span>
                          <span className={`text-xs font-medium ${getTextColor(dailyTotals.fat, planData.fat, 'text-gray-700')}`}>
                            {dailyTotals.fat >= planData.fat ? 
                              `+${dailyTotals.fat - planData.fat}g` : 
                              `${planData.fat - dailyTotals.fat}g to go`
                            }
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Summary Stats */}
                    <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-200">
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 text-center">
                        <div>
                          <div className="text-sm sm:text-lg lg:text-2xl font-bold text-orange-600">{dailyTotals.calories}</div>
                          <div className="text-xs sm:text-sm text-gray-600">Calories</div>
                        </div>
                        <div>
                          <div className="text-sm sm:text-lg lg:text-2xl font-bold text-blue-600">{dailyTotals.protein}g</div>
                          <div className="text-xs sm:text-sm text-gray-600">Protein</div>
                        </div>
                        <div>
                          <div className="text-sm sm:text-lg lg:text-2xl font-bold text-green-600">{dailyTotals.carbs}g</div>
                          <div className="text-xs sm:text-sm text-gray-600">Carbs</div>
                        </div>
                        <div>
                          <div className="text-sm sm:text-lg lg:text-2xl font-bold text-gray-900">{dailyTotals.fat}g</div>
                          <div className="text-xs sm:text-sm text-gray-600">Fat</div>
                        </div>
                      </div>
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
                      <th className="px-1 sm:px-2 py-2 sm:py-3 lg:py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {mealOrder.map((mealType) => {
                      // Use the same data source as the main calculation
                      let dayMenu = null;
                      if (planData?.weekMenu?.[activeDay]) {
                        dayMenu = planData.weekMenu[activeDay];
                      } else if (planData?.days?.[activeDay]) {
                        dayMenu = planData.days[activeDay];
                      }
                      const meal = (dayMenu && typeof dayMenu[mealType] === 'string') ? dayMenu[mealType] : '';
                      // Use V3 DOM-based calculation for meal macros display
                      // Force re-render when forceTableUpdate changes
                      const macros = forceTableUpdate >= 0 ? getMealMacrosFromDOM(mealType) : { calories: 0, protein: 0, carbs: 0, fat: 0 };
                      const isLoading = false; // No longer needed with V3
                      
                      return (
                        <tr key={mealType} className="hover:bg-gray-50">
                          <td className="px-1 sm:px-2 lg:px-3 py-2 sm:py-3 lg:py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <span className="mr-1 sm:mr-2 flex items-center">{getMealIcon(mealType)}</span>
                              <div>
                                <div className="text-xs sm:text-sm font-medium text-gray-900">
                                  {mealType === 'morning-snack' ? 'Morning Snack' : 
                                   mealType === 'afternoon-snack' ? 'Afternoon Snack' : 
                                   mealType === 'evening-snack' ? 'Evening Snack' : 
                                   mealType.charAt(0).toUpperCase() + mealType.slice(1)}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-1 sm:px-2 lg:px-3 py-2 sm:py-3 lg:py-4">
                            <div className="text-xs sm:text-sm text-gray-900 max-w-[200px] sm:max-w-xs lg:max-w-md break-words">
                              {(() => {
                                // Check if meal is JSON string (new format) or text (old format)
                                if (meal && meal.startsWith('[') && meal.endsWith(']')) {
                                  try {
                                    const ingredients = JSON.parse(meal);
                                    if (Array.isArray(ingredients) && ingredients.length > 0) {
                                      return ingredients.map((ing: any) => {
                                        const quantity = ing.quantity || 0;
                                        const unit = ing.unit || 'g';
                                        const name = ing.name || 'Unknown';
                                        const dbStatus = ing.id ? '' : ' (Niet in DB)';
                                        return `${quantity}${unit} ${name}${dbStatus}`;
                                      }).join(', ');
                                    }
                                  } catch (e) {
                                    console.log('Failed to parse JSON meal:', meal);
                                  }
                                }
                                
                                // Fallback to old text parsing
                                let parts = parseMealDescription(meal);
                                // Sanitize: remove IDs and clean up ingredient names
                                parts = parts.map((ing: string) => {
                                  // Remove DB id pipes if present (e.g., "cmg123|Milk" -> "Milk")
                                  if (ing.includes('|')) {
                                    const pipeParts = ing.split('|');
                                    ing = pipeParts[pipeParts.length - 1].trim();
                                  }
                                  
                                  // Remove common quantity patterns and clean up
                                  ing = ing
                                    .replace(/^\d+(?:\.\d+)?\s*(?:g|gram|grams|ml|milliliter|milliliters|cup|cups|tbsp|tablespoon|tablespoons|tsp|teaspoon|teaspoons|slice|slices)\s*/i, '')
                                    .replace(/^\d+(?:\.\d+)?\s*(?:piece|pieces)\s*/i, '')
                                    .replace(/^\d+(?:\.\d+)?\s*/i, '')
                                    .replace(/^(\d+\/\d+|\d+)\s*/i, '')
                                    .replace(/^\([^)]*\)\s*/g, '')
                                    .replace(/^[^a-zA-Z]*/, '')
                                    .replace(/\)$/, '') // Remove trailing )
                                    .trim();
                                    
                                  return ing;
                                });
                                
                                // Filter out empty parts and format nicely
                                parts = parts.filter(part => part && part.length > 0);
                                const text = parts.join(', ');
                                return text && text.length > 0 ? text : <span className="text-gray-400 italic">No ingredients yet</span>;
                              })()}
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
                              <span className="inline-flex items-center px-1 sm:px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                {macros.fat}g
                              </span>
                            )}
                          </td>
                          <td className="px-1 sm:px-2 py-2 sm:py-3 lg:py-4 whitespace-nowrap text-center">
                            <div className="flex items-center gap-1 sm:gap-2 justify-center flex-wrap">
                              <IngredientSelector
                                onAddIngredient={handleAddIngredient}
                                onAddRecipe={handleAddRecipe}
                                mealType={mealType}
                                dayKey={activeDay}
                              />
                              <button
                                onClick={() => {
                                  setSelectedMealType(mealType);
                                  setMealTemplateModalOpen(true);
                                  // Only load if not cached
                                  if (!templatesCacheRef.current) {
                                    loadTemplates();
                                  }
                                }}
                                className="px-2 py-1 text-xs font-medium rounded-lg bg-purple-600 text-white hover:bg-purple-700 whitespace-nowrap"
                                title={`Import template for ${mealType}`}
                              >
                                Template
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Ingredient Breakdown */}
              {((planData?.weekMenu?.[activeDay]) || (planData?.days?.[activeDay])) && (
                <div className="mt-4 sm:mt-6 lg:mt-8">

                  {mealOrder.map((mealType) => {
                    // Use the same data source as the main calculation
                    let dayMenu = null;
                    if (planData?.weekMenu?.[activeDay]) {
                      dayMenu = planData.weekMenu[activeDay];
                    } else if (planData?.days?.[activeDay]) {
                      dayMenu = planData.days[activeDay];
                    }
                    const meal = getMealString(dayMenu || {}, mealType);
                    // Use new structure first, only fallback to old structure if new structure has no data
                    const newStructureInstructions = getCookingInstructions(dayMenu, mealType);
                    const cookingInstructions = newStructureInstructions || getCookingInstructionsFromStructure(planData?.weekMenu, activeDay, mealType);
                    
                    return (
                      <div key={`${activeDay}-${mealType}`} className="mb-6">
                        {/* Meal Header with Clear Button */}
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-base sm:text-lg font-semibold text-gray-800 capitalize">
                            {mealDisplayNames[mealType as MealKey] || mealType}
                          </h4>
                          {meal && meal.trim() !== '' && (
                            <button
                              onClick={() => handleClearMeal(mealType)}
                              className="px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg bg-red-100 text-red-700 hover:bg-red-200 border border-red-300 transition-colors whitespace-nowrap"
                              title={`Verwijder alle ingrediënten van ${mealDisplayNames[mealType as MealKey] || mealType}`}
                            >
                              🗑️ Leeg maken
                            </button>
                          )}
                        </div>
                        <IngredientBreakdown
                          mealDescription={meal}
                          mealType={mealType.charAt(0).toUpperCase() + mealType.slice(1)}
                          planId={planId}
                          dayKey={activeDay}
                          mealTypeKey={mealType}
                          editable={true}
                          onMacrosUpdated={onMacrosUpdatedCallback}
                          onPlanUpdated={(updatedPlan: any) => {
                            console.log('🔔 [DEBUG] onPlanUpdated called in NutritionPlanDetailClient');
                            console.log('🔔 [DEBUG] updatedPlan:', updatedPlan);
                            console.log('🔔 [DEBUG] Current dailyTotals before onPlanUpdated:', dailyTotals);
                            console.log('🔔 [DEBUG] Current planData.weekMenu before update:', planData?.weekMenu?.[activeDay]);
                            
                            const handleUpdate = async () => {
                              try {
                                if (updatedPlan) {
                                  console.log('🔔 [DEBUG] onPlanUpdated: updatedPlan is truthy, updating planData');
                                  // API update - update state immediately for instant UI feedback
                                  setPlanData(updatedPlan);
                                  
                                  // Use same logic as main useEffect: prefer weekMenu, fallback to days
                                  let dayData = null;
                                  if (updatedPlan?.weekMenu?.[activeDay]) {
                                    dayData = updatedPlan.weekMenu[activeDay];
                                  } else if (updatedPlan?.days?.[activeDay]) {
                                    dayData = updatedPlan.days[activeDay];
                                  }
                                  
                                  console.log('🔔 [DEBUG] onPlanUpdated: dayData extracted:', dayData);
                                  
                                  if (dayData) {
                                    // Don't call calculateMealMacrosAndTotalsV2 - it uses old data from the API
                                    // The IngredientBreakdown components will update the DOM with new values
                                    // Just wait for DOM to update, then read from DOM
                                    setTimeout(() => {
                                      console.log('🔔 [DEBUG] onPlanUpdated: setTimeout fired, recalculating totals from DOM');
                                      const totals = calculateDailyTotalsFromDOM();
                                      console.log('🔔 [DEBUG] onPlanUpdated: Totals calculated from DOM:', totals);
                                      setDailyTotals(prev => {
                                        console.log('🔔 [DEBUG] onPlanUpdated: setDailyTotals called with prev:', prev, 'new:', totals);
                                        return {...totals};
                                      });
                                    }, 300); // Longer delay to ensure IngredientBreakdown components have updated the DOM
                                  }
                                } else {
                                  console.log('🔔 [DEBUG] onPlanUpdated: updatedPlan is null/falsy, using local changes - reading from DOM only');
                                  // Local changes only - DOM is already updated by IngredientBreakdown, just read it
                                  // Don't call calculateMealMacrosAndTotalsV2 as it uses old data from planData
                                  // Wait a bit for DOM to be fully updated, then read directly from DOM
                                  setTimeout(() => {
                                    console.log('🔔 [DEBUG] onPlanUpdated (local): setTimeout fired, recalculating totals from DOM');
                                    const totals = calculateDailyTotalsFromDOM();
                                    console.log('🔔 [DEBUG] onPlanUpdated (local): Totals calculated from DOM:', totals);
                                    setDailyTotals(prev => {
                                      console.log('🔔 [DEBUG] onPlanUpdated (local): setDailyTotals called with prev:', prev, 'new:', totals);
                                      return {...totals};
                                    });
                                  }, 200); // Slightly longer delay to ensure DOM is updated
                                }
                              } catch (e) {
                                console.error('❌ [PARENT] Failed to refresh macros after update', e);
                              }
                            };
                            
                            handleUpdate();
                          }}
                        />
                        
                        
                        <CookingInstructions
                          key={`${activeDay}-${mealType}-${planData?.weekMenu?.[activeDay]?.[mealType]?.cookingInstructions || ''}`}
                          mealType={mealType}
                          dayKey={activeDay}
                          planId={planId}
                          initialInstructions={cookingInstructions}
                          onInstructionsUpdated={(newInstructions) => {
                            // Update planData with new cooking instructions
                            setPlanData((prev: any) => {
                              if (!prev?.weekMenu?.[activeDay]) return prev;
                              
                              const currentMealData = prev.weekMenu[activeDay][mealType];
                              let newMealData;
                              
                              if (typeof currentMealData === 'string') {
                                // Old structure: convert to new structure
                                newMealData = {
                                  ingredients: currentMealData,
                                  cookingInstructions: newInstructions
                                };
                              } else if (currentMealData && typeof currentMealData === 'object') {
                                // New structure: update cooking instructions only
                                newMealData = {
                                  ...currentMealData,
                                  cookingInstructions: newInstructions
                                };
                              } else {
                                // No existing data: create new structure
                                newMealData = {
                                  ingredients: '',
                                  cookingInstructions: newInstructions
                                };
                              }
                              
                              return {
                                ...prev,
                                weekMenu: {
                                  ...prev.weekMenu,
                                  [activeDay]: {
                                    ...prev.weekMenu[activeDay],
                                    [mealType]: newMealData,
                                  },
                                },
                              };
                            });
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
            </>
          )}
          
          {activeTab === 'shopping' && (
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
          
          {activeTab === 'ingredients' && (
            /* Ingredients Analysis Content */
            <div className="space-y-6">
              {/* Ingredients Header */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6 border border-blue-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-sm sm:text-base lg:text-lg font-bold text-gray-800 mb-2">
                      🥗 Ingredients Analysis
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Complete nutritional breakdown of all ingredients used in this plan
                    </p>
                  </div>
                  <div className="flex gap-2 mt-2 sm:mt-0">
                    <button
                      onClick={fetchIngredientsAnalysis}
                      className="px-3 py-2 bg-blue-500 text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      🔄 Refresh
                    </button>
                  </div>
                </div>
              </div>

              {/* Loading State */}
              {loadingIngredients ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <span className="ml-3 text-sm text-gray-600">Analyzing ingredients...</span>
                </div>
              ) : ingredientsAnalysis ? (
                <>
                  {/* Summary Stats */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm">
                      <div className="text-lg sm:text-2xl font-bold text-orange-600">
                        {ingredientsAnalysis.dailyAverage.calories}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600">Daily Calories</div>
                      <div className="text-xs text-gray-500">
                        Target: {ingredientsAnalysis.plan.targetCalories}
                      </div>
                    </div>
                    <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm">
                      <div className="text-lg sm:text-2xl font-bold text-blue-600">
                        {ingredientsAnalysis.dailyAverage.protein}g
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600">Daily Protein</div>
                      <div className="text-xs text-gray-500">
                        Target: {ingredientsAnalysis.plan.targetProtein}g
                      </div>
                    </div>
                    <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm">
                      <div className="text-lg sm:text-2xl font-bold text-green-600">
                        {ingredientsAnalysis.dailyAverage.carbs}g
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600">Daily Carbs</div>
                      <div className="text-xs text-gray-500">
                        Target: {ingredientsAnalysis.plan.targetCarbs}g
                      </div>
                    </div>
                    <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm">
                      <div className="text-lg sm:text-2xl font-bold text-gray-900">
                        {ingredientsAnalysis.dailyAverage.fat}g
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600">Daily Fat</div>
                      <div className="text-xs text-gray-500">
                        Target: {ingredientsAnalysis.plan.targetFat}g
                      </div>
                    </div>
                  </div>

                  {/* Ingredients Table */}
                  <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Naam
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Per
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Categorie
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Calorieën
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Eiwit (g)
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Koolhydraten (g)
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Vet (g)
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Vezels (g)
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Suiker (g)
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Gebruikt
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {ingredientsAnalysis.ingredients.map((ingredient: any, index: number) => {
                            // Function to get category color
                            const getCategoryColor = (category: string) => {
                              switch (category) {
                                case 'proteins': return 'bg-red-100 text-red-800';
                                case 'carbohydrates': return 'bg-blue-100 text-blue-800';
                                case 'fruits': return 'bg-green-100 text-green-800';
                                case 'vegetables': return 'bg-yellow-100 text-yellow-800';
                                case 'healthy-fats': return 'bg-gray-100 text-gray-800';
                                case 'dairy': return 'bg-gray-100 text-gray-800';
                                case 'nuts-seeds': return 'bg-orange-100 text-orange-800';
                                default: return 'bg-gray-100 text-gray-800';
                              }
                            };

                            // Function to determine category based on ingredient name
                            const getIngredientCategory = (name: string): string => {
                              const lowerName = name.toLowerCase();
                              
                              if (lowerName.includes('egg') || lowerName.includes('chicken') || lowerName.includes('beef') || 
                                  lowerName.includes('pork') || lowerName.includes('turkey') || lowerName.includes('salmon') || 
                                  lowerName.includes('tuna') || lowerName.includes('fish') || lowerName.includes('protein')) {
                                return 'proteins';
                              } else if (lowerName.includes('oats') || lowerName.includes('rice') || lowerName.includes('pasta') || 
                                         lowerName.includes('bread') || lowerName.includes('potato') || lowerName.includes('quinoa') ||
                                         lowerName.includes('bulgur')) {
                                return 'carbohydrates';
                              } else if (lowerName.includes('apple') || lowerName.includes('banana') || lowerName.includes('berry') || 
                                         lowerName.includes('kiwi') || lowerName.includes('pear') || lowerName.includes('orange') ||
                                         lowerName.includes('strawberry') || lowerName.includes('grape') || lowerName.includes('mango')) {
                                return 'fruits';
                              } else if (lowerName.includes('broccoli') || lowerName.includes('spinach') || lowerName.includes('tomato') || 
                                         lowerName.includes('cucumber') || lowerName.includes('carrot') || lowerName.includes('lettuce') ||
                                         lowerName.includes('pepper') || lowerName.includes('onion') || lowerName.includes('garlic') ||
                                         lowerName.includes('asparagus') || lowerName.includes('mushroom') || lowerName.includes('zucchini')) {
                                return 'vegetables';
                              } else if (lowerName.includes('avocado') || lowerName.includes('olive oil') || lowerName.includes('coconut oil') || 
                                         lowerName.includes('almond butter') || lowerName.includes('peanut butter') || lowerName.includes('hummus')) {
                                return 'healthy-fats';
                              } else if (lowerName.includes('milk') || lowerName.includes('yogurt') || lowerName.includes('cheese') || 
                                         lowerName.includes('cottage cheese') || lowerName.includes('quark')) {
                                return 'dairy';
                              } else if (lowerName.includes('almond') || lowerName.includes('walnut') || lowerName.includes('cashew') || 
                                         lowerName.includes('chia') || lowerName.includes('flax') || lowerName.includes('pumpkin seed') ||
                                         lowerName.includes('sunflower seed') || lowerName.includes('nut')) {
                                return 'nuts-seeds';
                              } else {
                                return 'other';
                              }
                            };

                            const category = getIngredientCategory(ingredient.name);
                            
                            return (
                              <tr key={index} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-4 whitespace-nowrap">
                                  <div className="text-sm font-medium text-gray-900">{ingredient.name}</div>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-center">
                                  <div className="text-sm text-gray-600">100g</div>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap">
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(category)}`}>
                                    {category}
                                  </span>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-center">
                                  <div className="text-sm font-medium text-orange-600">{Math.round(ingredient.totalCalories / ingredient.totalAmount * 100)}</div>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-center">
                                  <div className="text-sm font-medium text-blue-600">{Math.round(ingredient.totalProtein / ingredient.totalAmount * 100)}g</div>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-center">
                                  <div className="text-sm font-medium text-green-600">{Math.round(ingredient.totalCarbs / ingredient.totalAmount * 100)}g</div>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-center">
                                  <div className="text-sm font-medium text-gray-900">{Math.round(ingredient.totalFat / ingredient.totalAmount * 100)}g</div>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-center">
                                  <div className="text-sm text-gray-600">{Math.round(ingredient.totalFiber / ingredient.totalAmount * 100)}g</div>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-center">
                                  <div className="text-sm text-gray-600">-</div>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-center">
                                  <div className="text-sm text-gray-600">{ingredient.occurrences}x</div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Weekly Totals */}
                  <div className="bg-gray-50 rounded-lg sm:rounded-xl p-4 sm:p-6">
                    <h4 className="text-sm sm:text-base font-bold text-gray-800 mb-3">Weekly Totals</h4>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                      <div className="text-center">
                        <div className="text-lg sm:text-xl font-bold text-orange-600">
                          {ingredientsAnalysis.totals.calories}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600">Total Calories</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg sm:text-xl font-bold text-blue-600">
                          {ingredientsAnalysis.totals.protein}g
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600">Total Protein</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg sm:text-xl font-bold text-green-600">
                          {ingredientsAnalysis.totals.carbs}g
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600">Total Carbs</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg sm:text-xl font-bold text-gray-900">
                          {ingredientsAnalysis.totals.fat}g
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600">Total Fat</div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-4xl mb-4">🥗</div>
                  <p className="text-gray-500">No ingredients analysis available</p>
                  <button
                    onClick={fetchIngredientsAnalysis}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Analyze Ingredients
                  </button>
            </div>
          )}
        </div>
      )}

      {/* PDF Generation Progress Modal */}
      {pdfGenerating && typeof window !== 'undefined' && createPortal(
        (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4">
            <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-rose-500 to-pink-500 p-4">
                <h3 className="font-bold text-white text-lg flex items-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  Generating PDF...
                </h3>
                <p className="text-white/90 text-sm mt-1">Please wait while we prepare your 7-day nutrition plan</p>
              </div>

              {/* Progress Log */}
              <div ref={progressLogRef} className="p-4 bg-gray-50 max-h-[60vh] overflow-y-auto">
                <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm space-y-1">
                  {pdfProgress.map((log, idx) => (
                    <div
                      key={idx}
                      className={`${log.trim() === '' ? 'h-2' : 'text-green-400'} whitespace-pre-wrap`}
                    >
                      {log}
                    </div>
                  ))}
                  {pdfProgress.length === 0 && (
                    <div className="text-gray-400">Initializing...</div>
                  )}
                  {/* Animated cursor */}
                  <div className="inline-block w-2 h-4 bg-green-400 animate-pulse"></div>
                </div>
              </div>

              {/* Footer Info */}
              <div className="p-4 bg-white border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center">
                  ⏱️ This process typically takes a few seconds
                </p>
              </div>
            </div>
          </div>
        ),
        document.body
      )}

      {/* Preview Modal Portal */}
      {/* PDF Preview Modal */}
      {pdfPreviewOpen && pdfPreviewUrl && typeof window !== 'undefined' && createPortal(
        (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4" onClick={(e) => {
            if (e.target === e.currentTarget) {
              console.log('[Preview] Backdrop clicked, closing modal');
              if (pdfPreviewUrl && pdfPreviewUrl.startsWith('blob:')) URL.revokeObjectURL(pdfPreviewUrl);
              setPdfPreviewOpen(false);
              setPdfPreviewUrl(null);
            }
          }}>
            <div className="bg-white w-full max-w-5xl h-[80vh] rounded-lg shadow-xl overflow-hidden flex flex-col">
              <div className="flex items-center justify-between p-3 border-b">
                <h3 className="font-semibold text-gray-800 text-sm">PDF Preview</h3>
                <button
                  onClick={() => {
                    console.log('[Preview] Close button clicked');
                    if (pdfPreviewUrl && pdfPreviewUrl.startsWith('blob:')) URL.revokeObjectURL(pdfPreviewUrl);
                    setPdfPreviewOpen(false);
                    setPdfPreviewUrl(null);
                  }}
                  className="px-3 py-1.5 rounded-md bg-gray-700 text-white text-xs hover:bg-gray-800"
                >
                  Close
                </button>
              </div>
              <div className="flex-1">
                <iframe src={pdfPreviewUrl} className="w-full h-full" title="PDF Preview" />
              </div>
            </div>
          </div>
        ),
        document.body
      )}



      </div>
    </div>
  </div>
  );
}
