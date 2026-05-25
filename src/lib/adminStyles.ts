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

export const adminPageShellClassName = 'min-h-screen text-white';

/** Centered content width — matches AdminMobileHeader on all breakpoints */
export const adminContentContainerClassName =
  'mx-auto w-full max-w-lg px-3 sm:max-w-xl sm:px-6 lg:max-w-4xl lg:px-8 xl:max-w-6xl';

export const adminHeaderBarClassName =
  'border-b border-white/10 bg-white/[0.03] backdrop-blur-sm';

export const adminStatsCardClassName =
  'rounded-xl border border-white/10 bg-white/[0.04] p-3 shadow-sm sm:rounded-2xl sm:p-4';

export const adminNoticeBannerClassName =
  'rounded-lg border border-amber-400/35 bg-amber-500/15 p-4 shadow-sm';

export const adminNoticeBannerTitleClassName = 'mb-1 text-sm font-semibold text-amber-100';

export const adminNoticeBannerBodyClassName = 'text-sm text-amber-200/85';

export const adminNoticeBannerBtnClassName =
  'flex shrink-0 items-center gap-2 rounded-lg bg-gradient-to-r from-[#E11C48] to-[#F36088] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90';

/** Subtle admin identity rows (not full bright pink/blue) */
export const adminBarMihaelaClassName =
  'rounded-xl border border-[#F36088]/35 bg-gradient-to-r from-[#4a2035] to-[#351828] shadow-sm';

export const adminBarChielClassName =
  'rounded-xl border border-sky-400/30 bg-gradient-to-r from-[#2d2438] to-[#351828] shadow-sm';

export const adminClientCardClassName =
  'group overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#351828] to-[#2a1220] shadow-sm transition-all duration-300 hover:border-white/20 hover:shadow-lg';

export const adminInputClassName =
  'w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-white placeholder:text-white/35 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#F36088]/50';

export const adminGhostBtnClassName =
  'flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-4 py-2.5 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50';

export const adminPrimaryBtnClassName = `inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r ${ADMIN_PRIMARY_GRADIENT} px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#E11C48]/30 transition-opacity hover:opacity-90`;

export const adminPageTitleClassName = 'text-2xl font-semibold text-white sm:text-3xl';

export const adminPageSubtitleClassName = 'mt-1 text-sm text-white/55';

export const adminLabelClassName = 'mb-1.5 block text-xs font-medium text-white/70 sm:text-sm';

export const adminModalOverlayClassName =
  'fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-3 py-6 sm:px-4 overscroll-contain';

export const adminModalPanelClassName =
  'admin-modal-panel w-full max-w-md rounded-xl sm:rounded-2xl border border-white/10 p-4 sm:p-6 shadow-2xl max-h-[min(90dvh,720px)] overflow-y-auto overscroll-y-contain';

export const adminModalPanelStyle: CSSProperties = adminCardStyle;

/** Status pill for dark admin lists */
export function getAdminStatusClassName(status: string): string {
  const base = 'inline-flex rounded-full px-2.5 py-1 text-xs font-semibold';
  switch (status.toLowerCase()) {
    case 'active':
    case 'completed':
      return `${base} border border-emerald-500/30 bg-emerald-500/15 text-emerald-300`;
    case 'pending':
    case 'intake':
    case 'scheduled':
      return `${base} border border-amber-500/30 bg-amber-500/15 text-amber-200`;
    case 'inactive':
    case 'cancelled':
    case 'failed':
      return `${base} border border-red-500/30 bg-red-500/15 text-red-300`;
    default:
      return `${base} border border-white/15 bg-white/[0.06] text-white/70`;
  }
}

export function getAdminBarClassName(email: string): string {
  const e = email.toLowerCase();
  if (e === 'info@mihaelafitness.com' || e === 'mihaela@mihaelafitness.com') {
    return adminBarMihaelaClassName;
  }
  if (e === 'chiel@media2net.nl') {
    return adminBarChielClassName;
  }
  return adminBarChielClassName;
}
