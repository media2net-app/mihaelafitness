'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import AdminMobileHeader from './AdminMobileHeader';
import AdminNav from './AdminNav';

type Ctx = { openMenu: () => void };

const AdminMenuContext = createContext<Ctx | null>(null);

export function AdminMenuProvider({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <AdminMenuContext.Provider value={{ openMenu: () => setMenuOpen(true) }}>
      <AdminNav menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <AdminMobileHeader />
      {children}
    </AdminMenuContext.Provider>
  );
}

export function useAdminMenu() {
  return useContext(AdminMenuContext);
}
