'use client';

import type { ReactNode } from 'react';
import {
  adminContentContainerClassName,
  adminPageShellClassName,
} from '@/lib/adminStyles';

type AdminPageContentProps = {
  children: ReactNode;
  /** Full width on large screens (e.g. schedule) */
  fullWidth?: boolean;
  className?: string;
};

export default function AdminPageContent({
  children,
  fullWidth = false,
  className = '',
}: AdminPageContentProps) {
  const containerClass = fullWidth
    ? `w-full px-3 pb-6 pt-1 sm:px-6 lg:px-8 ${className}`.trim()
    : `${adminContentContainerClassName} pb-6 pt-1 ${className}`.trim();

  return <div className={`${adminPageShellClassName} ${containerClass}`}>{children}</div>;
}
