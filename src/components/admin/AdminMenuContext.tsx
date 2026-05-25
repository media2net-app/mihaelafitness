'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import AdminMobileHeader from './AdminMobileHeader';
import AdminTaskTopBar from './AdminTaskTopBar';
import AdminNav, { AdminNavDesktop } from './AdminNav';

type Ctx = { openMenu: () => void };

const AdminMenuContext = createContext<Ctx | null>(null);

export function AdminMenuProvider({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <AdminMenuContext.Provider value={{ openMenu: () => setMenuOpen(true) }}>
      <div className="flex min-h-screen w-full">
        <div className="min-w-0 flex-1">
          <AdminTaskTopBar />
          <AdminMobileHeader />
          {children}
        </div>
        <AdminNavDesktop />
      </div>
      <AdminNav menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
    </AdminMenuContext.Provider>
  );
}

export function useAdminMenu() {
  return useContext(AdminMenuContext);
}
