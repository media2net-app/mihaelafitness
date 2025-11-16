import { notFound } from "next/navigation";
import { findClient, listClients, type ClientConfig } from "@/lib/clients";
import { rimatoDashboardData, neumannDashboardData, vulcanDashboardData } from "@/lib/dashboard-data";
import { BarChart3, Users, Euro, CheckCircle2, Star, TrendingUp, Factory, Droplets, Building2, Home, Users2, Trees, Laptop, Hospital, UserCog, User, MapPin, Clock, Wrench, Zap, ClipboardList } from "lucide-react";
import type React from "react";

type DashboardPageProps = {
  params: Promise<{ client: string }> | { client: string };
};

export function generateStaticParams() {
  return listClients().map((client) => ({ client: client.id }));
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const resolvedParams = await Promise.resolve(params);
  const client = findClient(resolvedParams.client);

  if (!client) {
    notFound();
  }

  // Rimato Admin Dashboard
  if (client.id === "rimato") {
    const data = rimatoDashboardData;
    
    return (
      <div className="dashboard-admin">
        {/* Key Metrics - Extended */}
        <div className="dashboard-metrics" style={{ gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
          <div className="dashboard-metric-card">
            <div className="dashboard-metric__icon">
              <BarChart3 size={32} />
            </div>
            <div className="dashboard-metric__content">
              <h3>{data.stats.totalProjects}</h3>
              <p>Projecten</p>
              <span className="dashboard-metric__sub">{data.stats.activeProjects} actief</span>
            </div>
          </div>
          <div className="dashboard-metric-card">
            <div className="dashboard-metric__icon">
              <Users size={32} />
            </div>
            <div className="dashboard-metric__content">
              <h3>{data.stats.totalClients}</h3>
              <p>Klanten</p>
              <span className="dashboard-metric__sub">CRM</span>
            </div>
          </div>
          <div className="dashboard-metric-card dashboard-metric-card--primary">
            <div className="dashboard-metric__icon">
              <Euro size={32} />
            </div>
            <div className="dashboard-metric__content">
              <h3>€{data.stats.monthlyRevenue.toLocaleString("nl-NL")}</h3>
              <p>Maandomzet</p>
              <span className="dashboard-metric__sub">+{data.revenue.growth}% vs vorige maand</span>
            </div>
          </div>
          <div className="dashboard-metric-card">
            <div className="dashboard-metric__icon">
              <CheckCircle2 size={32} />
            </div>
            <div className="dashboard-metric__content">
              <h3>{data.stats.completionRate}%</h3>
              <p>Afrondpercentage</p>
              <span className="dashboard-metric__sub">Kwaliteit</span>
            </div>
          </div>
          <div className="dashboard-metric-card">
            <div className="dashboard-metric__icon">
              <Users size={32} />
            </div>
            <div className="dashboard-metric__content">
              <h3>{data.stats.teamMembers}</h3>
              <p>Medewerkers</p>
              <span className="dashboard-metric__sub">Team</span>
            </div>
          </div>
          <div className="dashboard-metric-card">
            <div className="dashboard-metric__icon">
              <TrendingUp size={32} />
            </div>
            <div className="dashboard-metric__content">
              <h3>€{data.revenue.thisYear.toLocaleString("nl-NL")}</h3>
              <p>Jaaromzet</p>
              <span className="dashboard-metric__sub">Totaal</span>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="dashboard-grid" style={{ gridTemplateColumns: "repeat(2, 1fr)", gap: "1.25rem" }}>
          {/* Module Cards - Grid Layout */}
          <a href={`/clients/${client.id}/leads`} className="dashboard-card dashboard-card--hoverable" style={{ textDecoration: "none", color: "inherit", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
              <div style={{ 
                padding: "1rem", 
                background: "rgba(237, 29, 36, 0.1)", 
                borderRadius: "0.75rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <BarChart3 size={32} style={{ color: "#ED1D24" }} />
              </div>
              <div style={{ flex: 1 }}>
                <h2 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 700 }}>Leads & Sales</h2>
                <p style={{ margin: "0.25rem 0 0", color: "#64748b", fontSize: "0.9rem" }}>Intake, offertes en pipeline</p>
              </div>
            </div>
            <div style={{ 
              padding: "1rem", 
              background: "rgba(237, 29, 36, 0.05)", 
              borderRadius: "0.5rem",
              marginTop: "auto"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.85rem", color: "#64748b" }}>3 actieve leads</span>
                <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#ED1D24" }}>Bekijk →</span>
              </div>
            </div>
          </a>

          <a href={`/clients/${client.id}/clients`} className="dashboard-card dashboard-card--hoverable" style={{ textDecoration: "none", color: "inherit", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
              <div style={{ 
                padding: "1rem", 
                background: "rgba(237, 29, 36, 0.1)", 
                borderRadius: "0.75rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <Users size={32} style={{ color: "#ED1D24" }} />
              </div>
              <div style={{ flex: 1 }}>
                <h2 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 700 }}>CRM</h2>
                <p style={{ margin: "0.25rem 0 0", color: "#64748b", fontSize: "0.9rem" }}>360° klantprofielen</p>
              </div>
            </div>
            <div style={{ 
              padding: "1rem", 
              background: "rgba(237, 29, 36, 0.05)", 
              borderRadius: "0.5rem",
              marginTop: "auto"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.85rem", color: "#64748b" }}>{data.stats.totalClients} klanten</span>
                <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#ED1D24" }}>Bekijk →</span>
              </div>
            </div>
          </a>

          <a href={`/clients/${client.id}/projects`} className="dashboard-card dashboard-card--hoverable" style={{ textDecoration: "none", color: "inherit", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
              <div style={{ 
                padding: "1rem", 
                background: "rgba(237, 29, 36, 0.1)", 
                borderRadius: "0.75rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <Wrench size={32} style={{ color: "#ED1D24" }} />
              </div>
              <div style={{ flex: 1 }}>
                <h2 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 700 }}>Projectbeheer</h2>
                <p style={{ margin: "0.25rem 0 0", color: "#64748b", fontSize: "0.9rem" }}>Planning & resources</p>
              </div>
            </div>
            <div style={{ 
              padding: "1rem", 
              background: "rgba(237, 29, 36, 0.05)", 
              borderRadius: "0.5rem",
              marginTop: "auto"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.85rem", color: "#64748b" }}>{data.stats.activeProjects} actief</span>
                <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#ED1D24" }}>Bekijk →</span>
              </div>
            </div>
          </a>

          <a href={`/clients/${client.id}/operations`} className="dashboard-card dashboard-card--hoverable" style={{ textDecoration: "none", color: "inherit", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
              <div style={{ 
                padding: "1rem", 
                background: "rgba(237, 29, 36, 0.1)", 
                borderRadius: "0.75rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <ClipboardList size={32} style={{ color: "#ED1D24" }} />
              </div>
              <div style={{ flex: 1 }}>
                <h2 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 700 }}>Operatie</h2>
                <p style={{ margin: "0.25rem 0 0", color: "#64748b", fontSize: "0.9rem" }}>Werkbonnen & LMRA</p>
              </div>
            </div>
            <div style={{ 
              padding: "1rem", 
              background: "rgba(237, 29, 36, 0.05)", 
              borderRadius: "0.5rem",
              marginTop: "auto"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.85rem", color: "#64748b" }}>Mobile app</span>
                <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#ED1D24" }}>Bekijk →</span>
              </div>
            </div>
          </a>

          <a href={`/clients/${client.id}/reports`} className="dashboard-card dashboard-card--hoverable" style={{ textDecoration: "none", color: "inherit", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
              <div style={{ 
                padding: "1rem", 
                background: "rgba(237, 29, 36, 0.1)", 
                borderRadius: "0.75rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <TrendingUp size={32} style={{ color: "#ED1D24" }} />
              </div>
              <div style={{ flex: 1 }}>
                <h2 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 700 }}>Rapportage</h2>
                <p style={{ margin: "0.25rem 0 0", color: "#64748b", fontSize: "0.9rem" }}>Financieel & compliance</p>
              </div>
            </div>
            <div style={{ 
              padding: "1rem", 
              background: "rgba(237, 29, 36, 0.05)", 
              borderRadius: "0.5rem",
              marginTop: "auto"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.85rem", color: "#64748b" }}>ISO & VCA**</span>
                <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#ED1D24" }}>Bekijk →</span>
              </div>
            </div>
          </a>
          {/* Projecten Overzicht - Card Grid */}
          <section className="dashboard-card" style={{ gridColumn: "span 2" }}>
            <div className="dashboard-card__header">
              <h2>Projecten Overzicht</h2>
              <a href={`/clients/${client.id}/projects`} className="dashboard-card__link">
                Bekijk alle →
              </a>
            </div>
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(2, 1fr)", 
              gap: "1rem" 
            }}>
              {data.recentProjects.map((project) => (
                <a 
                  key={project.id}
                  href={`/clients/${client.id}/projects/${project.id}`}
                  className="dashboard-card dashboard-card--hoverable"
                  style={{ 
                    textDecoration: "none", 
                    color: "inherit",
                    padding: "1.25rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.75rem"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: "0 0 0.5rem", fontSize: "1.1rem", fontWeight: 600 }}>{project.name}</h4>
                      <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748b" }}>{project.client}</p>
                    </div>
                    <span className={`dashboard-badge dashboard-badge--${project.status.toLowerCase()}`}>
                      {project.status}
                    </span>
                  </div>
                  <div style={{ 
                    padding: "0.75rem", 
                    background: "rgba(237, 29, 36, 0.05)", 
                    borderRadius: "0.5rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}>
                    <div>
                      <div style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: "0.25rem" }}>Voortgang</div>
                      <div className="dashboard-progress" style={{ height: "6px", marginBottom: "0.25rem" }}>
                        <div className="dashboard-progress__bar" style={{ width: `${project.progress}%` }}></div>
                      </div>
                      <div style={{ fontSize: "0.85rem", fontWeight: 600 }}>{project.progress}%</div>
                    </div>
                    <div style={{ textAlign: "right", minWidth: 0, flex: "0 0 auto" }}>
                      <div style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: "0.25rem" }}>Waarde</div>
                      <div style={{ fontSize: "clamp(0.875rem, 2vw, 1rem)", fontWeight: 700, color: "#ED1D24", wordBreak: "break-word", overflowWrap: "break-word" }}>
                        €{project.value.toLocaleString("nl-NL")}
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </section>

          {/* Klanten CRM - Card Grid */}
          <section className="dashboard-card">
            <div className="dashboard-card__header">
              <h2>Klanten CRM</h2>
              <a href={`/clients/${client.id}/clients`} className="dashboard-card__link">
                Bekijk alle →
              </a>
            </div>
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(2, 1fr)", 
              gap: "1rem" 
            }}>
              {data.clients.map((clientItem) => (
                <a 
                  key={clientItem.id}
                  href={`/clients/${client.id}/clients/${clientItem.id}`}
                  className="dashboard-card dashboard-card--hoverable"
                  style={{ 
                    textDecoration: "none", 
                    color: "inherit",
                    padding: "1.25rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.75rem"
                  }}
                >
                  <div>
                    <h4 style={{ margin: "0 0 0.5rem", fontSize: "1.1rem", fontWeight: 600 }}>{clientItem.name}</h4>
                    <p style={{ margin: "0 0 0.5rem", fontSize: "0.85rem", color: "#64748b" }}>{clientItem.contact}</p>
                    <span className={`dashboard-badge dashboard-badge--${clientItem.status.toLowerCase()}`}>
                      {clientItem.status}
                    </span>
                  </div>
                  <div style={{ 
                    padding: "0.75rem", 
                    background: "rgba(237, 29, 36, 0.05)", 
                    borderRadius: "0.5rem",
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "0.5rem",
                    marginTop: "auto"
                  }}>
                    <div>
                      <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Projecten</div>
                      <div style={{ fontSize: "1rem", fontWeight: 700 }}>{clientItem.totalProjects}</div>
                    </div>
                    <div style={{ minWidth: 0, overflow: "hidden" }}>
                      <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Waarde</div>
                      <div style={{ fontSize: "clamp(0.875rem, 2vw, 1rem)", fontWeight: 700, color: "#ED1D24", wordBreak: "break-word", overflowWrap: "break-word" }}>
                        €{clientItem.totalValue.toLocaleString("nl-NL")}
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </section>

          {/* Diensten Performance - Enhanced Cards */}
          <section className="dashboard-card" style={{ gridColumn: "span 2" }}>
            <div className="dashboard-card__header">
              <h2>Diensten Performance</h2>
            </div>
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(2, 1fr)", 
              gap: "1rem" 
            }}>
              {data.services.map((service) => {
                const iconMap: Record<string, React.ReactNode> = {
                  "1": <Factory size={32} />,
                  "2": <Droplets size={32} />,
                  "3": <Building2 size={32} />,
                };
                return (
                  <div 
                    key={service.id} 
                    className="dashboard-card dashboard-card--hoverable"
                    style={{ 
                      padding: "1.5rem",
                      display: "flex",
                      flexDirection: "column",
                      gap: "1rem"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                      <div style={{ 
                        padding: "1rem", 
                        background: "rgba(237, 29, 36, 0.1)", 
                        borderRadius: "0.75rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}>
                        {iconMap[service.id]}
                      </div>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 700 }}>{service.name}</h4>
                        <p style={{ margin: "0.25rem 0 0", fontSize: "0.85rem", color: "#64748b" }}>{service.description}</p>
                      </div>
                    </div>
                    <div style={{ 
                      display: "grid", 
                      gridTemplateColumns: "1fr 1fr", 
                      gap: "1rem",
                      padding: "1rem",
                      background: "rgba(237, 29, 36, 0.05)",
                      borderRadius: "0.5rem"
                    }}>
                      <div>
                        <div style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: "0.25rem" }}>Actieve projecten</div>
                        <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>{service.activeProjects}</div>
                      </div>
                      <div style={{ minWidth: 0, overflow: "hidden" }}>
                        <div style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: "0.25rem" }}>Maandomzet</div>
                        <div style={{ fontSize: "clamp(1rem, 3vw, 1.5rem)", fontWeight: 700, color: "#ED1D24", wordBreak: "break-word", overflowWrap: "break-word" }}>
                          €{service.monthlyRevenue.toLocaleString("nl-NL")}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Aankomende Taken - Card Grid */}
          <section className="dashboard-card">
            <div className="dashboard-card__header">
              <h2>Aankomende Taken</h2>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {data.upcomingTasks.map((task) => (
                <div 
                  key={task.id} 
                  className="dashboard-card dashboard-card--hoverable"
                  style={{ 
                    padding: "1rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: "0 0 0.25rem", fontSize: "1rem", fontWeight: 600 }}>{task.task}</h4>
                    <p style={{ margin: "0 0 0.5rem", fontSize: "0.85rem", color: "#64748b" }}>{task.project}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", color: "#64748b" }}>
                      <User size={14} />
                      <span>{task.assignedTo}</span>
                    </div>
                  </div>
                  <div style={{ 
                    padding: "0.75rem 1rem", 
                    background: "rgba(237, 29, 36, 0.1)", 
                    borderRadius: "0.5rem",
                    textAlign: "center",
                    minWidth: "60px"
                  }}>
                    <div style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: "0.25rem" }}>Deadline</div>
                    <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "#ED1D24" }}>
                      {new Date(task.dueDate).toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Financiën Overzicht - Enhanced Card */}
          <section className="dashboard-card dashboard-card--primary" style={{ gridColumn: "span 2" }}>
            <h2 style={{ margin: "0 0 1.5rem", fontSize: "1.75rem" }}>Financiën Overzicht</h2>
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", 
              gap: "1rem" 
            }}>
              <div style={{ 
                padding: "1.25rem", 
                background: "rgba(255, 255, 255, 0.15)", 
                borderRadius: "0.75rem",
                backdropFilter: "blur(10px)",
                minWidth: 0,
                overflow: "hidden"
              }}>
                <div style={{ fontSize: "0.85rem", opacity: 0.9, marginBottom: "0.5rem" }}>Deze maand</div>
                <div style={{ fontSize: "clamp(1.25rem, 4vw, 2rem)", fontWeight: 700, wordBreak: "break-word", overflowWrap: "break-word" }}>€{data.revenue.thisMonth.toLocaleString("nl-NL")}</div>
              </div>
              <div style={{ 
                padding: "1.25rem", 
                background: "rgba(255, 255, 255, 0.15)", 
                borderRadius: "0.75rem",
                backdropFilter: "blur(10px)",
                minWidth: 0,
                overflow: "hidden"
              }}>
                <div style={{ fontSize: "0.85rem", opacity: 0.9, marginBottom: "0.5rem" }}>Vorige maand</div>
                <div style={{ fontSize: "clamp(1.25rem, 4vw, 2rem)", fontWeight: 700, wordBreak: "break-word", overflowWrap: "break-word" }}>€{data.revenue.lastMonth.toLocaleString("nl-NL")}</div>
              </div>
              <div style={{ 
                padding: "1.25rem", 
                background: "rgba(255, 255, 255, 0.15)", 
                borderRadius: "0.75rem",
                backdropFilter: "blur(10px)",
                minWidth: 0,
                overflow: "hidden"
              }}>
                <div style={{ fontSize: "0.85rem", opacity: 0.9, marginBottom: "0.5rem" }}>Dit jaar</div>
                <div style={{ fontSize: "clamp(1.25rem, 4vw, 2rem)", fontWeight: 700, wordBreak: "break-word", overflowWrap: "break-word" }}>€{data.revenue.thisYear.toLocaleString("nl-NL")}</div>
              </div>
              <div style={{ 
                padding: "1.25rem", 
                background: "rgba(255, 255, 255, 0.2)", 
                borderRadius: "0.75rem",
                backdropFilter: "blur(10px)",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem"
              }}>
                <TrendingUp size={32} />
                <div>
                  <div style={{ fontSize: "0.85rem", opacity: 0.9, marginBottom: "0.25rem" }}>Groei</div>
                  <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>+{data.revenue.growth}%</div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    );
  }

  // Neumann Admin Dashboard
  if (client.id === "neumann") {
    const data = neumannDashboardData;
    
    return (
      <div className="dashboard-admin">
        {/* Key Metrics */}
        <div className="dashboard-metrics">
          <div className="dashboard-metric-card">
            <div className="dashboard-metric__icon">
              <Users size={32} />
            </div>
            <div className="dashboard-metric__content">
              <h3>{data.stats.totalClients}</h3>
              <p>Klanten</p>
              <span className="dashboard-metric__sub">{data.stats.activeClients} actief</span>
            </div>
          </div>
          <div className="dashboard-metric-card">
            <div className="dashboard-metric__icon">
              <UserCog size={32} />
            </div>
            <div className="dashboard-metric__content">
              <h3>{data.stats.totalSessions}</h3>
              <p>Sessies</p>
              <span className="dashboard-metric__sub">Dit jaar</span>
            </div>
          </div>
          <div className="dashboard-metric-card dashboard-metric-card--primary">
            <div className="dashboard-metric__icon">
              <Euro size={32} />
            </div>
            <div className="dashboard-metric__content">
              <h3>€{data.stats.monthlyRevenue.toLocaleString("nl-NL")}</h3>
              <p>Maandomzet</p>
              <span className="dashboard-metric__sub">+{data.revenue.growth}% vs vorige maand</span>
            </div>
          </div>
          <div className="dashboard-metric-card">
            <div className="dashboard-metric__icon">
              <Star size={32} />
            </div>
            <div className="dashboard-metric__content">
              <h3>{data.stats.satisfactionRate}</h3>
              <p>Tevredenheid</p>
              <span className="dashboard-metric__sub">Gemiddeld</span>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="dashboard-grid">
          {/* Klanten/Trajecten Overzicht */}
          <section className="dashboard-card dashboard-card--large">
            <div className="dashboard-card__header">
              <h2>Klanten & Trajecten</h2>
              <a href={`/clients/${client.id}/clients`} className="dashboard-card__link">
                Bekijk alle →
              </a>
            </div>
            <div className="dashboard-table">
              <table>
                <thead>
                  <tr>
                    <th>Klant</th>
                    <th>Doel</th>
                    <th>Status</th>
                    <th>Type</th>
                    <th>Voortgang</th>
                    <th>Waarde</th>
                  </tr>
                </thead>
                <tbody>
                  {data.clients.map((clientItem) => (
                    <tr key={clientItem.id}>
                      <td data-label="Klant">
                        <strong>{clientItem.name}</strong>
                        <span className="dashboard-table__meta">{clientItem.email}</span>
                      </td>
                      <td data-label="Doel">{clientItem.goal}</td>
                      <td data-label="Status">
                        <span className={`dashboard-badge dashboard-badge--${clientItem.status.toLowerCase()}`}>
                          {clientItem.status}
                        </span>
                      </td>
                      <td data-label="Type">{clientItem.type}</td>
                      <td data-label="Voortgang">
                        <div className="dashboard-progress">
                          <div className="dashboard-progress__bar" style={{ width: `${clientItem.progress}%` }}></div>
                          <span>{clientItem.progress}%</span>
                        </div>
                        <span className="dashboard-table__meta">{clientItem.sessionsCompleted}/{clientItem.totalSessions} sessies</span>
                      </td>
                      <td data-label="Waarde">€{clientItem.value.toLocaleString("nl-NL")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Aankomende Sessies */}
          <section className="dashboard-card">
            <div className="dashboard-card__header">
              <h2>Aankomende Sessies</h2>
              <a href={`/clients/${client.id}/schedule`} className="dashboard-card__link">
                Bekijk agenda →
              </a>
            </div>
            <div className="dashboard-sessions">
              {data.upcomingSessions.map((session) => (
                <div key={session.id} className="dashboard-session">
                  <div className="dashboard-session__date">
                    <span className="dashboard-session__day">{new Date(session.date).toLocaleDateString("nl-NL", { day: "numeric" })}</span>
                    <span className="dashboard-session__month">{new Date(session.date).toLocaleDateString("nl-NL", { month: "short" })}</span>
                  </div>
                  <div className="dashboard-session__content">
                    <h4>{session.client}</h4>
                    <p>{session.type}</p>
                    <span className="dashboard-session__meta">
                      <MapPin size={12} />
                      {session.location} • 
                      <Clock size={12} />
                      {session.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Diensten Performance */}
          <section className="dashboard-card">
            <div className="dashboard-card__header">
              <h2>Diensten Performance</h2>
            </div>
            <div className="dashboard-services-grid">
              {data.services.map((service) => {
                const iconMap: Record<string, React.ReactNode> = {
                  "1": <Home size={24} />,
                  "2": <Users2 size={24} />,
                  "3": <Laptop size={24} />,
                };
                return (
                  <div key={service.id} className="dashboard-service-card">
                    <div className="dashboard-service-card__icon">{iconMap[service.id]}</div>
                    <h4>{service.name}</h4>
                    <div className="dashboard-service-card__stats">
                      <div>
                        <span className="dashboard-service-card__value">{service.activeClients}</span>
                        <span className="dashboard-service-card__label">Actieve klanten</span>
                      </div>
                      <div>
                        <span className="dashboard-service-card__value">€{service.monthlyRevenue.toLocaleString("nl-NL")}</span>
                        <span className="dashboard-service-card__label">Maandomzet</span>
                      </div>
                      <div>
                        <span className="dashboard-service-card__value">{service.sessionsThisMonth}</span>
                        <span className="dashboard-service-card__label">Sessies deze maand</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Recente Reviews */}
          <section className="dashboard-card">
            <div className="dashboard-card__header">
              <h2>Recente Reviews</h2>
              <a href={`/clients/${client.id}/reviews`} className="dashboard-card__link">
                Bekijk alle →
              </a>
            </div>
            <div className="dashboard-reviews">
              {data.recentReviews.map((review, index) => (
                <div key={index} className="dashboard-review">
                  <div className="dashboard-review__header">
                    <h4>{review.name}</h4>
                    <div className="dashboard-review__rating">
                      {Array.from({ length: review.rating }).map((_, i) => (
                        <Star key={i} size={16} fill="currentColor" />
                      ))}
                    </div>
                  </div>
                  <p className="dashboard-review__text">"{review.text}"</p>
                  <span className="dashboard-review__date">{new Date(review.date).toLocaleDateString("nl-NL")}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Financiën Overzicht */}
          <section className="dashboard-card dashboard-card--primary">
            <h2>Financiën Overzicht</h2>
            <div className="dashboard-finance">
              <div className="dashboard-finance__item">
                <span className="dashboard-finance__label">Deze maand</span>
                <span className="dashboard-finance__value">€{data.revenue.thisMonth.toLocaleString("nl-NL")}</span>
              </div>
              <div className="dashboard-finance__item">
                <span className="dashboard-finance__label">Vorige maand</span>
                <span className="dashboard-finance__value">€{data.revenue.lastMonth.toLocaleString("nl-NL")}</span>
              </div>
              <div className="dashboard-finance__item">
                <span className="dashboard-finance__label">Dit jaar</span>
                <span className="dashboard-finance__value">€{data.revenue.thisYear.toLocaleString("nl-NL")}</span>
              </div>
              <div className="dashboard-finance__growth">
                <TrendingUp size={16} />
                <span>+{data.revenue.growth}% groei</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    );
  }

  // Vulcan Admin Dashboard
  if (client.id === "vulcan") {
    const data = vulcanDashboardData;
    
    return (
      <div className="dashboard-admin">
        {/* Key Metrics */}
        <div className="dashboard-metrics">
          <div className="dashboard-metric-card">
            <div className="dashboard-metric__icon">
              <Zap size={32} />
            </div>
            <div className="dashboard-metric__content">
              <h3>{data.stats.totalInstallations}</h3>
              <p>Installaties</p>
              <span className="dashboard-metric__sub">{data.stats.activeInstallations} actief</span>
            </div>
          </div>
          <div className="dashboard-metric-card">
            <div className="dashboard-metric__icon">
              <Users size={32} />
            </div>
            <div className="dashboard-metric__content">
              <h3>{data.stats.totalClients}</h3>
              <p>Klanten</p>
              <span className="dashboard-metric__sub">CRM</span>
            </div>
          </div>
          <div className="dashboard-metric-card dashboard-metric-card--primary">
            <div className="dashboard-metric__icon">
              <Euro size={32} />
            </div>
            <div className="dashboard-metric__content">
              <h3>€{data.stats.monthlyRevenue.toLocaleString("nl-NL")}</h3>
              <p>Maandomzet</p>
              <span className="dashboard-metric__sub">+{data.revenue.growth}% vs vorige maand</span>
            </div>
          </div>
          <div className="dashboard-metric-card">
            <div className="dashboard-metric__icon">
              <Star size={32} />
            </div>
            <div className="dashboard-metric__content">
              <h3>{data.stats.satisfactionRate}</h3>
              <p>Tevredenheid</p>
              <span className="dashboard-metric__sub">Gemiddeld</span>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="dashboard-grid">
          {/* Installaties Overzicht */}
          <section className="dashboard-card dashboard-card--large">
            <div className="dashboard-card__header">
              <h2>Installaties Overzicht</h2>
              <a href={`/clients/${client.id}/projects`} className="dashboard-card__link">
                Bekijk alle →
              </a>
            </div>
            <div className="dashboard-table">
              <table>
                <thead>
                  <tr>
                    <th>Installatie</th>
                    <th>Klant</th>
                    <th>Status</th>
                    <th>Type</th>
                    <th>Locatie</th>
                    <th>Waarde</th>
                    <th>Voortgang</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentInstallations.map((installation) => (
                    <tr key={installation.id}>
                      <td>
                        <strong>{installation.name}</strong>
                        <span className="dashboard-table__meta">{installation.pipeDiameter}</span>
                      </td>
                      <td>{installation.client}</td>
                      <td>
                        <span className={`dashboard-badge dashboard-badge--${installation.status.toLowerCase()}`}>
                          {installation.status}
                        </span>
                      </td>
                      <td>{installation.type}</td>
                      <td>{installation.location}</td>
                      <td>€{installation.value.toLocaleString("nl-NL")}</td>
                      <td>
                        <div className="dashboard-progress">
                          <div className="dashboard-progress__bar" style={{ width: `${installation.progress}%` }}></div>
                          <span>{installation.progress}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Klanten CRM */}
          <section className="dashboard-card">
            <div className="dashboard-card__header">
              <h2>Klanten CRM</h2>
              <a href={`/clients/${client.id}/clients`} className="dashboard-card__link">
                Bekijk alle →
              </a>
            </div>
            <div className="dashboard-list">
              {data.clients.map((clientItem) => (
                <div key={clientItem.id} className="dashboard-list__item">
                  <div className="dashboard-list__main">
                    <h4>{clientItem.name}</h4>
                    <p>{clientItem.contact}</p>
                    <span className="dashboard-list__meta">{clientItem.type} • {clientItem.location}</span>
                  </div>
                  <div className="dashboard-list__side">
                    <div className="dashboard-list__stats">
                      <span className="dashboard-list__stat-value">{clientItem.totalInstallations}</span>
                      <span className="dashboard-list__stat-label">Installaties</span>
                    </div>
                    <div className="dashboard-list__stats">
                      <span className="dashboard-list__stat-value">€{clientItem.totalValue.toLocaleString("nl-NL")}</span>
                      <span className="dashboard-list__stat-label">Waarde</span>
                    </div>
                    <span className={`dashboard-badge dashboard-badge--${clientItem.status.toLowerCase()}`}>
                      {clientItem.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Productlijnen Performance */}
          <section className="dashboard-card">
            <div className="dashboard-card__header">
              <h2>Productlijnen Performance</h2>
            </div>
            <div className="dashboard-services-grid">
              {data.services.map((service) => {
                const iconMap: Record<string, React.ReactNode> = {
                  "1": <Home size={24} />,
                  "2": <Building2 size={24} />,
                  "3": <Factory size={24} />,
                };
                return (
                  <div key={service.id} className="dashboard-service-card">
                    <div className="dashboard-service-card__icon">{iconMap[service.id]}</div>
                    <h4>{service.name}</h4>
                    <div className="dashboard-service-card__stats">
                      <div>
                        <span className="dashboard-service-card__value">{service.activeInstallations}</span>
                        <span className="dashboard-service-card__label">Actieve installaties</span>
                      </div>
                      <div>
                        <span className="dashboard-service-card__value">€{service.monthlyRevenue.toLocaleString("nl-NL")}</span>
                        <span className="dashboard-service-card__label">Maandomzet</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Aankomende Taken */}
          <section className="dashboard-card">
            <div className="dashboard-card__header">
              <h2>Aankomende Taken</h2>
            </div>
            <div className="dashboard-tasks">
              {data.upcomingTasks.map((task) => (
                <div key={task.id} className="dashboard-task">
                  <div className="dashboard-task__content">
                    <h4>{task.task}</h4>
                    <p>{task.project}</p>
                    <span className="dashboard-task__assignee">
                      <Wrench size={14} />
                      {task.assignedTo}
                    </span>
                  </div>
                  <div className="dashboard-task__date">
                    {new Date(task.dueDate).toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Recente Reviews */}
          <section className="dashboard-card">
            <div className="dashboard-card__header">
              <h2>Recente Reviews</h2>
            </div>
            <div className="dashboard-reviews">
              {data.recentReviews.map((review, index) => (
                <div key={index} className="dashboard-review">
                  <div className="dashboard-review__header">
                    <h4>{review.name}</h4>
                    <div className="dashboard-review__rating">
                      {Array.from({ length: review.rating }).map((_, i) => (
                        <Star key={i} size={16} fill="currentColor" />
                      ))}
                    </div>
                  </div>
                  <p className="dashboard-review__text">"{review.text}"</p>
                  <span className="dashboard-review__date">{new Date(review.date).toLocaleDateString("nl-NL")}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Financiën Overzicht */}
          <section className="dashboard-card dashboard-card--primary">
            <h2>Financiën Overzicht</h2>
            <div className="dashboard-finance">
              <div className="dashboard-finance__item">
                <span className="dashboard-finance__label">Deze maand</span>
                <span className="dashboard-finance__value">€{data.revenue.thisMonth.toLocaleString("nl-NL")}</span>
              </div>
              <div className="dashboard-finance__item">
                <span className="dashboard-finance__label">Vorige maand</span>
                <span className="dashboard-finance__value">€{data.revenue.lastMonth.toLocaleString("nl-NL")}</span>
              </div>
              <div className="dashboard-finance__item">
                <span className="dashboard-finance__label">Dit jaar</span>
                <span className="dashboard-finance__value">€{data.revenue.thisYear.toLocaleString("nl-NL")}</span>
              </div>
              <div className="dashboard-finance__growth">
                <TrendingUp size={16} />
                <span>+{data.revenue.growth}% groei</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    );
  }

  // Fallback voor andere clients
  // Als we hier komen, betekent het dat de client bestaat maar geen specifiek dashboard heeft
  // We gebruiken een type assertion omdat TypeScript denkt dat dit onbereikbaar is
  // maar het kan voorkomen als er nieuwe clients worden toegevoegd zonder dashboard implementatie
  return (
    <div className="dashboard-grid">
      <section className="dashboard-card dashboard-card--primary">
        <h2>Welkom bij {(client as ClientConfig).name}</h2>
        <p className="dashboard-intro">{(client as ClientConfig).summary}</p>
      </section>
    </div>
  );
}
