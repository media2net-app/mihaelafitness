import { notFound } from "next/navigation";
import { findClient } from "@/lib/clients";
import { neumannDashboardData, rimatoDashboardData } from "@/lib/dashboard-data";
import { Edit, Calendar, Eye, Plus, Mail, Phone, Target } from "lucide-react";
import Link from "next/link";

type ClientsPageProps = {
  params: Promise<{ client: string }> | { client: string };
};

export default async function ClientsPage({ params }: ClientsPageProps) {
  const resolvedParams = await Promise.resolve(params);
  const client = findClient(resolvedParams.client);

  if (!client) {
    notFound();
  }

  // Neumann: bestaande klantenweergave
  if (client.id === "neumann") {
    const allClients = [
    ...neumannDashboardData.clients,
    {
      id: "5",
      name: "Sarah de Vries",
      email: "sarah@example.nl",
      phone: "06-56789012",
      status: "Actief",
      goal: "Afvallen & conditie opbouwen",
      startDate: "2024-10-01",
      nextSession: "2024-12-21",
      type: "Duo Training",
      sessionsCompleted: 10,
      totalSessions: 20,
      progress: 50,
      package: "Duo pakket",
      value: 1200,
    },
    {
      id: "6",
      name: "Mark Jansen",
      email: "mark@example.nl",
      phone: "06-67890123",
      status: "Actief",
      goal: "Spieropbouw & kracht",
      startDate: "2024-09-15",
      nextSession: "2024-12-22",
      type: "1-op-1 Training",
      sessionsCompleted: 15,
      totalSessions: 30,
      progress: 50,
      package: "Performance pakket",
      value: 1950,
    },
    {
      id: "7",
      name: "Emma Bakker",
      email: "emma@example.nl",
      phone: "06-78901234",
      status: "Voltooid",
      goal: "Revalidatie schouderblessure",
      startDate: "2024-05-01",
      nextSession: null,
      type: "1-op-1 Training",
      sessionsCompleted: 20,
      totalSessions: 20,
      progress: 100,
      package: "Revalidatie pakket",
      value: 1300,
    },
    ];

    const stats = {
    total: allClients.length,
    active: allClients.filter((c) => c.status === "Actief").length,
    completed: allClients.filter((c) => c.status === "Voltooid").length,
    totalValue: allClients.reduce((sum, c) => sum + c.value, 0),
    avgProgress: Math.round(
      allClients.reduce((sum, c) => sum + c.progress, 0) / allClients.length
    ),
    };

    return (
    <div className="page-admin">
      <div className="page-header">
        <h1>Klanten & Trajecten</h1>
        <button className="btn btn--primary">
          <Plus size={16} />
          Nieuwe Klant
        </button>
      </div>

      {/* Stats Cards */}
      <div className="page-stats">
        <div className="page-stat-card">
          <h3>{stats.total}</h3>
          <p>Totaal Klanten</p>
        </div>
        <div className="page-stat-card page-stat-card--active">
          <h3>{stats.active}</h3>
          <p>Actief</p>
        </div>
        <div className="page-stat-card page-stat-card--completed">
          <h3>{stats.completed}</h3>
          <p>Voltooid</p>
        </div>
        <div className="page-stat-card">
          <h3>{stats.avgProgress}%</h3>
          <p>Gem. Voortgang</p>
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
          <option>Actief</option>
          <option>Voltooid</option>
        </select>
        <select className="page-filter">
          <option>Alle types</option>
          <option>1-op-1 Training</option>
          <option>Duo Training</option>
          <option>Online coaching</option>
        </select>
        <select className="page-filter">
          <option>Alle pakketten</option>
          <option>Revalidatie pakket</option>
          <option>Performance pakket</option>
          <option>Online pakket</option>
          <option>Duo pakket</option>
        </select>
        <input
          type="search"
          placeholder="Zoek klanten..."
          className="page-search"
        />
      </div>

      {/* Clients Cards Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
        gap: '1.5rem' 
      }}>
        {allClients.map((clientItem) => (
          <Link
            key={clientItem.id}
            href={`/clients/${client.id}/clients/${clientItem.id}`}
            style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
          >
            <div 
              className="dashboard-card dashboard-card--hoverable"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                cursor: 'pointer',
                position: 'relative',
              }}
            >
            {/* Card Header */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'flex-start',
              paddingBottom: '1rem',
              borderBottom: '1px solid var(--client-border)'
            }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: 600, 
                  margin: 0,
                  marginBottom: '0.25rem'
                }}>
                  {clientItem.name}
                </h3>
                <span className={`dashboard-badge dashboard-badge--${clientItem.status.toLowerCase()}`}>
                  {clientItem.status}
                </span>
              </div>
              <div className="dashboard-actions">
                <button 
                  className="dashboard-action-btn" 
                  title="Bewerken"
                  type="button"
                >
                  <Edit size={16} />
                </button>
                <button 
                  className="dashboard-action-btn" 
                  title="Agenda"
                  type="button"
                >
                  <Calendar size={16} />
                </button>
              </div>
            </div>

            {/* Contact Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                <Mail size={14} style={{ color: '#64748b' }} />
                <a href={`mailto:${clientItem.email}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                  {clientItem.email}
                </a>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                <Phone size={14} style={{ color: '#64748b' }} />
                <span>{clientItem.phone}</span>
              </div>
            </div>

            {/* Goal */}
            <div style={{ 
              padding: '0.75rem', 
              background: 'var(--client-surface)', 
              borderRadius: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <Target size={16} style={{ color: 'var(--client-brand)' }} />
              <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{clientItem.goal}</span>
            </div>

            {/* Progress Bar */}
            <div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '0.5rem'
              }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#64748b' }}>
                  Voortgang
                </span>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                  {clientItem.progress}%
                </span>
              </div>
              <div className="dashboard-progress" style={{ height: '8px' }}>
                <div 
                  className="dashboard-progress__bar" 
                  style={{ 
                    width: `${clientItem.progress}%`,
                    height: '100%'
                  }}
                ></div>
              </div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                marginTop: '0.5rem',
                fontSize: '0.85rem',
                color: '#64748b'
              }}>
                <span>{clientItem.sessionsCompleted} van {clientItem.totalSessions} sessies voltooid</span>
                <span>{clientItem.totalSessions - clientItem.sessionsCompleted} resterend</span>
              </div>
            </div>

            {/* Stats Grid */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(2, 1fr)', 
              gap: '0.75rem',
              marginTop: '0.5rem'
            }}>
              <div style={{
                padding: '0.75rem',
                background: 'var(--client-surface)',
                borderRadius: '0.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.25rem'
              }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Type</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{clientItem.type}</span>
              </div>
              <div style={{
                padding: '0.75rem',
                background: 'var(--client-surface)',
                borderRadius: '0.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.25rem'
              }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Pakket</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{clientItem.package}</span>
              </div>
            </div>

            {/* Footer Info */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: '1rem',
              borderTop: '1px solid var(--client-border)',
              marginTop: 'auto'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Startdatum</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>
                  {new Date(clientItem.startDate).toLocaleDateString("nl-NL")}
                </span>
              </div>
              {clientItem.nextSession && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', textAlign: 'right' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Volgende sessie</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--client-brand)' }}>
                    {new Date(clientItem.nextSession).toLocaleDateString("nl-NL")}
                  </span>
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', textAlign: 'right' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Waarde</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--client-brand)' }}>
                  €{clientItem.value.toLocaleString("nl-NL")}
                </span>
              </div>
            </div>
          </div>
          </Link>
        ))}
      </div>
    </div>
    );
  }

  // Rimato: CRM-overzicht met klantdata
  if (client.id === "rimato") {
    const allClients = rimatoDashboardData.clients || [];

    const stats = {
      total: allClients.length,
      active: allClients.filter((c) => c.status === "Actief").length,
      totalProjects: allClients.reduce((sum, c) => sum + c.totalProjects, 0),
      totalValue: allClients.reduce((sum, c) => sum + c.totalValue, 0),
    };

    return (
      <div className="page-admin">
        <div className="page-header">
          <div>
            <h1>Klanten CRM</h1>
            <p style={{ color: "#64748b", marginTop: "0.5rem" }}>
              360° klantprofielen, contract- en locatiebeheer
            </p>
          </div>
          <button className="btn btn--primary">
            <Plus size={16} />
            Nieuwe Klant
          </button>
        </div>

        {/* Stats Cards */}
        <div className="page-stats">
          <div className="page-stat-card">
            <h3>{stats.total}</h3>
            <p>Totaal Klanten</p>
          </div>
          <div className="page-stat-card page-stat-card--active">
            <h3>{stats.active}</h3>
            <p>Actief</p>
          </div>
          <div className="page-stat-card">
            <h3>{stats.totalProjects}</h3>
            <p>Totaal Projecten</p>
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
            <option>Actief</option>
            <option>Inactief</option>
          </select>
          <select className="page-filter">
            <option>Alle types</option>
            <option>Industrieel</option>
            <option>Overheid</option>
            <option>Commercieel</option>
          </select>
          <input
            type="search"
            placeholder="Zoek klanten..."
            className="page-search"
          />
        </div>

        {/* Clients Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
          gap: '1.5rem' 
        }}>
          {allClients.map((clientItem) => (
            <Link
              key={clientItem.id}
              href={`/clients/${client.id}/clients/${clientItem.id}`}
              className="dashboard-card dashboard-card--hoverable"
              style={{ 
                textDecoration: 'none', 
                color: 'inherit', 
                display: 'block',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }}
              aria-label={`Bekijk klant ${clientItem.name}`}
            >
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start',
                paddingBottom: '1rem',
                borderBottom: '1px solid var(--client-border)'
              }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ 
                    fontSize: '1.25rem', 
                    fontWeight: 600, 
                    margin: 0,
                    marginBottom: '0.25rem'
                  }}>
                    {clientItem.name}
                  </h3>
                  <span className={`dashboard-badge dashboard-badge--${clientItem.status.toLowerCase()}`}>
                    {clientItem.status}
                  </span>
                </div>
                <div className="dashboard-actions">
                  <button 
                    className="dashboard-action-btn" 
                    title="Bewerken"
                    type="button"
                  >
                    <Edit size={16} />
                  </button>
                </div>
              </div>

              {/* Contact Info */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                  <Mail size={14} style={{ color: '#64748b' }} />
                  <a 
                    href={`mailto:${clientItem.email}`} 
                    style={{ color: 'inherit', textDecoration: 'none' }}
                  >
                    {clientItem.email}
                  </a>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                  <Phone size={14} style={{ color: '#64748b' }} />
                  <span>{clientItem.phone}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                  <span style={{ color: '#64748b' }}>Contact:</span>
                  <span>{clientItem.contact}</span>
                </div>
              </div>

              {/* Stats Grid */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(2, 1fr)', 
                gap: '0.75rem',
                marginTop: '1rem'
              }}>
                <div style={{
                  padding: '0.75rem',
                  background: 'var(--client-surface)',
                  borderRadius: '0.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.25rem'
                }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Type</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{clientItem.type}</span>
                </div>
                <div style={{
                  padding: '0.75rem',
                  background: 'var(--client-surface)',
                  borderRadius: '0.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.25rem'
                }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Projecten</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{clientItem.totalProjects}</span>
                </div>
              </div>

              {/* Footer Info */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '1rem',
                borderTop: '1px solid var(--client-border)',
                marginTop: '1rem'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Laatste contact</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>
                    {new Date(clientItem.lastContact).toLocaleDateString("nl-NL")}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', textAlign: 'right' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Waarde</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--client-brand)' }}>
                    €{clientItem.totalValue.toLocaleString("nl-NL")}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  // Andere clients: placeholder
  return (
    <div className="page-admin">
      <div className="page-header">
        <div>
          <h1>CRM</h1>
          <p style={{ color: "#64748b", marginTop: "0.5rem" }}>
            360° klantprofielen, contract- en locatiebeheer
          </p>
        </div>
      </div>
      <div className="dashboard-card">
        <h2>Overzicht</h2>
        <p style={{ color: "#64748b" }}>
          Deze module toont straks klantdossiers, contracten en locaties.
        </p>
      </div>
    </div>
  );
}

