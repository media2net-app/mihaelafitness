import { notFound } from "next/navigation";
import { findClient } from "@/lib/clients";
import { Sparkles, Users, Phone, TrendingUp, Plus, Bot, Funnel, Calendar, Mail, MessageSquare, Zap, Target } from "lucide-react";

type LeadsAIPageProps = {
  params: Promise<{ client: string }> | { client: string };
};

export default async function LeadsAIPage({ params }: LeadsAIPageProps) {
  const resolvedParams = await Promise.resolve(params);
  const client = findClient(resolvedParams.client);

  if (!client || client.id !== "neumann") {
    notFound();
  }

  const leads = [
    {
      id: "1",
      naam: "Jan de Vries",
      email: "jan@example.nl",
      telefoon: "06-12345678",
      bron: "Instagram Ad",
      status: "Nieuw",
      score: 85,
      interesse: "Gewichtsverlies",
      aangemaakt: "2024-12-18",
      laatsteActiviteit: "2024-12-18",
    },
    {
      id: "2",
      naam: "Lisa Jansen",
      email: "lisa@example.nl",
      telefoon: "06-23456789",
      bron: "Google Ads",
      status: "In Funnel",
      score: 72,
      interesse: "Spiermassa opbouw",
      aangemaakt: "2024-12-17",
      laatsteActiviteit: "2024-12-18",
    },
    {
      id: "3",
      naam: "Mark Bakker",
      email: "mark@example.nl",
      telefoon: "06-34567890",
      bron: "Facebook Ad",
      status: "Call Gepland",
      score: 90,
      interesse: "Revalidatie",
      aangemaakt: "2024-12-16",
      laatsteActiviteit: "2024-12-18",
      callDatum: "2024-12-20",
    },
    {
      id: "4",
      naam: "Emma Smit",
      email: "emma@example.nl",
      telefoon: "06-45678901",
      bron: "LinkedIn",
      status: "Call Gepland",
      score: 78,
      interesse: "Personal Training",
      aangemaakt: "2024-12-15",
      laatsteActiviteit: "2024-12-17",
      callDatum: "2024-12-19",
    },
    {
      id: "5",
      naam: "Tom de Boer",
      email: "tom@example.nl",
      telefoon: "06-56789012",
      bron: "Website Formulier",
      status: "Nieuw",
      score: 65,
      interesse: "Online Coaching",
      aangemaakt: "2024-12-18",
      laatsteActiviteit: "2024-12-18",
    },
  ];

  const funnels = [
    {
      id: "1",
      naam: "Instagram Gewichtsverlies Funnel",
      status: "Actief",
      leads: 45,
      conversie: 12,
      conversieRate: 26.7,
      laatsteUpdate: "2024-12-18",
    },
    {
      id: "2",
      naam: "Google Ads Revalidatie Funnel",
      status: "Actief",
      leads: 28,
      conversie: 8,
      conversieRate: 28.6,
      laatsteUpdate: "2024-12-17",
    },
    {
      id: "3",
      naam: "Facebook Spiermassa Funnel",
      status: "In Activering",
      leads: 0,
      conversie: 0,
      conversieRate: 0,
      laatsteUpdate: "2024-12-15",
    },
  ];

  const automatiseringen = [
    {
      id: "1",
      naam: "Welkomst E-mail",
      type: "E-mail",
      trigger: "Nieuwe lead",
      status: "Actief",
      verzonden: 156,
    },
    {
      id: "2",
      naam: "Follow-up na 3 dagen",
      type: "E-mail",
      trigger: "Geen reactie",
      status: "Actief",
      verzonden: 89,
    },
    {
      id: "3",
      naam: "Call Reminder",
      type: "SMS",
      trigger: "24u voor call",
      status: "Actief",
      verzonden: 34,
    },
    {
      id: "4",
      naam: "AI Lead Scoring",
      type: "AI",
      trigger: "Automatisch",
      status: "Actief",
      verzonden: 0,
    },
  ];

  const stats = {
    totaalLeads: leads.length,
    nieuweLeads: leads.filter((l) => l.status === "Nieuw").length,
    inFunnel: leads.filter((l) => l.status === "In Funnel").length,
    callsGepland: leads.filter((l) => l.status === "Call Gepland").length,
    gemiddeldeScore: Math.round(leads.reduce((sum, l) => sum + l.score, 0) / leads.length),
  };

  return (
    <div className="page-admin">
      <div className="page-header">
        <div>
          <h1>Leads AI</h1>
          <p style={{ color: '#64748b', marginTop: '0.5rem' }}>
            AI-gestuurde lead generatie en automatische funnel beheer
          </p>
        </div>
        <button className="btn btn--primary">
          <Plus size={16} />
          Nieuwe Lead
        </button>
      </div>

      {/* Stats Cards */}
      <div className="page-stats">
        <div className="page-stat-card">
          <h3>{stats.totaalLeads}</h3>
          <p>Totaal Leads</p>
        </div>
        <div className="page-stat-card page-stat-card--active">
          <h3>{stats.nieuweLeads}</h3>
          <p>Nieuwe Leads</p>
        </div>
        <div className="page-stat-card">
          <h3>{stats.inFunnel}</h3>
          <p>In Funnel</p>
        </div>
        <div className="page-stat-card page-stat-card--primary">
          <h3>{stats.callsGepland}</h3>
          <p>Calls Gepland</p>
        </div>
        <div className="page-stat-card">
          <h3>{stats.gemiddeldeScore}</h3>
          <p>Gem. Lead Score</p>
        </div>
      </div>

      {/* Funnels Overview */}
      <div className="page-section">
        <div className="page-card">
          <div className="dashboard-card__header">
            <h2>Actieve Funnels</h2>
            <button className="btn btn--secondary">
              <Plus size={16} />
              Nieuwe Funnel
            </button>
          </div>
          <div className="dashboard-services-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
            {funnels.map((funnel) => (
              <div key={funnel.id} className="dashboard-service-card">
                <div className="dashboard-service-card__icon">
                  <Funnel size={24} />
                </div>
                <h4>{funnel.naam}</h4>
                <div className="dashboard-service-card__stats">
                  <div>
                    <span className="dashboard-service-card__value">{funnel.leads}</span>
                    <span className="dashboard-service-card__label">Leads</span>
                  </div>
                  <div>
                    <span className="dashboard-service-card__value">{funnel.conversie}</span>
                    <span className="dashboard-service-card__label">Conversies</span>
                  </div>
                  <div>
                    <span className="dashboard-service-card__value">{funnel.conversieRate}%</span>
                    <span className="dashboard-service-card__label">Conversie Rate</span>
                  </div>
                </div>
                <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className={`dashboard-badge dashboard-badge--${funnel.status.toLowerCase().replace(" ", "-")}`}>
                    {funnel.status}
                  </span>
                  <button className="dashboard-action-btn" title="Bekijken">
                    <Funnel size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Leads Table */}
      <div className="page-section">
        <div className="page-card">
          <div className="dashboard-card__header">
            <h2>Leads Overzicht</h2>
            <div className="page-filters" style={{ marginTop: '1rem' }}>
              <select className="page-filter">
                <option>Alle statussen</option>
                <option>Nieuw</option>
                <option>In Funnel</option>
                <option>Call Gepland</option>
              </select>
              <select className="page-filter">
                <option>Alle bronnen</option>
                <option>Instagram Ad</option>
                <option>Google Ads</option>
                <option>Facebook Ad</option>
                <option>LinkedIn</option>
                <option>Website Formulier</option>
              </select>
              <input
                type="search"
                placeholder="Zoek leads..."
                className="page-search"
              />
            </div>
          </div>
          <div className="dashboard-table">
            <table>
              <thead>
                <tr>
                  <th>Lead</th>
                  <th>Contact</th>
                  <th>Bron</th>
                  <th>Interesse</th>
                  <th>Lead Score</th>
                  <th>Status</th>
                  <th>Call Datum</th>
                  <th>Acties</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id}>
                    <td>
                      <strong>{lead.naam}</strong>
                      <span className="dashboard-table__meta">
                        {new Date(lead.aangemaakt).toLocaleDateString("nl-NL")}
                      </span>
                    </td>
                    <td>
                      <div>{lead.email}</div>
                      <span className="dashboard-table__meta">{lead.telefoon}</span>
                    </td>
                    <td>
                      <span className="dashboard-table__type">{lead.bron}</span>
                    </td>
                    <td>{lead.interesse}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div className="dashboard-progress" style={{ flex: 1 }}>
                          <div className="dashboard-progress__bar" style={{ width: `${lead.score}%` }}></div>
                        </div>
                        <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{lead.score}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`dashboard-badge dashboard-badge--${lead.status.toLowerCase().replace(" ", "-")}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td>
                      {lead.callDatum ? (
                        <strong>{new Date(lead.callDatum).toLocaleDateString("nl-NL")}</strong>
                      ) : (
                        <span style={{ color: '#94a3b8' }}>-</span>
                      )}
                    </td>
                    <td>
                      <div className="dashboard-actions">
                        {lead.status !== "Call Gepland" && (
                          <button className="dashboard-action-btn" title="Call Plannen">
                            <Calendar size={16} />
                          </button>
                        )}
                        <button className="dashboard-action-btn" title="E-mailen">
                          <Mail size={16} />
                        </button>
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

      {/* Automatiseringen */}
      <div className="page-section">
        <div className="page-card">
          <div className="dashboard-card__header">
            <h2>Automatiseringen</h2>
            <button className="btn btn--secondary">
              <Plus size={16} />
              Nieuwe Automatisering
            </button>
          </div>
          <div className="dashboard-table">
            <table>
              <thead>
                <tr>
                  <th>Naam</th>
                  <th>Type</th>
                  <th>Trigger</th>
                  <th>Status</th>
                  <th>Verzonden</th>
                  <th>Acties</th>
                </tr>
              </thead>
              <tbody>
                {automatiseringen.map((auto) => (
                  <tr key={auto.id}>
                    <td>
                      <strong>{auto.naam}</strong>
                    </td>
                    <td>
                      <span className="dashboard-table__type">
                        {auto.type === "AI" && <Bot size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />}
                        {auto.type === "E-mail" && <Mail size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />}
                        {auto.type === "SMS" && <MessageSquare size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />}
                        {auto.type}
                      </span>
                    </td>
                    <td>{auto.trigger}</td>
                    <td>
                      <span className={`dashboard-badge dashboard-badge--${auto.status.toLowerCase()}`}>
                        {auto.status}
                      </span>
                    </td>
                    <td>{auto.verzonden}</td>
                    <td>
                      <div className="dashboard-actions">
                        <button className="dashboard-action-btn" title="Bewerken">
                          <Zap size={16} />
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

      {/* AI Insights */}
      <div className="page-section">
        <div className="page-card dashboard-card--primary">
          <div className="dashboard-card__header">
            <h2 style={{ color: '#ffffff' }}>AI Insights</h2>
            <Sparkles size={24} style={{ color: '#ffffff' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginTop: '1rem' }}>
            <div>
              <h3 style={{ color: '#ffffff', marginBottom: '0.5rem' }}>Beste Tijdstip voor Calls</h3>
              <p style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Woensdag 14:00-16:00 heeft de hoogste conversie rate (34%)</p>
            </div>
            <div>
              <h3 style={{ color: '#ffffff', marginBottom: '0.5rem' }}>Top Lead Bron</h3>
              <p style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Instagram Ads genereert de hoogste kwaliteit leads (gem. score: 82)</p>
            </div>
            <div>
              <h3 style={{ color: '#ffffff', marginBottom: '0.5rem' }}>AI Aanbeveling</h3>
              <p style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Verhoog budget voor Google Ads Revalidatie funnel met 25%</p>
            </div>
            <div>
              <h3 style={{ color: '#ffffff', marginBottom: '0.5rem' }}>Volgende Actie</h3>
              <p style={{ color: 'rgba(255, 255, 255, 0.9)' }}>3 leads wachten op follow-up e-mail (verzend binnen 24u)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}




