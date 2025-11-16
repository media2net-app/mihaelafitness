import { notFound } from "next/navigation";
import { findClient } from "@/lib/clients";
import { rimatoDashboardData } from "@/lib/dashboard-data";
import Link from "next/link";

type PageProps = { params: Promise<{ client: string }> | { client: string } };

export default async function LeadIntakePage({ params }: PageProps) {
  const resolvedParams = await Promise.resolve(params);
  const client = findClient(resolvedParams.client);
  if (!client || client.id !== "rimato") {
    notFound();
  }
  const { intake } = rimatoDashboardData.leads;
  return (
    <div className="page-admin">
      <div className="page-header">
        <div>
          <div className="client-breadcrumb">Rimato • Leads • Lead Intake</div>
          <h1>Lead Intake</h1>
          <p style={{ color: "#64748b", marginTop: "0.5rem" }}>
            Gecentraliseerde intake vanuit web, mail en telefoon.
          </p>
        </div>
        <Link href={`/clients/${client.id}/leads`} className="btn">
          ← Terug
        </Link>
      </div>
      <div className="dashboard-grid">
        <section className="dashboard-card">
          <div className="dashboard-card__header">
            <h2>Bronnen</h2>
          </div>
          <ul style={{ margin: 0, paddingLeft: "1.1rem" }}>
            {intake.sources.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </section>
        <section className="dashboard-card">
          <div className="dashboard-card__header">
            <h2>Velden</h2>
          </div>
          <div className="dashboard-table">
            <table>
              <thead>
                <tr>
                  <th>Label</th>
                  <th>Sleutel</th>
                </tr>
              </thead>
              <tbody>
                {intake.fields.map((f) => (
                  <tr key={f.key}>
                    <td>{f.label}</td>
                    <td><code>{f.key}</code></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section className="dashboard-card dashboard-card--primary">
          <div className="dashboard-card__header">
            <h2>Intakeformulier (mock)</h2>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              alert("Voorbeeld: lead ingestuurd (mock).");
            }}
            style={{ display: "grid", gap: "0.75rem" }}
          >
            {intake.fields.slice(0, 5).map((f) => (
              <label key={f.key}>
                <span>{f.label}</span>
                <input className="page-filter" placeholder={f.label} />
              </label>
            ))}
            <button type="submit" className="btn btn--primary">Lead aanmaken</button>
          </form>
        </section>
      </div>
    </div>
  );
}


