import { notFound } from "next/navigation";
import { findClient } from "@/lib/clients";
import { rimatoDashboardData } from "@/lib/dashboard-data";
import Link from "next/link";
import { Edit, Eye, Trash2, Plus } from "lucide-react";

type ProjectsPageProps = {
  params: Promise<{ client: string }> | { client: string };
};

export default async function ProjectsPage({ params }: ProjectsPageProps) {
  const resolvedParams = await Promise.resolve(params);
  const client = findClient(resolvedParams.client);

  if (!client || client.id !== "rimato") {
    notFound();
  }

  const allProjects = [
    ...rimatoDashboardData.recentProjects,
    {
      id: "5",
      name: "Vloerreiniging magazijn",
      client: "Distributiecentrum Noord",
      status: "Lopend",
      priority: "Hoog",
      startDate: "2024-11-01",
      nextService: "2024-12-22",
      type: "Industriële reiniging",
      value: 6200,
      progress: 45,
      assignedTeam: ["Jan Smit"],
    },
    {
      id: "6",
      name: "Rioolinspectie woonwijk",
      client: "Gemeente Hoogeveen",
      status: "Voltooid",
      priority: "Normaal",
      startDate: "2024-10-01",
      nextService: null,
      type: "Rioolbeheer",
      value: 8500,
      progress: 100,
      assignedTeam: ["Klaas Visser"],
    },
    {
      id: "7",
      name: "Gevelonderhoud fabriek",
      client: "Metaalwarenfabriek BV",
      status: "Lopend",
      priority: "Normaal",
      startDate: "2024-09-15",
      nextService: "2024-12-25",
      type: "Gevelbeheer",
      value: 15000,
      progress: 80,
      assignedTeam: ["Lisa Jansen", "Tom de Boer"],
    },
    {
      id: "8",
      name: "Machine reiniging productielijn",
      client: "Machinefabriek De Vries",
      status: "Gepland",
      priority: "Hoog",
      startDate: "2024-12-28",
      nextService: "2024-12-28",
      type: "Industriële reiniging",
      value: 9500,
      progress: 0,
      assignedTeam: ["Jan Smit", "Piet Bakker"],
    },
  ];

  const stats = {
    total: allProjects.length,
    active: allProjects.filter((p) => p.status === "Lopend").length,
    planned: allProjects.filter((p) => p.status === "Gepland").length,
    completed: allProjects.filter((p) => p.status === "Voltooid").length,
    totalValue: allProjects.reduce((sum, p) => sum + p.value, 0),
  };

  return (
    <div className="page-admin">
      <div className="page-header">
        <h1>Projecten Beheer</h1>
        <button className="btn btn--primary">
          <Plus size={16} />
          Nieuw Project
        </button>
      </div>

      {/* Stats Cards */}
      <div className="page-stats">
        <div className="page-stat-card">
          <h3>{stats.total}</h3>
          <p>Totaal Projecten</p>
        </div>
        <div className="page-stat-card page-stat-card--active">
          <h3>{stats.active}</h3>
          <p>Actief</p>
        </div>
        <div className="page-stat-card page-stat-card--planned">
          <h3>{stats.planned}</h3>
          <p>Gepland</p>
        </div>
        <div className="page-stat-card page-stat-card--completed">
          <h3>{stats.completed}</h3>
          <p>Voltooid</p>
        </div>
        <div className="page-stat-card page-stat-card--primary">
          <h3>€{stats.totalValue.toLocaleString("nl-NL")}</h3>
          <p>Totale Waarde</p>
        </div>
      </div>

      {/* Filters */}
      <div className="page-filters">
        <select className="page-filter">
          <option>Alle statussen</option>
          <option>Lopend</option>
          <option>Gepland</option>
          <option>Voltooid</option>
        </select>
        <select className="page-filter">
          <option>Alle prioriteiten</option>
          <option>Hoog</option>
          <option>Normaal</option>
          <option>Laag</option>
        </select>
        <select className="page-filter">
          <option>Alle diensten</option>
          <option>Industriële reiniging</option>
          <option>Rioolbeheer</option>
          <option>Gevelbeheer</option>
        </select>
        <input
          type="search"
          placeholder="Zoek projecten..."
          className="page-search"
        />
      </div>

      {/* Projects Table */}
      <div className="page-card">
        <div className="dashboard-table">
          <table>
            <thead>
              <tr>
                <th>Project</th>
                <th>Klant</th>
                <th>Type</th>
                <th>Status</th>
                <th>Prioriteit</th>
                <th>Startdatum</th>
                <th>Volgende Service</th>
                <th>Waarde</th>
                <th>Voortgang</th>
                <th>Team</th>
                <th>Acties</th>
              </tr>
            </thead>
            <tbody>
              {allProjects.map((project) => (
                <tr key={project.id}>
                  <td>
                    <Link
                      href={`/clients/${client.id}/projects/${project.id}`}
                      style={{ textDecoration: "none", color: "inherit" }}
                      aria-label={`Bekijk project ${project.name}`}
                    >
                      <strong>{project.name}</strong>
                    </Link>
                  </td>
                  <td>{project.client}</td>
                  <td>
                    <span className="dashboard-table__type">{project.type}</span>
                  </td>
                  <td>
                    <span className={`dashboard-badge dashboard-badge--${project.status.toLowerCase()}`}>
                      {project.status}
                    </span>
                  </td>
                  <td>
                    <span className={`dashboard-priority dashboard-priority--${project.priority.toLowerCase()}`}>
                      {project.priority}
                    </span>
                  </td>
                  <td>{new Date(project.startDate).toLocaleDateString("nl-NL")}</td>
                  <td>
                    {project.nextService
                      ? new Date(project.nextService).toLocaleDateString("nl-NL")
                      : "-"}
                  </td>
                  <td>
                    <strong>€{project.value.toLocaleString("nl-NL")}</strong>
                  </td>
                  <td>
                    <div className="dashboard-progress">
                      <div className="dashboard-progress__bar" style={{ width: `${project.progress}%` }}></div>
                      <span>{project.progress}%</span>
                    </div>
                  </td>
                  <td>
                    <div className="dashboard-team">
                      {project.assignedTeam.map((member, idx) => (
                        <span key={idx} className="dashboard-team__member">{member}</span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <div className="dashboard-actions">
                      <button className="dashboard-action-btn" title="Bewerken">
                        <Edit size={16} />
                      </button>
                      <button className="dashboard-action-btn" title="Bekijken">
                        <Eye size={16} />
                      </button>
                      <button className="dashboard-action-btn" title="Verwijderen">
                        <Trash2 size={16} />
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

