'use client';

import { useState, useEffect } from 'react';
import { ChefHat, Save, X } from 'lucide-react';

interface CookingInstructionsProps {
  mealType: string;
  dayKey: string;
  planId: string;
  initialInstructions: string;
  onInstructionsUpdated?: (instructions: string) => void;
}

export default function CookingInstructions({
  mealType,
  dayKey,
  planId,
  initialInstructions,
  onInstructionsUpdated
}: CookingInstructionsProps) {
  const [instructions, setInstructions] = useState(initialInstructions || '');
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setInstructions(initialInstructions || '');
  }, [initialInstructions]);

  const handleSave = async () => {
    if (saving) return;
    
    setSaving(true);
    try {
      const response = await fetch(`/api/nutrition-plans/${planId}/set-cooking-instructions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dayKey,
          mealType,
          cookingInstructions: instructions
        }),
      });

      if (response.ok) {
        setIsEditing(false);
        if (onInstructionsUpdated) {
          onInstructionsUpdated(instructions);
        }
      } else {
        console.error('Failed to save cooking instructions');
        alert('Failed to save cooking instructions. Please try again.');
      }
    } catch (error) {
      console.error('Error saving cooking instructions:', error);
      alert('Error saving cooking instructions. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setInstructions(initialInstructions || '');
    setIsEditing(false);
  };

  const getMealDisplayName = (mealType: string) => {
    switch (mealType) {
      case 'morning-snack': return 'Morning Snack';
      case 'afternoon-snack': return 'Afternoon Snack';
      case 'evening-snack': return 'Evening Snack';
      default: return mealType.charAt(0).toUpperCase() + mealType.slice(1);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden mb-4">
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ChefHat className="w-4 h-4 text-orange-600" />
            <h3 className="text-sm font-medium text-gray-800">
              Kook Instructies - {getMealDisplayName(mealType)}
            </h3>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="text-xs text-orange-600 hover:text-orange-700 font-medium"
            >
              {instructions ? 'Bewerken' : 'Toevoegen'}
            </button>
          )}
        </div>
      </div>

      <div className="p-4">
        {isEditing ? (
          <div className="space-y-3">
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Voeg kook instructies toe... (bijv. Bak de pannenkoeken 2-3 minuten per kant op middelhoog vuur)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              rows={3}
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={handleCancel}
                disabled={saving}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <X className="w-4 h-4 inline mr-1" />
                Annuleren
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-3 py-1 text-sm bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center gap-1"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Opslaan...' : 'Opslaan'}
              </button>
            </div>
          </div>
        ) : (
          <div className="min-h-[60px]">
            {instructions ? (
              <div className="text-sm text-gray-700 whitespace-pre-wrap">
                {instructions}
              </div>
            ) : (
              <div className="text-sm text-gray-400 italic">
                Geen kook instructies toegevoegd. Klik op "Toevoegen" om instructies toe te voegen.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


