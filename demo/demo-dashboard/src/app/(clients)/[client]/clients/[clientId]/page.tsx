import { notFound } from "next/navigation";
import { findClient } from "@/lib/clients";
import { neumannDashboardData } from "@/lib/dashboard-data";
import { ArrowLeft, Edit, Calendar, Mail, Phone, Target, Package, TrendingUp, Clock, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";

type ClientDetailPageProps = {
  params: Promise<{ client: string; clientId: string }> | { client: string; clientId: string };
};

export default async function ClientDetailPage({ params }: ClientDetailPageProps) {
  const resolvedParams = await Promise.resolve(params);
  const client = findClient(resolvedParams.client);

  if (!client || client.id !== "neumann") {
    notFound();
  }

  // Haal alle klanten op
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
    {
      id: "8",
      name: "Erwin Altena",
      email: "erwin@example.nl",
      phone: "06-89012345",
      status: "Actief",
      goal: "Gewichtsverlies & conditie",
      startDate: "2024-09-20",
      nextSession: "2024-12-23",
      type: "1-op-1 Training",
      sessionsCompleted: 12,
      totalSessions: 24,
      progress: 50,
      package: "Online pakket",
      value: 960,
    },
  ];

  const clientItem = allClients.find((c) => c.id === resolvedParams.clientId);

  if (!clientItem) {
    notFound();
  }

  // Mock data voor trainingen en sessies
  const trainingen = [
    {
      id: "1",
      naam: "Full Body Strength",
      type: "Kracht",
      duur: "60 min",
      datum: "2024-12-15",
      status: "Voltooid",
      oefeningen: ["Squats", "Deadlifts", "Bench Press", "Rows"],
      notities: "Goede progressie, gewicht verhoogd met 5kg",
    },
    {
      id: "2",
      naam: "Cardio & Core",
      type: "Conditie",
      duur: "45 min",
      datum: "2024-12-18",
      status: "Gepland",
      oefeningen: ["HIIT", "Planks", "Mountain Climbers"],
      notities: null,
    },
    {
      id: "3",
      naam: "Upper Body Focus",
      type: "Kracht",
      duur: "60 min",
      datum: "2024-12-12",
      status: "Voltooid",
      oefeningen: ["Push-ups", "Pull-ups", "Shoulder Press"],
      notities: "Focus op vorm verbetering",
    },
  ];

  const recenteSessies = [
    {
      id: "1",
      datum: "2024-12-15",
      tijd: "10:00",
      type: clientItem.type,
      locatie: "Thuis",
      status: "Voltooid",
      duur: "60 min",
      trainer: "Nick Neumann",
    },
    {
      id: "2",
      datum: "2024-12-12",
      tijd: "14:00",
      type: clientItem.type,
      locatie: "Thuis",
      status: "Voltooid",
      duur: "60 min",
      trainer: "Nick Neumann",
    },
    {
      id: "3",
      datum: "2024-12-10",
      tijd: "10:00",
      type: clientItem.type,
      locatie: "Thuis",
      status: "Voltooid",
      duur: "45 min",
      trainer: "Nick Neumann",
    },
  ];

  const pakketDetails = {
    naam: clientItem.package,
    waarde: clientItem.value,
    startdatum: clientItem.startDate,
    sessies: {
      totaal: clientItem.totalSessions,
      voltooid: clientItem.sessionsCompleted,
      resterend: clientItem.totalSessions - clientItem.sessionsCompleted,
    },
    looptijd: "6 maanden",
    verlenging: "2024-12-01",
  };

  return (
    <div className="page-admin">
      <div className="page-header">
        <div>
          <Link
            href={`/${client.id}/clients`}
            className="dashboard-card__link"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              marginBottom: "1rem",
            }}
          >
            <ArrowLeft size={16} />
            Terug naar Klanten
          </Link>
          <h1>{clientItem.name}</h1>
          <p style={{ color: "#64748b", marginTop: "0.5rem" }}>
            {clientItem.goal} • {clientItem.type}
          </p>
        </div>
        <div style={{ display: "flex", gap: "1rem" }}>
          <button className="btn btn--secondary">
            <Calendar size={16} />
            Sessie Inplannen
          </button>
          <button className="btn btn--primary">
            <Edit size={16} />
            Bewerken
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="page-stats">
        <div className="page-stat-card">
          <h3>{clientItem.progress}%</h3>
          <p>Voortgang</p>
        </div>
        <div className="page-stat-card page-stat-card--active">
          <h3>{clientItem.sessionsCompleted}</h3>
          <p>Voltooide Sessies</p>
        </div>
        <div className="page-stat-card">
          <h3>{clientItem.totalSessions - clientItem.sessionsCompleted}</h3>
          <p>Resterende Sessies</p>
        </div>
        <div className="page-stat-card page-stat-card--primary">
          <h3>€{clientItem.value.toLocaleString("nl-NL")}</h3>
          <p>Pakket Waarde</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1.5rem", marginTop: "1.5rem" }}>
        {/* Linker kolom */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Persoonlijke Gegevens */}
          <div className="page-card">
            <h2 style={{ marginBottom: "1rem" }}>Persoonlijke Gegevens</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <Mail size={18} style={{ color: "#64748b" }} />
                <div>
                  <span style={{ fontSize: "0.85rem", color: "#64748b" }}>Email</span>
                  <div>
                    <a href={`mailto:${clientItem.email}`} style={{ color: "inherit", textDecoration: "none" }}>
                      {clientItem.email}
                    </a>
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <Phone size={18} style={{ color: "#64748b" }} />
                <div>
                  <span style={{ fontSize: "0.85rem", color: "#64748b" }}>Telefoon</span>
                  <div>{clientItem.phone}</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <Target size={18} style={{ color: "#64748b" }} />
                <div>
                  <span style={{ fontSize: "0.85rem", color: "#64748b" }}>Doel</span>
                  <div style={{ fontWeight: 500 }}>{clientItem.goal}</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <Package size={18} style={{ color: "#64748b" }} />
                <div>
                  <span style={{ fontSize: "0.85rem", color: "#64748b" }}>Pakket</span>
                  <div style={{ fontWeight: 500 }}>{clientItem.package}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Voortgang */}
          <div className="page-card">
            <h2 style={{ marginBottom: "1rem" }}>Voortgang</h2>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                <span style={{ fontSize: "0.9rem", fontWeight: 500 }}>Traject Voortgang</span>
                <span style={{ fontSize: "0.9rem", fontWeight: 600 }}>{clientItem.progress}%</span>
              </div>
              <div className="dashboard-progress" style={{ height: "12px", marginBottom: "1rem" }}>
                <div
                  className="dashboard-progress__bar"
                  style={{
                    width: `${clientItem.progress}%`,
                    height: "100%",
                  }}
                ></div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
                <div style={{ textAlign: "center", padding: "0.75rem", background: "var(--client-surface)", borderRadius: "0.5rem" }}>
                  <div style={{ fontSize: "1.5rem", fontWeight: 600, color: "var(--client-brand)" }}>
                    {clientItem.sessionsCompleted}
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "#64748b", marginTop: "0.25rem" }}>Voltooid</div>
                </div>
                <div style={{ textAlign: "center", padding: "0.75rem", background: "var(--client-surface)", borderRadius: "0.5rem" }}>
                  <div style={{ fontSize: "1.5rem", fontWeight: 600 }}>
                    {clientItem.totalSessions - clientItem.sessionsCompleted}
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "#64748b", marginTop: "0.25rem" }}>Resterend</div>
                </div>
                <div style={{ textAlign: "center", padding: "0.75rem", background: "var(--client-surface)", borderRadius: "0.5rem" }}>
                  <div style={{ fontSize: "1.5rem", fontWeight: 600 }}>{clientItem.totalSessions}</div>
                  <div style={{ fontSize: "0.85rem", color: "#64748b", marginTop: "0.25rem" }}>Totaal</div>
                </div>
              </div>
            </div>
          </div>

          {/* Trainingen */}
          <div className="page-card">
            <div className="dashboard-card__header">
              <h2>Trainingen</h2>
              <button className="btn btn--secondary" style={{ fontSize: "0.9rem", padding: "0.5rem 1rem" }}>
                Nieuwe Training
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {trainingen.map((training) => (
                <div
                  key={training.id}
                  style={{
                    padding: "1rem",
                    background: "var(--client-surface)",
                    borderRadius: "0.75rem",
                    border: "1px solid var(--client-border)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                    <div>
                      <h3 style={{ fontSize: "1rem", margin: 0, marginBottom: "0.25rem" }}>{training.naam}</h3>
                      <div style={{ display: "flex", gap: "0.5rem", fontSize: "0.85rem", color: "#64748b" }}>
                        <span>{training.type}</span>
                        <span>•</span>
                        <span>{training.duur}</span>
                        <span>•</span>
                        <span>{new Date(training.datum).toLocaleDateString("nl-NL")}</span>
                      </div>
                    </div>
                    <span className={`dashboard-badge dashboard-badge--${training.status.toLowerCase()}`}>
                      {training.status}
                    </span>
                  </div>
                  <div style={{ marginTop: "0.75rem" }}>
                    <div style={{ fontSize: "0.85rem", fontWeight: 500, marginBottom: "0.25rem" }}>Oefeningen:</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                      {training.oefeningen.map((oefening, idx) => (
                        <span
                          key={idx}
                          style={{
                            padding: "0.25rem 0.5rem",
                            background: "white",
                            borderRadius: "0.25rem",
                            fontSize: "0.8rem",
                            border: "1px solid var(--client-border)",
                          }}
                        >
                          {oefening}
                        </span>
                      ))}
                    </div>
                    {training.notities && (
                      <div style={{ marginTop: "0.75rem", padding: "0.75rem", background: "white", borderRadius: "0.5rem", fontSize: "0.85rem" }}>
                        <strong>Notities:</strong> {training.notities}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Rechter kolom */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Status & Pakket Info */}
          <div className="page-card">
            <h2 style={{ marginBottom: "1rem" }}>Status & Pakket</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <span style={{ fontSize: "0.85rem", color: "#64748b" }}>Status</span>
                <div style={{ marginTop: "0.25rem" }}>
                  <span className={`dashboard-badge dashboard-badge--${clientItem.status.toLowerCase()}`}>
                    {clientItem.status}
                  </span>
                </div>
              </div>
              <div>
                <span style={{ fontSize: "0.85rem", color: "#64748b" }}>Type Training</span>
                <div style={{ marginTop: "0.25rem", fontWeight: 500 }}>{clientItem.type}</div>
              </div>
              <div>
                <span style={{ fontSize: "0.85rem", color: "#64748b" }}>Startdatum</span>
                <div style={{ marginTop: "0.25rem", fontWeight: 500 }}>
                  {new Date(clientItem.startDate).toLocaleDateString("nl-NL")}
                </div>
              </div>
              {clientItem.nextSession && (
                <div>
                  <span style={{ fontSize: "0.85rem", color: "#64748b" }}>Volgende Sessie</span>
                  <div style={{ marginTop: "0.25rem", fontWeight: 500, color: "var(--client-brand)" }}>
                    {new Date(clientItem.nextSession).toLocaleDateString("nl-NL")}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Pakket Details */}
          <div className="page-card">
            <h2 style={{ marginBottom: "1rem" }}>Pakket Details</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "0.9rem", color: "#64748b" }}>Pakket</span>
                <span style={{ fontSize: "0.9rem", fontWeight: 500 }}>{pakketDetails.naam}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "0.9rem", color: "#64748b" }}>Waarde</span>
                <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--client-brand)" }}>
                  €{pakketDetails.waarde.toLocaleString("nl-NL")}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "0.9rem", color: "#64748b" }}>Looptijd</span>
                <span style={{ fontSize: "0.9rem", fontWeight: 500 }}>{pakketDetails.looptijd}</span>
              </div>
              <div style={{ marginTop: "0.5rem", paddingTop: "0.75rem", borderTop: "1px solid var(--client-border)" }}>
                <div style={{ fontSize: "0.85rem", fontWeight: 500, marginBottom: "0.5rem" }}>Sessies:</div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem" }}>
                  <span>Voltooid</span>
                  <span style={{ fontWeight: 600 }}>{pakketDetails.sessies.voltooid}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem" }}>
                  <span>Resterend</span>
                  <span style={{ fontWeight: 600 }}>{pakketDetails.sessies.resterend}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", marginTop: "0.25rem", paddingTop: "0.25rem", borderTop: "1px solid var(--client-border)" }}>
                  <span>Totaal</span>
                  <span style={{ fontWeight: 600 }}>{pakketDetails.sessies.totaal}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recente Sessies */}
          <div className="page-card">
            <h2 style={{ marginBottom: "1rem" }}>Recente Sessies</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {recenteSessies.map((sessie) => (
                <div
                  key={sessie.id}
                  style={{
                    padding: "0.75rem",
                    background: "var(--client-surface)",
                    borderRadius: "0.5rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ fontSize: "0.9rem", fontWeight: 500 }}>
                      {new Date(sessie.datum).toLocaleDateString("nl-NL")} om {sessie.tijd}
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "0.25rem" }}>
                      {sessie.locatie} • {sessie.duur}
                    </div>
                  </div>
                  {sessie.status === "Voltooid" ? (
                    <CheckCircle size={20} style={{ color: "#10b981" }} />
                  ) : (
                    <Clock size={20} style={{ color: "#64748b" }} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


