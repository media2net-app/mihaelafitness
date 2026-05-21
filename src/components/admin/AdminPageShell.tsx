'use client';

import type { ReactNode } from 'react';

type AdminPageShellProps = {
  children: ReactNode;
  className?: string;
};

/** Wraps all /admin pages — pairs with `.admin-theme` global styles for legacy UIs */
export default function AdminPageShell({ children, className = '' }: AdminPageShellProps) {
  return <div className={`admin-theme min-h-full w-full ${className}`.trim()}>{children}</div>;
}
