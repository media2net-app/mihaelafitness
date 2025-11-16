import { notFound } from "next/navigation";
import { findClient } from "@/lib/clients";
import { rimatoDashboardData } from "@/lib/dashboard-data";
import Link from "next/link";

type PageProps = { params: Promise<{ client: string }> | { client: string } };

export default async function PipelinePage({ params }: PageProps) {
  const resolvedParams = await Promise.resolve(params);
  const client = findClient(resolvedParams.client);
  if (!client || client.id !== "rimato") {
    notFound();
  }
  const { pipeline } = rimatoDashboardData.leads;
  return (
    <div className="page-admin">
      <div className="page-header">
        <div>
          <div className="client-breadcrumb">Rimato • Leads • Pipeline</div>
          <h1>Sales Pipeline</h1>
          <p style={{ color: "#64748b", marginTop: "0.5rem" }}>
            Statussen: Nieuw, Gekwalificeerd, Offerte, Winst, Verlies.
          </p>
        </div>
        <Link href={`/clients/${client.id}/leads`} className="btn">
          ← Terug
        </Link>
      </div>
      <div className="dashboard-grid" style={{ gridTemplateColumns: "repeat(5, 1fr)" }}>
        {pipeline.stages.map((stage) => (
          <section key={stage.id} className="dashboard-card">
            <div className="dashboard-card__header">
              <h2 style={{ fontSize: "1rem" }}>{stage.name}</h2>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <div className="dashboard-list__item" style={{ background: "var(--client-surface)", borderRadius: "0.5rem", padding: "0.5rem 0.75rem" }}>
                <strong>Voorbeeld lead</strong>
                <div className="dashboard-table__meta">Acme BV • Gevelbeheer</div>
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}


