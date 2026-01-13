'use client';

import { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  subtitle?: string;
  isHighlighted?: boolean;
  chart?: React.ReactNode;
}

export default function MetricCard({
  title,
  value,
  icon: Icon,
  trend,
  subtitle,
  isHighlighted = false,
  chart
}: MetricCardProps) {
  return (
    <div
      className={`rounded-xl p-4 sm:p-6 transition-all hover:shadow-lg ${
        isHighlighted
          ? 'bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-lg'
          : 'bg-white text-gray-800 shadow-sm border border-gray-100'
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2 sm:p-3 rounded-lg ${
          isHighlighted ? 'bg-white/20' : 'bg-rose-100'
        }`}>
          <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${
            isHighlighted ? 'text-white' : 'text-rose-600'
          }`} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs sm:text-sm font-medium ${
            isHighlighted
              ? trend.isPositive ? 'text-white' : 'text-white/80'
              : trend.isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            {trend.isPositive ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>

      <div className="mb-2">
        <p className={`text-xs sm:text-sm font-medium mb-1 ${
          isHighlighted ? 'text-white/90' : 'text-gray-600'
        }`}>
          {title}
        </p>
        <p className={`text-2xl sm:text-3xl font-bold ${
          isHighlighted ? 'text-white' : 'text-gray-900'
        }`}>
          {value}
        </p>
        {subtitle && (
          <p className={`text-xs sm:text-sm mt-1 ${
            isHighlighted ? 'text-white/80' : 'text-gray-500'
          }`}>
            {subtitle}
          </p>
        )}
      </div>

      {chart && (
        <div className="mt-4">
          {chart}
        </div>
      )}
    </div>
  );
}

