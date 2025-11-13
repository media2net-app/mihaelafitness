import { notFound } from "next/navigation";
import { findClient } from "@/lib/clients";
import { Heart, Activity, FileText, Users, Plus } from "lucide-react";
import Link from "next/link";

type RevalidatiePageProps = {
  params: Promise<{ client: string }> | { client: string };
};

export default async function RevalidatiePage({ params }: RevalidatiePageProps) {
  const resolvedParams = await Promise.resolve(params);
  const client = findClient(resolvedParams.client);

  if (!client || client.id !== "neumann") {
    notFound();
  }

  const trajecten = [
    {
      id: "1",
      klant: "Marijn Besseler",
      aandoening: "Knieblessure",
      type: "Revalidatie",
      startdatum: "2024-10-01",
      voortgang: 75,
      sessies: 15,
      totaalSessies: 20,
      status: "Lopend",
    },
    {
      id: "2",
      klant: "Erwin Altena",
      aandoening: "Onderrug klachten",
      type: "Preventie",
      startdatum: "2024-11-15",
      voortgang: 40,
      sessies: 8,
      totaalSessies: 20,
      status: "Lopend",
    },
    {
      id: "3",
      klant: "Sarah de Vries",
      aandoening: "Artrose knie",
      type: "Revalidatie",
      startdatum: "2024-09-01",
      voortgang: 100,
      sessies: 20,
      totaalSessies: 20,
      status: "Voltooid",
    },
    {
      id: "4",
      klant: "Kristel Kwant",
      aandoening: "Schouderklachten",
      type: "Preventie",
      startdatum: "2024-12-01",
      voortgang: 20,
      sessies: 4,
      totaalSessies: 20,
      status: "Lopend",
    },
  ];

  const protocollen = [
    {
      id: "1",
      naam: "Knie Revalidatie Protocol",
      aandoening: "Knieblessure",
      klanten: 8,
      status: "Actief",
    },
    {
      id: "2",
      naam: "Onderrug Preventie Programma",
      aandoening: "Onderrug klachten",
      klanten: 12,
      status: "Actief",
    },
    {
      id: "3",
      naam: "Artrose Behandeling",
      aandoening: "Artrose",
      klanten: 5,
      status: "Actief",
    },
  ];

  const stats = {
    lopendeTrajecten: trajecten.filter((t) => t.status === "Lopend").length,
    voltooideTrajecten: trajecten.filter((t) => t.status === "Voltooid").length,
    gemiddeldeVoortgang: Math.round(
      trajecten.reduce((sum, t) => sum + t.voortgang, 0) / trajecten.length
    ),
  };

  return (
    <div className="page-admin">
      <div className="page-header">
        <h1>Revalidatie & Preventie</h1>
        <button className="btn btn--primary">
          <Plus size={16} />
          Nieuw Traject
        </button>
      </div>

      {/* Stats Cards */}
      <div className="page-stats">
        <div className="page-stat-card page-stat-card--active">
          <h3>{stats.lopendeTrajecten}</h3>
          <p>Lopende Trajecten</p>
        </div>
        <div className="page-stat-card page-stat-card--completed">
          <h3>{stats.voltooideTrajecten}</h3>
          <p>Voltooid</p>
        </div>
        <div className="page-stat-card">
          <h3>{stats.gemiddeldeVoortgang}%</h3>
          <p>Gem. Voortgang</p>
        </div>
      </div>

      {/* Revalidatie Trajecten */}
      <div className="page-section">
        <h2 className="page-section__title">Revalidatie Trajecten</h2>
        <div className="page-card">
          <div className="dashboard-table">
            <table>
              <thead>
                <tr>
                  <th>Klant</th>
                  <th>Aandoening</th>
                  <th>Type</th>
                  <th>Startdatum</th>
                  <th>Voortgang</th>
                  <th>Sessies</th>
                  <th>Status</th>
                  <th>Acties</th>
                </tr>
              </thead>
              <tbody>
                {trajecten.map((traject) => (
                  <tr key={traject.id} className="dashboard-table__row--clickable">
                    <td>
                      <Link href={`/${client.id}/revalidatie/${traject.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                        <strong>{traject.klant}</strong>
                      </Link>
                    </td>
                    <td>
                      <Link href={`/${client.id}/revalidatie/${traject.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                        {traject.aandoening}
                      </Link>
                    </td>
                    <td>
                      <Link href={`/${client.id}/revalidatie/${traject.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                        <span className="dashboard-table__type">{traject.type}</span>
                      </Link>
                    </td>
                    <td>
                      <Link href={`/${client.id}/revalidatie/${traject.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                        {new Date(traject.startdatum).toLocaleDateString("nl-NL")}
                      </Link>
                    </td>
                    <td>
                      <Link href={`/${client.id}/revalidatie/${traject.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                        <div className="dashboard-progress">
                          <div className="dashboard-progress__bar" style={{ width: `${traject.voortgang}%` }}></div>
                          <span>{traject.voortgang}%</span>
                        </div>
                      </Link>
                    </td>
                    <td>
                      <Link href={`/${client.id}/revalidatie/${traject.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                        {traject.sessies}/{traject.totaalSessies}
                      </Link>
                    </td>
                    <td>
                      <Link href={`/${client.id}/revalidatie/${traject.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                        <span className={`dashboard-badge dashboard-badge--${traject.status.toLowerCase()}`}>
                          {traject.status}
                        </span>
                      </Link>
                    </td>
                    <td>
                      <div className="dashboard-actions">
                        <Link href={`/${client.id}/revalidatie/${traject.id}`} className="dashboard-action-btn" title="Bekijken">
                          <FileText size={16} />
                        </Link>
                        <button className="dashboard-action-btn" title="Bewerken">
                          <Activity size={16} />
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

      {/* Protocollen */}
      <div className="page-section">
        <h2 className="page-section__title">Behandelprotocollen</h2>
        <div className="page-card">
          <div className="dashboard-table">
            <table>
              <thead>
                <tr>
                  <th>Protocol</th>
                  <th>Aandoening</th>
                  <th>Klanten</th>
                  <th>Status</th>
                  <th>Acties</th>
                </tr>
              </thead>
              <tbody>
                {protocollen.map((protocol) => (
                  <tr key={protocol.id}>
                    <td>
                      <strong>{protocol.naam}</strong>
                    </td>
                    <td>{protocol.aandoening}</td>
                    <td>{protocol.klanten}</td>
                    <td>
                      <span className={`dashboard-badge dashboard-badge--${protocol.status.toLowerCase()}`}>
                        {protocol.status}
                      </span>
                    </td>
                    <td>
                      <div className="dashboard-actions">
                        <button className="dashboard-action-btn" title="Bekijken">
                          <Heart size={16} />
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
    </div>
  );
}

