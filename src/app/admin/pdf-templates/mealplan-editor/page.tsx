'use client';

import { useState, useRef, useCallback } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Link from 'next/link';

// Types for template blocks
interface TemplateBlock {
  id: string;
  type: 'header' | 'client-info' | 'meal-table' | 'totals' | 'image' | 'footer';
  x: number;
  y: number;
  width: number;
  height: number;
  content: any;
  style: any;
}

// Draggable Block Component
const DraggableBlock = ({ block, onUpdate, onDelete }: { 
  block: TemplateBlock; 
  onUpdate: (block: TemplateBlock) => void;
  onDelete: (id: string) => void;
}) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'block',
    item: { id: block.id, x: block.x, y: block.y },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOver }, drop] = useDrop({
    accept: 'block',
    drop: (item: any) => {
      if (item.id !== block.id) {
        // Handle block reordering if needed
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  const renderBlockContent = () => {
    switch (block.type) {
      case 'header':
        return (
          <div className="bg-gradient-to-r from-pink-500 to-pink-600 text-white p-4 rounded-lg">
            <h1 className="text-2xl font-bold">MIHAELA</h1>
            <p className="text-pink-100">Nutrition Plan</p>
          </div>
        );
      case 'client-info':
        return (
          <div className="bg-white border border-gray-200 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Client Information</h3>
            <div className="text-sm text-gray-600">
              <p>Name: [CLIENT_NAME]</p>
              <p>Plan: [PLAN_TYPE]</p>
              <p>Date: [DATE]</p>
            </div>
          </div>
        );
      case 'meal-table':
        return (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">[MEAL_TYPE] Ingredients</h3>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-6 gap-2 text-xs font-medium text-gray-600 mb-2">
                <div>Ingredient</div>
                <div>Portion</div>
                <div>Cal</div>
                <div>P</div>
                <div>C</div>
                <div>F</div>
              </div>
              <div className="space-y-1">
                <div className="grid grid-cols-6 gap-2 text-sm">
                  <div>[INGREDIENT]</div>
                  <div>[PORTION]</div>
                  <div>[CALORIES]</div>
                  <div>[PROTEIN]</div>
                  <div>[CARBS]</div>
                  <div>[FAT]</div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'totals':
        return (
          <div className="bg-pink-100 border border-pink-200 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Daily Totals</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Calories: <span className="font-bold">[TOTAL_CALORIES]</span></div>
              <div>Protein: <span className="font-bold">[TOTAL_PROTEIN]g</span></div>
              <div>Carbs: <span className="font-bold">[TOTAL_CARBS]g</span></div>
              <div>Fat: <span className="font-bold">[TOTAL_FAT]g</span></div>
            </div>
          </div>
        );
      case 'image':
        return (
          <div className="bg-gray-100 border border-gray-200 p-4 rounded-lg text-center">
            <div className="text-gray-400 mb-2">
              <svg className="mx-auto h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-sm text-gray-600">[IMAGE_PLACEHOLDER]</p>
          </div>
        );
      case 'footer':
        return (
          <div className="bg-gray-800 text-white p-4 rounded-lg text-center">
            <p className="font-semibold">MIHAELA</p>
            <p className="text-sm text-gray-300">Professional Nutrition Plans</p>
          </div>
        );
      default:
        return <div>Unknown block type</div>;
    }
  };

  return (
    <div
      ref={(node) => drag(drop(node))}
      className={`absolute cursor-move transition-all duration-200 ${
        isDragging ? 'opacity-50' : 'opacity-100'
      } ${isOver ? 'ring-2 ring-pink-500' : ''}`}
      style={{
        left: block.x,
        top: block.y,
        width: block.width,
        height: block.height,
      }}
    >
      <div className="relative group">
        {renderBlockContent()}
        
        {/* Block Controls */}
        <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex space-x-1">
            <button
              onClick={() => onUpdate({ ...block, width: block.width + 50 })}
              className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-blue-600"
              title="Resize"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </button>
            <button
              onClick={() => onDelete(block.id)}
              className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
              title="Delete"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Block Palette Component
const BlockPalette = ({ onAddBlock }: { onAddBlock: (type: TemplateBlock['type']) => void }) => {
  const blockTypes = [
    { type: 'header' as const, label: 'Header', icon: '📋' },
    { type: 'client-info' as const, label: 'Client Info', icon: '👤' },
    { type: 'meal-table' as const, label: 'Meal Table', icon: '🍽️' },
    { type: 'totals' as const, label: 'Daily Totals', icon: '📊' },
    { type: 'image' as const, label: 'Image', icon: '🖼️' },
    { type: 'footer' as const, label: 'Footer', icon: '📄' },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h3 className="font-semibold text-gray-900 mb-4">Block Palette</h3>
      <div className="grid grid-cols-2 gap-2">
        {blockTypes.map((block) => (
          <button
            key={block.type}
            onClick={() => onAddBlock(block.type)}
            className="p-3 border border-gray-200 rounded-lg hover:border-pink-300 hover:bg-pink-50 transition-colors text-left"
          >
            <div className="text-lg mb-1">{block.icon}</div>
            <div className="text-sm font-medium text-gray-900">{block.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

// Main Editor Component
export default function MealPlanTemplateEditor() {
  const [blocks, setBlocks] = useState<TemplateBlock[]>([
    {
      id: '1',
      type: 'header',
      x: 50,
      y: 50,
      width: 400,
      height: 80,
      content: {},
      style: {},
    },
    {
      id: '2',
      type: 'client-info',
      x: 50,
      y: 150,
      width: 300,
      height: 120,
      content: {},
      style: {},
    },
  ]);
  const canvasRef = useRef<HTMLDivElement>(null);

  const addBlock = useCallback((type: TemplateBlock['type']) => {
    const newBlock: TemplateBlock = {
      id: Date.now().toString(),
      type,
      x: 100 + Math.random() * 200,
      y: 100 + Math.random() * 200,
      width: type === 'meal-table' ? 500 : 300,
      height: type === 'header' ? 80 : type === 'meal-table' ? 200 : 120,
      content: {},
      style: {},
    };
    setBlocks(prev => [...prev, newBlock]);
  }, []);

  const updateBlock = useCallback((updatedBlock: TemplateBlock) => {
    setBlocks(prev => prev.map(block => 
      block.id === updatedBlock.id ? updatedBlock : block
    ));
  }, []);

  const deleteBlock = useCallback((blockId: string) => {
    setBlocks(prev => prev.filter(block => block.id !== blockId));
  }, []);

  const handleCanvasDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // This would be triggered when dropping from palette
    // For now, we'll add a default block
    console.log('Dropped at:', x, y);
  }, []);

  const saveTemplate = useCallback(() => {
    const template = {
      name: 'Meal Plan Template',
      blocks,
      createdAt: new Date().toISOString(),
    };
    
    // Save to localStorage for now
    localStorage.setItem('mealplan-template', JSON.stringify(template));
    
    alert('Template saved successfully!');
  }, [blocks]);

  const previewPDF = useCallback(() => {
    alert('PDF preview functionality will be implemented!');
  }, []);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                href="/admin/pdf-templates"
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">Meal Plan Template Editor</h1>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={previewPDF}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                Preview PDF
              </button>
              <button
                onClick={saveTemplate}
                className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 transition-colors"
              >
                Save Template
              </button>
            </div>
          </div>
        </div>

        <div className="flex h-screen">
          {/* Sidebar */}
          <div className="w-80 bg-white border-r border-gray-200 p-4 overflow-y-auto">
            <BlockPalette onAddBlock={addBlock} />
            
            {/* Properties Panel */}
            <div className="mt-6 bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Properties</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Canvas Width
                  </label>
                  <input
                    type="number"
                    defaultValue={800}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Canvas Height
                  </label>
                  <input
                    type="number"
                    defaultValue={1000}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Canvas */}
          <div className="flex-1 p-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full">
              <div
                ref={canvasRef}
                className="relative w-full h-full bg-gray-50 overflow-auto"
                onDrop={handleCanvasDrop}
                onDragOver={(e) => e.preventDefault()}
                style={{ minHeight: '800px', minWidth: '600px' }}
              >
                {/* Grid Background */}
                <div 
                  className="absolute inset-0 opacity-30"
                  style={{
                    backgroundImage: `
                      linear-gradient(to right, #e5e7eb 1px, transparent 1px),
                      linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
                    `,
                    backgroundSize: '20px 20px'
                  }}
                />

                {/* Template Blocks */}
                {blocks.map((block) => (
                  <DraggableBlock
                    key={block.id}
                    block={block}
                    onUpdate={updateBlock}
                    onDelete={deleteBlock}
                  />
                ))}

                {/* Drop Zone Indicator */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-4 left-4 text-sm text-gray-400">
                    Drop blocks here to build your template
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DndProvider>
  );
}
