"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ClientConfig } from "@/lib/clients";

type SidebarProps = {
  client: ClientConfig;
};

export default function Sidebar({ client }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="client-sidebar" aria-label={`${client.name} navigatie`}>
      <div className="client-sidebar__branding">
        <div className="client-sidebar__logo">
          <Image
            src={client.logo}
            alt={`${client.name} logo`}
            width={160}
            height={48}
            priority
          />
        </div>
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
                >
                  <span>{link.label}</span>
                  {link.description && (
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
      {client.resources && client.resources.length > 0 && (
        <div className="client-sidebar__nav">
          <h2 className="client-sidebar__section" aria-label="Snelle links">
            Resources
          </h2>
          <ul className="client-sidebar__list">
            {client.resources.map((resource) => (
              <li key={resource.href}>
                <Link
                  href={resource.href}
                  target="_blank"
                  rel="noreferrer"
                  className="client-sidebar__link client-sidebar__link--external"
                >
                  <span>{resource.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  );
}



