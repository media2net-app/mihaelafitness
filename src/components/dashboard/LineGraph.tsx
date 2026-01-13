'use client';

interface LineGraphProps {
  data: Array<{ date: string; value: number }>;
  color?: string;
  height?: number;
  showGrid?: boolean;
  showPoints?: boolean;
}

export default function LineGraph({
  data,
  color = 'rose',
  height = 150,
  showGrid = true,
  showPoints = true
}: LineGraphProps) {
  if (data.length === 0) {
    return (
      <div className="w-full flex items-center justify-center" style={{ height: `${height}px` }}>
        <p className="text-sm text-gray-400">Geen data beschikbaar</p>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value), 1);
  const minValue = Math.min(...data.map(d => d.value), 0);
  const range = maxValue - minValue || 1;
  const padding = 20;
  const graphHeight = height - padding * 2;
  const graphWidth = 100; // percentage

  const colorClasses = {
    rose: {
      stroke: 'stroke-rose-500',
      fill: 'fill-rose-500',
      point: 'fill-rose-500',
      grid: 'stroke-rose-200'
    },
    blue: {
      stroke: 'stroke-blue-500',
      fill: 'fill-blue-500',
      point: 'fill-blue-500',
      grid: 'stroke-blue-200'
    },
    green: {
      stroke: 'stroke-green-500',
      fill: 'fill-green-500',
      point: 'fill-green-500',
      grid: 'stroke-green-200'
    }
  };

  const colors = colorClasses[color as keyof typeof colorClasses] || colorClasses.rose;

  // Calculate points
  const points = data.map((item, index) => {
    const x = (index / (data.length - 1 || 1)) * graphWidth;
    const y = graphHeight - ((item.value - minValue) / range) * graphHeight;
    return { x, y, value: item.value, date: item.date };
  });

  // Create path for line
  const pathData = points.map((point, index) => {
    return `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y + padding}`;
  }).join(' ');

  // Create area path (for gradient fill)
  const areaPath = `${pathData} L ${points[points.length - 1].x} ${graphHeight + padding} L ${points[0].x} ${graphHeight + padding} Z`;

  return (
    <div className="w-full relative" style={{ height: `${height}px` }}>
      <svg
        viewBox={`0 0 ${graphWidth} ${height}`}
        className="w-full h-full"
        preserveAspectRatio="none"
      >
        {/* Grid lines */}
        {showGrid && (
          <g>
            {[0, 25, 50, 75, 100].map((percent) => {
              const y = (percent / 100) * graphHeight + padding;
              return (
                <line
                  key={percent}
                  x1="0"
                  y1={y}
                  x2={graphWidth}
                  y2={y}
                  stroke="currentColor"
                  strokeWidth="0.5"
                  className={colors.grid}
                  opacity="0.3"
                />
              );
            })}
          </g>
        )}

        {/* Area fill */}
        <path
          d={areaPath}
          className={`${colors.fill} opacity-20`}
        />

        {/* Line */}
        <path
          d={pathData}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={colors.stroke}
        />

        {/* Points */}
        {showPoints && points.map((point, index) => (
          <circle
            key={index}
            cx={point.x}
            cy={point.y + padding}
            r="3"
            className={colors.point}
          />
        ))}
      </svg>

      {/* Labels */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500 px-2">
        {data.length > 0 && (
          <>
            <span>{new Date(data[0].date).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })}</span>
            {data.length > 1 && (
              <span>{new Date(data[data.length - 1].date).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })}</span>
            )}
          </>
        )}
      </div>
    </div>
  );
}

