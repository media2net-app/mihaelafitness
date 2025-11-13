import Link from "next/link";
import { 
  Zap, 
  Database, 
  Brain, 
  BarChart3, 
  Shield, 
  Workflow,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  LayoutDashboard,
  Link2,
  Bot,
  TrendingUp,
  Clock,
  DollarSign,
  Target,
  AlertTriangle,
  Users,
  FileText,
  Calendar,
  PieChart
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="landing-nav">
        <div className="landing-nav__container">
          <div className="landing-nav__brand">
            <LayoutDashboard size={32} />
            <span className="landing-nav__brand-text">DataDashboard.app</span>
          </div>
          <div className="landing-nav__actions">
            <Link href="/login" className="landing-nav__link">
              Demo bekijken
            </Link>
            <Link href="/login" className="landing-btn landing-btn--primary">
              Vraag demo aan
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="landing-hero__background">
          <div className="landing-hero__gradient"></div>
          <div className="landing-hero__grid"></div>
        </div>
        <div className="landing-hero__content">
          <div className="landing-hero__badge">
            <Sparkles size={14} />
            <span>Onderdeel van Media2Net</span>
          </div>
          <h1 className="landing-hero__title">
            Stop met switchen tussen systemen.{" "}
            <span className="landing-hero__title-highlight">Alles inzichtelijk in 1 webapplicatie</span>
          </h1>
          <p className="landing-hero__subtitle">
            Het centrale dashboard dat al jouw bedrijfsprocessen samenbrengt. 
            Van klantenbeheer tot planning, van verkoop tot operations - alles op één plek, 
            real-time inzichtelijk en volledig geautomatiseerd.
          </p>
          <div className="landing-hero__cta">
            <Link href="/login" className="landing-btn landing-btn--large landing-btn--primary">
              Vraag demo aan
              <ArrowRight size={20} />
            </Link>
            <Link href="#features" className="landing-btn landing-btn--large landing-btn--secondary">
              Ontdek mogelijkheden
            </Link>
          </div>
          <div className="landing-hero__stats">
            <div className="landing-stat">
              <div className="landing-stat__value">80%</div>
              <div className="landing-stat__label">Tijdsbesparing</div>
            </div>
            <div className="landing-stat">
              <div className="landing-stat__value">100%</div>
              <div className="landing-stat__label">Maatwerk</div>
            </div>
            <div className="landing-stat">
              <div className="landing-stat__value">24/7</div>
              <div className="landing-stat__label">Automatisering</div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="landing-section landing-section--problem">
        <div className="landing-section__container">
          <div className="landing-section__header">
            <AlertTriangle size={48} style={{ color: "#f59e0b", marginBottom: "1rem" }} />
            <h2 className="landing-section__title">
              Herken je dit? Je werkt met meerdere systemen
            </h2>
            <p className="landing-section__subtitle">
              Excel voor planning, een CRM voor klanten, aparte tools voor verkoop en rapportages. 
              Je verliest tijd met het switchen tussen systemen en het handmatig kopiëren van data.
            </p>
          </div>
          <div className="landing-problems">
            <div className="landing-problem">
              <div className="landing-problem__icon">⏱️</div>
              <h3>Verlies van tijd</h3>
              <p>Dagelijks uren kwijt aan het zoeken en kopiëren van data tussen verschillende systemen</p>
            </div>
            <div className="landing-problem">
              <div className="landing-problem__icon">📊</div>
              <h3>Geen overzicht</h3>
              <p>Je hebt geen real-time beeld van wat er gebeurt in je organisatie</p>
            </div>
            <div className="landing-problem">
              <div className="landing-problem__icon">🔄</div>
              <h3>Handmatig werk</h3>
              <p>Repetitieve taken die eigenlijk geautomatiseerd zouden moeten zijn</p>
            </div>
            <div className="landing-problem">
              <div className="landing-problem__icon">❌</div>
              <h3>Fouten en vertraging</h3>
              <p>Data komt niet op tijd binnen of bevat fouten door handmatige invoer</p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section id="features" className="landing-section">
        <div className="landing-section__container">
          <div className="landing-section__header">
            <h2 className="landing-section__title">
              DataDashboard.app lost dit op
            </h2>
            <p className="landing-section__subtitle">
              Eén centrale webapplicatie die al jouw systemen integreert en automatiseert. 
              Alles wat je nodig hebt, op één plek, altijd up-to-date.
            </p>
          </div>
          <div className="landing-features">
            <div className="landing-feature">
              <div className="landing-feature__icon">
                <Link2 size={32} />
              </div>
              <h3 className="landing-feature__title">Integreer alles</h3>
              <p className="landing-feature__description">
                Verbind je CRM, planningstools, verkoopsystemen en meer. 
                Ongeacht welke programma&apos;s je gebruikt - alles komt samen in één dashboard.
              </p>
            </div>
            <div className="landing-feature">
              <div className="landing-feature__icon">
                <BarChart3 size={32} />
              </div>
              <h3 className="landing-feature__title">Real-time inzicht</h3>
              <p className="landing-feature__description">
                Zie direct wat er gebeurt in je organisatie. Van verkoopcijfers tot planning, 
                van klantstatus tot operationele metrics - alles real-time zichtbaar.
              </p>
            </div>
            <div className="landing-feature">
              <div className="landing-feature__icon">
                <Bot size={32} />
              </div>
              <h3 className="landing-feature__title">AI-automatisering</h3>
              <p className="landing-feature__description">
                Laat AI repetitieve taken overnemen. Automatische rapportages, 
                slimme voorspellingen en proactieve meldingen - 24/7 actief.
              </p>
            </div>
            <div className="landing-feature">
              <div className="landing-feature__icon">
                <Workflow size={32} />
              </div>
              <h3 className="landing-feature__title">Maatwerk processen</h3>
              <p className="landing-feature__description">
                Volledig ingericht op jouw bedrijfsproces. Geen one-size-fits-all, 
                maar precies wat jij nodig hebt - van klantenbeheer tot planning.
              </p>
            </div>
            <div className="landing-feature">
              <div className="landing-feature__icon">
                <Database size={32} />
              </div>
              <h3 className="landing-feature__title">Unified data</h3>
              <p className="landing-feature__description">
                Alle data op één plek, automatisch gesynchroniseerd. 
                Geen meer handmatig kopiëren of switchen tussen systemen.
              </p>
            </div>
            <div className="landing-feature">
              <div className="landing-feature__icon">
                <Shield size={32} />
              </div>
              <h3 className="landing-feature__title">Veilig & betrouwbaar</h3>
              <p className="landing-feature__description">
                Enterprise-grade beveiliging en 99.9% uptime garantie. 
                Je data is veilig en altijd beschikbaar.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="landing-section landing-section--alt">
        <div className="landing-section__container">
          <div className="landing-section__header">
            <h2 className="landing-section__title">
              Wat kun je er allemaal mee?
            </h2>
            <p className="landing-section__subtitle">
              Concrete voorbeelden van wat DataDashboard.app voor jouw organisatie kan betekenen
            </p>
          </div>
          <div className="landing-use-cases">
            <div className="landing-use-case">
              <Users size={32} style={{ color: "var(--client-brand)", marginBottom: "1rem" }} />
              <h3>Klantenbeheer</h3>
              <p>
                Centraal overzicht van alle klanten, trajecten en contactmomenten. 
                Automatische synchronisatie met je CRM, real-time statusupdates en 
                slimme reminders voor follow-ups.
              </p>
            </div>
            <div className="landing-use-case">
              <Calendar size={32} style={{ color: "var(--client-brand)", marginBottom: "1rem" }} />
              <h3>Planning & Agenda</h3>
              <p>
                Weekoverzicht van alle afspraken en sessies. Automatische conflictdetectie, 
                herinneringen naar klanten en integratie met je kalender.
              </p>
            </div>
            <div className="landing-use-case">
              <FileText size={32} style={{ color: "var(--client-brand)", marginBottom: "1rem" }} />
              <h3>Voedingsplannen & Schema&apos;s</h3>
              <p>
                Maak op maat gemaakte plannen met AI-ondersteuning. Automatische macro-berekeningen, 
                ingrediëntendatabase en real-time aanpassingen per klant.
              </p>
            </div>
            <div className="landing-use-case">
              <BarChart3 size={32} style={{ color: "var(--client-brand)", marginBottom: "1rem" }} />
              <h3>Rapportages & Analytics</h3>
              <p>
                Automatische rapportages over prestaties, trends en KPI&apos;s. 
                Real-time dashboards met alle belangrijke metrics op één plek.
              </p>
            </div>
            <div className="landing-use-case">
              <Target size={32} style={{ color: "var(--client-brand)", marginBottom: "1rem" }} />
              <h3>Doelen & Progress Tracking</h3>
              <p>
                Volg de voortgang van klanten en projecten. Automatische updates, 
                visuele progress indicators en slimme alerts bij mijlpalen.
              </p>
            </div>
            <div className="landing-use-case">
              <PieChart size={32} style={{ color: "var(--client-brand)", marginBottom: "1rem" }} />
              <h3>Financieel Overzicht</h3>
              <p>
                Inzicht in omzet, kosten en winstgevendheid. Automatische facturering, 
                kosten tracking en financiële rapportages.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="landing-section">
        <div className="landing-section__container">
          <div className="landing-benefits">
            <div className="landing-benefits__content">
              <h2 className="landing-section__title">
                Waarom DataDashboard.app onmisbaar is
              </h2>
              <div className="landing-benefits__list">
                <div className="landing-benefit">
                  <Clock size={24} className="landing-benefit__icon" />
                  <div>
                    <h3 className="landing-benefit__title">Bespaar 80% van je tijd</h3>
                    <p className="landing-benefit__description">
                      Geen meer handmatig kopiëren van data of switchen tussen systemen. 
                      Alles gebeurt automatisch, zodat jij je kunt focussen op wat echt belangrijk is.
                    </p>
                  </div>
                </div>
                <div className="landing-benefit">
                  <TrendingUp size={24} className="landing-benefit__icon" />
                  <div>
                    <h3 className="landing-benefit__title">Betere beslissingen</h3>
                    <p className="landing-benefit__description">
                      Real-time inzicht betekent dat je sneller kunt reageren op kansen en problemen. 
                      Data-gedreven beslissingen leiden tot betere resultaten.
                    </p>
                  </div>
                </div>
                <div className="landing-benefit">
                  <DollarSign size={24} className="landing-benefit__icon" />
                  <div>
                    <h3 className="landing-benefit__title">Lagere kosten</h3>
                    <p className="landing-benefit__description">
                      Minder fouten, minder handmatig werk en betere efficiency. 
                      Automatisering bespaart niet alleen tijd, maar ook geld.
                    </p>
                  </div>
                </div>
                <div className="landing-benefit">
                  <Users size={24} className="landing-benefit__icon" />
                  <div>
                    <h3 className="landing-benefit__title">Tevredenere klanten</h3>
                    <p className="landing-benefit__description">
                      Snellere reactietijden, betere service en persoonlijke aandacht. 
                      Door automatisering heb je meer tijd voor je klanten.
                    </p>
                  </div>
                </div>
                <div className="landing-benefit">
                  <Zap size={24} className="landing-benefit__icon" />
                  <div>
                    <h3 className="landing-benefit__title">Schaalbaarheid</h3>
                    <p className="landing-benefit__description">
                      Groei mee met je bedrijf zonder extra personeel. 
                      Het dashboard schaalt automatisch mee met jouw behoeften.
                    </p>
                  </div>
                </div>
                <div className="landing-benefit">
                  <CheckCircle2 size={24} className="landing-benefit__icon" />
                  <div>
                    <h3 className="landing-benefit__title">Minder fouten</h3>
                    <p className="landing-benefit__description">
                      Automatische synchronisatie voorkomt handmatige fouten. 
                      Data is altijd up-to-date en consistent tussen alle systemen.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="landing-benefits__visual">
              <div className="landing-visual-card">
                <div className="landing-visual-card__header">
                  <div className="landing-visual-card__dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <span className="landing-visual-card__title">Dashboard Preview</span>
                </div>
                <div className="landing-visual-card__content">
                  <div className="landing-visual-metric">
                    <TrendingUp size={20} />
                    <div>
                      <div className="landing-visual-metric__value">+80%</div>
                      <div className="landing-visual-metric__label">Efficiëntie</div>
                    </div>
                  </div>
                  <div className="landing-visual-chart">
                    <div className="landing-visual-chart__bar" style={{ height: "60%" }}></div>
                    <div className="landing-visual-chart__bar" style={{ height: "80%" }}></div>
                    <div className="landing-visual-chart__bar" style={{ height: "45%" }}></div>
                    <div className="landing-visual-chart__bar" style={{ height: "90%" }}></div>
                    <div className="landing-visual-chart__bar" style={{ height: "70%" }}></div>
                    <div className="landing-visual-chart__bar" style={{ height: "95%" }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Section */}
      <section className="landing-section landing-section--alt">
        <div className="landing-section__container">
          <div className="landing-ai">
            <div className="landing-ai__visual">
              <div className="landing-ai__glow"></div>
              <Brain size={120} className="landing-ai__icon" />
            </div>
            <div className="landing-ai__content">
              <h2 className="landing-section__title">
                AI die voor je werkt, 24/7
              </h2>
              <p className="landing-section__subtitle">
                DataDashboard.app gebruikt geavanceerde AI om je processen te automatiseren 
                en proactieve inzichten te geven. Laat de technologie het werk doen, 
                zodat jij je kunt focussen op groei.
              </p>
              <div className="landing-ai__features">
                <div className="landing-ai-feature">
                  <Zap size={20} />
                  <span>Automatische data-analyse en rapportages</span>
                </div>
                <div className="landing-ai-feature">
                  <Zap size={20} />
                  <span>Proactieve meldingen bij belangrijke events</span>
                </div>
                <div className="landing-ai-feature">
                  <Zap size={20} />
                  <span>Voorspellende inzichten voor betere planning</span>
                </div>
                <div className="landing-ai-feature">
                  <Zap size={20} />
                  <span>Intelligente automatisering van workflows</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="landing-cta">
        <div className="landing-cta__background">
          <div className="landing-cta__gradient"></div>
        </div>
        <div className="landing-cta__content">
          <h2 className="landing-cta__title">
            Stop met tijd verliezen. Start met groeien.
          </h2>
          <p className="landing-cta__subtitle">
            Ontdek hoe DataDashboard.app jouw organisatie transformeert. 
            Vraag een gratis demo aan en zie wat er mogelijk is.
          </p>
          <div className="landing-cta__actions">
            <Link href="/login" className="landing-btn landing-btn--large landing-btn--primary landing-btn--white">
              Vraag demo aan
              <ArrowRight size={20} />
            </Link>
            <Link href="#features" className="landing-btn landing-btn--large landing-btn--outline">
              Bekijk mogelijkheden
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-footer__container">
          <div className="landing-footer__brand">
            <LayoutDashboard size={24} />
            <span>DataDashboard.app</span>
          </div>
          <div className="landing-footer__info">
            <p>Onderdeel van Media2Net</p>
            <p className="landing-footer__copyright">
              © {new Date().getFullYear()} DataDashboard.app. Alle rechten voorbehouden.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
