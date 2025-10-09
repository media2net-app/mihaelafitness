'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft, Save, Eye, Download, Plus, Trash2, Type, Image as ImageIcon,
  AlignLeft, Bold, Italic, Underline, Square, Circle, Minus, X, Check
} from 'lucide-react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { calculateDailyTotalsV2 } from '@/utils/dailyTotalsV2';

interface TemplateElement {
  id: string;
  type: 'text' | 'image' | 'shape' | 'line';
  x: number;
  y: number;
  width: number;
  height: number;
  content?: string;
  fontSize?: number;
  fontWeight?: string;
  color?: string;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
}

const ElementTypes = {
  ELEMENT: 'element',
};

// Draggable Element Component
function DraggableElement({ 
  element, 
  onUpdate, 
  onDelete, 
  isSelected,
  onSelect 
}: { 
  element: TemplateElement;
  onUpdate: (id: string, updates: Partial<TemplateElement>) => void;
  onDelete: (id: string) => void;
  isSelected: boolean;
  onSelect: (id: string) => void;
}) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ElementTypes.ELEMENT,
    item: element,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    end: (item, monitor) => {
      // Ensure element stays visible after drag
      if (monitor.didDrop()) {
        console.log('Element dropped successfully:', item.id);
      }
    },
  }));

  const renderElement = () => {
    switch (element.type) {
      case 'text':
        return (
          <div
            style={{
              fontSize: `${element.fontSize || 16}px`,
              fontWeight: element.fontWeight || 'normal',
              color: element.color || '#000',
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              padding: '4px',
              overflow: 'hidden',
            }}
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => onUpdate(element.id, { content: e.currentTarget.textContent || '' })}
          >
            {element.content || 'Text'}
          </div>
        );
      case 'shape':
        return (
          <div
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: element.backgroundColor || '#e5e7eb',
              borderColor: element.borderColor || '#000',
              borderWidth: element.borderWidth || 1,
              borderStyle: 'solid',
              borderRadius: element.content === 'circle' ? '50%' : '0',
            }}
          />
        );
      case 'line':
        return (
          <div
            style={{
              width: '100%',
              height: element.borderWidth || 2,
              backgroundColor: element.borderColor || '#000',
            }}
          />
        );
      case 'image':
        return element.content && element.content.startsWith('/') ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img 
            src={element.content} 
            alt="Image"
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'contain' 
            }}
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: '#f3f4f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px dashed #d1d5db',
            }}
          >
            <ImageIcon className="w-8 h-8 text-gray-400" />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      ref={drag}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(element.id);
      }}
      style={{
        position: 'absolute',
        left: element.x,
        top: element.y,
        width: element.width,
        height: element.height,
        cursor: 'move',
        opacity: isDragging ? 0.3 : 1,
        border: isSelected ? '2px solid #e63946' : '1px solid transparent',
        boxShadow: isSelected ? '0 0 0 2px rgba(230, 57, 70, 0.2)' : 'none',
        zIndex: isSelected ? 10 : 1,
        minWidth: 20,
        minHeight: 20,
        pointerEvents: isDragging ? 'none' : 'auto',
      }}
      className="hover:border-rose-300 transition-all"
    >
      {!isDragging && renderElement()}
      {isSelected && !isDragging && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(element.id);
          }}
          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 z-20"
          style={{ width: 20, height: 20 }}
        >
          <Trash2 className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}

// Canvas Drop Zone
function Canvas({ 
  elements, 
  onDrop, 
  onUpdate, 
  onDelete,
  selectedElement,
  onSelectElement,
  zoom 
}: {
  elements: TemplateElement[];
  onDrop: (x: number, y: number) => void;
  onUpdate: (id: string, updates: Partial<TemplateElement>) => void;
  onDelete: (id: string) => void;
  selectedElement: string | null;
  onSelectElement: (id: string) => void;
  zoom: number;
}) {
  const [, drop] = useDrop(() => ({
    accept: ElementTypes.ELEMENT,
    drop: (item: TemplateElement, monitor) => {
      const delta = monitor.getDifferenceFromInitialOffset();
      if (delta) {
        // Account for the zoom scale factor
        const newX = Math.max(0, Math.round(item.x + (delta.x / zoom)));
        const newY = Math.max(0, Math.round(item.y + (delta.y / zoom)));
        
        console.log('Drop update:', { id: item.id, oldX: item.x, oldY: item.y, newX, newY, delta, zoom });
        onUpdate(item.id, { x: newX, y: newY });
      }
    },
    hover: (item: TemplateElement, monitor) => {
      // Optional: Add hover effects
    },
  }));

  return (
    <div
      ref={drop}
      onClick={() => onSelectElement('')}
      className="relative bg-white rounded-lg shadow-inner"
      style={{
        width: '210mm', // A4 width
        height: '297mm', // A4 height
        transform: `scale(${zoom})`,
        transformOrigin: 'top left',
        border: '1px solid #e5e7eb',
      }}
    >
      {elements.map((element) => (
        <DraggableElement
          key={element.id}
          element={element}
          onUpdate={onUpdate}
          onDelete={onDelete}
          isSelected={selectedElement === element.id}
          onSelect={onSelectElement}
        />
      ))}
    </div>
  );
}

export default function PDFTemplateEditorPage() {
  const router = useRouter();
  const params = useParams();
  const templateId = params.id as string;

  const [templateName, setTemplateName] = useState('');
  const [elements, setElements] = useState<TemplateElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [nutritionPlans, setNutritionPlans] = useState<any[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [previewData, setPreviewData] = useState<any>(null);
  const [zoom, setZoom] = useState(0.7); // Zoom level (0.25 to 1.5)
  const [previewZoom, setPreviewZoom] = useState(0.5); // Preview zoom level

  useEffect(() => {
    // Load template data
    const templates: Record<string, any> = {
      '1': { name: 'Voedingsplan Template', type: 'nutrition' },
      '2': { name: 'Trainingsschema Template', type: 'training' },
      '3': { name: 'Factuur Template', type: 'invoice' },
    };

    const template = templates[templateId];
    if (template) {
      setTemplateName(template.name);
      
      // Load nutrition plan template structure
      if (template.type === 'nutrition') {
        setElements([
          // Header background (pink bar)
          {
            id: 'header-bg',
            type: 'shape',
            x: 0,
            y: 0,
            width: 794, // A4 width in pixels at 96 DPI (210mm)
            height: 106, // 28mm converted
            backgroundColor: '#ec4899', // pink-500
            borderWidth: 0,
          },
          // Logo placeholder
          {
            id: 'logo',
            type: 'image',
            x: 45,
            y: 15,
            width: 150,
            height: 68,
            content: '/logo-mihaela.svg', // Load actual logo
          },
          // Header title
          {
            id: 'header-title',
            type: 'text',
            x: 220,
            y: 45,
            width: 500,
            height: 40,
            content: 'Nutrition Plan Title',
            fontSize: 20,
            fontWeight: 'bold',
            color: '#ffffff',
          },
          // Header subtitle
          {
            id: 'header-subtitle',
            type: 'text',
            x: 220,
            y: 70,
            width: 500,
            height: 30,
            content: 'Weekly meal plan description',
            fontSize: 12,
            color: '#ffffff',
          },
          // Section title
          {
            id: 'section-title',
            type: 'text',
            x: 57,
            y: 136,
            width: 400,
            height: 30,
            content: 'Weekly Nutrition Summary',
            fontSize: 14,
            fontWeight: 'bold',
            color: '#1f2937',
          },
          // Calorie badge background
          {
            id: 'cal-badge-bg',
            type: 'shape',
            x: 57,
            y: 160,
            width: 159, // 42mm
            height: 106, // 28mm
            backgroundColor: '#ffa500', // orange
            borderWidth: 0,
          },
          // Calorie badge label
          {
            id: 'cal-badge-label',
            type: 'text',
            x: 80,
            y: 198,
            width: 120,
            height: 20,
            content: 'Day Calories',
            fontSize: 8,
            color: '#ffffff',
          },
          // Calorie badge value
          {
            id: 'cal-badge-value',
            type: 'text',
            x: 80,
            y: 243,
            width: 120,
            height: 30,
            content: '2000',
            fontSize: 16,
            fontWeight: 'bold',
            color: '#ffffff',
          },
          // Protein badge background
          {
            id: 'protein-badge-bg',
            type: 'shape',
            x: 235,
            y: 160,
            width: 159,
            height: 106,
            backgroundColor: '#007bff', // blue
            borderWidth: 0,
          },
          // Protein badge label
          {
            id: 'protein-badge-label',
            type: 'text',
            x: 258,
            y: 198,
            width: 120,
            height: 20,
            content: 'Day Protein',
            fontSize: 8,
            color: '#ffffff',
          },
          // Protein badge value
          {
            id: 'protein-badge-value',
            type: 'text',
            x: 258,
            y: 243,
            width: 120,
            height: 30,
            content: '150g',
            fontSize: 16,
            fontWeight: 'bold',
            color: '#ffffff',
          },
          // Carbs badge background
          {
            id: 'carbs-badge-bg',
            type: 'shape',
            x: 413,
            y: 160,
            width: 159,
            height: 106,
            backgroundColor: '#22c55e', // green
            borderWidth: 0,
          },
          // Carbs badge label
          {
            id: 'carbs-badge-label',
            type: 'text',
            x: 436,
            y: 198,
            width: 120,
            height: 20,
            content: 'Day Carbs',
            fontSize: 8,
            color: '#ffffff',
          },
          // Carbs badge value
          {
            id: 'carbs-badge-value',
            type: 'text',
            x: 436,
            y: 243,
            width: 120,
            height: 30,
            content: '200g',
            fontSize: 16,
            fontWeight: 'bold',
            color: '#ffffff',
          },
          // Fat badge background
          {
            id: 'fat-badge-bg',
            type: 'shape',
            x: 591,
            y: 160,
            width: 159,
            height: 106,
            backgroundColor: '#a855f7', // purple
            borderWidth: 0,
          },
          // Fat badge label
          {
            id: 'fat-badge-label',
            type: 'text',
            x: 614,
            y: 198,
            width: 120,
            height: 20,
            content: 'Day Fat',
            fontSize: 8,
            color: '#ffffff',
          },
          // Fat badge value
          {
            id: 'fat-badge-value',
            type: 'text',
            x: 614,
            y: 243,
            width: 120,
            height: 30,
            content: '65g',
            fontSize: 16,
            fontWeight: 'bold',
            color: '#ffffff',
          },
          // Day table title
          {
            id: 'day-title',
            type: 'text',
            x: 76,
            y: 314,
            width: 300,
            height: 30,
            content: 'Monday',
            fontSize: 15,
            fontWeight: 'bold',
            color: '#1f2937',
          },
          // Table header background
          {
            id: 'table-header-bg',
            type: 'shape',
            x: 76,
            y: 337,
            width: 680,
            height: 30,
            backgroundColor: '#f3f4f6',
            borderWidth: 0,
          },
          // Table header - Meal
          {
            id: 'table-header-meal',
            type: 'text',
            x: 87,
            y: 354,
            width: 150,
            height: 20,
            content: 'Meal',
            fontSize: 10,
            fontWeight: 'bold',
            color: '#374151',
          },
          // Table header - Description
          {
            id: 'table-header-desc',
            type: 'text',
            x: 227,
            y: 354,
            width: 300,
            height: 20,
            content: 'Description',
            fontSize: 10,
            fontWeight: 'bold',
            color: '#374151',
          },
          // Table header - Calories
          {
            id: 'table-header-cal',
            type: 'text',
            x: 640,
            y: 354,
            width: 100,
            height: 20,
            content: 'Calories',
            fontSize: 10,
            fontWeight: 'bold',
            color: '#374151',
          },
          // Sample meal row 1
          {
            id: 'meal-1-name',
            type: 'text',
            x: 87,
            y: 386,
            width: 150,
            height: 25,
            content: 'Breakfast',
            fontSize: 10,
            color: '#212121',
          },
          {
            id: 'meal-1-desc',
            type: 'text',
            x: 227,
            y: 386,
            width: 380,
            height: 25,
            content: 'Oatmeal with berries and honey',
            fontSize: 10,
            color: '#212121',
          },
          {
            id: 'meal-1-cal',
            type: 'text',
            x: 640,
            y: 386,
            width: 100,
            height: 25,
            content: '350',
            fontSize: 10,
            color: '#212121',
          },
          // Divider line
          {
            id: 'divider-1',
            type: 'line',
            x: 76,
            y: 405,
            width: 680,
            height: 2,
            borderColor: '#f0f0f0',
            borderWidth: 1,
          },
        ]);
      } else {
        // Default elements for other templates
        setElements([
          {
            id: '1',
            type: 'text',
            x: 50,
            y: 50,
            width: 300,
            height: 50,
            content: 'Template Title',
            fontSize: 24,
            fontWeight: 'bold',
            color: '#000',
          },
          {
            id: '2',
            type: 'text',
            x: 50,
            y: 120,
            width: 400,
            height: 30,
            content: 'Subtitle or description here...',
            fontSize: 14,
            color: '#666',
          },
        ]);
      }
    }
  }, [templateId]);

  const handleAddElement = (type: TemplateElement['type']) => {
    const newElement: TemplateElement = {
      id: Date.now().toString(),
      type,
      x: 100,
      y: 200,
      width: type === 'line' ? 200 : type === 'text' ? 200 : 100,
      height: type === 'line' ? 2 : type === 'text' ? 40 : 100,
      content: type === 'text' ? 'New Text' : type === 'shape' ? 'square' : undefined,
      fontSize: 16,
      color: '#000',
      backgroundColor: '#e5e7eb',
      borderColor: '#000',
      borderWidth: 1,
    };
    setElements([...elements, newElement]);
    setSelectedElement(newElement.id);
  };

  const handleUpdateElement = (id: string, updates: Partial<TemplateElement>) => {
    console.log('Updating element:', id, updates);
    setElements(prevElements => {
      const updatedElements = prevElements.map(el => {
        if (el.id === id) {
          const updated = { ...el, ...updates };
          console.log('Element updated:', updated);
          return updated;
        }
        return el;
      });
      
      // Ensure element still exists
      const elementExists = updatedElements.find(el => el.id === id);
      if (!elementExists) {
        console.error('Element disappeared!', { id, updates, prevElements });
        return prevElements; // Return original if element disappeared
      }
      
      return updatedElements;
    });
  };

  const handleDeleteElement = (id: string) => {
    setElements(elements.filter(el => el.id !== id));
    if (selectedElement === id) {
      setSelectedElement(null);
    }
  };

  const handleSave = () => {
    console.log('Saving template:', { name: templateName, elements });
    alert('Template saved successfully!');
  };

  const fetchNutritionPlans = async () => {
    try {
      const response = await fetch('/api/nutrition-plans');
      if (response.ok) {
        const plans = await response.json();
        setNutritionPlans(plans);
      }
    } catch (error) {
      console.error('Error fetching nutrition plans:', error);
    }
  };

  const handlePreview = () => {
    setShowPreviewModal(true);
    fetchNutritionPlans();
  };

  const generatePreviewData = async (plan: any) => {
    try {
      console.log('🔍 Generating preview for plan:', plan.id);
      
      // Fetch detailed plan data
      const response = await fetch(`/api/nutrition-plans/${plan.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch plan data');
      }
      
        const planData = await response.json();
      console.log('📊 Plan data loaded:', planData);

      // Get customer info if plan is assigned
      let customerName = '';
      let customerGoal = '';
      if (planData.assignedCustomers && planData.assignedCustomers.length > 0) {
        const firstCustomer = planData.assignedCustomers[0];
        customerName = firstCustomer.customer?.name || '';
        customerGoal = planData.goal || '';
      }

      // Calculate daily totals for Monday (first day)
        let dayTotals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
      let mondayData = null;
      
      if (planData.weekMenu?.days?.monday) {
        mondayData = planData.weekMenu.days.monday;
        console.log('📅 Monday data:', mondayData);
        
        // Use V2 calculator for accurate totals
        dayTotals = await calculateDailyTotalsV2(mondayData);
        console.log('✅ Calculated totals:', dayTotals);
      }

      // Parse Monday meals to display in table
      const meals = [
        { name: 'Breakfast', content: mondayData?.breakfast || '' },
        { name: 'Morning Snack', content: mondayData?.['morning-snack'] || '' },
        { name: 'Lunch', content: mondayData?.lunch || '' },
        { name: 'Afternoon Snack', content: mondayData?.['afternoon-snack'] || '' },
        { name: 'Dinner', content: mondayData?.dinner || '' },
        { name: 'Evening Snack', content: mondayData?.['evening-snack'] || '' },
      ].filter(meal => meal.content.trim() !== ''); // Only show non-empty meals

      // Calculate individual meal calories (simplified - could be more accurate)
      const mealCalories = Math.round(dayTotals.calories / meals.length);

      // Clean meal descriptions (remove IDs)
      const cleanMealDescription = (desc: string) => {
        return desc.replace(/[a-z0-9]{26}\|/g, '').trim();
      };

      // Build subtitle
      let subtitle = 'Personalized nutrition plan for ';
      if (customerName) {
        subtitle += `${customerName} based on calculation. `;
      }
      if (customerGoal) {
        subtitle += `Goal: ${customerGoal}`;
      }
      
      // Get macro percentages
      const totalMacros = dayTotals.protein + dayTotals.carbs + dayTotals.fat;
      const proteinPercent = totalMacros > 0 ? Math.round((dayTotals.protein * 100) / totalMacros) : 0;
      const carbsPercent = totalMacros > 0 ? Math.round((dayTotals.carbs * 100) / totalMacros) : 0;
      const fatPercent = totalMacros > 0 ? Math.round((dayTotals.fat * 100) / totalMacros) : 0;
      
      if (totalMacros > 0) {
        subtitle += ` (${carbsPercent}% carbs, ${proteinPercent}% protein, ${fatPercent}% fat).`;
      }

      // Generate preview elements with real data
      const previewElements = [...elements];
      
      // Update header elements
      const headerTitleIdx = previewElements.findIndex(el => el.id === 'header-title');
      if (headerTitleIdx >= 0) {
        previewElements[headerTitleIdx] = { 
          ...previewElements[headerTitleIdx], 
          content: `${customerName || 'Customer'} - ${planData.goal || 'Nutrition Plan'}` 
        };
      }

      const headerSubtitleIdx = previewElements.findIndex(el => el.id === 'header-subtitle');
      if (headerSubtitleIdx >= 0) {
        previewElements[headerSubtitleIdx] = { 
          ...previewElements[headerSubtitleIdx], 
          content: subtitle
        };
      }

      // Update badge values
      const calBadgeIdx = previewElements.findIndex(el => el.id === 'cal-badge-value');
      if (calBadgeIdx >= 0) {
        previewElements[calBadgeIdx] = { ...previewElements[calBadgeIdx], content: dayTotals.calories.toString() };
      }

      const proteinBadgeIdx = previewElements.findIndex(el => el.id === 'protein-badge-value');
      if (proteinBadgeIdx >= 0) {
        previewElements[proteinBadgeIdx] = { ...previewElements[proteinBadgeIdx], content: `${dayTotals.protein}g` };
      }

      const carbsBadgeIdx = previewElements.findIndex(el => el.id === 'carbs-badge-value');
      if (carbsBadgeIdx >= 0) {
        previewElements[carbsBadgeIdx] = { ...previewElements[carbsBadgeIdx], content: `${dayTotals.carbs}g` };
      }

      const fatBadgeIdx = previewElements.findIndex(el => el.id === 'fat-badge-value');
      if (fatBadgeIdx >= 0) {
        previewElements[fatBadgeIdx] = { ...previewElements[fatBadgeIdx], content: `${dayTotals.fat}g` };
      }

      // Update logo to show actual logo instead of placeholder
      const logoIdx = previewElements.findIndex(el => el.id === 'logo');
      if (logoIdx >= 0) {
        previewElements[logoIdx] = { 
          ...previewElements[logoIdx], 
          content: '/logo-mihaela.svg' // Set logo path
        };
      }

      // Remove existing meal elements
      const filteredElements = previewElements.filter(el => 
        !el.id.startsWith('meal-') && !el.id.startsWith('divider-')
      );

      // Add real meal elements dynamically
      let currentY = 386; // Starting Y position for meals
      const rowHeight = 30;
      
      meals.forEach((meal, index) => {
        // Meal name
        filteredElements.push({
          id: `meal-${index}-name`,
          type: 'text',
          x: 87,
          y: currentY,
          width: 150,
          height: 25,
          content: meal.name,
          fontSize: 10,
          color: '#212121',
        });

        // Meal description (cleaned)
        filteredElements.push({
          id: `meal-${index}-desc`,
          type: 'text',
          x: 227,
          y: currentY,
          width: 380,
          height: 25,
          content: cleanMealDescription(meal.content),
          fontSize: 10,
          color: '#212121',
        });

        // Meal calories (estimated)
        filteredElements.push({
          id: `meal-${index}-cal`,
          type: 'text',
          x: 640,
          y: currentY,
          width: 100,
          height: 25,
          content: mealCalories.toString(),
          fontSize: 10,
          color: '#212121',
        });

        currentY += rowHeight;

        // Add divider
        if (index < meals.length - 1) {
          filteredElements.push({
            id: `divider-${index}`,
            type: 'line',
            x: 76,
            y: currentY - 5,
            width: 680,
            height: 2,
            borderColor: '#f0f0f0',
            borderWidth: 1,
          });
        }
      });

      setPreviewData({ elements: filteredElements, planData, customerName, meals });
      setSelectedPlan(plan);
      console.log('✅ Preview generated successfully');
    } catch (error) {
      console.error('❌ Error generating preview data:', error);
      alert('Failed to generate preview. Please try again.');
    }
  };

  const selectedEl = elements.find(el => el.id === selectedElement);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gray-50">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="max-w-full flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </button>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-xl font-bold text-gray-900">{templateName}</h1>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={handlePreview}
                className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Eye className="w-4 h-4" />
                Preview
              </button>
              <button className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                <Download className="w-4 h-4" />
                Export PDF
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 bg-rose-500 text-white px-4 py-2 rounded-lg hover:bg-rose-600 transition-colors"
              >
                <Save className="w-4 h-4" />
                Save Template
              </button>
            </div>
          </div>
        </div>

        <div className="flex h-[calc(100vh-73px)]">
          {/* Left Sidebar - Tools */}
          <div className="w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Elements</h2>
            
            <div className="space-y-2">
              <button
                onClick={() => handleAddElement('text')}
                className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left"
              >
                <Type className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-700">Text</span>
              </button>

              <button
                onClick={() => handleAddElement('image')}
                className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left"
              >
                <ImageIcon className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-700">Image</span>
              </button>

              <button
                onClick={() => handleAddElement('shape')}
                className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left"
              >
                <Square className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-700">Shape</span>
              </button>

              <button
                onClick={() => handleAddElement('line')}
                className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left"
              >
                <Minus className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-700">Line</span>
              </button>
            </div>

            {selectedEl && (
              <>
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-bold text-gray-900 mb-3">Properties</h3>
                  
                  {selectedEl.type === 'text' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Font Size
                        </label>
                        <input
                          type="number"
                          value={selectedEl.fontSize || 16}
                          onChange={(e) => handleUpdateElement(selectedEl.id, { fontSize: parseInt(e.target.value) })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Color
                        </label>
                        <input
                          type="color"
                          value={selectedEl.color || '#000000'}
                          onChange={(e) => handleUpdateElement(selectedEl.id, { color: e.target.value })}
                          className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Font Weight
                        </label>
                        <select
                          value={selectedEl.fontWeight || 'normal'}
                          onChange={(e) => handleUpdateElement(selectedEl.id, { fontWeight: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        >
                          <option value="normal">Normal</option>
                          <option value="bold">Bold</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {(selectedEl.type === 'shape' || selectedEl.type === 'line') && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Background Color
                        </label>
                        <input
                          type="color"
                          value={selectedEl.backgroundColor || '#e5e7eb'}
                          onChange={(e) => handleUpdateElement(selectedEl.id, { backgroundColor: e.target.value })}
                          className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Border Color
                        </label>
                        <input
                          type="color"
                          value={selectedEl.borderColor || '#000000'}
                          onChange={(e) => handleUpdateElement(selectedEl.id, { borderColor: e.target.value })}
                          className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Border Width
                        </label>
                        <input
                          type="number"
                          value={selectedEl.borderWidth || 1}
                          onChange={(e) => handleUpdateElement(selectedEl.id, { borderWidth: parseInt(e.target.value) })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>
                    </div>
                  )}

                  <div className="mt-4 space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Width
                      </label>
                      <input
                        type="number"
                        value={selectedEl.width}
                        onChange={(e) => handleUpdateElement(selectedEl.id, { width: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Height
                      </label>
                      <input
                        type="number"
                        value={selectedEl.height}
                        onChange={(e) => handleUpdateElement(selectedEl.id, { height: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Center - Canvas */}
          <div className="flex-1 p-8 overflow-auto bg-gray-100">
            {/* Zoom Controls */}
            <div className="flex justify-center mb-4">
              <div className="bg-white rounded-lg shadow-md px-4 py-2 flex items-center gap-3">
                <button
                  onClick={() => setZoom(Math.max(0.25, zoom - 0.1))}
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-700 font-medium transition-colors"
                >
                  −
                </button>
                <div className="flex items-center gap-2 min-w-[120px]">
                  <input
                    type="range"
                    min="0.25"
                    max="1.5"
                    step="0.05"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <span className="text-sm font-medium text-gray-700 min-w-[45px]">
                    {Math.round(zoom * 100)}%
                  </span>
                </div>
                <button
                  onClick={() => setZoom(Math.min(1.5, zoom + 0.1))}
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-700 font-medium transition-colors"
                >
                  +
                </button>
                <div className="h-4 w-px bg-gray-300 mx-1" />
                <button
                  onClick={() => setZoom(0.7)}
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-700 text-sm font-medium transition-colors"
                >
                  Reset
                </button>
              </div>
            </div>
            
            <div className="flex justify-center">
              <div className="relative">
                <Canvas
                  elements={elements}
                  onDrop={(x, y) => console.log('Drop at', x, y)}
                  onUpdate={handleUpdateElement}
                  onDelete={handleDeleteElement}
                  selectedElement={selectedElement}
                  onSelectElement={setSelectedElement}
                  zoom={zoom}
                />
              </div>
            </div>
          </div>

          {/* Right Sidebar - Layers */}
          <div className="w-64 bg-white border-l border-gray-200 p-4 overflow-y-auto">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Layers</h2>
            
            <div className="space-y-2">
              {elements.map((element, index) => (
                <div
                  key={element.id}
                  onClick={() => setSelectedElement(element.id)}
                  className={`px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                    selectedElement === element.id
                      ? 'bg-rose-100 border border-rose-300'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {element.type === 'text' && <Type className="w-4 h-4 text-gray-600" />}
                      {element.type === 'image' && <ImageIcon className="w-4 h-4 text-gray-600" />}
                      {element.type === 'shape' && <Square className="w-4 h-4 text-gray-600" />}
                      {element.type === 'line' && <Minus className="w-4 h-4 text-gray-600" />}
                      <span className="text-sm font-medium text-gray-700">
                        {element.type === 'text' ? element.content : `${element.type} ${index + 1}`}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteElement(element.id);
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Preview Modal */}
        {showPreviewModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Preview Template</h2>
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6">
                {!selectedPlan ? (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Select a Nutrition Plan</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                      {nutritionPlans.map((plan) => (
                        <div
                          key={plan.id}
                          onClick={() => generatePreviewData(plan)}
                          className="p-4 border border-gray-200 rounded-lg hover:border-rose-300 hover:bg-rose-50 cursor-pointer transition-colors"
                        >
                          <h4 className="font-semibold text-gray-900">{plan.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">{plan.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {plan.days ? Object.keys(plan.days).length : 0} days
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(plan.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Preview: {selectedPlan.name}</h3>
                        <p className="text-sm text-gray-600">{selectedPlan.description}</p>
                      </div>
                      <button
                        onClick={() => setSelectedPlan(null)}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Plans
                      </button>
                    </div>
                    
                    {/* Preview Zoom Controls */}
                    <div className="flex justify-center mb-4">
                      <div className="bg-white rounded-lg shadow-md px-4 py-2 flex items-center gap-3">
                        <button
                          onClick={() => setPreviewZoom(Math.max(0.25, previewZoom - 0.1))}
                          className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-700 font-medium transition-colors"
                        >
                          −
                        </button>
                        <div className="flex items-center gap-2 min-w-[120px]">
                          <input
                            type="range"
                            min="0.25"
                            max="1.5"
                            step="0.05"
                            value={previewZoom}
                            onChange={(e) => setPreviewZoom(parseFloat(e.target.value))}
                            className="w-full"
                          />
                          <span className="text-sm font-medium text-gray-700 min-w-[45px]">
                            {Math.round(previewZoom * 100)}%
                          </span>
                        </div>
                        <button
                          onClick={() => setPreviewZoom(Math.min(1.5, previewZoom + 0.1))}
                          className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-700 font-medium transition-colors"
                        >
                          +
                        </button>
                        <div className="h-4 w-px bg-gray-300 mx-1" />
                        <button
                          onClick={() => setPreviewZoom(0.5)}
                          className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-700 text-sm font-medium transition-colors"
                        >
                          Reset
                        </button>
                      </div>
                    </div>
                    
                    {/* Preview Canvas */}
                    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 overflow-auto max-h-[60vh]">
                      <div className="flex justify-center">
                        <div className="relative">
                          <div
                            className="relative bg-white rounded-lg shadow-inner"
                            style={{
                              width: '210mm',
                              height: '297mm',
                              transform: `scale(${previewZoom})`,
                              transformOrigin: 'top left',
                              border: '1px solid #e5e7eb',
                            }}
                          >
                            {previewData?.elements.map((element: TemplateElement) => (
                              <div
                                key={element.id}
                                style={{
                                  position: 'absolute',
                                  left: element.x,
                                  top: element.y,
                                  width: element.width,
                                  height: element.height,
                                  fontSize: `${element.fontSize || 16}px`,
                                  fontWeight: element.fontWeight || 'normal',
                                  color: element.color || '#000',
                                  backgroundColor: element.backgroundColor,
                                  borderColor: element.borderColor,
                                  borderWidth: element.borderWidth || 0,
                                  borderStyle: 'solid',
                                  borderRadius: element.content === 'circle' ? '50%' : '0',
                                  display: 'flex',
                                  alignItems: 'center',
                                  padding: '4px',
                                  overflow: 'hidden',
                                }}
                              >
                                {element.type === 'image' ? (
                                  element.content && element.content.startsWith('/') ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img 
                                      src={element.content} 
                                      alt="Logo"
                                      style={{ 
                                        width: '100%', 
                                        height: '100%', 
                                        objectFit: 'contain' 
                                      }}
                                    />
                                  ) : (
                                  <div className="w-full h-full bg-gray-200 flex items-center justify-center border-2 border-dashed border-gray-300">
                                    <ImageIcon className="w-8 h-8 text-gray-400" />
                                  </div>
                                  )
                                ) : element.type === 'line' ? (
                                  <div
                                    style={{
                                      width: '100%',
                                      height: element.borderWidth || 2,
                                      backgroundColor: element.borderColor || '#000',
                                    }}
                                  />
                                ) : (
                                  element.content || 'Text'
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-4">
                      <button
                        onClick={() => setShowPreviewModal(false)}
                        className="flex items-center gap-2 bg-rose-500 text-white px-4 py-2 rounded-lg hover:bg-rose-600 transition-colors"
                      >
                        <Check className="w-4 h-4" />
                        Close Preview
                      </button>
                      <button className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                        <Download className="w-4 h-4" />
                        Export PDF
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DndProvider>
  );
}

