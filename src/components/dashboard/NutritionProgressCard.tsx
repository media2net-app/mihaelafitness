'use client';

import CircularProgressChart from './CircularProgressChart';

interface NutritionProgressCardProps {
  calories: { current: number; target: number };
  macros: {
    carbs: { current: number; target: number };
    protein: { current: number; target: number };
    fats: { current: number; target: number };
  };
  date?: Date;
}

export default function NutritionProgressCard({
  calories,
  macros,
  date = new Date()
}: NutritionProgressCardProps) {
  const dayName = date.toLocaleDateString('nl-NL', { weekday: 'long' });
  const dayNumber = date.getDate();

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 sm:p-6">
      <div className="mb-4">
        <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-1">
          Voedingsplan - {dayName} {dayNumber}
        </h3>
        <p className="text-xs text-gray-500">Dagelijkse doelen</p>
      </div>

      {/* Calories - Large Circular Chart */}
      <div className="mb-6 flex justify-center">
        <CircularProgressChart
          value={calories.current}
          maxValue={calories.target}
          label="Calorieën"
          unit="kcal"
          color="rose"
          size="lg"
        />
      </div>

      {/* Macros - Three Small Circular Charts */}
      <div className="grid grid-cols-3 gap-4">
        <CircularProgressChart
          value={macros.carbs.current}
          maxValue={macros.carbs.target}
          label="Koolhydraten"
          unit="g"
          color="blue"
          size="sm"
        />
        <CircularProgressChart
          value={macros.protein.current}
          maxValue={macros.protein.target}
          label="Eiwitten"
          unit="g"
          color="green"
          size="sm"
        />
        <CircularProgressChart
          value={macros.fats.current}
          maxValue={macros.fats.target}
          label="Vetten"
          unit="g"
          color="purple"
          size="sm"
        />
      </div>

      {/* Macro Details */}
      <div className="mt-6 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Koolhydraten</span>
          <span className="font-semibold text-gray-800">
            {macros.carbs.current} / {macros.carbs.target}g
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all"
            style={{ width: `${Math.min(100, (macros.carbs.current / macros.carbs.target) * 100)}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Eiwitten</span>
          <span className="font-semibold text-gray-800">
            {macros.protein.current} / {macros.protein.target}g
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-green-500 h-2 rounded-full transition-all"
            style={{ width: `${Math.min(100, (macros.protein.current / macros.protein.target) * 100)}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Vetten</span>
          <span className="font-semibold text-gray-800">
            {macros.fats.current} / {macros.fats.target}g
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-purple-500 h-2 rounded-full transition-all"
            style={{ width: `${Math.min(100, (macros.fats.current / macros.fats.target) * 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}

