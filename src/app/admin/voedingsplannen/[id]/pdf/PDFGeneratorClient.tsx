'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiDownload, FiEye, FiX } from 'react-icons/fi';
import jsPDF from 'jspdf';
import { createPortal } from 'react-dom';
import { calculateDailyTotalsV2 } from '@/utils/dailyTotalsV2';

export default function PDFGeneratorClient({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [planData, setPlanData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());
  const [loadingIngredients, setLoadingIngredients] = useState<Set<string>>(new Set());
  const [ingredientsCache, setIngredientsCache] = useState<Record<string, any[]>>({});

  useEffect(() => {
    const fetchPlanData = async () => {
      try {
        setLoading(true);
        console.log('[PDF Generator] Fetching plan data for ID:', params.id);
        const response = await fetch(`/api/nutrition-plans/${params.id}`);
        console.log('[PDF Generator] Response status:', response.status);
        if (!response.ok) {
          throw new Error('Failed to load nutrition plan');
        }
        const data = await response.json();
        console.log('[PDF Generator] Received plan data:', data);
        console.log('[PDF Generator] Plan data keys:', Object.keys(data));
        console.log('[PDF Generator] Has days?', 'days' in data);
        console.log('[PDF Generator] Has weekMenu?', 'weekMenu' in data);
        console.log('[PDF Generator] Days data:', data.days);
        console.log('[PDF Generator] WeekMenu data:', data.weekMenu);
        
        // Check if days are directly on the object
        const possibleDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        const directDays = possibleDays.filter(day => day in data);
        console.log('[PDF Generator] Days found directly on object:', directDays);
        
        if (data.days) {
          console.log('[PDF Generator] Days keys:', Object.keys(data.days));
          Object.keys(data.days).forEach(day => {
            console.log(`[PDF Generator] ${day}:`, data.days[day]);
          });
        }
        
        if (data.weekMenu) {
          console.log('[PDF Generator] WeekMenu structure:', data.weekMenu);
        }
        setPlanData(data);
      } catch (err) {
        console.error('[PDF Generator] Error loading plan:', err);
        setError('Failed to load nutrition plan');
      } finally {
        setLoading(false);
      }
    };

    fetchPlanData();
  }, [params.id]);

  // Cleanup preview URL
  useEffect(() => {
    return () => {
      if (pdfPreviewUrl && pdfPreviewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(pdfPreviewUrl);
      }
    };
  }, [pdfPreviewUrl]);

  const THEME = {
    pink: { r: 236, g: 72, b: 153 },
    pinkLight: { r: 251, g: 207, b: 232 },
    textDark: { r: 31, g: 41, b: 55 },
    grayLight: { r: 243, g: 244, b: 246 },
  };

  // Create gradient background
  const createGradientDataUrl = async (w: number, h: number): Promise<string> => {
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#fff1f2');
    grad.addColorStop(0.5, '#fce7f3');
    grad.addColorStop(1, '#fae8ff');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    return canvas.toDataURL('image/png');
  };

  const paintGradientBackground = async (pdf: jsPDF) => {
    const w = pdf.internal.pageSize.getWidth();
    const h = pdf.internal.pageSize.getHeight();
    const targetPxW = 1200;
    const aspect = h / w;
    const targetPxH = Math.round(targetPxW * aspect);
    const dataUrl = await createGradientDataUrl(targetPxW, targetPxH);
    pdf.addImage(dataUrl, 'PNG', 0, 0, w, h);
  };

  const loadLogoDataUrl = async (): Promise<string | null> => {
    try {
      const url = '/logo/Middel 4.svg';
      const svgText = await fetch(url).then(r => r.text());
      const svgBlob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
      const DOMURL = window.URL || (window as any).webkitURL;
      const urlObj = DOMURL.createObjectURL(svgBlob);
      const img = new Image();
      const dataUrl: string = await new Promise((resolve) => {
        img.onload = () => {
          const canvas = document.createElement('canvas');
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
    const leftColW = contentW * 0.25;
    const rightColW = contentW * 0.75;

    pdf.setFillColor(THEME.pink.r, THEME.pink.g, THEME.pink.b);
    pdf.rect(0, 0, pageW, headerH, 'F');

    const logo = await loadLogoDataUrl();
    if (logo) {
      try {
        const img = new Image();
        await new Promise<void>((resolve) => { img.onload = () => resolve(); img.onerror = () => resolve(); img.src = logo; });
        const maxH = 18;
        const maxW = leftColW;
        let drawW = 30;
        let drawH = 12;
        if (img.naturalWidth && img.naturalHeight) {
          const ratio = img.naturalWidth / img.naturalHeight;
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
    const cardWidth = 42;
    const cardHeight = 28;
    const borderRadius = 6;
    
    pdf.setFillColor(0, 0, 0, 0.1);
    pdf.roundedRect(x + 1, y + 1, cardWidth, cardHeight, borderRadius, borderRadius, 'F');
    
    pdf.setFillColor(color[0], color[1], color[2]);
    pdf.roundedRect(x, y, cardWidth, cardHeight, borderRadius, borderRadius, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7);
    pdf.text(label, x + 6, y + 10);
    
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.text(value, x + 6, y + 22);
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

  const parseMealDescription = (desc: string): Array<{ name: string; amount: number; unit: string }> => {
    if (!desc || desc.trim() === '') return [];
    const lines = desc.split('\n').map(l => l.trim()).filter(Boolean);
    const ingredients: Array<{ name: string; amount: number; unit: string }> = [];
    for (const line of lines) {
      const match = line.match(/^(\d+(?:\.\d+)?)\s*(g|ml|tbsp|tsp|piece|pieces|slice|slices|cup|cups)?\s+(.+)$/i);
      if (match) {
        const amount = parseFloat(match[1]);
        let unit = (match[2] || 'g').toLowerCase();
        const name = match[3].trim();
        if (unit === 'pieces') unit = 'piece';
        if (unit === 'slices') unit = 'slice';
        if (unit === 'cups') unit = 'cup';
        ingredients.push({ name, amount, unit });
      } else {
        ingredients.push({ name: line, amount: 100, unit: 'g' });
      }
    }
    return ingredients;
  };

  const getIngredientDataFromAPI = async (mealDescription: string) => {
    try {
      if (!mealDescription || mealDescription.trim() === '') return [];

      if (mealDescription.startsWith('[') && mealDescription.endsWith(']')) {
        try {
          const jsonIngredients = JSON.parse(mealDescription);
          if (Array.isArray(jsonIngredients)) {
            return jsonIngredients.map((ingredient: any) => {
              const quantity = ingredient.quantity || 0;
              const per = ingredient.per || '100g';
              
              let baseAmount = 100;
              let multiplier = 1;
              
              if (per === '100g' || per === '100ml') {
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
                name: String(ingredient.name || 'Unknown'),
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

      const ingredients = parseMealDescription(mealDescription);
      const response = await fetch('/api/calculate-macros', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredients }),
      });

      if (!response.ok) throw new Error('Failed to calculate macros');

      const data = await response.json();
      const results = data.results;

      return results.map((result: any) => {
        // Ensure we have a string
        let cleanName = String(result.ingredient || '');
        
        if (cleanName.includes('|')) {
          const parts = cleanName.split('|');
          cleanName = parts[parts.length - 1].trim();
        }
        
        cleanName = cleanName
          .replace(/^\d+(?:\.\d+)?\s*(?:g|gram|grams|ml|milliliter|milliliters|cup|cups|tbsp|tablespoon|tablespoons|tsp|teaspoon|teaspoons|slice|slices)\s*/i, '')
          .replace(/^\d+(?:\.\d+)?\s*(?:piece|pieces)\s*/i, '')
          .replace(/^\d+(?:\.\d+)?\s*/i, '')
          .replace(/^(\d+\/\d+|\d+)\s*/i, '')
          .replace(/^\([^)]*\)\s*/g, '')
          .replace(/^[^a-zA-Z]*/, '')
          .replace(/\)$/, '')
          .trim();

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
          if (result.pieces === 0.5) portion = '1/2 piece';
          else if (result.pieces === 0.25) portion = '1/4 piece';
          else if (result.pieces === 0.33) portion = '1/3 piece';
          else if (result.pieces === 1) portion = '1 piece';
          else portion = `${result.pieces} pieces`;
        } else if (result.amount) {
          portion = `${Math.round(result.amount)} ${result.unit || 'g'}`;
        } else {
          portion = '1 piece';
        }

        return {
          name: cleanName,
          portion: portion,
          calories: Math.round(result.macros?.calories || 0),
          protein: Math.round(result.macros?.protein || 0),
          carbs: Math.round(result.macros?.carbs || 0),
          fat: Math.round(result.macros?.fat || 0),
          fiber: Math.round(result.macros?.fiber || 0)
        };
      });
    } catch (error) {
      console.error('Error getting ingredient data from API:', error);
      return [];
    }
  };

  const drawMealIngredientsTable = async (pdf: jsPDF, startY: number, mealName: string, rows: Array<{ ingredient: string; portion: string; calories: number; protein: number; carbs: number; fat: number; fiber?: number }>) => {
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let y = startY;
    const tableX = 15;
    const tableW = pageWidth - 30;
    
    let totalRowsHeight = 10;
    const computedHeights = rows.map(r => {
      const nameLines = pdf.splitTextToSize(r.ingredient, 65);
      const portionLines = pdf.splitTextToSize(r.portion, 50);
      const rowH = Math.max(8, Math.max(nameLines.length, portionLines.length) * 5) + 2;
      return rowH;
    });
    totalRowsHeight += computedHeights.reduce((a,b)=>a+b,0);
    
    pdf.setFillColor(255,255,255);
    pdf.roundedRect(tableX, y - 4, tableW, Math.min(totalRowsHeight + 10, pageHeight - y - 20), 4, 4, 'F');
    
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    pdf.setTextColor(THEME.textDark.r, THEME.textDark.g, THEME.textDark.b);
    pdf.text(mealName, tableX + 5, y);
    y += 5;
    
    pdf.setFillColor(THEME.grayLight.r, THEME.grayLight.g, THEME.grayLight.b);
    pdf.rect(tableX, y, tableW, 10, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.setTextColor(55);
    pdf.text('Ingredient', tableX + 5, y + 7);
    pdf.text('Portion', tableX + 75, y + 7);
    pdf.text('Cal', tableX + tableW - 65, y + 7);
    pdf.text('P', tableX + tableW - 48, y + 7);
    pdf.text('C', tableX + tableW - 35, y + 7);
    pdf.text('Fi', tableX + tableW - 22, y + 7);
    pdf.text('F', tableX + tableW - 10, y + 7);
    y += 12;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(33);
    for (const r of rows) {
      const nameLines = pdf.splitTextToSize(r.ingredient, 65);
      const portionLines = pdf.splitTextToSize(r.portion, 50);
      const rowH = Math.max(8, Math.max(nameLines.length, portionLines.length) * 5);
      if (y + rowH > pageHeight - 25) {
        pdf.addPage();
        await paintGradientBackground(pdf);
        await drawHeader(pdf, planData.name || 'Nutrition Plan');
        y = 36;
      }
      nameLines.forEach((line: string, i: number) => pdf.text(line, tableX + 5, y + 5 + i * 5));
      portionLines.forEach((line: string, i: number) => pdf.text(line, tableX + 75, y + 5 + i * 5));
      pdf.text(String(r.calories || 0), tableX + tableW - 55, y + 5, { align: 'right' });
      pdf.text(String(r.protein || 0), tableX + tableW - 40, y + 5, { align: 'right' });
      pdf.text(String(r.carbs || 0), tableX + tableW - 27, y + 5, { align: 'right' });
      pdf.text(String(r.fiber || 0), tableX + tableW - 14, y + 5, { align: 'right' });
      pdf.text(String(r.fat || 0), tableX + tableW - 4, y + 5, { align: 'right' });
      y += rowH;
      pdf.setDrawColor(240);
      pdf.line(tableX, y, tableX + tableW, y);
    }
    return y + 4;
  };

  const drawDayTable = (pdf: jsPDF, startY: number, dayName: string, meals: Array<{ name: string; description: string; calories: number; cookingInstructions?: string }>) => {
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let y = startY;
    const left = 15, right = pageWidth - 15;
    
    let estimated = 6 + 10;
    const descriptionWidth = pageWidth - 110;
    const tmpLinesHeights = meals.map(row => {
      const lines = pdf.splitTextToSize(row.description || '', descriptionWidth);
      const rowHeight = Math.max(8, lines.length * 5);
      return rowHeight + 2;
    });
    estimated += tmpLinesHeights.reduce((a, b) => a + b, 0);
    
    pdf.setFillColor(255, 255, 255);
    pdf.roundedRect(left, y - 4, right - left, Math.min(estimated, pageHeight - y - 20), 4, 4, 'F');
    
    pdf.setTextColor(THEME.textDark.r, THEME.textDark.g, THEME.textDark.b);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(13);
    pdf.text(dayName, 20, y);
    y += 6;
    
    pdf.setFillColor(THEME.grayLight.r, THEME.grayLight.g, THEME.grayLight.b);
    pdf.rect(20, y, pageWidth - 40, 8, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.setTextColor(55);
    pdf.text('Meal', 23, y + 6);
    pdf.text('Description', 60, y + 6);
    pdf.text('Calories', pageWidth - 45, y + 6);
    y += 10;
    
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(33);
    
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
      
      pdf.setDrawColor(240);
      pdf.line(20, y, pageWidth - 20, y);
      y += 2;
    }
    return y;
  };

  const buildPdf = async (): Promise<jsPDF | null> => {
    if (!planData) return null;

    try {
      console.log('[PDF] Starting PDF build with planData:', planData);
      console.log('[PDF] Has weekMenu?', !!planData.weekMenu);
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      await paintGradientBackground(pdf);
      let yPosition = 36;

      await drawHeader(pdf, planData.name || 'Nutrition Plan', '7-Day Meal Plan');

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(12);
      pdf.setTextColor(THEME.textDark.r, THEME.textDark.g, THEME.textDark.b);
      pdf.text('Weekly Nutrition Plan', 15, yPosition);
      yPosition += 10;

      const allDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      
      for (const day of allDays) {
        const dayData = planData.weekMenu?.[day];
        console.log(`[PDF] Processing ${day}:`, dayData);
        
        if (day !== 'monday') {
          yPosition += 10;
        }
        
        if (yPosition > pageHeight - 80) {
          pdf.addPage();
          await paintGradientBackground(pdf);
          await drawHeader(pdf, planData.name || 'Nutrition Plan', '7-Day Meal Plan');
          yPosition = 36;
        }

        pdf.setFillColor(236, 72, 153);
        pdf.roundedRect(15, yPosition - 4, 180, 12, 2, 2, 'F');
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(14);
        pdf.setTextColor(255, 255, 255);
        const dayName = day.charAt(0).toUpperCase() + day.slice(1);
        pdf.text(dayName, 20, yPosition + 4);
        yPosition += 14;

        let dayTotals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
        if (dayData) {
          try {
            dayTotals = await calculateDailyTotalsV2(dayData);
          } catch {}
        }
        
        if (!dayData) {
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(10);
          pdf.setTextColor(100, 100, 100);
          pdf.text(`No meal plan for this day`, 20, yPosition);
          yPosition += 8;
        } else {
          const yRow = yPosition;
          drawBadge(pdf, 15, yRow, 'Day Calories', `${dayTotals.calories}`, [255, 165, 0]);
          drawBadge(pdf, 62, yRow, 'Day Protein', `${dayTotals.protein}g`, [0, 123, 255]);
          drawBadge(pdf, 109, yRow, 'Day Carbs', `${dayTotals.carbs}g`, [34, 197, 94]);
          drawBadge(pdf, 156, yRow, 'Day Fat', `${dayTotals.fat}g`, [168, 85, 247]);
          yPosition += 30;

          const mealOrder = ['breakfast', 'morning-snack', 'lunch', 'afternoon-snack', 'dinner', 'evening-snack'];
          const rows: Array<{ name: string; description: string; calories: number; cookingInstructions?: string }> = [];
          
          for (const mealKey of mealOrder) {
            const mealData = dayData[mealKey];
            
            // Support both string format and object format
            let description = '';
            let cookingInstructions = '';
            if (typeof mealData === 'string') {
              description = mealData;
            } else if (mealData?.description) {
              description = mealData.description;
              cookingInstructions = mealData.cookingInstructions || '';
            } else if (mealData?.ingredients) {
              description = mealData.ingredients;
              cookingInstructions = mealData.cookingInstructions || '';
            }
            
            if (!description || description.trim() === '') continue;
            
            const cleanDesc = description.replace(/[a-z0-9]{26}\|/g, '').trim();
            const mealNameDisplay = mealKey.replace('-', ' ').split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
            
            const ingredientData = await getIngredientDataFromAPI(description);
            const mealCalories = ingredientData.reduce((sum: number, ing: any) => sum + (ing.calories || 0), 0);
            
            rows.push({
              name: mealNameDisplay,
              description: cleanDesc,
              calories: mealCalories,
              cookingInstructions: cookingInstructions
            });
          }

          if (yPosition + 40 > pageHeight - 20) {
            pdf.addPage();
            await paintGradientBackground(pdf);
            await drawHeader(pdf, planData.name || 'Nutrition Plan', '7-Day Meal Plan');
            yPosition = 36;
          }

          yPosition = drawDayTable(pdf, yPosition, dayName, rows);
          yPosition += 6;

          for (const mealKey of mealOrder) {
            const mealData = dayData[mealKey];
            
            // Support both string format and object format
            let description = '';
            if (typeof mealData === 'string') {
              description = mealData;
            } else if (mealData?.description) {
              description = mealData.description;
            } else if (mealData?.ingredients) {
              description = mealData.ingredients;
            }
            
            if (!description || description.trim() === '') continue;
            
            const mealNameDisplay = mealKey.replace('-', ' ').split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
            const ingredientData = await getIngredientDataFromAPI(description);
            
            if (ingredientData.length > 0) {
              if (yPosition > pageHeight - 60) {
                pdf.addPage();
                await paintGradientBackground(pdf);
                await drawHeader(pdf, planData.name || 'Nutrition Plan');
                yPosition = 36;
              }
              
              const rowsIng = ingredientData.map((ing: any) => ({
                ingredient: ing.name,
                portion: ing.portion,
                calories: ing.calories,
                protein: ing.protein,
                carbs: ing.carbs,
                fat: ing.fat,
                fiber: ing.fiber
              }));
              
              yPosition = await drawMealIngredientsTable(pdf, yPosition, `${mealNameDisplay} ingredients`, rowsIng);
              yPosition += 6;
            }
          }
        }
      }

      for (let i = 1; i <= pdf.getNumberOfPages(); i++) {
        pdf.setPage(i);
        addFooter(pdf, i);
      }

      return pdf;
    } catch (error) {
      console.error('Error building PDF:', error);
      return null;
    }
  };

  const handleGeneratePDF = async () => {
    setGenerating(true);
    try {
      const pdf = await buildPdf();
      if (pdf) {
        const fileName = `${planData.name || 'nutrition-plan'}_7days.pdf`;
        pdf.save(fileName);
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF');
    } finally {
      setGenerating(false);
    }
  };

  const handlePreview = async () => {
    setGenerating(true);
    try {
      const pdf = await buildPdf();
      if (pdf) {
        const blob = pdf.output('blob');
        const url = URL.createObjectURL(blob);
        setPdfPreviewUrl(url);
        setShowPreview(true);
      }
    } catch (error) {
      console.error('Error generating preview:', error);
      alert('Failed to generate preview');
    } finally {
      setGenerating(false);
    }
  };

  const toggleDay = async (day: string) => {
    console.log('[PDF Generator] toggleDay called for:', day);
    const newExpandedDays = new Set(expandedDays);
    
    if (expandedDays.has(day)) {
      console.log('[PDF Generator] Collapsing day:', day);
      newExpandedDays.delete(day);
      setExpandedDays(newExpandedDays);
    } else {
      console.log('[PDF Generator] Expanding day:', day);
      newExpandedDays.add(day);
      setExpandedDays(newExpandedDays);
      
      // Load ingredients for all meals in this day if not already loaded
      const dayData = planData.weekMenu?.[day];
      console.log('[PDF Generator] Day data for', day, ':', dayData);
      
      if (dayData) {
        const mealTypes = ['breakfast', 'morning-snack', 'lunch', 'afternoon-snack', 'dinner', 'evening-snack'];
        
        for (const mealType of mealTypes) {
          const mealData = dayData[mealType];
          let description = '';
          
          if (typeof mealData === 'string') {
            description = mealData;
          } else if (mealData?.description) {
            description = mealData.description;
          } else if (mealData?.ingredients) {
            description = mealData.ingredients;
          }
          
          console.log(`[PDF Generator] ${day}.${mealType} description:`, description);
          
          if (description && description.trim() !== '') {
            const cacheKey = `${day}-${mealType}`;
            
            if (!ingredientsCache[cacheKey]) {
              console.log('[PDF Generator] Loading ingredients for', cacheKey);
              setLoadingIngredients(prev => new Set(prev).add(cacheKey));
              
              try {
                const ingredients = await getIngredientDataFromAPI(description);
                console.log('[PDF Generator] Loaded ingredients for', cacheKey, ':', ingredients);
                setIngredientsCache(prev => ({
                  ...prev,
                  [cacheKey]: ingredients
                }));
              } catch (error) {
                console.error(`[PDF Generator] Error loading ingredients for ${cacheKey}:`, error);
              } finally {
                setLoadingIngredients(prev => {
                  const newSet = new Set(prev);
                  newSet.delete(cacheKey);
                  return newSet;
                });
              }
            } else {
              console.log('[PDF Generator] Using cached ingredients for', cacheKey);
            }
          }
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-rose-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading plan data...</p>
        </div>
      </div>
    );
  }

  if (error || !planData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <FiArrowLeft className="w-5 h-5" />
            Back
          </button>
          <div className="bg-white rounded-xl p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Error</h1>
            <p className="text-gray-600">{error || 'Plan not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  const PreviewModal = () => {
    if (!showPreview || !pdfPreviewUrl) return null;

    return createPortal(
      <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-xl font-bold text-gray-800">PDF Preview</h3>
            <button
              onClick={() => {
                setShowPreview(false);
                if (pdfPreviewUrl) {
                  URL.revokeObjectURL(pdfPreviewUrl);
                  setPdfPreviewUrl(null);
                }
              }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FiX className="w-6 h-6 text-gray-600" />
            </button>
          </div>
          <div className="flex-1 overflow-auto">
            <iframe
              src={pdfPreviewUrl}
              className="w-full h-full"
              title="PDF Preview"
            />
          </div>
        </div>
      </div>,
      document.body
    );
  };

  const allDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  // Use weekMenu instead of days (database structure)
  const daysWithData = allDays.filter(day => planData.weekMenu?.[day]);
  
  console.log('[PDF Generator] Rendering with planData:', planData);
  console.log('[PDF Generator] WeekMenu:', planData.weekMenu);
  console.log('[PDF Generator] Days with data:', daysWithData);

  return (
    <>
      <PreviewModal />
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
            >
              <FiArrowLeft className="w-5 h-5" />
              Back to Plan
            </button>
            
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">{planData.name}</h1>
                  <p className="text-gray-600">{planData.description}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    {daysWithData.length} of 7 days have meal plans
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handlePreview}
                    disabled={generating}
                    className="flex items-center gap-2 px-6 py-3 bg-white text-rose-600 border-2 border-rose-500 rounded-lg hover:bg-rose-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {generating ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-rose-600"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <FiEye className="w-5 h-5" />
                        Preview PDF
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleGeneratePDF}
                    disabled={generating}
                    className="flex items-center gap-2 px-6 py-3 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {generating ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <FiDownload className="w-5 h-5" />
                        Download PDF
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

        {/* Days Overview */}
        <div className="grid grid-cols-1 gap-4">
          {allDays.map((day) => {
            const dayData = planData.weekMenu?.[day];
            const dayName = day.charAt(0).toUpperCase() + day.slice(1);
            console.log(`[PDF Generator] Checking ${day} - Full object:`, JSON.stringify(dayData, null, 2));
            console.log(`[PDF Generator] ${day} keys:`, dayData ? Object.keys(dayData) : 'no data');
            
            // Check each meal type
            if (dayData) {
              ['breakfast', 'lunch', 'dinner', 'morning-snack', 'afternoon-snack', 'evening-snack'].forEach(mealType => {
                console.log(`[PDF Generator] ${day}.${mealType}:`, dayData[mealType]);
                if (dayData[mealType]) {
                  console.log(`[PDF Generator] ${day}.${mealType}.description:`, dayData[mealType]?.description);
                }
              });
            }
            
            const hasMeals = dayData && Object.keys(dayData).some(key => {
              // Support both string format and object format
              const mealData = dayData[key];
              const hasMeal = ['breakfast', 'lunch', 'dinner', 'morning-snack', 'afternoon-snack', 'evening-snack'].includes(key) &&
                (typeof mealData === 'string' ? mealData.trim() !== '' : (mealData?.description || mealData?.ingredients));
              if (hasMeal) {
                console.log(`[PDF Generator] ${day} has ${key}:`, mealData);
              }
              return hasMeal;
            });
            console.log(`[PDF Generator] ${day} hasMeals:`, hasMeals);

            const isExpanded = expandedDays.has(day);

            return (
              <div 
                key={day}
                className={`bg-white rounded-xl shadow-md overflow-hidden border-2 ${
                  hasMeals ? 'border-green-200' : 'border-gray-200'
                }`}
              >
                <div 
                  className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => hasMeals && toggleDay(day)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        {dayName}
                        {hasMeals && (
                          <span className="text-sm text-gray-400">
                            {isExpanded ? '▼' : '▶'}
                          </span>
                        )}
                      </h3>
                      {hasMeals ? (
                        <p className="text-sm text-green-600 mt-1">✓ Meals configured - Click to view details</p>
                      ) : (
                        <p className="text-sm text-gray-400 mt-1">No meals configured</p>
                      )}
                    </div>
                    {hasMeals && (
                      <div className="flex gap-2">
                        {['breakfast', 'lunch', 'dinner'].map(meal => {
                          const mealData = dayData[meal];
                          const hasThisMeal = typeof mealData === 'string' ? mealData.trim() !== '' : (mealData?.description || mealData?.ingredients);
                          return hasThisMeal ? (
                            <span key={meal} className="text-xs bg-rose-100 text-rose-700 px-2 py-1 rounded">
                              {meal}
                            </span>
                          ) : null;
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {hasMeals && isExpanded && (
                  <div className="border-t border-gray-200 p-6 bg-gray-50 space-y-6">
                    {['breakfast', 'morning-snack', 'lunch', 'afternoon-snack', 'dinner', 'evening-snack'].map(meal => {
                      const mealData = dayData[meal];
                      
                      // Support both string format and object format
                      let description = '';
                      if (typeof mealData === 'string') {
                        description = mealData;
                      } else if (mealData?.description) {
                        description = mealData.description;
                      } else if (mealData?.ingredients) {
                        description = mealData.ingredients;
                      }
                      
                      if (!description || description.trim() === '') return null;
                      
                      const cacheKey = `${day}-${meal}`;
                      const ingredients = ingredientsCache[cacheKey] || [];
                      const isLoading = loadingIngredients.has(cacheKey);
                      const mealNameDisplay = meal.replace('-', ' ').split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                      
                      console.log(`[PDF Generator] Rendering ${cacheKey}:`, {
                        cacheKey,
                        hasCache: !!ingredientsCache[cacheKey],
                        ingredientsLength: ingredients.length,
                        ingredients: ingredients,
                        isLoading,
                        allCacheKeys: Object.keys(ingredientsCache)
                      });
                      
                      const mealTotal = ingredients.reduce((sum, ing) => ({
                        calories: sum.calories + (ing.calories || 0),
                        protein: sum.protein + (ing.protein || 0),
                        carbs: sum.carbs + (ing.carbs || 0),
                        fat: sum.fat + (ing.fat || 0),
                        fiber: sum.fiber + (ing.fiber || 0)
                      }), { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });
                      
                      return (
                        <div key={meal} className="bg-white rounded-lg shadow-sm overflow-hidden">
                          {/* Meal Header */}
                          <div className="bg-gradient-to-r from-rose-500 to-pink-500 px-4 py-3">
                            <h4 className="text-white font-bold text-lg">{mealNameDisplay}</h4>
                          </div>
                          
                          {/* Ingredients Table */}
                          {isLoading ? (
                            <div className="p-8 text-center">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500 mx-auto mb-2"></div>
                              <p className="text-gray-600 text-sm">Loading ingredients...</p>
                            </div>
                          ) : ingredients.length > 0 ? (
                            <>
                              <div className="overflow-x-auto">
                                <table className="w-full">
                                  <thead className="bg-gray-100">
                                    <tr>
                                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Ingredient</th>
                                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Portion</th>
                                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Cal</th>
                                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Protein</th>
                                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Carbs</th>
                                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Fiber</th>
                                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Fat</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-200">
                                    {ingredients.map((ing, idx) => (
                                      <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3 text-sm text-gray-800">{ing.name}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{ing.portion}</td>
                                        <td className="px-4 py-3 text-sm text-gray-800 text-right font-medium">{ing.calories}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600 text-right">{ing.protein}g</td>
                                        <td className="px-4 py-3 text-sm text-gray-600 text-right">{ing.carbs}g</td>
                                        <td className="px-4 py-3 text-sm text-gray-600 text-right">{ing.fiber || 0}g</td>
                                        <td className="px-4 py-3 text-sm text-gray-600 text-right">{ing.fat}g</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                  <tfoot className="bg-gradient-to-r from-rose-50 to-pink-50 border-t-2 border-rose-200">
                                    <tr>
                                      <td colSpan={2} className="px-4 py-3 text-sm font-bold text-gray-800">Total</td>
                                      <td className="px-4 py-3 text-sm font-bold text-rose-600 text-right">{mealTotal.calories}</td>
                                      <td className="px-4 py-3 text-sm font-bold text-blue-600 text-right">{Math.round(mealTotal.protein)}g</td>
                                      <td className="px-4 py-3 text-sm font-bold text-green-600 text-right">{Math.round(mealTotal.carbs)}g</td>
                                      <td className="px-4 py-3 text-sm font-bold text-yellow-600 text-right">{Math.round(mealTotal.fiber)}g</td>
                                      <td className="px-4 py-3 text-sm font-bold text-purple-600 text-right">{Math.round(mealTotal.fat)}g</td>
                                    </tr>
                                  </tfoot>
                                </table>
                              </div>
                            </>
                          ) : (
                            <div className="p-4 text-center text-gray-500 text-sm">
                              No ingredients data available
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-blue-900 mb-2">📄 PDF Generation</h3>
          <p className="text-blue-800 text-sm">
            The PDF will include all 7 days with meal plans, ingredient breakdowns, and macro calculations.
            Days without meals will show "No meal plan for this day".
          </p>
        </div>
        </div>
      </div>
    </>
  );
}

