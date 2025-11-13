import { notFound } from "next/navigation";
import { findClient } from "@/lib/clients";
import { Target, TrendingDown, TrendingUp, Edit, ArrowLeft, Plus, Calendar, Award, Camera } from "lucide-react";
import Link from "next/link";

type DoelDetailPageProps = {
  params: Promise<{ client: string; doelId: string }> | { client: string; doelId: string };
};

export default async function DoelDetailPage({ params }: DoelDetailPageProps) {
  const resolvedParams = await Promise.resolve(params);
  const client = findClient(resolvedParams.client);

  if (!client || client.id !== "neumann") {
    notFound();
  }

  // Mock doel data
  const doel = {
    id: resolvedParams.doelId,
    klant: "Marijn Besseler",
    doel: "Gewichtsverlies",
    startgewicht: 85,
    doelgewicht: 75,
    huidigGewicht: 78,
    voortgang: 70,
    startdatum: "2024-09-01",
    doelDatum: "2024-12-31",
    status: "Lopend",
  };

  const metingen = [
    { datum: "2024-09-01", gewicht: 85, vetpercentage: 28, spierMassa: 55 },
    { datum: "2024-09-15", gewicht: 83, vetpercentage: 27, spierMassa: 55.5 },
    { datum: "2024-10-01", gewicht: 81, vetpercentage: 26, spierMassa: 56 },
    { datum: "2024-10-15", gewicht: 80, vetpercentage: 25.5, spierMassa: 56.5 },
    { datum: "2024-11-01", gewicht: 79, vetpercentage: 25, spierMassa: 57 },
    { datum: "2024-11-15", gewicht: 78.5, vetpercentage: 24.5, spierMassa: 57.5 },
    { datum: "2024-12-01", gewicht: 78, vetpercentage: 24, spierMassa: 58 },
  ];

  const milestones = [
    { id: "1", naam: "Eerste 5kg verloren", datum: "2024-10-15", behaald: true },
    { id: "2", naam: "10kg verloren", datum: "2024-12-31", behaald: false },
    { id: "3", naam: "Vetpercentage onder 25%", datum: "2024-12-01", behaald: true },
  ];

  const foto = [
    { type: "Voor", datum: "2024-09-01", beschrijving: "Start foto" },
    { type: "Tussentijds", datum: "2024-11-01", beschrijving: "Na 2 maanden" },
    { type: "Tussentijds", datum: "2024-12-01", beschrijving: "Na 3 maanden" },
  ];

  const bodyMeasurements = [
    { locatie: "Borst", start: 105, huidig: 98, verschil: -7 },
    { locatie: "Taille", start: 95, huidig: 85, verschil: -10 },
    { locatie: "Heup", start: 105, huidig: 98, verschil: -7 },
    { locatie: "Dij", start: 65, huidig: 60, verschil: -5 },
  ];

  const gewichtsVerlies = doel.startgewicht - doel.huidigGewicht;
  const nogTeGaan = doel.huidigGewicht - doel.doelgewicht;
  const dagenOver = Math.ceil((new Date(doel.doelDatum).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="page-admin">
      <div className="page-header">
        <div>
          <Link href={`/${client.id}/doelen`} className="dashboard-card__link" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <ArrowLeft size={16} />
            Terug naar Doelen & Trajecten
          </Link>
          <h1>{doel.klant} - {doel.doel}</h1>
          <p style={{ color: '#64748b', marginTop: '0.5rem' }}>
            Van {doel.startgewicht}kg naar {doel.doelgewicht}kg • {doel.voortgang}% voltooid
          </p>
        </div>
        <button className="btn btn--primary">
          <Edit size={16} />
          Bewerken
        </button>
      </div>

      {/* Stats Cards */}
      <div className="page-stats">
        <div className="page-stat-card">
          <h3>{doel.huidigGewicht} kg</h3>
          <p>Huidig Gewicht</p>
        </div>
        <div className="page-stat-card">
          <h3>{doel.doelgewicht} kg</h3>
          <p>Doel Gewicht</p>
        </div>
        <div className="page-stat-card page-stat-card--active">
          <h3>{gewichtsVerlies} kg</h3>
          <p>Verloren</p>
        </div>
        <div className="page-stat-card">
          <h3>{nogTeGaan} kg</h3>
          <p>Nog Te Gaan</p>
        </div>
        <div className="page-stat-card">
          <h3>{doel.voortgang}%</h3>
          <p>Voortgang</p>
        </div>
      </div>

      {/* Voortgang Overzicht */}
      <div className="page-section">
        <div className="page-card">
          <div className="dashboard-card__header">
            <h2>Gewicht Voortgang</h2>
            <button className="btn btn--secondary">
              <Plus size={16} />
              Meting Toevoegen
            </button>
          </div>
          <div className="dashboard-table">
            <table>
              <thead>
                <tr>
                  <th>Datum</th>
                  <th>Gewicht</th>
                  <th>Vetpercentage</th>
                  <th>Spier Massa</th>
                  <th>Verandering</th>
                </tr>
              </thead>
              <tbody>
                {metingen.map((meting, index) => {
                  const vorigeMeting = index > 0 ? metingen[index - 1] : null;
                  const verschil = vorigeMeting ? meting.gewicht - vorigeMeting.gewicht : 0;
                  return (
                    <tr key={index}>
                      <td>{new Date(meting.datum).toLocaleDateString("nl-NL")}</td>
                      <td><strong>{meting.gewicht} kg</strong></td>
                      <td>{meting.vetpercentage}%</td>
                      <td>{meting.spierMassa} kg</td>
                      <td>
                        {verschil !== 0 && (
                          <span className={`dashboard-badge ${verschil < 0 ? 'dashboard-badge--voltooid' : 'dashboard-badge--actief'}`}>
                            {verschil > 0 ? '+' : ''}{verschil.toFixed(1)} kg
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Body Measurements */}
      <div className="page-section">
        <div className="page-card">
          <div className="dashboard-card__header">
            <h2>Body Measurements</h2>
            <button className="btn btn--secondary">
              <Plus size={16} />
              Meting Toevoegen
            </button>
          </div>
          <div className="dashboard-table">
            <table>
              <thead>
                <tr>
                  <th>Locatie</th>
                  <th>Start (cm)</th>
                  <th>Huidig (cm)</th>
                  <th>Verschil</th>
                </tr>
              </thead>
              <tbody>
                {bodyMeasurements.map((measurement, index) => (
                  <tr key={index}>
                    <td><strong>{measurement.locatie}</strong></td>
                    <td>{measurement.start} cm</td>
                    <td>{measurement.huidig} cm</td>
                    <td>
                      <span className="dashboard-badge dashboard-badge--voltooid">
                        {measurement.verschil < 0 ? '' : '+'}{measurement.verschil} cm
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Milestones */}
      <div className="page-section">
        <div className="page-card">
          <div className="dashboard-card__header">
            <h2>Milestones</h2>
            <button className="btn btn--secondary">
              <Plus size={16} />
              Milestone Toevoegen
            </button>
          </div>
          <div className="dashboard-list">
            {milestones.map((milestone) => (
              <div key={milestone.id} className="dashboard-list__item">
                <div className="dashboard-list__main">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {milestone.behaald ? (
                      <Award size={20} style={{ color: '#16a34a' }} />
                    ) : (
                      <Target size={20} style={{ color: '#64748b' }} />
                    )}
                    <h4>{milestone.naam}</h4>
                  </div>
                  <span className="dashboard-list__meta">{new Date(milestone.datum).toLocaleDateString("nl-NL")}</span>
                </div>
                <div className="dashboard-list__side">
                  {milestone.behaald ? (
                    <span className="dashboard-badge dashboard-badge--voltooid">Behaald</span>
                  ) : (
                    <span className="dashboard-badge dashboard-badge--gepland">In uitvoering</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Foto's */}
      <div className="page-section">
        <div className="page-card">
          <div className="dashboard-card__header">
            <h2>Foto's</h2>
            <button className="btn btn--secondary">
              <Plus size={16} />
              Foto Toevoegen
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            {foto.map((fotoItem, index) => (
              <div key={index} style={{ padding: '1rem', background: 'var(--client-surface)', borderRadius: '0.75rem', border: '1px solid var(--client-border)', textAlign: 'center' }}>
                <Camera size={48} style={{ color: '#94a3b8', marginBottom: '0.5rem' }} />
                <p><strong>{fotoItem.type}</strong></p>
                <p className="dashboard-table__meta">{new Date(fotoItem.datum).toLocaleDateString("nl-NL")}</p>
                <p className="dashboard-table__meta" style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>{fotoItem.beschrijving}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}




