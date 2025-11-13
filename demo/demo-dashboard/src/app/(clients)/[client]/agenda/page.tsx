import { notFound } from "next/navigation";
import { findClient } from "@/lib/clients";
import { neumannDashboardData } from "@/lib/dashboard-data";
import { Calendar, Clock, MapPin, ChevronLeft, ChevronRight } from "lucide-react";

type AgendaPageProps = {
  params: Promise<{ client: string }> | { client: string };
};

export default async function AgendaPage({ params }: AgendaPageProps) {
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

  // Week van 13 november 2025 (maandag 13 nov = start van de week)
  const weekStart = new Date("2025-11-13");
  const dagen = ["Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag", "Zondag"];
  
  // Genereer datums voor de week
  const weekData = dagen.map((dagNaam, index) => {
    const datum = new Date(weekStart);
    datum.setDate(weekStart.getDate() + index);
    return {
      dag: dagNaam,
      datum: datum,
      datumString: datum.toISOString().split("T")[0],
    };
  });

  // Genereer tijdsloten van 06:00 tot 22:00 (elk uur)
  const tijdsloten: string[] = [];
  for (let uur = 6; uur <= 22; uur++) {
    tijdsloten.push(`${uur.toString().padStart(2, "0")}:00`);
  }

  // Dummy sessies/afspraken voor de week
  const sessies = [
    // Maandag
    { id: "1", klantId: "1", klantNaam: "Marijn Besseler", dag: "Maandag", tijd: "10:00", duur: 60, type: "1-op-1 Training", locatie: "Thuis", status: "Bevestigd" },
    { id: "2", klantId: "2", klantNaam: "Kristel Kwant", dag: "Maandag", tijd: "14:00", duur: 60, type: "1-op-1 Training", locatie: "Thuis", status: "Bevestigd" },
    { id: "3", klantId: "4", klantNaam: "Fadil Deniz", dag: "Maandag", tijd: "18:00", duur: 60, type: "1-op-1 Training", locatie: "Thuis", status: "Bevestigd" },
    
    // Dinsdag
    { id: "4", klantId: "1", klantNaam: "Marijn Besseler", dag: "Dinsdag", tijd: "09:00", duur: 60, type: "1-op-1 Training", locatie: "Thuis", status: "Bevestigd" },
    { id: "5", klantId: "5", klantNaam: "Sarah de Vries", dag: "Dinsdag", tijd: "11:00", duur: 60, type: "Duo Training", locatie: "Park", status: "Bevestigd" },
    { id: "6", klantId: "6", klantNaam: "Mark Jansen", dag: "Dinsdag", tijd: "16:00", duur: 60, type: "1-op-1 Training", locatie: "Thuis", status: "Bevestigd" },
    { id: "7", klantId: "8", klantNaam: "Erwin Altena", dag: "Dinsdag", tijd: "19:00", duur: 45, type: "1-op-1 Training", locatie: "Thuis", status: "Bevestigd" },
    
    // Woensdag
    { id: "8", klantId: "2", klantNaam: "Kristel Kwant", dag: "Woensdag", tijd: "10:00", duur: 60, type: "1-op-1 Training", locatie: "Thuis", status: "Bevestigd" },
    { id: "9", klantId: "4", klantNaam: "Fadil Deniz", dag: "Woensdag", tijd: "15:00", duur: 60, type: "1-op-1 Training", locatie: "Thuis", status: "Bevestigd" },
    { id: "10", klantId: "6", klantNaam: "Mark Jansen", dag: "Woensdag", tijd: "17:00", duur: 60, type: "1-op-1 Training", locatie: "Thuis", status: "Bevestigd" },
    
    // Donderdag
    { id: "11", klantId: "1", klantNaam: "Marijn Besseler", dag: "Donderdag", tijd: "08:00", duur: 60, type: "1-op-1 Training", locatie: "Thuis", status: "Bevestigd" },
    { id: "12", klantId: "5", klantNaam: "Sarah de Vries", dag: "Donderdag", tijd: "12:00", duur: 60, type: "Duo Training", locatie: "Park", status: "Bevestigd" },
    { id: "13", klantId: "2", klantNaam: "Kristel Kwant", dag: "Donderdag", tijd: "14:00", duur: 60, type: "1-op-1 Training", locatie: "Thuis", status: "Bevestigd" },
    { id: "14", klantId: "8", klantNaam: "Erwin Altena", dag: "Donderdag", tijd: "20:00", duur: 45, type: "1-op-1 Training", locatie: "Thuis", status: "Bevestigd" },
    
    // Vrijdag
    { id: "15", klantId: "4", klantNaam: "Fadil Deniz", dag: "Vrijdag", tijd: "09:00", duur: 60, type: "1-op-1 Training", locatie: "Thuis", status: "Bevestigd" },
    { id: "16", klantId: "6", klantNaam: "Mark Jansen", dag: "Vrijdag", tijd: "16:00", duur: 60, type: "1-op-1 Training", locatie: "Thuis", status: "Bevestigd" },
    
    // Zaterdag
    { id: "17", klantId: "1", klantNaam: "Marijn Besseler", dag: "Zaterdag", tijd: "10:00", duur: 60, type: "1-op-1 Training", locatie: "Thuis", status: "Bevestigd" },
    { id: "18", klantId: "2", klantNaam: "Kristel Kwant", dag: "Zaterdag", tijd: "11:00", duur: 60, type: "1-op-1 Training", locatie: "Thuis", status: "Bevestigd" },
    { id: "19", klantId: "5", klantNaam: "Sarah de Vries", dag: "Zaterdag", tijd: "14:00", duur: 60, type: "Duo Training", locatie: "Park", status: "Bevestigd" },
    
    // Zondag
    { id: "20", klantId: "4", klantNaam: "Fadil Deniz", dag: "Zondag", tijd: "11:00", duur: 60, type: "1-op-1 Training", locatie: "Thuis", status: "Bevestigd" },
    { id: "21", klantId: "8", klantNaam: "Erwin Altena", dag: "Zondag", tijd: "15:00", duur: 45, type: "1-op-1 Training", locatie: "Thuis", status: "Bevestigd" },
  ];

  // Helper functie om sessies per dag en tijd te vinden
  const getSessieVoorTijd = (dag: string, tijd: string) => {
    // Vind sessie die op dit tijdstip start
    return sessies.find((s) => s.dag === dag && s.tijd === tijd);
  };

  // Bereken of een sessie doorloopt in dit tijdslot
  const isSessieActiefInTijdslot = (sessie: typeof sessies[0], tijd: string) => {
    const [sessieUur, sessieMin] = sessie.tijd.split(":").map(Number);
    const [tijdUur, tijdMin] = tijd.split(":").map(Number);
    
    const sessieStart = sessieUur * 60 + sessieMin;
    const sessieEind = sessieStart + sessie.duur;
    const tijdslotStart = tijdUur * 60 + tijdMin;
    const tijdslotEind = tijdslotStart + 60;
    
    // Sessie is actief als het overlapt met dit tijdslot
    return sessieStart < tijdslotEind && sessieEind > tijdslotStart;
  };

  // Bereken hoogte en positie van sessie blok
  const getSessieStyles = (sessie: typeof sessies[0], tijd: string) => {
    const [sessieUur, sessieMin] = sessie.tijd.split(":").map(Number);
    const [tijdUur, tijdMin] = tijd.split(":").map(Number);
    
    const sessieStart = sessieUur * 60 + sessieMin;
    const sessieEind = sessieStart + sessie.duur;
    const tijdslotStart = tijdUur * 60 + tijdMin;
    const tijdslotEind = tijdslotStart + 60;
    
    // Bereken hoeveel minuten van de sessie in dit tijdslot vallen
    const overlapStart = Math.max(sessieStart, tijdslotStart);
    const overlapEind = Math.min(sessieEind, tijdslotEind);
    const overlapMinuten = Math.max(0, overlapEind - overlapStart);
    
    // Bereken top positie (als sessie niet op het uur begint)
    const offsetMinuten = Math.max(0, sessieStart - tijdslotStart);
    const topPercentage = (offsetMinuten / 60) * 100;
    
    // Bereken hoogte percentage
    const hoogtePercentage = (overlapMinuten / 60) * 100;
    
    return {
      top: `${topPercentage}%`,
      height: `${hoogtePercentage}%`,
      minHeight: overlapMinuten > 0 ? "30px" : "0",
    };
  };

  return (
    <div className="page-admin">
      <div className="page-header">
        <div>
          <h1>Agenda</h1>
          <p style={{ color: "#64748b", marginTop: "0.5rem" }}>
            Week van {weekStart.toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <div style={{ display: "flex", gap: "1rem" }}>
          <button className="btn btn--secondary">
            <ChevronLeft size={16} />
            Vorige Week
          </button>
          <button className="btn btn--secondary">
            Volgende Week
            <ChevronRight size={16} />
          </button>
          <button className="btn btn--primary">
            <Calendar size={16} />
            Nieuwe Afspraak
          </button>
        </div>
      </div>

      {/* Week Overzicht */}
      <div className="page-section">
        <div className="page-card" style={{ padding: 0, overflow: "hidden" }}>
          {/* Header met dagen */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "80px repeat(7, 1fr)",
              background: "var(--client-surface)",
              borderBottom: "2px solid var(--client-border)",
              position: "sticky",
              top: 0,
              zIndex: 10,
            }}
          >
            <div style={{ padding: "1rem", borderRight: "1px solid var(--client-border)", fontWeight: 600 }}>
              Tijd
            </div>
            {weekData.map((dagData) => (
              <div
                key={dagData.dag}
                style={{
                  padding: "1rem",
                  textAlign: "center",
                  borderRight: "1px solid var(--client-border)",
                }}
              >
                <div style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "0.25rem" }}>
                  {dagData.dag}
                </div>
                <div style={{ fontWeight: 600 }}>
                  {dagData.datum.toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}
                </div>
              </div>
            ))}
          </div>

          {/* Tijdsloten en sessies */}
          <div style={{ position: "relative" }}>
            {tijdsloten.map((tijd, tijdIndex) => {
              const [uur] = tijd.split(":");
              const isLaatsteUur = parseInt(uur) === 22;

              return (
                <div
                  key={tijd}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "80px repeat(7, 1fr)",
                    borderBottom: isLaatsteUur ? "none" : "1px solid var(--client-border)",
                    minHeight: "60px",
                    position: "relative",
                  }}
                >
                  {/* Tijd label */}
                  <div
                    style={{
                      padding: "0.5rem 1rem",
                      borderRight: "1px solid var(--client-border)",
                      fontSize: "0.9rem",
                      color: "#64748b",
                      display: "flex",
                      alignItems: "flex-start",
                      paddingTop: "0.75rem",
                    }}
                  >
                    {tijd}
                  </div>

                  {/* Dagen kolommen */}
                  {weekData.map((dagData) => {
                    // Vind alle sessies die actief zijn in dit tijdslot
                    const actieveSessies = sessies.filter((s) => 
                      s.dag === dagData.dag && isSessieActiefInTijdslot(s, tijd)
                    );
                    
                    // Vind de sessie die op dit tijdstip start (voor volledige weergave)
                    const startSessie = getSessieVoorTijd(dagData.dag, tijd);
                    
                    // Vind doorlopende sessies (die in vorige tijdsloten zijn gestart)
                    const doorlopendeSessies = actieveSessies.filter((s) => s.tijd !== tijd);

                    return (
                      <div
                        key={`${dagData.dag}-${tijd}`}
                        style={{
                          borderRight: "1px solid var(--client-border)",
                          position: "relative",
                          minHeight: "60px",
                          padding: "0.25rem",
                        }}
                      >
                        {/* Sessie die hier start */}
                        {startSessie && (
                          <div
                            className="agenda-sessie"
                            style={{
                              background: "var(--client-brand)",
                              color: "white",
                              borderRadius: "0.5rem",
                              padding: "0.75rem",
                              display: "flex",
                              flexDirection: "column",
                              gap: "0.25rem",
                              cursor: "pointer",
                              transition: "opacity 0.2s, transform 0.2s",
                              position: "absolute",
                              left: "0.25rem",
                              right: "0.25rem",
                              zIndex: 5,
                              ...getSessieStyles(startSessie, tijd),
                            }}
                          >
                            <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>
                              {startSessie.klantNaam}
                            </div>
                            <div style={{ fontSize: "0.75rem", opacity: 0.9 }}>
                              {startSessie.tijd} - {startSessie.duur} min
                            </div>
                            <div style={{ fontSize: "0.75rem", opacity: 0.8, display: "flex", alignItems: "center", gap: "0.25rem", marginTop: "0.25rem" }}>
                              <MapPin size={12} />
                              {startSessie.locatie}
                            </div>
                            <div style={{ fontSize: "0.75rem", opacity: 0.8 }}>
                              {startSessie.type}
                            </div>
                          </div>
                        )}
                        
                        {/* Doorlopende sessies (vervolg van vorige tijdsloten) */}
                        {doorlopendeSessies.map((sessie) => {
                          const styles = getSessieStyles(sessie, tijd);
                          if (styles.minHeight === "0") return null;
                          
                          return (
                            <div
                              key={`${sessie.id}-${tijd}`}
                              className="agenda-sessie"
                              style={{
                                background: "var(--client-brand)",
                                color: "white",
                                borderRadius: "0.5rem",
                                padding: "0.5rem",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                                transition: "opacity 0.2s, transform 0.2s",
                                position: "absolute",
                                left: "0.25rem",
                                right: "0.25rem",
                                zIndex: 4,
                                opacity: 0.7,
                                ...styles,
                              }}
                            >
                              <div style={{ fontWeight: 600, fontSize: "0.85rem", textAlign: "center" }}>
                                {sessie.klantNaam}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legenda */}
      <div className="page-section">
        <div className="page-card">
          <h3 style={{ marginBottom: "1rem" }}>Legenda</h3>
          <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <div
                style={{
                  width: "20px",
                  height: "20px",
                  background: "var(--client-brand)",
                  borderRadius: "0.25rem",
                }}
              ></div>
              <span style={{ fontSize: "0.9rem" }}>Bevestigde afspraak</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Clock size={16} style={{ color: "#64748b" }} />
              <span style={{ fontSize: "0.9rem" }}>Tijdsloten: 06:00 - 22:00</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

