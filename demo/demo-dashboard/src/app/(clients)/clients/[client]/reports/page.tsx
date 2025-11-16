import { notFound } from "next/navigation";
import { findClient } from "@/lib/clients";
import { FileText, Mail, Eye, Plus, AlertTriangle } from "lucide-react";

type ReportsPageProps = {
  params: Promise<{ client: string }> | { client: string };
};

export default async function ReportsPage({ params }: ReportsPageProps) {
  const resolvedParams = await Promise.resolve(params);
  const client = findClient(resolvedParams.client);

  if (!client || client.id !== "rimato") {
    notFound();
  }

  const reports = [
    {
      id: "1",
      type: "Inspectie",
      project: "Industriële reiniging productiehal",
      client: "Machinefabriek De Vries",
      date: "2024-12-10",
      status: "Voltooid",
      inspector: "Jan Smit",
      findings: 3,
      critical: 0,
    },
    {
      id: "2",
      type: "Audit",
      project: "Periodiek rioolonderhoud",
      client: "Gemeente Hoogeveen",
      date: "2024-12-08",
      status: "Voltooid",
      inspector: "Klaas Visser",
      findings: 1,
      critical: 0,
    },
    {
      id: "3",
      type: "Kwaliteitscontrole",
      project: "Gevelreiniging kantoorgebouw",
      client: "Hoogeveen Business Center",
      date: "2024-12-05",
      status: "In behandeling",
      inspector: "Lisa Jansen",
      findings: 0,
      critical: 0,
    },
    {
      id: "4",
      type: "Veiligheidsinspectie",
      project: "Vloerreiniging magazijn",
      client: "Distributiecentrum Noord",
      date: "2024-12-03",
      status: "Voltooid",
      inspector: "Jan Smit",
      findings: 2,
      critical: 1,
    },
    {
      id: "5",
      type: "Milieu audit",
      project: "Rioolinspectie woonwijk",
      client: "Gemeente Hoogeveen",
      date: "2024-11-28",
      status: "Voltooid",
      inspector: "Klaas Visser",
      findings: 0,
      critical: 0,
    },
    {
      id: "6",
      type: "Inspectie",
      project: "Gevelonderhoud fabriek",
      client: "Metaalwarenfabriek BV",
      date: "2024-11-25",
      status: "Voltooid",
      inspector: "Lisa Jansen",
      findings: 1,
      critical: 0,
    },
  ];

  const stats = {
    total: reports.length,
    completed: reports.filter((r) => r.status === "Voltooid").length,
    inProgress: reports.filter((r) => r.status === "In behandeling").length,
    totalFindings: reports.reduce((sum, r) => sum + r.findings, 0),
    criticalFindings: reports.reduce((sum, r) => sum + r.critical, 0),
  };

  return (
    <div className="page-admin">
      <div className="page-header">
        <h1>Rapportages & Inspecties</h1>
        <button className="btn btn--primary">
          <Plus size={16} />
          Nieuwe Rapportage
        </button>
      </div>

      {/* Stats Cards */}
      <div className="page-stats">
        <div className="page-stat-card">
          <h3>{stats.total}</h3>
          <p>Totaal Rapportages</p>
        </div>
        <div className="page-stat-card page-stat-card--completed">
          <h3>{stats.completed}</h3>
          <p>Voltooid</p>
        </div>
        <div className="page-stat-card page-stat-card--active">
          <h3>{stats.inProgress}</h3>
          <p>In Behandeling</p>
        </div>
        <div className="page-stat-card">
          <h3>{stats.totalFindings}</h3>
          <p>Bevindingen</p>
        </div>
        <div className="page-stat-card page-stat-card--critical">
          <h3>{stats.criticalFindings}</h3>
          <p>Kritiek</p>
        </div>
      </div>

      {/* Filters */}
      <div className="page-filters">
        <select className="page-filter">
          <option>Alle types</option>
          <option>Inspectie</option>
          <option>Audit</option>
          <option>Kwaliteitscontrole</option>
          <option>Veiligheidsinspectie</option>
          <option>Milieu audit</option>
        </select>
        <select className="page-filter">
          <option>Alle statussen</option>
          <option>Voltooid</option>
          <option>In behandeling</option>
        </select>
        <input
          type="date"
          className="page-filter"
          placeholder="Van datum"
        />
        <input
          type="date"
          className="page-filter"
          placeholder="Tot datum"
        />
        <input
          type="search"
          placeholder="Zoek rapportages..."
          className="page-search"
        />
      </div>

      {/* Reports Table */}
      <div className="page-card">
        <div className="dashboard-table">
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Project</th>
                <th>Klant</th>
                <th>Datum</th>
                <th>Inspecteur</th>
                <th>Status</th>
                <th>Bevindingen</th>
                <th>Kritiek</th>
                <th>Acties</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report.id}>
                  <td>
                    <span className="dashboard-table__type">{report.type}</span>
                  </td>
                  <td>
                    <Link
                      href={`/clients/${client.id}/reports/${report.id}`}
                      style={{ textDecoration: "none", color: "inherit" }}
                      aria-label={`Bekijk rapport ${report.type} voor ${report.project}`}
                    >
                      <strong>{report.project}</strong>
                    </Link>
                  </td>
                  <td>{report.client}</td>
                  <td>{new Date(report.date).toLocaleDateString("nl-NL")}</td>
                  <td>{report.inspector}</td>
                  <td>
                    <span className={`dashboard-badge dashboard-badge--${report.status.toLowerCase().replace(" ", "-")}`}>
                      {report.status}
                    </span>
                  </td>
                  <td>
                    {report.findings > 0 ? (
                      <span className="dashboard-badge dashboard-badge--actief">{report.findings}</span>
                    ) : (
                      <span className="dashboard-badge dashboard-badge--voltooid">0</span>
                    )}
                  </td>
                  <td>
                    {report.critical > 0 ? (
                      <span className="dashboard-badge dashboard-badge--critical">
                        <AlertTriangle size={12} />
                        {report.critical}
                      </span>
                    ) : (
                      <span>-</span>
                    )}
                  </td>
                  <td>
                    <div className="dashboard-actions">
                      <button className="dashboard-action-btn" title="PDF">
                        <FileText size={16} />
                      </button>
                      <button className="dashboard-action-btn" title="E-mailen">
                        <Mail size={16} />
                      </button>
                      <button className="dashboard-action-btn" title="Bekijken">
                        <Eye size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

