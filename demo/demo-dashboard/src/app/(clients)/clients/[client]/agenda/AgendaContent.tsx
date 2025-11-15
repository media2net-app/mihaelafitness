"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, MapPin, ChevronLeft, ChevronRight } from "lucide-react";

type Sessie = {
  id: string;
  klantId: string;
  klantNaam: string;
  dag: string;
  tijd: string;
  duur: number;
  type: string;
  locatie: string;
  status: string;
};

type WeekData = {
  dag: string;
  datum: Date;
  datumString: string;
};

type AgendaContentProps = {
  weekStart: Date;
  weekData: WeekData[];
  sessies: Sessie[];
  tijdsloten: string[];
};

export default function AgendaContent({ weekStart, weekData, sessies, tijdsloten }: AgendaContentProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [currentDayIndex, setCurrentDayIndex] = useState(0);

  useEffect(() => {
    // Detecteer of het mobiel is
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Bepaal huidige dag index
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset tijd voor vergelijking
    
    // Vind de dag die het dichtst bij vandaag ligt
    let closestIndex = 0;
    let minDiff = Infinity;
    
    weekData.forEach((day, index) => {
      const dayDate = new Date(day.datum);
      dayDate.setHours(0, 0, 0, 0);
      const diff = Math.abs(dayDate.getTime() - today.getTime());
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = index;
      }
    });
    
    setCurrentDayIndex(closestIndex);

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [weekData]);

  // Helper functie om sessies per dag en tijd te vinden
  const getSessieVoorTijd = (dag: string, tijd: string) => {
    return sessies.find((s) => s.dag === dag && s.tijd === tijd);
  };

  // Bereken of een sessie doorloopt in dit tijdslot
  const isSessieActiefInTijdslot = (sessie: Sessie, tijd: string) => {
    const [sessieUur, sessieMin] = sessie.tijd.split(":").map(Number);
    const [tijdUur, tijdMin] = tijd.split(":").map(Number);
    
    const sessieStart = sessieUur * 60 + sessieMin;
    const sessieEind = sessieStart + sessie.duur;
    const tijdslotStart = tijdUur * 60 + tijdMin;
    const tijdslotEind = tijdslotStart + 60;
    
    return sessieStart < tijdslotEind && sessieEind > tijdslotStart;
  };

  // Bereken hoogte en positie van sessie blok
  const getSessieStyles = (sessie: Sessie, tijd: string) => {
    const [sessieUur, sessieMin] = sessie.tijd.split(":").map(Number);
    const [tijdUur, tijdMin] = tijd.split(":").map(Number);
    
    const sessieStart = sessieUur * 60 + sessieMin;
    const sessieEind = sessieStart + sessie.duur;
    const tijdslotStart = tijdUur * 60 + tijdMin;
    const tijdslotEind = tijdslotStart + 60;
    
    const overlapStart = Math.max(sessieStart, tijdslotStart);
    const overlapEind = Math.min(sessieEind, tijdslotEind);
    const overlapMinuten = Math.max(0, overlapEind - overlapStart);
    
    const offsetMinuten = Math.max(0, sessieStart - tijdslotStart);
    const topPercentage = (offsetMinuten / 60) * 100;
    const hoogtePercentage = (overlapMinuten / 60) * 100;
    
    return {
      top: `${topPercentage}%`,
      height: `${hoogtePercentage}%`,
      minHeight: overlapMinuten > 0 ? "30px" : "0",
    };
  };

  // Op mobiel: toon alleen huidige dag, anders toon alle dagen
  const dagenTeTonen = isMobile ? [weekData[currentDayIndex]] : weekData;
  const gridColumns = isMobile ? "80px 1fr" : "80px repeat(7, 1fr)";

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Agenda</h1>
          <p style={{ color: "#64748b", marginTop: "0.5rem" }}>
            {isMobile 
              ? `${dagenTeTonen[0]?.dag} ${dagenTeTonen[0]?.datum.toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" })}`
              : `Week van ${weekStart.toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" })}`
            }
          </p>
        </div>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          {isMobile ? (
            <>
              <button 
                className="btn btn--secondary"
                onClick={() => {
                  const newIndex = currentDayIndex > 0 ? currentDayIndex - 1 : weekData.length - 1;
                  setCurrentDayIndex(newIndex);
                }}
              >
                <ChevronLeft size={16} />
                Vorige Dag
              </button>
              <button 
                className="btn btn--secondary"
                onClick={() => {
                  const newIndex = currentDayIndex < weekData.length - 1 ? currentDayIndex + 1 : 0;
                  setCurrentDayIndex(newIndex);
                }}
              >
                Volgende Dag
                <ChevronRight size={16} />
              </button>
            </>
          ) : (
            <>
              <button className="btn btn--secondary">
                <ChevronLeft size={16} />
                Vorige Week
              </button>
              <button className="btn btn--secondary">
                Volgende Week
                <ChevronRight size={16} />
              </button>
            </>
          )}
          <button className="btn btn--primary">
            <Calendar size={16} />
            Nieuwe Afspraak
          </button>
        </div>
      </div>

      {/* Week/Dag Overzicht */}
      <div className="page-section">
        <div className="page-card" style={{ padding: 0, overflow: "hidden" }}>
          {/* Header met dagen */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: gridColumns,
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
            {dagenTeTonen.map((dagData) => (
              <div
                key={dagData.dag}
                style={{
                  padding: "1rem",
                  textAlign: "center",
                  borderRight: isMobile ? "none" : "1px solid var(--client-border)",
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
                    gridTemplateColumns: gridColumns,
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
                  {dagenTeTonen.map((dagData) => {
                    const actieveSessies = sessies.filter((s) => 
                      s.dag === dagData.dag && isSessieActiefInTijdslot(s, tijd)
                    );
                    
                    const startSessie = getSessieVoorTijd(dagData.dag, tijd);
                    const doorlopendeSessies = actieveSessies.filter((s) => s.tijd !== tijd);

                    return (
                      <div
                        key={`${dagData.dag}-${tijd}`}
                        style={{
                          borderRight: isMobile ? "none" : "1px solid var(--client-border)",
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
                        
                        {/* Doorlopende sessies */}
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
    </>
  );
}

