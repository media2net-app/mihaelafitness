import { notFound } from "next/navigation";
import { findClient } from "@/lib/clients";
import Link from "next/link";

type PageProps = { params: Promise<{ client: string }> | { client: string } };

export default async function OffertegeneratorPage({ params }: PageProps) {
  const resolvedParams = await Promise.resolve(params);
  const client = findClient(resolvedParams.client);
  if (!client || client.id !== "rimato") {
    notFound();
  }
  return (
    <div className="page-admin">
      <div className="page-header">
        <div>
          <div className="client-breadcrumb">Rimato • Leads • Offertegenerator</div>
          <h1>Offertegenerator</h1>
          <p style={{ color: "#64748b", marginTop: "0.5rem" }}>
            Sjablonen per discipline en automatische kostencalculatie.
          </p>
        </div>
        <Link href={`/clients/${client.id}/leads`} className="btn">
          ← Terug
        </Link>
      </div>
      <div className="dashboard-card">
        <h2>Placeholder</h2>
        <p style={{ color: "#64748b" }}>
          Hier komt de configuratie van parameters en prijsregels per discipline.
        </p>
      </div>
    </div>
  );
}


