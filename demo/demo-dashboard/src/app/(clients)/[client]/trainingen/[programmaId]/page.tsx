import { notFound } from "next/navigation";
import { findClient } from "@/lib/clients";
import { Dumbbell, Calendar, Users, Edit, ArrowLeft, Plus, Activity, Clock } from "lucide-react";
import Link from "next/link";

type ProgrammaDetailPageProps = {
  params: Promise<{ client: string; programmaId: string }> | { client: string; programmaId: string };
};

export default async function ProgrammaDetailPage({ params }: ProgrammaDetailPageProps) {
  const resolvedParams = await Promise.resolve(params);
  const client = findClient(resolvedParams.client);

  if (!client || client.id !== "neumann") {
    notFound();
  }

  // Mock programma data
  const programma = {
    id: resolvedParams.programmaId,
    naam: "Functionele Training Basis",
    type: "Functioneel",
    duur: "8 weken",
    klanten: 8,
    sessies: 16,
    status: "Actief",
    beschrijving: "Een uitgebreid programma gericht op functionele bewegingen en algehele fitheid. Perfect voor beginners die willen starten met krachttraining.",
  };

  const weekSchema = [
    {
      week: 1,
      dagen: [
        { dag: "Maandag", oefeningen: ["Squats", "Push-ups", "Plank"], sets: 3, reps: "10-12" },
        { dag: "Woensdag", oefeningen: ["Deadlifts", "Rows", "Lunges"], sets: 3, reps: "8-10" },
        { dag: "Vrijdag", oefeningen: ["Overhead Press", "Pull-ups", "Core"], sets: 3, reps: "10-12" },
      ],
    },
    {
      week: 2,
      dagen: [
        { dag: "Maandag", oefeningen: ["Squats", "Push-ups", "Plank"], sets: 3, reps: "12-15" },
        { dag: "Woensdag", oefeningen: ["Deadlifts", "Rows", "Lunges"], sets: 3, reps: "10-12" },
        { dag: "Vrijdag", oefeningen: ["Overhead Press", "Pull-ups", "Core"], sets: 3, reps: "12-15" },
      ],
    },
  ];

  const progressie = [
    { week: 1, focus: "Techniek aanleren", intensiteit: "Laag" },
    { week: 2, focus: "Techniek verbeteren", intensiteit: "Laag-Middel" },
    { week: 3, focus: "Volume verhogen", intensiteit: "Middel" },
    { week: 4, focus: "Intensiteit verhogen", intensiteit: "Middel-Hoog" },
  ];

  const actieveKlanten = [
    { id: "1", naam: "Marijn Besseler", startdatum: "2024-11-01", voortgang: 50, volgendeSessie: "2024-12-20" },
    { id: "2", naam: "Erwin Altena", startdatum: "2024-10-15", voortgang: 75, volgendeSessie: "2024-12-19" },
    { id: "3", naam: "Sarah de Vries", startdatum: "2024-11-10", voortgang: 25, volgendeSessie: "2024-12-21" },
  ];

  return (
    <div className="page-admin">
      <div className="page-header">
        <div>
          <Link href={`/${client.id}/trainingen`} className="dashboard-card__link" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <ArrowLeft size={16} />
            Terug naar Training Programma's
          </Link>
          <h1>{programma.naam}</h1>
          <p style={{ color: '#64748b', marginTop: '0.5rem' }}>{programma.beschrijving}</p>
        </div>
        <button className="btn btn--primary">
          <Edit size={16} />
          Bewerken
        </button>
      </div>

      {/* Stats Cards */}
      <div className="page-stats">
        <div className="page-stat-card">
          <h3>{programma.duur}</h3>
          <p>Duur</p>
        </div>
        <div className="page-stat-card">
          <h3>{programma.sessies}</h3>
          <p>Totaal Sessies</p>
        </div>
        <div className="page-stat-card page-stat-card--active">
          <h3>{programma.klanten}</h3>
          <p>Actieve Klanten</p>
        </div>
        <div className="page-stat-card">
          <h3>{programma.type}</h3>
          <p>Type</p>
        </div>
      </div>

      {/* Week Schema's */}
      <div className="page-section">
        <div className="page-card">
          <div className="dashboard-card__header">
            <h2>Week Schema's</h2>
            <button className="btn btn--secondary">
              <Plus size={16} />
              Week Toevoegen
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {weekSchema.map((weekData) => (
              <div key={weekData.week} style={{ padding: '1.5rem', background: 'var(--client-surface)', borderRadius: '0.75rem', border: '1px solid var(--client-border)' }}>
                <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Week {weekData.week}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {weekData.dagen.map((dag, index) => (
                    <div key={index} style={{ padding: '1rem', background: 'white', borderRadius: '0.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                        <strong>{dag.dag}</strong>
                        <span className="dashboard-table__meta">{dag.sets} sets × {dag.reps} reps</span>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {dag.oefeningen.map((oefening, idx) => (
                          <span key={idx} className="dashboard-badge dashboard-badge--actief">{oefening}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Progressie Schema */}
      <div className="page-section">
        <div className="page-card">
          <div className="dashboard-card__header">
            <h2>Progressie Schema</h2>
          </div>
          <div className="dashboard-table">
            <table>
              <thead>
                <tr>
                  <th>Week</th>
                  <th>Focus</th>
                  <th>Intensiteit</th>
                </tr>
              </thead>
              <tbody>
                {progressie.map((prog, index) => (
                  <tr key={index}>
                    <td><strong>Week {prog.week}</strong></td>
                    <td>{prog.focus}</td>
                    <td>
                      <span className="dashboard-badge dashboard-badge--actief">{prog.intensiteit}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Actieve Klanten */}
      <div className="page-section">
        <div className="page-card">
          <div className="dashboard-card__header">
            <h2>Actieve Klanten ({actieveKlanten.length})</h2>
          </div>
          <div className="dashboard-table">
            <table>
              <thead>
                <tr>
                  <th>Klant</th>
                  <th>Startdatum</th>
                  <th>Voortgang</th>
                  <th>Volgende Sessie</th>
                  <th>Acties</th>
                </tr>
              </thead>
              <tbody>
                {actieveKlanten.map((klant) => (
                  <tr key={klant.id}>
                    <td><strong>{klant.naam}</strong></td>
                    <td>{new Date(klant.startdatum).toLocaleDateString("nl-NL")}</td>
                    <td>
                      <div className="dashboard-progress">
                        <div className="dashboard-progress__bar" style={{ width: `${klant.voortgang}%` }}></div>
                        <span>{klant.voortgang}%</span>
                      </div>
                    </td>
                    <td>{new Date(klant.volgendeSessie).toLocaleDateString("nl-NL")}</td>
                    <td>
                      <div className="dashboard-actions">
                        <button className="dashboard-action-btn" title="Bekijken">
                          <Users size={16} />
                        </button>
                        <button className="dashboard-action-btn" title="Sessie">
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




