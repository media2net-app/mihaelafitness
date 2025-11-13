import { notFound } from "next/navigation";
import { findClient } from "@/lib/clients";
import { Heart, Activity, FileText, Edit, ArrowLeft, Plus, Calendar, AlertCircle } from "lucide-react";
import Link from "next/link";

type TrajectDetailPageProps = {
  params: Promise<{ client: string; trajectId: string }> | { client: string; trajectId: string };
};

export default async function TrajectDetailPage({ params }: TrajectDetailPageProps) {
  const resolvedParams = await Promise.resolve(params);
  const client = findClient(resolvedParams.client);

  if (!client || client.id !== "neumann") {
    notFound();
  }

  // Mock traject data
  const traject = {
    id: resolvedParams.trajectId,
    klant: "Marijn Besseler",
    aandoening: "Knieblessure",
    type: "Revalidatie",
    startdatum: "2024-10-01",
    voortgang: 75,
    sessies: 15,
    totaalSessies: 20,
    status: "Lopend",
    beschrijving: "Revalidatie traject na knieblessure. Focus op geleidelijke opbouw van kracht en mobiliteit.",
  };

  const fases = [
    {
      fase: "Acute Fase",
      status: "Voltooid",
      duur: "2 weken",
      oefeningen: ["Passieve mobilisatie", "IJs therapie", "Rust"],
      doelen: ["Pijn verminderen", "Zwelling reduceren"],
    },
    {
      fase: "Herstel Fase",
      status: "Lopend",
      duur: "4 weken",
      oefeningen: ["Quad sets", "Hamstring curls", "Calf raises"],
      doelen: ["Kracht opbouwen", "Mobiliteit verbeteren"],
    },
    {
      fase: "Preventie Fase",
      status: "Gepland",
      duur: "6 weken",
      oefeningen: ["Squats", "Lunges", "Plyometrie"],
      doelen: ["Volledige functie", "Preventie herhaling"],
    },
  ];

  const pijnLogboek = [
    { datum: "2024-12-15", pijnScore: 2, opmerking: "Minder pijn na oefeningen" },
    { datum: "2024-12-10", pijnScore: 4, opmerking: "Meer pijn na intensieve training" },
    { datum: "2024-12-05", pijnScore: 3, opmerking: "Stabiel" },
  ];

  const evaluaties = [
    { datum: "2024-11-15", type: "Tussentijds", resultaat: "Goede voortgang, pijn verminderd" },
    { datum: "2024-10-15", type: "Start", resultaat: "Beperkte mobiliteit, start revalidatie" },
  ];

  return (
    <div className="page-admin">
      <div className="page-header">
        <div>
          <Link href={`/${client.id}/revalidatie`} className="dashboard-card__link" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <ArrowLeft size={16} />
            Terug naar Revalidatie & Preventie
          </Link>
          <h1>{traject.klant} - {traject.aandoening}</h1>
          <p style={{ color: '#64748b', marginTop: '0.5rem' }}>{traject.beschrijving}</p>
        </div>
        <button className="btn btn--primary">
          <Edit size={16} />
          Bewerken
        </button>
      </div>

      {/* Stats Cards */}
      <div className="page-stats">
        <div className="page-stat-card">
          <h3>{traject.sessies}/{traject.totaalSessies}</h3>
          <p>Sessies</p>
        </div>
        <div className="page-stat-card page-stat-card--active">
          <h3>{traject.voortgang}%</h3>
          <p>Voortgang</p>
        </div>
        <div className="page-stat-card">
          <h3>{traject.type}</h3>
          <p>Type</p>
        </div>
        <div className="page-stat-card">
          <h3>{new Date(traject.startdatum).toLocaleDateString("nl-NL", { month: "short", year: "numeric" })}</h3>
          <p>Gestart</p>
        </div>
      </div>

      {/* Traject Fases */}
      <div className="page-section">
        <div className="page-card">
          <div className="dashboard-card__header">
            <h2>Traject Fases</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {fases.map((faseData, index) => (
              <div key={index} style={{ padding: '1.5rem', background: 'var(--client-surface)', borderRadius: '0.75rem', border: '1px solid var(--client-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{faseData.fase}</h3>
                    <span className="dashboard-table__meta">{faseData.duur}</span>
                  </div>
                  <span className={`dashboard-badge dashboard-badge--${faseData.status.toLowerCase()}`}>
                    {faseData.status}
                  </span>
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <strong>Doelen:</strong>
                  <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                    {faseData.doelen.map((doel, idx) => (
                      <li key={idx}>{doel}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <strong>Oefeningen:</strong>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                    {faseData.oefeningen.map((oefening, idx) => (
                      <span key={idx} className="dashboard-badge dashboard-badge--actief">{oefening}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pijn Logboek */}
      <div className="page-section">
        <div className="page-card">
          <div className="dashboard-card__header">
            <h2>Pijn Logboek</h2>
            <button className="btn btn--secondary">
              <Plus size={16} />
              Toevoegen
            </button>
          </div>
          <div className="dashboard-table">
            <table>
              <thead>
                <tr>
                  <th>Datum</th>
                  <th>Pijn Score</th>
                  <th>Opmerking</th>
                </tr>
              </thead>
              <tbody>
                {pijnLogboek.map((entry, index) => (
                  <tr key={index}>
                    <td>{new Date(entry.datum).toLocaleDateString("nl-NL")}</td>
                    <td>
                      <span className={`dashboard-badge ${entry.pijnScore <= 2 ? 'dashboard-badge--voltooid' : entry.pijnScore <= 4 ? 'dashboard-badge--actief' : 'dashboard-badge--critical'}`}>
                        {entry.pijnScore}/10
                      </span>
                    </td>
                    <td>{entry.opmerking}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Evaluaties */}
      <div className="page-section">
        <div className="page-card">
          <div className="dashboard-card__header">
            <h2>Evaluaties ({evaluaties.length})</h2>
            <button className="btn btn--secondary">
              <Plus size={16} />
              Evaluatie Toevoegen
            </button>
          </div>
          <div className="dashboard-list">
            {evaluaties.map((evaluatie, index) => (
              <div key={index} className="dashboard-list__item">
                <div className="dashboard-list__main">
                  <h4>{evaluatie.type} Evaluatie</h4>
                  <p>{evaluatie.resultaat}</p>
                  <span className="dashboard-list__meta">{new Date(evaluatie.datum).toLocaleDateString("nl-NL")}</span>
                </div>
                <div className="dashboard-list__side">
                  <div className="dashboard-actions">
                    <button className="dashboard-action-btn" title="Bekijken">
                      <FileText size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}




