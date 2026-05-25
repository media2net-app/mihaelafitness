'use client';

import type { ReactNode } from 'react';
import { adminPageShellClassName } from '@/lib/adminStyles';

type AdminPageShellProps = {
  children: ReactNode;
  className?: string;
};

/** Theme wrapper for all /admin routes — use AdminPageContent for width/padding */
export default function AdminPageShell({ children, className = '' }: AdminPageShellProps) {
  return (
    <div className={`admin-theme ${adminPageShellClassName} ${className}`.trim()}>{children}</div>
  );
}
