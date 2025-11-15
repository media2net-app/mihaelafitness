import { notFound } from "next/navigation";
import { findClient } from "@/lib/clients";
import { Euro, Calendar, CheckCircle2, Clock, Zap, LayoutDashboard, Users, UtensilsCrossed, Brain, Smartphone, Shield, Code, Palette } from "lucide-react";

type OntwikkelingskostenPageProps = {
  params: Promise<{ client: string }> | { client: string };
};

export default async function OntwikkelingskostenPage({ params }: OntwikkelingskostenPageProps) {
  const resolvedParams = await Promise.resolve(params);
  const client = findClient(resolvedParams.client);

  if (!client || client.id !== "neumann") {
    notFound();
  }

  const totaalPrijsExclBTW = 1100;
  const btwPercentage = 21;
  const btwBedrag = Math.round(totaalPrijsExclBTW * (btwPercentage / 100));
  const totaalPrijsInclBTW = totaalPrijsExclBTW + btwBedrag;
  const aanbetalingPercentage = 50;
  const aanbetalingBedrag = Math.round(totaalPrijsExclBTW * (aanbetalingPercentage / 100));
  const ontwikkelingsduur = "3 weken";

  const functies = [
    {
      categorie: "Dashboard & Overzicht",
      icon: LayoutDashboard,
      items: [
        "Dashboard met KPI's en statistieken",
        "Real-time metrics en overzichten",
        "Customizable dashboard widgets",
      ],
    },
    {
      categorie: "Klantenbeheer",
      icon: Users,
      items: [
        "Klanten overzicht met filters",
        "Klant detail pagina's",
        "Klant status tracking",
        "Progress tracking per klant",
      ],
    },
    {
      categorie: "Voedingsplannen",
      icon: UtensilsCrossed,
      items: [
        "Voedingsplan overzicht",
        "Voedingsplan detail pagina",
        "Macro tracking per dag (tabs)",
        "Maaltijd toevoegen functionaliteit",
        "Ingrediënten database (100+ items)",
        "Automatische voedingswaarde berekening",
      ],
    },
    {
      categorie: "AI Functionaliteiten",
      icon: Brain,
      items: [
        "AI Voedingsplan Generator",
        "Slimme maaltijd suggesties",
        "Automatische macro berekening",
      ],
    },
    {
      categorie: "Design & UI/UX",
      icon: Palette,
      items: [
        "Modern dark mode sci-fi 2.0 design",
        "Landing page met glassmorphism",
        "Fully responsive mobile design",
        "Hamburger menu & mobile navigation",
        "Custom client theming",
      ],
    },
    {
      categorie: "Technische Features",
      icon: Code,
      items: [
        "Next.js App Router implementatie",
        "TypeScript type safety",
        "Server & Client component optimalisatie",
        "Performance optimalisatie",
      ],
    },
    {
      categorie: "Beveiliging & Authenticatie",
      icon: Shield,
      items: [
        "Login systeem met authenticatie",
        "Client selectie na login",
        "Secure cookie management",
      ],
    },
    {
      categorie: "Mobile Optimalisatie",
      icon: Smartphone,
      items: [
        "Responsive dashboard componenten",
        "Mobile-first table layouts",
        "Touch-friendly interacties",
        "Mobile agenda optimalisatie",
      ],
    },
  ];

  const totaalFuncties = functies.reduce((sum, cat) => sum + cat.items.length, 0);

  return (
    <div className="page-admin">
      <div className="page-header">
        <div>
          <h1>Offerte - Platform Ontwikkeling</h1>
          <p style={{ color: "#64748b", marginTop: "0.5rem" }}>
            Volledige prijsopgave voor ontwikkeling van het dashboard platform
          </p>
        </div>
      </div>

      {/* Prijs Overzicht Cards */}
      <div className="dashboard-metrics" style={{ marginBottom: "2rem" }}>
        <div className="dashboard-metric-card dashboard-metric-card--primary">
          <div className="dashboard-metric__icon">
            <Euro size={32} />
          </div>
          <div className="dashboard-metric__content">
            <h3>€{totaalPrijsExclBTW.toLocaleString("nl-NL")}</h3>
            <p>Totaalprijs excl. BTW</p>
            <span className="dashboard-metric__sub">€{totaalPrijsInclBTW.toLocaleString("nl-NL")} incl. BTW</span>
          </div>
        </div>
        <div className="dashboard-metric-card">
          <div className="dashboard-metric__icon">
            <Zap size={32} />
          </div>
          <div className="dashboard-metric__content">
            <h3>{aanbetalingPercentage}%</h3>
            <p>Aanbetaling bij akkoord</p>
            <span className="dashboard-metric__sub">€{aanbetalingBedrag.toLocaleString("nl-NL")} excl. BTW</span>
          </div>
        </div>
        <div className="dashboard-metric-card">
          <div className="dashboard-metric__icon">
            <Clock size={32} />
          </div>
          <div className="dashboard-metric__content">
            <h3>{ontwikkelingsduur}</h3>
            <p>Duur ontwikkeling</p>
            <span className="dashboard-metric__sub">Na akkoord</span>
          </div>
        </div>
        <div className="dashboard-metric-card">
          <div className="dashboard-metric__icon">
            <CheckCircle2 size={32} />
          </div>
          <div className="dashboard-metric__content">
            <h3>{functies.reduce((sum, cat) => sum + cat.items.length, 0)}</h3>
            <p>Functionaliteiten</p>
            <span className="dashboard-metric__sub">{functies.length} categorieën</span>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Functies Overzicht */}
        <section className="dashboard-card dashboard-card--large">
          <div className="dashboard-card__header">
            <h2>Functionaliteiten & Onderdelen</h2>
            <span style={{ color: "#64748b", fontSize: "0.875rem" }}>
              {totaalFuncties} functionaliteiten
            </span>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            {functies.map((categorie, catIndex) => {
              const IconComponent = categorie.icon;
              
              return (
                <div key={catIndex} style={{ borderBottom: catIndex < functies.length - 1 ? "1px solid var(--client-border)" : "none", paddingBottom: catIndex < functies.length - 1 ? "2rem" : "0" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
                    <div style={{ 
                      padding: "0.5rem", 
                      background: "var(--client-brand)", 
                      borderRadius: "0.5rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white"
                    }}>
                      <IconComponent size={20} />
                    </div>
                    <h3 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 600 }}>
                      {categorie.categorie}
                    </h3>
                  </div>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginLeft: "2.5rem" }}>
                    {categorie.items.map((item, itemIndex) => (
                      <div 
                        key={itemIndex}
                        style={{ 
                          display: "flex", 
                          alignItems: "center",
                          padding: "0.5rem 0",
                        }}
                      >
                        <span style={{ color: "#64748b", fontSize: "0.95rem" }}>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Prijs Samenvatting */}
        <section className="dashboard-card dashboard-card--primary">
          <h2>Prijs Samenvatting</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1.5rem" }}>
            <div style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center",
              padding: "1rem",
              background: "rgba(255, 255, 255, 0.05)",
              borderRadius: "0.5rem",
            }}>
              <span style={{ fontSize: "1rem", color: "#cbd5e1" }}>Subtotaal (excl. BTW)</span>
              <span style={{ fontSize: "1.25rem", fontWeight: 600 }}>€{totaalPrijsExclBTW.toLocaleString("nl-NL")}</span>
            </div>
            <div style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center",
              padding: "1rem",
              background: "rgba(255, 255, 255, 0.05)",
              borderRadius: "0.5rem",
            }}>
              <span style={{ fontSize: "1rem", color: "#cbd5e1" }}>BTW ({btwPercentage}%)</span>
              <span style={{ fontSize: "1.25rem", fontWeight: 600 }}>€{btwBedrag.toLocaleString("nl-NL")}</span>
            </div>
            <div style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center",
              padding: "1.5rem",
              background: "rgba(255, 255, 255, 0.1)",
              borderRadius: "0.5rem",
              border: "2px solid var(--client-brand)",
            }}>
              <span style={{ fontSize: "1.25rem", fontWeight: 700, color: "#ffffff" }}>Totaalprijs (incl. BTW)</span>
              <span style={{ fontSize: "1.75rem", fontWeight: 700, color: "#ffffff" }}>€{totaalPrijsInclBTW.toLocaleString("nl-NL")}</span>
            </div>
          </div>

          <div style={{ marginTop: "2rem", padding: "1.5rem", background: "rgba(255, 255, 255, 0.05)", borderRadius: "0.5rem" }}>
            <h3 style={{ marginTop: 0, marginBottom: "1rem", fontSize: "1.1rem", fontWeight: 600 }}>
              Betalingsvoorwaarden
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <CheckCircle2 size={18} style={{ color: "var(--client-brand)" }} />
                <span style={{ fontSize: "0.95rem", color: "#cbd5e1" }}>
                  <strong>{aanbetalingPercentage}% aanbetaling</strong> bij akkoord: €{aanbetalingBedrag.toLocaleString("nl-NL")} excl. BTW
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <CheckCircle2 size={18} style={{ color: "var(--client-brand)" }} />
                <span style={{ fontSize: "0.95rem", color: "#cbd5e1" }}>
                  <strong>50% restant</strong> bij oplevering: €{(totaalPrijsExclBTW - aanbetalingBedrag).toLocaleString("nl-NL")} excl. BTW
                </span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: "1.5rem", padding: "1.5rem", background: "rgba(255, 255, 255, 0.05)", borderRadius: "0.5rem" }}>
            <h3 style={{ marginTop: 0, marginBottom: "1rem", fontSize: "1.1rem", fontWeight: 600 }}>
              Levertijd
            </h3>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Calendar size={18} style={{ color: "var(--client-brand)" }} />
              <span style={{ fontSize: "0.95rem", color: "#cbd5e1" }}>
                <strong>{ontwikkelingsduur}</strong> na akkoord en ontvangst van aanbetaling
              </span>
            </div>
          </div>
        </section>

        {/* Inclusief & Exclusief */}
        <section className="dashboard-card">
          <h2>Wat is inbegrepen?</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", marginTop: "1.5rem" }}>
            <div>
              <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1rem", color: "#22c55e" }}>
                ✓ Inclusief
              </h3>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <li style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
                  <CheckCircle2 size={16} style={{ color: "#22c55e", marginTop: "0.25rem", flexShrink: 0 }} />
                  <span style={{ fontSize: "0.9rem", color: "#64748b" }}>Volledige ontwikkeling van alle functionaliteiten</span>
                </li>
                <li style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
                  <CheckCircle2 size={16} style={{ color: "#22c55e", marginTop: "0.25rem", flexShrink: 0 }} />
                  <span style={{ fontSize: "0.9rem", color: "#64748b" }}>Responsive design voor alle devices</span>
                </li>
                <li style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
                  <CheckCircle2 size={16} style={{ color: "#22c55e", marginTop: "0.25rem", flexShrink: 0 }} />
                  <span style={{ fontSize: "0.9rem", color: "#64748b" }}>Testing en kwaliteitscontrole</span>
                </li>
                <li style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
                  <CheckCircle2 size={16} style={{ color: "#22c55e", marginTop: "0.25rem", flexShrink: 0 }} />
                  <span style={{ fontSize: "0.9rem", color: "#64748b" }}>Deployment en hosting setup</span>
                </li>
                <li style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
                  <CheckCircle2 size={16} style={{ color: "#22c55e", marginTop: "0.25rem", flexShrink: 0 }} />
                  <span style={{ fontSize: "0.9rem", color: "#64748b" }}>Documentatie en handleiding</span>
                </li>
                <li style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
                  <CheckCircle2 size={16} style={{ color: "#22c55e", marginTop: "0.25rem", flexShrink: 0 }} />
                  <span style={{ fontSize: "0.9rem", color: "#64748b" }}>30 dagen support na oplevering</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1rem", color: "#ef4444" }}>
                ✗ Exclusief
              </h3>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <li style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
                  <span style={{ color: "#ef4444", marginTop: "0.25rem", flexShrink: 0 }}>✗</span>
                  <span style={{ fontSize: "0.9rem", color: "#64748b" }}>Hosting kosten (maandelijks)</span>
                </li>
                <li style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
                  <span style={{ color: "#ef4444", marginTop: "0.25rem", flexShrink: 0 }}>✗</span>
                  <span style={{ fontSize: "0.9rem", color: "#64748b" }}>Domeinnaam registratie</span>
                </li>
                <li style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
                  <span style={{ color: "#ef4444", marginTop: "0.25rem", flexShrink: 0 }}>✗</span>
                  <span style={{ fontSize: "0.9rem", color: "#64748b" }}>Aanpassingen na oplevering</span>
                </li>
                <li style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
                  <span style={{ color: "#ef4444", marginTop: "0.25rem", flexShrink: 0 }}>✗</span>
                  <span style={{ fontSize: "0.9rem", color: "#64748b" }}>Extra functionaliteiten</span>
                </li>
                <li style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
                  <span style={{ color: "#ef4444", marginTop: "0.25rem", flexShrink: 0 }}>✗</span>
                  <span style={{ fontSize: "0.9rem", color: "#64748b" }}>Training van gebruikers</span>
                </li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
