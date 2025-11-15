import { notFound } from "next/navigation";
import { findClient } from "@/lib/clients";
import { Target, TrendingDown, TrendingUp, Users, Plus } from "lucide-react";
import Link from "next/link";

type DoelenPageProps = {
  params: Promise<{ client: string }> | { client: string };
};

export default async function DoelenPage({ params }: DoelenPageProps) {
  const resolvedParams = await Promise.resolve(params);
  const client = findClient(resolvedParams.client);

  if (!client || client.id !== "neumann") {
    notFound();
  }

  const doelen = [
    {
      id: "1",
      klant: "Marijn Besseler",
      doel: "Gewichtsverlies",
      startgewicht: 85,
      doelgewicht: 75,
      huidigGewicht: 78,
      voortgang: 70,
      startdatum: "2024-09-01",
      status: "Lopend",
    },
    {
      id: "2",
      klant: "Erwin Altena",
      doel: "Spiermassa Opbouw",
      startgewicht: 70,
      doelgewicht: 78,
      huidigGewicht: 75,
      voortgang: 62,
      startdatum: "2024-08-15",
      status: "Lopend",
    },
    {
      id: "3",
      klant: "Sarah de Vries",
      doel: "Gewichtsverlies",
      startgewicht: 92,
      doelgewicht: 80,
      huidigGewicht: 80,
      voortgang: 100,
      startdatum: "2024-06-01",
      status: "Voltooid",
    },
    {
      id: "4",
      klant: "Kristel Kwant",
      doel: "Spiermassa Opbouw",
      startgewicht: 58,
      doelgewicht: 65,
      huidigGewicht: 61,
      voortgang: 43,
      startdatum: "2024-10-01",
      status: "Lopend",
    },
  ];

  const trajecten = [
    {
      id: "1",
      naam: "12 Weken Afval Traject",
      type: "Gewichtsverlies",
      klanten: 8,
      gemiddeldeVoortgang: 65,
      status: "Actief",
    },
    {
      id: "2",
      naam: "16 Weken Bulk Traject",
      type: "Spiermassa",
      klanten: 5,
      gemiddeldeVoortgang: 52,
      status: "Actief",
    },
    {
      id: "3",
      naam: "8 Weken Quick Start",
      type: "Gewichtsverlies",
      klanten: 12,
      gemiddeldeVoortgang: 78,
      status: "Actief",
    },
  ];

  const stats = {
    totaalDoelen: doelen.length,
    lopendeDoelen: doelen.filter((d) => d.status === "Lopend").length,
    voltooideDoelen: doelen.filter((d) => d.status === "Voltooid").length,
    gemiddeldeVoortgang: Math.round(
      doelen.reduce((sum, d) => sum + d.voortgang, 0) / doelen.length
    ),
  };

  return (
    <div className="page-admin">
      <div className="page-header">
        <h1>Doelen & Trajecten</h1>
        <button className="btn btn--primary">
          <Plus size={16} />
          Nieuw Doel
        </button>
      </div>

      {/* Stats Cards */}
      <div className="page-stats">
        <div className="page-stat-card">
          <h3>{stats.totaalDoelen}</h3>
          <p>Totaal Doelen</p>
        </div>
        <div className="page-stat-card page-stat-card--active">
          <h3>{stats.lopendeDoelen}</h3>
          <p>Lopend</p>
        </div>
        <div className="page-stat-card page-stat-card--completed">
          <h3>{stats.voltooideDoelen}</h3>
          <p>Voltooid</p>
        </div>
        <div className="page-stat-card">
          <h3>{stats.gemiddeldeVoortgang}%</h3>
          <p>Gem. Voortgang</p>
        </div>
      </div>

      {/* Individuele Doelen */}
      <div className="page-section">
        <h2 className="page-section__title">Individuele Doelen</h2>
        <div className="page-card">
          <div className="dashboard-table">
            <table>
              <thead>
                <tr>
                  <th>Klant</th>
                  <th>Doel</th>
                  <th>Startgewicht</th>
                  <th>Doelgewicht</th>
                  <th>Huidig Gewicht</th>
                  <th>Voortgang</th>
                  <th>Status</th>
                  <th>Acties</th>
                </tr>
              </thead>
              <tbody>
                {doelen.map((doel) => (
                  <tr key={doel.id} className="dashboard-table__row--clickable">
                    <td>
                      <Link href={`/clients/${client.id}/doelen/${doel.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                        <strong>{doel.klant}</strong>
                      </Link>
                    </td>
                    <td>
                      <Link href={`/clients/${client.id}/doelen/${doel.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                        <span className="dashboard-table__type">{doel.doel}</span>
                      </Link>
                    </td>
                    <td>
                      <Link href={`/clients/${client.id}/doelen/${doel.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                        {doel.startgewicht} kg
                      </Link>
                    </td>
                    <td>
                      <Link href={`/clients/${client.id}/doelen/${doel.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                        {doel.doelgewicht} kg
                      </Link>
                    </td>
                    <td>
                      <Link href={`/clients/${client.id}/doelen/${doel.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                        <strong>{doel.huidigGewicht} kg</strong>
                      </Link>
                    </td>
                    <td>
                      <Link href={`/clients/${client.id}/doelen/${doel.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                        <div className="dashboard-progress">
                          <div className="dashboard-progress__bar" style={{ width: `${doel.voortgang}%` }}></div>
                          <span>{doel.voortgang}%</span>
                        </div>
                      </Link>
                    </td>
                    <td>
                      <Link href={`/clients/${client.id}/doelen/${doel.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                        <span className={`dashboard-badge dashboard-badge--${doel.status.toLowerCase()}`}>
                          {doel.status}
                        </span>
                      </Link>
                    </td>
                    <td>
                      <div className="dashboard-actions">
                        <Link href={`/clients/${client.id}/doelen/${doel.id}`} className="dashboard-action-btn" title="Bekijken">
                          {doel.doel === "Gewichtsverlies" ? (
                            <TrendingDown size={16} />
                          ) : (
                            <TrendingUp size={16} />
                          )}
                        </Link>
                        <button className="dashboard-action-btn" title="Bewerken">
                          <Target size={16} />
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

      {/* Trajecten */}
      <div className="page-section">
        <h2 className="page-section__title">Standaard Trajecten</h2>
        <div className="page-card">
          <div className="dashboard-table">
            <table>
              <thead>
                <tr>
                  <th>Traject</th>
                  <th>Type</th>
                  <th>Klanten</th>
                  <th>Gem. Voortgang</th>
                  <th>Status</th>
                  <th>Acties</th>
                </tr>
              </thead>
              <tbody>
                {trajecten.map((traject) => (
                  <tr key={traject.id}>
                    <td>
                      <strong>{traject.naam}</strong>
                    </td>
                    <td>
                      <span className="dashboard-table__type">{traject.type}</span>
                    </td>
                    <td>{traject.klanten}</td>
                    <td>
                      <div className="dashboard-progress">
                        <div className="dashboard-progress__bar" style={{ width: `${traject.gemiddeldeVoortgang}%` }}></div>
                        <span>{traject.gemiddeldeVoortgang}%</span>
                      </div>
                    </td>
                    <td>
                      <span className={`dashboard-badge dashboard-badge--${traject.status.toLowerCase()}`}>
                        {traject.status}
                      </span>
                    </td>
                    <td>
                      <div className="dashboard-actions">
                        <button className="dashboard-action-btn" title="Bekijken">
                          <Users size={16} />
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

