'use client';

interface BarChartProps {
  data: Array<{ label: string; value: number }>;
  maxValue?: number;
  color?: string;
  height?: number;
  showLabels?: boolean;
}

export default function BarChart({
  data,
  maxValue,
  color = 'rose',
  height = 100,
  showLabels = true
}: BarChartProps) {
  const max = maxValue || Math.max(...data.map(d => d.value), 1);
  
  const colorClasses = {
    rose: {
      bg: 'bg-rose-500',
      hover: 'hover:bg-rose-600'
    },
    blue: {
      bg: 'bg-blue-500',
      hover: 'hover:bg-blue-600'
    },
    green: {
      bg: 'bg-green-500',
      hover: 'hover:bg-green-600'
    },
    cyan: {
      bg: 'bg-cyan-500',
      hover: 'hover:bg-cyan-600'
    }
  };

  const colors = colorClasses[color as keyof typeof colorClasses] || colorClasses.rose;

  return (
    <div className="w-full">
      <div className="flex items-end justify-between gap-1 sm:gap-2" style={{ height: `${height}px` }}>
        {data.map((item, index) => {
          const barHeight = (item.value / max) * 100;
          return (
            <div key={index} className="flex-1 flex flex-col items-center justify-end">
              <div
                className={`w-full ${colors.bg} ${colors.hover} rounded-t transition-all duration-300 relative group`}
                style={{ height: `${barHeight}%`, minHeight: item.value > 0 ? '4px' : '0' }}
                title={`${item.label}: ${item.value}`}
              >
                {item.value > 0 && (
                  <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {item.value}
                  </span>
                )}
              </div>
              {showLabels && (
                <span className="text-xs text-gray-500 mt-1 truncate w-full text-center">
                  {item.label}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

