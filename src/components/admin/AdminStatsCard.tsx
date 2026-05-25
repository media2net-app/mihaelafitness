'use client';

import type { LucideIcon } from 'lucide-react';
import { adminInnerCardStyle, adminStatsCardClassName } from '@/lib/adminStyles';
import { onlineTheme } from '@/lib/onlineTheme';

type AdminStatsCardProps = {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  onClick?: () => void;
};

export default function AdminStatsCard({
  title,
  value,
  icon: Icon,
  trend,
  onClick,
}: AdminStatsCardProps) {
  const className = `${adminStatsCardClassName} ${onClick ? 'cursor-pointer transition-colors hover:border-white/20 hover:bg-white/[0.07]' : ''}`;

  const content = (
    <>
      <div className="flex items-center gap-3 sm:gap-4">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/[0.08] sm:h-11 sm:w-11"
          style={{ borderColor: onlineTheme.cardBorder }}
        >
          <Icon className="h-5 w-5" style={{ color: onlineTheme.accentLight }} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-xl font-bold leading-none text-white sm:text-2xl">{value}</div>
          <p className="mt-1 text-xs text-white/55 sm:text-sm">{title}</p>
        </div>
        {trend ? (
          <span className="shrink-0 text-xs font-medium text-emerald-300/90">{trend}</span>
        ) : null}
      </div>
    </>
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={`${className} w-full text-left`} style={adminInnerCardStyle}>
        {content}
      </button>
    );
  }

  return (
    <div className={className} style={adminInnerCardStyle}>
      {content}
    </div>
  );
}
