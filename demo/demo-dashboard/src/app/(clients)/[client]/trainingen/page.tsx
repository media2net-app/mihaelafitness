import { notFound } from "next/navigation";
import { findClient } from "@/lib/clients";
import { Dumbbell, Users, Activity, Calendar, Plus } from "lucide-react";
import Link from "next/link";

type TrainingenPageProps = {
  params: Promise<{ client: string }> | { client: string };
};

export default async function TrainingenPage({ params }: TrainingenPageProps) {
  const resolvedParams = await Promise.resolve(params);
  const client = findClient(resolvedParams.client);

  if (!client || client.id !== "neumann") {
    notFound();
  }

  const programma = [
    {
      id: "1",
      naam: "Functionele Training Basis",
      type: "Functioneel",
      duur: "8 weken",
      klanten: 8,
      sessies: 16,
      status: "Actief",
    },
    {
      id: "2",
      naam: "Kracht & Stabiliteit Gevorderd",
      type: "Kracht",
      duur: "12 weken",
      klanten: 5,
      sessies: 24,
      status: "Actief",
    },
    {
      id: "3",
      naam: "Small Group Training - Beginners",
      type: "Groep",
      duur: "6 weken",
      klanten: 12,
      sessies: 12,
      status: "Actief",
    },
    {
      id: "4",
      naam: "HIIT & Cardio Intensief",
      type: "Cardio",
      duur: "4 weken",
      klanten: 6,
      sessies: 8,
      status: "In ontwikkeling",
    },
  ];

  const sessies = [
    {
      id: "1",
      programma: "Functionele Training Basis",
      datum: "2024-12-20",
      tijd: "09:00",
      type: "1-op-1",
      klant: "Marijn Besseler",
      status: "Gepland",
    },
    {
      id: "2",
      programma: "Small Group Training",
      datum: "2024-12-20",
      tijd: "18:00",
      type: "Groep",
      klant: "Groep van 4",
      status: "Gepland",
    },
    {
      id: "3",
      programma: "Kracht & Stabiliteit",
      datum: "2024-12-19",
      tijd: "14:00",
      type: "1-op-1",
      klant: "Erwin Altena",
      status: "Voltooid",
    },
  ];

  const stats = {
    totalProgramma: programma.length,
    actieveKlanten: programma.reduce((sum, p) => sum + p.klanten, 0),
    komendeSessies: sessies.filter((s) => s.status === "Gepland").length,
  };

  return (
    <div className="page-admin">
      <div className="page-header">
        <h1>Training Programma's</h1>
        <button className="btn btn--primary">
          <Plus size={16} />
          Nieuw Programma
        </button>
      </div>

      {/* Stats Cards */}
      <div className="page-stats">
        <div className="page-stat-card">
          <h3>{stats.totalProgramma}</h3>
          <p>Programma's</p>
        </div>
        <div className="page-stat-card page-stat-card--active">
          <h3>{stats.actieveKlanten}</h3>
          <p>Actieve Klanten</p>
        </div>
        <div className="page-stat-card">
          <h3>{stats.komendeSessies}</h3>
          <p>Komende Sessies</p>
        </div>
      </div>

      {/* Programma's */}
      <div className="page-section">
        <h2 className="page-section__title">Training Programma's</h2>
        <div className="page-card">
          <div className="dashboard-table">
            <table>
              <thead>
                <tr>
                  <th>Programma</th>
                  <th>Type</th>
                  <th>Duur</th>
                  <th>Klanten</th>
                  <th>Sessies</th>
                  <th>Status</th>
                  <th>Acties</th>
                </tr>
              </thead>
              <tbody>
                {programma.map((prog) => (
                  <tr key={prog.id} className="dashboard-table__row--clickable">
                    <td>
                      <Link href={`/${client.id}/trainingen/${prog.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                        <strong>{prog.naam}</strong>
                      </Link>
                    </td>
                    <td>
                      <Link href={`/${client.id}/trainingen/${prog.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                        <span className="dashboard-table__type">{prog.type}</span>
                      </Link>
                    </td>
                    <td>
                      <Link href={`/${client.id}/trainingen/${prog.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                        {prog.duur}
                      </Link>
                    </td>
                    <td>
                      <Link href={`/${client.id}/trainingen/${prog.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                        {prog.klanten}
                      </Link>
                    </td>
                    <td>
                      <Link href={`/${client.id}/trainingen/${prog.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                        {prog.sessies}
                      </Link>
                    </td>
                    <td>
                      <Link href={`/${client.id}/trainingen/${prog.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                        <span className={`dashboard-badge dashboard-badge--${prog.status.toLowerCase().replace(" ", "-")}`}>
                          {prog.status}
                        </span>
                      </Link>
                    </td>
                    <td>
                      <div className="dashboard-actions">
                        <Link href={`/${client.id}/trainingen/${prog.id}`} className="dashboard-action-btn" title="Bekijken">
                          <Activity size={16} />
                        </Link>
                        <button className="dashboard-action-btn" title="Bewerken">
                          <Dumbbell size={16} />
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

      {/* Komende Sessies */}
      <div className="page-section">
        <h2 className="page-section__title">Komende Training Sessies</h2>
        <div className="page-card">
          <div className="dashboard-table">
            <table>
              <thead>
                <tr>
                  <th>Programma</th>
                  <th>Datum & Tijd</th>
                  <th>Type</th>
                  <th>Klant</th>
                  <th>Status</th>
                  <th>Acties</th>
                </tr>
              </thead>
              <tbody>
                {sessies.map((sessie) => (
                  <tr key={sessie.id}>
                    <td>
                      <strong>{sessie.programma}</strong>
                    </td>
                    <td>
                      {new Date(sessie.datum).toLocaleDateString("nl-NL")} • {sessie.tijd}
                    </td>
                    <td>
                      <span className="dashboard-table__type">{sessie.type}</span>
                    </td>
                    <td>{sessie.klant}</td>
                    <td>
                      <span className={`dashboard-badge dashboard-badge--${sessie.status.toLowerCase()}`}>
                        {sessie.status}
                      </span>
                    </td>
                    <td>
                      <div className="dashboard-actions">
                        <button className="dashboard-action-btn" title="Bekijken">
                          <Calendar size={16} />
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

