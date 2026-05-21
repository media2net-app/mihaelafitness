'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import OnlineNav from './OnlineNav';

type Ctx = { openMenu: () => void };

const OnlineMenuContext = createContext<Ctx | null>(null);

export function OnlineMenuProvider({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <OnlineMenuContext.Provider value={{ openMenu: () => setMenuOpen(true) }}>
      <OnlineNav menuOpen={menuOpen} setMenuOpen={setMenuOpen} dark />
      {children}
    </OnlineMenuContext.Provider>
  );
}

export function useOnlineMenu() {
  const ctx = useContext(OnlineMenuContext);
  return ctx;
}
