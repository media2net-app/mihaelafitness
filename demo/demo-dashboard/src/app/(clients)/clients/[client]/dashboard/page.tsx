import { notFound } from "next/navigation";
import { findClient, listClients, type ClientConfig } from "@/lib/clients";
import { rimatoDashboardData, neumannDashboardData, vulcanDashboardData } from "@/lib/dashboard-data";
import { BarChart3, Users, Euro, CheckCircle2, Star, TrendingUp, Factory, Droplets, Building2, Home, Users2, Trees, Laptop, Hospital, UserCog, User, MapPin, Clock, Wrench, Zap } from "lucide-react";
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
        {/* Key Metrics */}
        <div className="dashboard-metrics">
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
        </div>

        {/* Main Content Grid */}
        <div className="dashboard-grid">
          {/* Projecten Overzicht */}
          <section className="dashboard-card dashboard-card--large">
            <div className="dashboard-card__header">
              <h2>Projecten Overzicht</h2>
              <a href={`/clients/${client.id}/projects`} className="dashboard-card__link">
                Bekijk alle →
              </a>
            </div>
            <div className="dashboard-table">
              <table>
                <thead>
                  <tr>
                    <th>Project</th>
                    <th>Klant</th>
                    <th>Status</th>
                    <th>Prioriteit</th>
                    <th>Waarde</th>
                    <th>Voortgang</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentProjects.map((project) => (
                    <tr key={project.id}>
                      <td>
                        <strong>{project.name}</strong>
                        <span className="dashboard-table__type">{project.type}</span>
                      </td>
                      <td>{project.client}</td>
                      <td>
                        <span className={`dashboard-badge dashboard-badge--${project.status.toLowerCase()}`}>
                          {project.status}
                        </span>
                      </td>
                      <td>
                        <span className={`dashboard-priority dashboard-priority--${project.priority.toLowerCase()}`}>
                          {project.priority}
                        </span>
                      </td>
                      <td>€{project.value.toLocaleString("nl-NL")}</td>
                      <td>
                        <div className="dashboard-progress">
                          <div className="dashboard-progress__bar" style={{ width: `${project.progress}%` }}></div>
                          <span>{project.progress}%</span>
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
                    <span className="dashboard-list__meta">{clientItem.type}</span>
                  </div>
                  <div className="dashboard-list__side">
                    <div className="dashboard-list__stats">
                      <span className="dashboard-list__stat-value">{clientItem.totalProjects}</span>
                      <span className="dashboard-list__stat-label">Projecten</span>
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

          {/* Diensten Performance */}
          <section className="dashboard-card">
            <div className="dashboard-card__header">
              <h2>Diensten Performance</h2>
            </div>
            <div className="dashboard-services-grid">
              {data.services.map((service) => {
                const iconMap: Record<string, React.ReactNode> = {
                  "1": <Factory size={24} />,
                  "2": <Droplets size={24} />,
                  "3": <Building2 size={24} />,
                };
                return (
                  <div key={service.id} className="dashboard-service-card">
                    <div className="dashboard-service-card__icon">{iconMap[service.id]}</div>
                    <h4>{service.name}</h4>
                    <div className="dashboard-service-card__stats">
                      <div>
                        <span className="dashboard-service-card__value">{service.activeProjects}</span>
                        <span className="dashboard-service-card__label">Actieve projecten</span>
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
                      <User size={14} />
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
