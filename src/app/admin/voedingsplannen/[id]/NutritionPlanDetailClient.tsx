'use client';

import { calculateDailyTotalsV2 } from '@/utils/dailyTotalsV2';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { FiArrowLeft, FiHeart, FiCoffee, FiActivity, FiClock, FiUsers, FiCalendar, FiCopy, FiShare2, FiDownload, FiEye } from 'react-icons/fi';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRouter } from 'next/navigation';
import IngredientBreakdown from '@/components/IngredientBreakdown';
import IngredientSelector from '@/components/IngredientSelector';
import CookingInstructions from '@/components/CookingInstructions';
import TextConverterModal from '@/components/TextConverterModal';
import ProductMappingModal from '@/components/ProductMappingModal';
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
  const [textConverterOpen, setTextConverterOpen] = useState(false);
  const [productMappingOpen, setProductMappingOpen] = useState(false);

  const overviewRef = useRef<HTMLDivElement | null>(null);
  const progressLogRef = useRef<HTMLDivElement | null>(null);
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
      console.log('[NutritionPlanDetailClient] fetching plan:', url);
      const response = await fetch(url);
      console.log('[NutritionPlanDetailClient] fetch status:', response.status);
      if (!response.ok) {
        let bodyText = '';
        try { bodyText = await response.text(); } catch {}
        console.error('[NutritionPlanDetailClient] fetch error body:', bodyText);
        setError(`Failed to load nutrition plan (${response.status})`);
        setLoading(false);
        return;
      }
      const data = await response.json();
      console.log('[NutritionPlanDetailClient] plan loaded:', data?.id || '(no id)');
      console.log('[NutritionPlanDetailClient] weekMenu data:', JSON.stringify(data.weekMenu, null, 2));
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
        console.log('[NutritionPlanDetailClient] params received:', params);
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
      console.log('[PDF] Parsed ingredients for API:', ingredients);
      
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
    console.log('Parsing meal description:', mealDescription);
    
    // Remove cooking instructions and descriptions
    let cleaned = mealDescription
      .replace(/\. Cook.*$/i, '') // Remove "Cook pancakes and serve with yogurt + berries"
      .replace(/\. Serve.*$/i, '') // Remove serving instructions
      .replace(/\. Mix.*$/i, '') // Remove mixing instructions
      .trim();
    
    console.log('Cleaned description:', cleaned);
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
        console.log('Parsed ingredients from colon:', ingredients);
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
      console.log('Parsed ingredients from comma:', ingredients);
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
          const newDailyTotals = await calculateDailyTotalsV2(updatedDayData);
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
    const calculateAllMacros = async () => {
      // Use the same logic as PDF: prefer weekMenu, fallback to days
      let dayData = null;
      if (planData?.weekMenu?.[activeDay]) {
        dayData = planData.weekMenu[activeDay];
        console.log('🔄 [V2] Using weekMenu data for day:', activeDay);
      } else if (planData?.days?.[activeDay]) {
        dayData = planData.days[activeDay];
        console.log('🔄 [V2] Using days data for day:', activeDay);
      }
      
      if (!dayData) {
        console.log('🔄 [V2] No day data found for:', activeDay);
        return;
      }

      // Reset macros to avoid showing stale values
      setMealMacros({});
      
      try {
        console.log('🔄 [V3] Calculating macros and totals for day:', activeDay);
        
        // First calculate meal macros using V2
        const { mealMacros: calculatedMealMacros } = await calculateMealMacrosAndTotalsV2(dayData);
        setMealMacros(calculatedMealMacros);
        
        // Wait a bit for DOM to update, then calculate daily totals from actual DOM values
        setTimeout(() => {
          const totals = calculateDailyTotalsFromDOM();
          setDailyTotals({...totals});
          
          console.log('✅ [V3] All meal macros calculated:', calculatedMealMacros);
          console.log('✅ [V3] Daily totals calculated from DOM:', totals);
        }, 100);
        
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
        const totals = await calculateDailyTotalsV2((updated.weekMenu || {})[day] || {});
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
      
      // Use V2 function for consistent calculation
      const dayData = updatedPlan.weekMenu[activeDay];
      const { mealMacros: newMealMacros, dailyTotals: totals } = await calculateMealMacrosAndTotalsV2(dayData);
      
      setMealMacros(newMealMacros);
      setDailyTotals({...totals});
      
      console.log('✅ Ingredient added successfully:', data.addedIngredient);
      console.log('📊 [V2] Updated daily totals:', totals);
      console.log('🍽️ [V2] Updated meal macros:', newMealMacros);
      
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
        throw new Error('Failed to add recipe');
      }

      const data = await response.json();
      
      // Update the plan data with the new meal description
      setPlanData(data.plan);
      
      // Force re-render by updating the plan data
      const updatedPlan = data.plan;
      
      // Use V2 function for consistent calculation
      const dayData = updatedPlan.weekMenu[activeDay];
      const { mealMacros: newMealMacros, dailyTotals: totals } = await calculateMealMacrosAndTotalsV2(dayData);
      
      setMealMacros(newMealMacros);
      setDailyTotals({...totals});
      
      console.log('✅ Recipe added successfully:', recipe.name);
      console.log('📊 [V2] Updated daily totals:', totals);
      console.log('🍽️ [V2] Updated meal macros:', newMealMacros);
    } catch (error) {
      console.error('Error adding recipe:', error);
      alert('Failed to add recipe. Please try again.');
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

  const handleCopyCustomerLink = () => {
    if (assignedCustomer?.id) {
      const customerLink = `${window.location.origin}/my-plan/${assignedCustomer.id}`;
      navigator.clipboard.writeText(customerLink);
      // Optional: add toast notification
      alert('Link gekopieerd! Je kunt deze nu delen met de klant.');
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
        dayTotals = await calculateDailyTotalsV2(dayData);
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
              dayTotals = await calculateDailyTotalsV2(dayMenu);
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

  // V3: Callback for when meal macros change
  const onMacrosUpdatedCallback = useCallback(() => {
    // Recalculate daily totals from DOM when any meal macros change
    const totals = calculateDailyTotalsFromDOM();
    setDailyTotals({...totals});
    // Force table update to show new values
    setForceTableUpdate(prev => prev + 1);
    console.log('🔄 [V3] Daily totals and table updated from macros change:', totals);
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
    console.log('🔍 [V3] Calculating daily totals from DOM values');
    
    const mealOrder = ['breakfast', 'morning-snack', 'lunch', 'afternoon-snack', 'dinner', 'evening-snack'];
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    for (const mealType of mealOrder) {
      try {
        // Get calories
        const caloriesElement = document.querySelector(`.totalcalories-${mealType}`);
        if (caloriesElement) {
          const calories = parseInt(caloriesElement.textContent || '0');
          totalCalories += calories;
          console.log(`🔍 [V3] ${mealType} calories from DOM:`, calories);
        }

        // Get protein
        const proteinElement = document.querySelector(`.totalprotein-${mealType}`);
        if (proteinElement) {
          const proteinText = proteinElement.textContent || '0g';
          const protein = parseFloat(proteinText.replace('g', '')) || 0;
          totalProtein += protein;
          console.log(`🔍 [V3] ${mealType} protein from DOM:`, protein);
        }

        // Get fat
        const fatElement = document.querySelector(`.totalfat-${mealType}`);
        if (fatElement) {
          const fatText = fatElement.textContent || '0g';
          const fat = parseFloat(fatText.replace('g', '')) || 0;
          totalFat += fat;
          console.log(`🔍 [V3] ${mealType} fat from DOM:`, fat);
        }

        // Get carbs
        const carbsElement = document.querySelector(`.totalcarbs-${mealType}`);
        if (carbsElement) {
          const carbsText = carbsElement.textContent || '0g';
          const carbs = parseFloat(carbsText.replace('g', '')) || 0;
          totalCarbs += carbs;
          console.log(`🔍 [V3] ${mealType} carbs from DOM:`, carbs);
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
    
    console.log('🎯 [V3] FINAL DAILY TOTALS FROM DOM:', totals);
    return totals;
  };

  // V2: Calculate both meal macros and daily totals using the same logic
  const calculateMealMacrosAndTotalsV2 = async (dayData: any) => {
    console.log('🚀 [V2] Calculating meal macros and daily totals for:', dayData);
    
    const mealOrder = ['breakfast', 'morning-snack', 'lunch', 'afternoon-snack', 'dinner', 'evening-snack'];
    const newMealMacros: {[key: string]: any} = {};
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    for (const mealType of mealOrder) {
      const meal = getMealString(dayData, mealType);
      console.log(`🚀 [V2] Processing ${mealType}: "${meal}"`);
      
      if (!meal || meal.trim() === '') {
        newMealMacros[mealType] = { calories: 0, protein: 0, carbs: 0, fat: 0 };
        console.log(`🚀 [V2] ${mealType} is empty, setting to zeros`);
        continue;
      }

      try {
        // Parse ingredients from meal description
        const ingredients = parseMealDescription(meal);
        
        if (ingredients.length === 0) {
          newMealMacros[mealType] = { calories: 0, protein: 0, carbs: 0, fat: 0 };
          console.log(`🚀 [V2] ${mealType} has no parseable ingredients`);
          continue;
        }

        // Get ingredient data from API - same as V2 daily totals
        const ingredientData = await getIngredientDataFromAPI(meal);
        console.log(`🚀 [V2] ${mealType} ingredient data:`, ingredientData);
        
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
          
          console.log(`🚀 [V2] ${mealType} totals:`, newMealMacros[mealType]);
        } else {
          newMealMacros[mealType] = { calories: 0, protein: 0, carbs: 0, fat: 0 };
          console.log(`🚀 [V2] ${mealType} has no ingredient data from API`);
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
    
    console.log('🎯 [V2] FINAL MEAL MACROS:', newMealMacros);
    console.log('🎯 [V2] FINAL DAILY TOTALS:', dailyTotals);
    
    return { mealMacros: newMealMacros, dailyTotals };
  };

  // Keep old function for backward compatibility but mark as deprecated
  const calculateDailyTotals = async (
    dayData: any, 
    ignoreCache: boolean = false
  ): Promise<{ calories: number; protein: number; carbs: number; fat: number }> => {
    console.log('⚠️ [DEPRECATED] Using old calculateDailyTotals, switching to V2...');
    return calculateDailyTotalsV2(dayData);
  };

  const getMealIcon = (mealType: string) => {
    switch (mealType) {
      case 'breakfast': return '🌅';
      case 'morning-snack': return '🍎';
      case 'lunch': return '🍽️';
      case 'afternoon-snack': return '🥜';
      case 'dinner': return '🌙';
      case 'evening-snack': return '🍓';
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
                  className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 bg-white text-rose-600 border-2 border-rose-500 rounded-lg hover:bg-rose-50 transition-colors text-xs sm:text-sm font-medium"
                  title="Preview PDF"
                >
                  <FiEye className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Preview</span>
                </button>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors text-xs sm:text-sm font-medium"
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
        {assignedCustomer && (
          <div className="mb-4 sm:mb-6 bg-gradient-to-r from-rose-50 to-pink-50 border-2 border-rose-200 rounded-xl p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                  🔗 Persoonlijke Link voor {assignedCustomer.name}
                </p>
                <p className="text-xs text-gray-600 font-mono bg-white rounded px-2 sm:px-3 py-2 border border-gray-200 break-all">
                  {typeof window !== 'undefined' && `${window.location.origin}/my-plan/${assignedCustomer.id}`}
                </p>
              </div>
              <button
                onClick={handleCopyCustomerLink}
                className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors text-xs sm:text-sm font-medium whitespace-nowrap"
                title="Kopieer klant link"
              >
                <FiCopy className="w-3 h-3 sm:w-4 sm:h-4" />
                Kopieer Link
              </button>
            </div>
          </div>
        )}

        {/* Plan Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">
          <div className="bg-white rounded-lg sm:rounded-xl lg:rounded-2xl p-2 sm:p-3 lg:p-6 shadow-sm">
            <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3 mb-1.5 sm:mb-2 lg:mb-4">
              <div className="p-1 sm:p-1.5 lg:p-2 bg-orange-100 rounded-lg">
                <FiHeart className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-6 lg:h-6 text-orange-600" />
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
                <FiActivity className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-6 lg:h-6 text-blue-600" />
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
                <FiCoffee className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-6 lg:h-6 text-green-600" />
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
                <FiClock className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-6 lg:h-6 text-purple-600" />
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
            <div className="flex gap-1 mt-2 sm:mt-0 overflow-x-auto pb-1">
              <button
                onClick={() => setActiveTab('menu')}
                className={`px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap flex-shrink-0 ${
                  activeTab === 'menu'
                    ? 'bg-rose-500 text-white'
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
                    ? 'bg-rose-500 text-white'
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
                    ? 'bg-rose-500 text-white'
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
              <div className="bg-white/90 backdrop-blur rounded-xl shadow-lg border border-rose-200 px-3 py-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-semibold text-sm text-gray-800 flex items-center gap-2">
                    {dayNames[activeDay as keyof typeof dayNames]} – Daily Overview
                    {trainingWeekdays.includes(dayKeyToWeekday(activeDay)) && (
                      <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-rose-100 text-rose-700 border border-rose-200">Training Day</span>
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
            <div className="flex items-center justify-between gap-2">
    <div className="flex gap-1 sm:gap-2 border-b border-gray-200 overflow-x-auto pb-1">
      {planData.weekMenu && dayOrder.map((dayKey) => (
        <button
          key={dayKey}
          onClick={() => setActiveDay(dayKey)}
          className={`px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap flex-shrink-0 flex items-center gap-2 ${
            activeDay === dayKey
              ? 'bg-rose-500 text-white border-b-2 border-rose-500'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <span>{dayNames[dayKey as keyof typeof dayNames]}</span>
          {trainingWeekdays.includes(dayKeyToWeekday(dayKey)) && (
            <span className={`px-2 py-0.5 rounded-full text-[10px] border ${activeDay === dayKey ? 'bg-white/20 border-white/40 text-white' : 'bg-rose-50 border-rose-200 text-rose-700'}`}>Training</span>
          )}
        </button>
      ))}
    </div>
              <div className="flex items-center gap-2">
        <button
          onClick={() => setTextConverterOpen(true)}
          className="ml-2 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg bg-orange-500 text-white hover:bg-orange-600 whitespace-nowrap"
        >
          Text Converter
        </button>
        <button
          onClick={() => setProductMappingOpen(true)}
          className="ml-2 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg bg-green-500 text-white hover:bg-green-600 whitespace-nowrap"
        >
          Product Mapping
        </button>
                <button
                  onClick={() => setPrefsOpen(true)}
                  className="ml-2 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg bg-rose-500 text-white hover:bg-rose-600 whitespace-nowrap"
                >
                  Generate Day Plan
                </button>
                <button
                  onClick={async () => {
                    if (!planId) return;
                    const ok = window.confirm('Weet je zeker dat je ALLE ingrediënten van deze dag wilt verwijderen? Dit kan niet ongedaan gemaakt worden.');
                    if (!ok) return;
                    try {
                      const res = await fetch(`/api/nutrition-plans/${planId}/clear-day`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ dayKey: activeDay }) });
                      if (res.ok) {
                        const data = await res.json();
                        if (data?.plan) {
                          setPlanData((prev: any) => ({ ...(prev || {}), weekMenu: data.plan.weekMenu }));
                        } else {
                          setPlanData((prev: any) => ({ ...(prev || {}), weekMenu: { ...(prev?.weekMenu || {}), [activeDay]: { breakfast: '', 'morning-snack': '', lunch: '', 'afternoon-snack': '', dinner: '', 'evening-snack': '' } } }));
                        }
                        setMealMacros({});
                        setDailyTotals({ calories: 0, protein: 0, carbs: 0, fat: 0 });
                      } else {
                        alert('Kon dag niet leegmaken. Probeer opnieuw.');
                      }
                    } catch (e) {
                      alert('Er ging iets mis bij het leegmaken van de dag.');
                    }
                  }}
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
                          <label key={cat} className={`flex items-center gap-2 text-xs border rounded px-2 py-1 cursor-pointer ${mealPrefs[meal].has(cat) ? 'bg-rose-50 border-rose-300' : 'bg-white border-gray-200'}`}>
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
                  <button className="px-3 py-2 text-xs rounded bg-rose-600 text-white" onClick={()=>{ setPrefsOpen(false); generateDayPlan(); }}>Use preferences & Generate</button>
                </div>
              </div>
            </div>
          )}

          {/* Generation Log Modal */}
          {genLogOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/40" onClick={() => setGenLogOpen(false)} />
              <div className="relative bg-white w-[90vw] max-w-3xl max-h-[80vh] rounded-lg shadow-xl border border-gray-200 p-3 sm:p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm sm:text-base font-bold text-gray-800">Generation Log</h4>
                  <button
                    onClick={() => setGenLogOpen(false)}
                    className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                  >
                    Close
                  </button>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded p-2 overflow-auto h-[55vh] font-mono text-[10px] sm:text-xs whitespace-pre-wrap">
                  {genLog.length ? genLog.join('\n') : 'No logs yet...'}
                </div>
              </div>
            </div>
          )}

          {/* Daily Menu Table */}
      {planData.weekMenu && (
        <div className="space-y-6">
              {/* Daily Totals Header with Progress Indicators */}
              <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6 border border-rose-200">
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
                          <span className="text-sm font-bold text-purple-600">{dailyTotals.fat}g / {planData.fat}g</span>
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
                          <span className={`text-xs font-medium ${getTextColor(dailyTotals.fat, planData.fat, 'text-purple-600')}`}>
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
                          <div className="text-sm sm:text-lg lg:text-2xl font-bold text-purple-600">{dailyTotals.fat}g</div>
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
                              <span className="text-sm sm:text-lg lg:text-xl mr-1 sm:mr-2">{getMealIcon(mealType)}</span>
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
                              <span className="inline-flex items-center px-1 sm:px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                {macros.fat}g
                              </span>
                            )}
                          </td>
                          <td className="px-1 sm:px-2 py-2 sm:py-3 lg:py-4 whitespace-nowrap text-center">
                            <IngredientSelector
                              onAddIngredient={handleAddIngredient}
                              onAddRecipe={handleAddRecipe}
                              mealType={mealType}
                              dayKey={activeDay}
                            />
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
                    const cookingInstructions = getCookingInstructionsFromStructure(planData?.weekMenu, activeDay, mealType) || getCookingInstructions(dayMenu, mealType);
                    
                    return (
                      <div key={`${activeDay}-${mealType}`}>
                        <IngredientBreakdown
                          mealDescription={meal}
                          mealType={mealType.charAt(0).toUpperCase() + mealType.slice(1)}
                          planId={planId}
                          dayKey={activeDay}
                          mealTypeKey={mealType}
                          editable={true}
                          onMacrosUpdated={onMacrosUpdatedCallback}
                          onPlanUpdated={(updatedPlan: any) => {
                            console.log('🔄 [PARENT] onPlanUpdated called with updated plan:', updatedPlan ? 'API update' : 'local changes');
                            console.log('🔄 [PARENT] Updated plan data:', updatedPlan?.weekMenu?.[activeDay]);
                            console.log('🔄 [PARENT] Current dailyTotals BEFORE update:', dailyTotals);
                            
                            const handleUpdate = async () => {
                              try {
                                console.log('🔄 [PARENT] Starting handleUpdate...');
                                
                                if (updatedPlan) {
                                  // API update - use the updated plan data
                                  setPlanData(updatedPlan);
                                  
                                  // Use same logic as main useEffect: prefer weekMenu, fallback to days
                                  let dayData = null;
                                  if (updatedPlan?.weekMenu?.[activeDay]) {
                                    dayData = updatedPlan.weekMenu[activeDay];
                                    console.log('🔄 [PARENT] Using weekMenu data for day:', activeDay);
                                  } else if (updatedPlan?.days?.[activeDay]) {
                                    dayData = updatedPlan.days[activeDay];
                                    console.log('🔄 [PARENT] Using days data for day:', activeDay);
                                  }
                                  
                                  if (dayData) {
                                    // Use V2 function for meal macros
                                    const { mealMacros: newMealMacros } = await calculateMealMacrosAndTotalsV2(dayData);
                                    setMealMacros(newMealMacros);
                                    
                                    // Wait for DOM update, then calculate daily totals from DOM
                                    setTimeout(() => {
                                      const totals = calculateDailyTotalsFromDOM();
                                      setDailyTotals({...totals});
                                      
                                      console.log('🔄 [PARENT] New meal macros calculated with V2:', newMealMacros);
                                      console.log('🔄 [PARENT] Daily totals calculated with V3 DOM:', totals);
                                    }, 100);
                                  }
                                  
                                  console.log('✅ [PARENT] Both meal macros and daily totals updated with V2');
                                } else {
                                  // Local changes only - recalculate from current plan data
                                  console.log('🔄 [PARENT] Recalculating totals for local changes');
                                  
                                  // Use same logic as main useEffect: prefer weekMenu, fallback to days
                                  let dayData = null;
                                  if (planData?.weekMenu?.[activeDay]) {
                                    dayData = planData.weekMenu[activeDay];
                                    console.log('🔄 [PARENT] Using weekMenu data for local changes:', activeDay);
                                  } else if (planData?.days?.[activeDay]) {
                                    dayData = planData.days[activeDay];
                                    console.log('🔄 [PARENT] Using days data for local changes:', activeDay);
                                  }
                                  
                                  if (dayData) {
                                    // Use V2 function for meal macros
                                    const { mealMacros: newMealMacros } = await calculateMealMacrosAndTotalsV2(dayData);
                                    setMealMacros(newMealMacros);
                                    
                                    // Wait for DOM update, then calculate daily totals from DOM
                                    setTimeout(() => {
                                      const totals = calculateDailyTotalsFromDOM();
                                      setDailyTotals({...totals});
                                      
                                      console.log('🔄 [PARENT] Meal macros calculated with V2:', newMealMacros);
                                      console.log('🔄 [PARENT] Daily totals calculated with V3 DOM:', totals);
                                    }, 100);
                                  }
                                  
                                  console.log('✅ [PARENT] Both updated for local changes with V2');
                                }
                              } catch (e) {
                                console.error('❌ [PARENT] Failed to refresh macros after update', e);
                              }
                            };
                            
                            console.log('🔄 [PARENT] About to call handleUpdate()');
                            handleUpdate();
                            console.log('🔄 [PARENT] handleUpdate() called (async execution started)');
                          }}
                        />
                        
                        
                        <CookingInstructions
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
                      <div className="text-lg sm:text-2xl font-bold text-purple-600">
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
                                case 'healthy-fats': return 'bg-purple-100 text-purple-800';
                                case 'dairy': return 'bg-pink-100 text-pink-800';
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
                                  <div className="text-sm font-medium text-purple-600">{Math.round(ingredient.totalFat / ingredient.totalAmount * 100)}g</div>
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
                        <div className="text-lg sm:text-xl font-bold text-purple-600">
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
                  className="px-3 py-1.5 rounded-md bg-rose-500 text-white text-xs hover:bg-rose-600"
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


      {/* Text Converter Modal */}
      <TextConverterModal
        isOpen={textConverterOpen}
        onClose={() => setTextConverterOpen(false)}
        onConvert={(parsedData) => {
          // Refresh the plan data after conversion
          console.log('[NutritionPlanDetailClient] onConvert called with:', parsedData);
          if (planId) {
            console.log('[NutritionPlanDetailClient] Refreshing plan data for ID:', planId);
            fetchPlanData(planId);
          }
        }}
        planId={planId}
      />

      <ProductMappingModal
        isOpen={productMappingOpen}
        onClose={() => setProductMappingOpen(false)}
        onConvert={(parsedData) => {
          // Refresh the plan data after conversion
          console.log('[NutritionPlanDetailClient] Product mapping onConvert called with:', parsedData);
          if (planId) {
            console.log('[NutritionPlanDetailClient] Refreshing plan data for ID:', planId);
            fetchPlanData(planId);
          }
        }}
        planId={planId}
      />

      </div>
    </div>
  </div>
  );
}
