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
  TrendingUp
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
            Alle processen inzichtelijk in{" "}
            <span className="landing-hero__title-highlight">1 webapplicatie</span>
          </h1>
          <p className="landing-hero__subtitle">
            Maatwerk data dashboards volledig ingericht op jouw bedrijfsproces. 
            Ongeacht welke programma&apos;s je gebruikt, alles centraal op 1 plek, 
            en vanaf 1 plek te bedienen.
          </p>
          <div className="landing-hero__cta">
            <Link href="/login" className="landing-btn landing-btn--large landing-btn--primary">
              Vraag demo aan
              <ArrowRight size={20} />
            </Link>
            <Link href="#features" className="landing-btn landing-btn--large landing-btn--secondary">
              Meer informatie
            </Link>
          </div>
          <div className="landing-hero__stats">
            <div className="landing-stat">
              <div className="landing-stat__value">100%</div>
              <div className="landing-stat__label">Maatwerk</div>
            </div>
            <div className="landing-stat">
              <div className="landing-stat__value">1</div>
              <div className="landing-stat__label">Centraal Dashboard</div>
            </div>
            <div className="landing-stat">
              <div className="landing-stat__value">AI</div>
              <div className="landing-stat__label">Geautomatiseerd</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="landing-section">
        <div className="landing-section__container">
          <div className="landing-section__header">
            <h2 className="landing-section__title">
              Alles wat je nodig hebt op één plek
            </h2>
            <p className="landing-section__subtitle">
              DataDashboard.app integreert al je tools en processen in één krachtig dashboard
            </p>
          </div>
          <div className="landing-features">
            <div className="landing-feature">
              <div className="landing-feature__icon">
                <Link2 size={32} />
              </div>
              <h3 className="landing-feature__title">Centrale Integratie</h3>
              <p className="landing-feature__description">
                Verbind alle programma&apos;s en tools die je gebruikt. 
                Ongeacht het systeem, alles komt samen in één dashboard.
              </p>
            </div>
            <div className="landing-feature">
              <div className="landing-feature__icon">
                <BarChart3 size={32} />
              </div>
              <h3 className="landing-feature__title">Real-time Inzichten</h3>
              <p className="landing-feature__description">
                Krijg direct inzicht in al je bedrijfsprocessen. 
                Van verkoop tot operations, alles real-time zichtbaar.
              </p>
            </div>
            <div className="landing-feature">
              <div className="landing-feature__icon">
                <Bot size={32} />
              </div>
              <h3 className="landing-feature__title">AI Automatisering</h3>
              <p className="landing-feature__description">
                Slimme AI-processen automatiseren repetitieve taken en 
                geven proactieve inzichten voor betere besluitvorming.
              </p>
            </div>
            <div className="landing-feature">
              <div className="landing-feature__icon">
                <Workflow size={32} />
              </div>
              <h3 className="landing-feature__title">Maatwerk Processen</h3>
              <p className="landing-feature__description">
                Volledig ingericht op jouw specifieke bedrijfsproces. 
                Geen one-size-fits-all, maar precies wat jij nodig hebt.
              </p>
            </div>
            <div className="landing-feature">
              <div className="landing-feature__icon">
                <Database size={32} />
              </div>
              <h3 className="landing-feature__title">Unified Data</h3>
              <p className="landing-feature__description">
                Alle data op één plek, ongeacht de bron. 
                Geen meer switchen tussen verschillende systemen.
              </p>
            </div>
            <div className="landing-feature">
              <div className="landing-feature__icon">
                <Shield size={32} />
              </div>
              <h3 className="landing-feature__title">Veilig & Betrouwbaar</h3>
              <p className="landing-feature__description">
                Enterprise-grade beveiliging en betrouwbaarheid. 
                Je data is veilig en altijd beschikbaar.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="landing-section landing-section--alt">
        <div className="landing-section__container">
          <div className="landing-benefits">
            <div className="landing-benefits__content">
              <h2 className="landing-section__title">
                Waarom DataDashboard.app?
              </h2>
              <div className="landing-benefits__list">
                <div className="landing-benefit">
                  <CheckCircle2 size={24} className="landing-benefit__icon" />
                  <div>
                    <h3 className="landing-benefit__title">Efficiëntie</h3>
                    <p className="landing-benefit__description">
                      Bespaar tijd door alles op één plek te hebben. 
                      Geen meer zoeken tussen verschillende systemen.
                    </p>
                  </div>
                </div>
                <div className="landing-benefit">
                  <CheckCircle2 size={24} className="landing-benefit__icon" />
                  <div>
                    <h3 className="landing-benefit__title">Overzicht</h3>
                    <p className="landing-benefit__description">
                      Krijg volledig inzicht in al je processen. 
                      Van één dashboard zie je alles wat er gebeurt.
                    </p>
                  </div>
                </div>
                <div className="landing-benefit">
                  <CheckCircle2 size={24} className="landing-benefit__icon" />
                  <div>
                    <h3 className="landing-benefit__title">Automatisering</h3>
                    <p className="landing-benefit__description">
                      Laat AI het werk voor je doen. 
                      Automatiseer processen en krijg slimme inzichten.
                    </p>
                  </div>
                </div>
                <div className="landing-benefit">
                  <CheckCircle2 size={24} className="landing-benefit__icon" />
                  <div>
                    <h3 className="landing-benefit__title">Schaalbaarheid</h3>
                    <p className="landing-benefit__description">
                      Groei mee met je bedrijf. 
                      Het dashboard schaalt automatisch mee met jouw behoeften.
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
                      <div className="landing-visual-metric__value">+24.5%</div>
                      <div className="landing-visual-metric__label">Groei deze maand</div>
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
      <section className="landing-section">
        <div className="landing-section__container">
          <div className="landing-ai">
            <div className="landing-ai__visual">
              <div className="landing-ai__glow"></div>
              <Brain size={120} className="landing-ai__icon" />
            </div>
            <div className="landing-ai__content">
              <h2 className="landing-section__title">
                Slimme AI-processen voor automatisering
              </h2>
              <p className="landing-section__subtitle">
                DataDashboard.app gebruikt geavanceerde AI om je processen te automatiseren 
                en proactieve inzichten te geven. Laat de technologie voor je werken.
              </p>
              <div className="landing-ai__features">
                <div className="landing-ai-feature">
                  <Zap size={20} />
                  <span>Automatische data-analyse</span>
                </div>
                <div className="landing-ai-feature">
                  <Zap size={20} />
                  <span>Proactieve meldingen</span>
                </div>
                <div className="landing-ai-feature">
                  <Zap size={20} />
                  <span>Voorspellende inzichten</span>
                </div>
                <div className="landing-ai-feature">
                  <Zap size={20} />
                  <span>Intelligente automatisering</span>
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
            Klaar om te beginnen?
          </h2>
          <p className="landing-cta__subtitle">
            Ontdek hoe DataDashboard.app jouw bedrijfsprocessen kan transformeren
          </p>
          <div className="landing-cta__actions">
            <Link href="/login" className="landing-btn landing-btn--large landing-btn--primary landing-btn--white">
              Vraag demo aan
              <ArrowRight size={20} />
            </Link>
            <Link href="#features" className="landing-btn landing-btn--large landing-btn--outline">
              Bekijk demo
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
