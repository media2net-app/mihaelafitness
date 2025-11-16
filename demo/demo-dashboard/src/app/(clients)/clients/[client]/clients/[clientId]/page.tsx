import { notFound } from "next/navigation";
import { findClient } from "@/lib/clients";
import { rimatoDashboardData } from "@/lib/dashboard-data";
import Link from "next/link";
import { ArrowLeft, Mail, Phone, MapPin, Calendar, Euro, Building2, FileText, Edit } from "lucide-react";

type ClientDetailPageProps = {
  params: Promise<{ client: string; clientId: string }> | { client: string; clientId: string };
};

export default async function ClientDetailPage({ params }: ClientDetailPageProps) {
  const resolvedParams = await Promise.resolve(params);
  const client = findClient(resolvedParams.client);

  if (!client || client.id !== "rimato") {
    notFound();
  }

  const clientItem = rimatoDashboardData.clients.find(c => c.id === resolvedParams.clientId);

  if (!clientItem) {
    notFound();
  }

  // Find projects for this client
  const clientProjects = rimatoDashboardData.recentProjects.filter(p => p.client === clientItem.name);

  return (
    <div className="page-admin">
      <div className="page-header">
        <Link href={`/clients/${client.id}/clients`} className="btn btn--secondary">
          <ArrowLeft size={16} />
          Terug naar CRM
        </Link>
        <div style={{ flex: 1 }}>
          <h1>{clientItem.name}</h1>
          <p className="client-tagline">{clientItem.type} - {clientItem.status}</p>
        </div>
        <button className="btn btn--primary">
          <Edit size={16} />
          Bewerken
        </button>
      </div>

      <div className="dashboard-grid" style={{ gridTemplateColumns: "2fr 1fr", gap: "1.5rem" }}>
        {/* Client Details */}
        <section className="dashboard-card">
          <h2>Klantgegevens</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem", background: "rgba(237, 29, 36, 0.05)", borderRadius: "0.5rem" }}>
              <Building2 size={20} style={{ color: "#ED1D24" }} />
              <div>
                <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Bedrijfsnaam</div>
                <div style={{ fontWeight: 600 }}>{clientItem.name}</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem", background: "rgba(237, 29, 36, 0.05)", borderRadius: "0.5rem" }}>
              <Mail size={20} style={{ color: "#ED1D24" }} />
              <div>
                <div style={{ fontSize: "0.75rem", color: "#64748b" }}>E-mail</div>
                <a href={`mailto:${clientItem.email}`} style={{ color: "inherit", textDecoration: "none" }}>
                  {clientItem.email}
                </a>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem", background: "rgba(237, 29, 36, 0.05)", borderRadius: "0.5rem" }}>
              <Phone size={20} style={{ color: "#ED1D24" }} />
              <div>
                <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Telefoon</div>
                <div>{clientItem.phone}</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem", background: "rgba(237, 29, 36, 0.05)", borderRadius: "0.5rem" }}>
              <FileText size={20} style={{ color: "#ED1D24" }} />
              <div>
                <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Contactpersoon</div>
                <div>{clientItem.contact}</div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats & Overview */}
        <section className="dashboard-card">
          <h2>Overzicht</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem", background: "rgba(237, 29, 36, 0.05)", borderRadius: "0.5rem" }}>
              <FileText size={20} style={{ color: "#ED1D24" }} />
              <div>
                <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Totaal Projecten</div>
                <div style={{ fontWeight: 600 }}>{clientItem.totalProjects}</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem", background: "rgba(237, 29, 36, 0.05)", borderRadius: "0.5rem" }}>
              <Euro size={20} style={{ color: "#ED1D24" }} />
              <div>
                <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Totale Waarde</div>
                <div style={{ fontWeight: 600, color: "#ED1D24" }}>€{clientItem.totalValue.toLocaleString("nl-NL")}</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem", background: "rgba(237, 29, 36, 0.05)", borderRadius: "0.5rem" }}>
              <Calendar size={20} style={{ color: "#ED1D24" }} />
              <div>
                <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Laatste Contact</div>
                <div style={{ fontWeight: 600 }}>{new Date(clientItem.lastContact).toLocaleDateString("nl-NL")}</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem", background: "rgba(237, 29, 36, 0.15)", borderRadius: "0.5rem", marginTop: "1rem" }}>
              <div>
                <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Status</div>
                <span className={`dashboard-badge dashboard-badge--${clientItem.status.toLowerCase()}`}>
                  {clientItem.status}
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Projects Section */}
      {clientProjects.length > 0 && (
        <section className="dashboard-card" style={{ marginTop: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h2>Projecten ({clientProjects.length})</h2>
            <Link href={`/clients/${client.id}/projects`} className="btn btn--secondary" style={{ textDecoration: "none" }}>
              Bekijk alle projecten →
            </Link>
          </div>
          <div className="dashboard-table">
            <table>
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Startdatum</th>
                  <th>Waarde</th>
                  <th>Voortgang</th>
                </tr>
              </thead>
              <tbody>
                {clientProjects.map((project) => (
                  <tr key={project.id}>
                    <td>
                      <Link
                        href={`/clients/${client.id}/projects/${project.id}`}
                        style={{ textDecoration: "none", color: "inherit", fontWeight: 600 }}
                      >
                        {project.name}
                      </Link>
                    </td>
                    <td>
                      <span className="dashboard-table__type">{project.type}</span>
                    </td>
                    <td>
                      <span className={`dashboard-badge dashboard-badge--${project.status.toLowerCase()}`}>
                        {project.status}
                      </span>
                    </td>
                    <td>{new Date(project.startDate).toLocaleDateString("nl-NL")}</td>
                    <td>
                      <strong>€{project.value.toLocaleString("nl-NL")}</strong>
                    </td>
                    <td>
                      <div className="dashboard-progress">
                        <div className="dashboard-progress__bar" style={{ width: `${project.progress}%` }}></div>
                        <span>{project.progress}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
