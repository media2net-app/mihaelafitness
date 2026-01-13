'use client';

import { useState, useEffect } from 'react';
import { ChefHat, Save, X, Plus } from 'lucide-react';

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
      console.log('🍳 [CookingInstructions] Saving instructions:', {
        planId,
        dayKey,
        mealType,
        instructions: instructions.trim()
      });

      const response = await fetch(`/api/nutrition-plans/${planId}/set-cooking-instructions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dayKey,
          mealType,
          cookingInstructions: instructions.trim()
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('🍳 [CookingInstructions] Save successful:', result);
        setIsEditing(false);
        if (onInstructionsUpdated) {
          onInstructionsUpdated(instructions.trim());
        }
      } else {
        const errorData = await response.json();
        console.error('🍳 [CookingInstructions] Save failed:', errorData);
        alert('Failed to save cooking instructions. Please try again.');
      }
    } catch (error) {
      console.error('🍳 [CookingInstructions] Error saving:', error);
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
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="text-xs text-blue-800 font-medium mb-1">💡 Tips voor goede kookinstructies:</div>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• Vermeld kooktijd en temperatuur</li>
                <li>• Beschrijf de bereidingswijze stap voor stap</li>
                <li>• Voeg specifieke details toe (bijv. "middelhoog vuur", "goudbruin")</li>
              </ul>
            </div>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Voeg kook instructies toe... (bijv. Bak de pannenkoeken 2-3 minuten per kant op middelhoog vuur tot ze goudbruin zijn)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              rows={4}
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
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                    Opslaan...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Opslaan
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="min-h-[60px]">
            {instructions ? (
              <div className="space-y-2">
                <div className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg border">
                  {instructions}
                </div>
                <div className="text-xs text-gray-500 flex items-center gap-1">
                  <ChefHat className="w-3 h-3" />
                  Kookinstructies opgeslagen
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <ChefHat className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <div className="text-sm text-gray-400 mb-2">Geen kook instructies toegevoegd</div>
                <div className="text-xs text-gray-500">Klik op "Toevoegen" om instructies toe te voegen</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


