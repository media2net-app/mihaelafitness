import type { CSSProperties } from 'react';
import { onlineTheme } from '@/lib/onlineTheme';

export const ADMIN_PRIMARY_GRADIENT = 'from-[#E11C48] to-[#F36088]';

export const adminCardStyle: CSSProperties = {
  background: `linear-gradient(160deg, ${onlineTheme.card} 0%, ${onlineTheme.bgElevated} 100%)`,
  border: `1px solid ${onlineTheme.cardBorder}`,
};

export const adminInnerCardStyle: CSSProperties = {
  borderColor: onlineTheme.cardBorder,
  background: 'rgba(255,255,255,0.04)',
};

export const adminInputClassName =
  'w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-white placeholder:text-white/35 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#F36088]/50';

export const adminGhostBtnClassName =
  'flex items-center rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2 text-sm text-white/80 transition-colors hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50';

export const adminPrimaryBtnClassName = `flex items-center justify-center rounded-lg bg-gradient-to-r ${ADMIN_PRIMARY_GRADIENT} px-4 py-2 text-sm font-medium text-white shadow-lg shadow-[#E11C48]/35 transition-opacity hover:opacity-90`;

export const adminPageTitleClassName = 'text-xl font-bold text-white sm:text-2xl';

export const adminPageSubtitleClassName = 'mt-1 text-sm text-white/55';

export const adminLabelClassName = 'mb-1.5 block text-xs font-medium text-white/70 sm:text-sm';
