import { notFound } from "next/navigation";
import { findClient } from "@/lib/clients";

type SectionPageProps = {
  params: Promise<{ client: string; section: string }> | { client: string; section: string };
};

export default async function SectionPage({ params }: SectionPageProps) {
  const resolvedParams = await Promise.resolve(params);
  const client = findClient(resolvedParams.client);

  if (!client) {
    notFound();
  }

  const path = `/clients/${client.id}/${resolvedParams.section}`;
  const link = client.sidebarLinks.find((sidebarLink) => sidebarLink.href === path);

  if (!link) {
    notFound();
  }

  return (
    <article className="dashboard-card">
      <h2>{link.label}</h2>
      <p>
        Deze placeholderpagina hoort bij de klantmap van <strong>{client.name}</strong>. Voeg
        hier eenvoudig componenten of data toe die specifiek zijn voor{" "}
        <em>{link.label.toLowerCase()}</em>.
      </p>
      {'description' in link && link.description && (
        <p className="dashboard-card__footnote">
          Sidebar omschrijving: {link.description}
        </p>
      )}
    </article>
  );
}

