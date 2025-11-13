import { notFound } from "next/navigation";
import { findClient } from "@/lib/clients";
import { Euro, Calendar, FileText, TrendingUp, Clock, CheckCircle2 } from "lucide-react";

type OntwikkelingskostenPageProps = {
  params: Promise<{ client: string }> | { client: string };
};

export default async function OntwikkelingskostenPage({ params }: OntwikkelingskostenPageProps) {
  const resolvedParams = await Promise.resolve(params);
  const client = findClient(resolvedParams.client);

  if (!client || client.id !== "neumann") {
    notFound();
  }

  // Dummy data voor ontwikkelingskosten
  const kostenOverzicht = {
    totaal: 12500,
    dezeMaand: 3200,
    vorigeMaand: 2800,
    groei: 14.3,
    gemiddeldPerMaand: 2950,
  };

  const kostenItems = [
    {
      id: "1",
      datum: "2024-12-15",
      omschrijving: "Dashboard ontwikkeling - Mobile responsive",
      uren: 8,
      tarief: 75,
      totaal: 600,
      status: "Betaald",
      factuurnummer: "FAC-2024-001",
    },
    {
      id: "2",
      datum: "2024-12-10",
      omschrijving: "Agenda functionaliteit - Weekoverzicht",
      uren: 6,
      tarief: 75,
      totaal: 450,
      status: "Betaald",
      factuurnummer: "FAC-2024-002",
    },
    {
      id: "3",
      datum: "2024-12-05",
      omschrijving: "Voedingsplan module - AI generator",
      uren: 12,
      tarief: 75,
      totaal: 900,
      status: "Openstaand",
      factuurnummer: "FAC-2024-003",
    },
    {
      id: "4",
      datum: "2024-11-28",
      omschrijving: "Client detail pagina's",
      uren: 4,
      tarief: 75,
      totaal: 300,
      status: "Betaald",
      factuurnummer: "FAC-2024-004",
    },
    {
      id: "5",
      datum: "2024-11-20",
      omschrijving: "Landing page - Dark mode design",
      uren: 10,
      tarief: 75,
      totaal: 750,
      status: "Betaald",
      factuurnummer: "FAC-2024-005",
    },
    {
      id: "6",
      datum: "2024-11-15",
      omschrijving: "Login systeem & authenticatie",
      uren: 5,
      tarief: 75,
      totaal: 375,
      status: "Betaald",
      factuurnummer: "FAC-2024-006",
    },
  ];

  const maandelijkseKosten = [
    { maand: "December 2024", totaal: 1950, uren: 26, status: "Gedeeltelijk betaald" },
    { maand: "November 2024", totaal: 1425, uren: 19, status: "Betaald" },
    { maand: "Oktober 2024", totaal: 2250, uren: 30, status: "Betaald" },
    { maand: "September 2024", totaal: 1800, uren: 24, status: "Betaald" },
  ];

  return (
    <div className="page-admin">
      <div className="page-header">
        <div>
          <h1>Ontwikkelingskosten</h1>
          <p style={{ color: "#64748b", marginTop: "0.5rem" }}>
            Overzicht van ontwikkelingskosten en facturering
          </p>
        </div>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <button className="btn btn--primary">
            <FileText size={16} />
            Nieuwe Factuur
          </button>
          <button className="btn btn--secondary">
            <Calendar size={16} />
            Rapportage
          </button>
        </div>
      </div>

      {/* Overzicht Cards */}
      <div className="dashboard-metrics" style={{ marginBottom: "2rem" }}>
        <div className="dashboard-metric-card">
          <div className="dashboard-metric__icon">
            <Euro size={32} />
          </div>
          <div className="dashboard-metric__content">
            <h3>€{kostenOverzicht.totaal.toLocaleString("nl-NL")}</h3>
            <p>Totaal kosten</p>
            <span className="dashboard-metric__sub">Alle tijd</span>
          </div>
        </div>
        <div className="dashboard-metric-card">
          <div className="dashboard-metric__icon">
            <Calendar size={32} />
          </div>
          <div className="dashboard-metric__content">
            <h3>€{kostenOverzicht.dezeMaand.toLocaleString("nl-NL")}</h3>
            <p>Deze maand</p>
            <span className="dashboard-metric__sub">December 2024</span>
          </div>
        </div>
        <div className="dashboard-metric-card dashboard-metric-card--primary">
          <div className="dashboard-metric__icon">
            <TrendingUp size={32} />
          </div>
          <div className="dashboard-metric__content">
            <h3>+{kostenOverzicht.groei}%</h3>
            <p>Groei</p>
            <span className="dashboard-metric__sub">vs vorige maand</span>
          </div>
        </div>
        <div className="dashboard-metric-card">
          <div className="dashboard-metric__icon">
            <Clock size={32} />
          </div>
          <div className="dashboard-metric__content">
            <h3>€{kostenOverzicht.gemiddeldPerMaand.toLocaleString("nl-NL")}</h3>
            <p>Gemiddeld/maand</p>
            <span className="dashboard-metric__sub">Laatste 6 maanden</span>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Kosten Items Tabel */}
        <section className="dashboard-card dashboard-card--large">
          <div className="dashboard-card__header">
            <h2>Kosten Items</h2>
            <a href="#" className="dashboard-card__link">
              Bekijk alle →
            </a>
          </div>
          <div className="dashboard-table">
            <table>
              <thead>
                <tr>
                  <th>Datum</th>
                  <th>Omschrijving</th>
                  <th>Uren</th>
                  <th>Tarief</th>
                  <th>Totaal</th>
                  <th>Status</th>
                  <th>Factuur</th>
                </tr>
              </thead>
              <tbody>
                {kostenItems.map((item) => (
                  <tr key={item.id}>
                    <td>
                      {new Date(item.datum).toLocaleDateString("nl-NL", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td>
                      <strong>{item.omschrijving}</strong>
                    </td>
                    <td>{item.uren} uur</td>
                    <td>€{item.tarief}/uur</td>
                    <td>
                      <strong>€{item.totaal.toLocaleString("nl-NL")}</strong>
                    </td>
                    <td>
                      <span
                        className={`dashboard-badge dashboard-badge--${
                          item.status === "Betaald" ? "actief" : "gepland"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td>
                      <a
                        href="#"
                        style={{
                          color: "var(--client-brand)",
                          textDecoration: "none",
                          fontSize: "0.875rem",
                        }}
                      >
                        {item.factuurnummer}
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Maandelijkse Overzichten */}
        <section className="dashboard-card">
          <div className="dashboard-card__header">
            <h2>Maandelijkse Overzichten</h2>
          </div>
          <div className="dashboard-list">
            {maandelijkseKosten.map((maand, index) => (
              <div key={index} className="dashboard-list__item">
                <div className="dashboard-list__main">
                  <h4>{maand.maand}</h4>
                  <p>
                    {maand.uren} uren ontwikkeld • €{maand.totaal.toLocaleString("nl-NL")} totaal
                  </p>
                  <span className="dashboard-list__meta">{maand.status}</span>
                </div>
                <div className="dashboard-list__side">
                  <div className="dashboard-list__stats">
                    <span className="dashboard-list__stat-value">
                      €{maand.totaal.toLocaleString("nl-NL")}
                    </span>
                    <span className="dashboard-list__stat-label">Totaal</span>
                  </div>
                  <CheckCircle2
                    size={20}
                    style={{
                      color: maand.status === "Betaald" ? "#22c55e" : "#f59e0b",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Samenvatting */}
        <section className="dashboard-card dashboard-card--primary">
          <h2>Financieel Overzicht</h2>
          <div className="dashboard-finance">
            <div className="dashboard-finance__item">
              <span className="dashboard-finance__label">Totaal betaald</span>
              <span className="dashboard-finance__value">
                €{kostenItems
                  .filter((i) => i.status === "Betaald")
                  .reduce((sum, i) => sum + i.totaal, 0)
                  .toLocaleString("nl-NL")}
              </span>
            </div>
            <div className="dashboard-finance__item">
              <span className="dashboard-finance__label">Openstaand</span>
              <span className="dashboard-finance__value">
                €{kostenItems
                  .filter((i) => i.status === "Openstaand")
                  .reduce((sum, i) => sum + i.totaal, 0)
                  .toLocaleString("nl-NL")}
              </span>
            </div>
            <div className="dashboard-finance__item">
              <span className="dashboard-finance__label">Totaal uren</span>
              <span className="dashboard-finance__value">
                {kostenItems.reduce((sum, i) => sum + i.uren, 0)} uur
              </span>
            </div>
            <div className="dashboard-finance__growth">
              <TrendingUp size={16} />
              <span>Gemiddeld €{Math.round(kostenOverzicht.gemiddeldPerMaand)}/maand</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

