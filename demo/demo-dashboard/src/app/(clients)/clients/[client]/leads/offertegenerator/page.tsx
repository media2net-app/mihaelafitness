import { notFound } from "next/navigation";
import { findClient } from "@/lib/clients";
import { rimatoDashboardData } from "@/lib/dashboard-data";
import Link from "next/link";

type PageProps = { params: Promise<{ client: string }> | { client: string } };

export default async function OffertegeneratorPage({ params }: PageProps) {
  const resolvedParams = await Promise.resolve(params);
  const client = findClient(resolvedParams.client);
  if (!client || client.id !== "rimato") {
    notFound();
  }
  const cfg = rimatoDashboardData.leads.offertegenerator;
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
      <div className="dashboard-grid">
        <section className="dashboard-card">
          <div className="dashboard-card__header">
            <h2>Disciplines</h2>
          </div>
          <div className="dashboard-list">
            {cfg.disciplines.map((d) => (
              <div key={d.id} className="dashboard-list__item" style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}>
                <div className="dashboard-list__main">
                  <strong>{d.name}</strong>
                  <div className="dashboard-table__meta">Basistarief</div>
                </div>
                <div className="dashboard-list__side" style={{ alignItems: "center" }}>
                  <span style={{ fontWeight: 600 }}>€{d.baseRate}/{d.unit}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
        <section className="dashboard-card">
          <div className="dashboard-card__header">
            <h2>Parameters</h2>
          </div>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {cfg.parameters.map((p) => (
              <li key={p.key} style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--client-border)", padding: "0.5rem 0" }}>
                <span>{p.label}</span>
                <code style={{ color: "#64748b" }}>{p.key}</code>
              </li>
            ))}
          </ul>
        </section>
        <section className="dashboard-card dashboard-card--primary">
          <div className="dashboard-card__header">
            <h2>Calculator (mock)</h2>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              alert("Voorbeeld: berekening volgt in volgende fase.");
            }}
            style={{ display: "grid", gap: "0.75rem" }}
          >
            <label>
              <span>Discipline</span>
              <select className="page-filter" defaultValue={cfg.disciplines[0]?.id}>
                {cfg.disciplines.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Oppervlakte (m²)</span>
              <input type="number" min={0} step={1} className="page-filter" placeholder="Bijv. 250" />
            </label>
            <label>
              <span>Benodigde uren</span>
              <input type="number" min={0} step={0.5} className="page-filter" placeholder="Bijv. 16" />
            </label>
            <label>
              <span>Materiaal kostprijs (€)</span>
              <input type="number" min={0} step={1} className="page-filter" placeholder="Bijv. 180" />
            </label>
            <button type="submit" className="btn btn--primary">Bereken indicatie</button>
          </form>
        </section>
      </div>
    </div>
  );
}


