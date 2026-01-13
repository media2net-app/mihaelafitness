'use client';

interface CircularProgressChartProps {
  value: number; // 0-100
  maxValue: number;
  label: string;
  unit?: string;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
}

export default function CircularProgressChart({
  value,
  maxValue,
  label,
  unit = '',
  color = 'rose',
  size = 'md',
  showValue = true
}: CircularProgressChartProps) {
  const percentage = Math.min((value / maxValue) * 100, 100);
  const radius = size === 'sm' ? 40 : size === 'md' ? 50 : 60;
  const strokeWidth = size === 'sm' ? 6 : size === 'md' ? 8 : 10;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  const colorClasses = {
    rose: {
      bg: 'bg-rose-100',
      stroke: 'stroke-rose-500',
      text: 'text-rose-600'
    },
    blue: {
      bg: 'bg-blue-100',
      stroke: 'stroke-blue-500',
      text: 'text-blue-600'
    },
    green: {
      bg: 'bg-green-100',
      stroke: 'stroke-green-500',
      text: 'text-green-600'
    },
    purple: {
      bg: 'bg-purple-100',
      stroke: 'stroke-purple-500',
      text: 'text-purple-600'
    }
  };

  const colors = colorClasses[color as keyof typeof colorClasses] || colorClasses.rose;
  const sizeClasses = {
    sm: 'w-24 h-24',
    md: 'w-32 h-32',
    lg: 'w-40 h-40'
  };

  return (
    <div className="flex flex-col items-center">
      <div className={`relative ${sizeClasses[size]}`}>
        <svg className="transform -rotate-90" width={radius * 2 + strokeWidth} height={radius * 2 + strokeWidth}>
          {/* Background circle */}
          <circle
            cx={radius + strokeWidth / 2}
            cy={radius + strokeWidth / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-gray-200"
          />
          {/* Progress circle */}
          <circle
            cx={radius + strokeWidth / 2}
            cy={radius + strokeWidth / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className={`${colors.stroke} transition-all duration-500`}
          />
        </svg>
        {showValue && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-lg sm:text-xl font-bold ${colors.text}`}>
              {Math.round(value)}
            </span>
            {unit && (
              <span className={`text-xs ${colors.text} opacity-70`}>
                {unit}
              </span>
            )}
          </div>
        )}
      </div>
      <div className="mt-2 text-center">
        <p className={`text-xs sm:text-sm font-medium ${colors.text}`}>
          {label}
        </p>
        <p className="text-xs text-gray-500">
          {Math.round(percentage)}% van {maxValue}{unit}
        </p>
      </div>
    </div>
  );
}

