"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import type { ClientConfig } from "@/lib/clients";

type SidebarProps = {
  client: ClientConfig;
};

export default function Sidebar({ client }: SidebarProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile Header met Hamburger Menu */}
      <div className="client-mobile-header">
        <div className="client-mobile-header__content">
          <div className="client-mobile-header__logo">
            <Image
              src={client.logo}
              alt={`${client.name} logo`}
              width={client.id === "neumann" ? 90 : 120}
              height={client.id === "neumann" ? 27 : 36}
              priority
              style={{ width: "auto", height: "auto" }}
            />
          </div>
          <button
            className="client-mobile-header__menu-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Menu openen"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="client-mobile-overlay"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside
        className={`client-sidebar ${isMobileMenuOpen ? "is-open" : ""}`}
        aria-label={`${client.name} navigatie`}
      >
        <div className="client-sidebar__branding">
        <div className="client-sidebar__logo">
          <Image
            src={client.logo}
            alt={`${client.name} logo`}
            width={client.id === "neumann" ? 120 : 160}
            height={client.id === "neumann" ? 36 : 48}
            priority
            style={{ width: "auto", height: "auto" }}
          />
        </div>
          <button
            className="client-sidebar__close"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Menu sluiten"
          >
            <X size={20} />
          </button>
        </div>
      <nav className="client-sidebar__nav">
        <h2 className="client-sidebar__section" aria-label="Navigatie">
          Overzicht
        </h2>
        <ul className="client-sidebar__list">
          {client.sidebarLinks.map((link) => {
            const active =
              pathname === link.href || pathname.startsWith(`${link.href}/`);

            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`client-sidebar__link${active ? " is-active" : ""}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span>{link.label}</span>
                  {"description" in link && link.description && (
                    <span className="client-sidebar__link-description">
                      {link.description}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      {(() => {
        if ("resources" in client) {
          const resources = client.resources;
          if (resources && Array.isArray(resources) && resources.length > 0) {
            return (
              <div className="client-sidebar__nav">
                <h2 className="client-sidebar__section" aria-label="Snelle links">
                  Resources
                </h2>
                <ul className="client-sidebar__list">
                  {resources.map((resource) => (
                    <li key={resource.href}>
                      <Link
                        href={resource.href}
                        target="_blank"
                        rel="noreferrer"
                        className="client-sidebar__link client-sidebar__link--external"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <span>{resource.label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          }
        }
        return null;
      })()}
      </aside>
    </>
  );
}



