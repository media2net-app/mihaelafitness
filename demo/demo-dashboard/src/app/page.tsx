import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Bot,
  Brain,
  CheckCircle2,
  Clock,
  Database,
  DollarSign,
  FileText,
  LayoutDashboard,
  Link2,
  PieChart,
  RefreshCw,
  Shield,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Workflow,
  XCircle,
  Zap
} from "lucide-react";

const copy = {
  nav: {
    demo: "Demo bekijken",
    requestDemo: "Vraag demo aan"
  },
  hero: {
    badge: "Onderdeel van Media2Net",
    title: "Stop met switchen tussen systemen.",
    titleHighlight: "Alles inzichtelijk in 1 webapplicatie",
    subtitle:
      "Het centrale dashboard dat al jouw bedrijfsprocessen samenbrengt. Van klantenbeheer tot planning, van verkoop tot operations - alles op één plek, real-time inzichtelijk en volledig geautomatiseerd.",
    cta: {
      requestDemo: "Vraag demo aan",
      discover: "Ontdek mogelijkheden"
    },
    stats: {
      timeSaving: "Tijdsbesparing",
      custom: "Maatwerk",
      automation: "Automatisering"
    }
  },
  problem: {
    title: "Herken je dit? Je werkt met meerdere systemen",
    subtitle:
      "Excel voor planning, een CRM voor klanten, aparte tools voor verkoop en rapportages. Je verliest tijd met het switchen tussen systemen en het handmatig kopiëren van data.",
    cards: [
      {
        title: "Verlies van tijd",
        description:
          "Dagelijks uren kwijt aan het zoeken en kopiëren van data tussen verschillende systemen",
        icon: Clock
      },
      {
        title: "Geen overzicht",
        description: "Je hebt geen real-time beeld van wat er gebeurt in je organisatie",
        icon: BarChart3
      },
      {
        title: "Handmatig werk",
        description: "Repetitieve taken die eigenlijk geautomatiseerd zouden moeten zijn",
        icon: RefreshCw
      },
      {
        title: "Fouten en vertraging",
        description:
          "Data komt niet op tijd binnen of bevat fouten door handmatige invoer",
        icon: XCircle
      }
    ]
  },
  solution: {
    title: "DataDashboard.app lost dit op",
    subtitle:
      "Eén centrale webapplicatie die al jouw systemen integreert en automatiseert. Alles wat je nodig hebt, op één plek, altijd up-to-date."
  },
  benefits: {
    title: "Waarom DataDashboard.app onmisbaar is",
    items: [
      {
        title: "Bespaar 80% van je tijd",
        description:
          "Geen meer handmatig kopiëren van data of switchen tussen systemen. Alles gebeurt automatisch, zodat jij je kunt focussen op wat echt belangrijk is.",
        icon: Clock
      },
      {
        title: "Betere beslissingen",
        description:
          "Real-time inzicht betekent dat je sneller kunt reageren op kansen en problemen. Data-gedreven beslissingen leiden tot betere resultaten.",
        icon: TrendingUp
      },
      {
        title: "Lagere kosten",
        description:
          "Minder fouten, minder handmatig werk en betere efficiency. Automatisering bespaart niet alleen tijd, maar ook geld.",
        icon: DollarSign
      },
      {
        title: "Tevredenere klanten",
        description:
          "Snellere reactietijden, betere service en persoonlijke aandacht. Door automatisering heb je meer tijd voor je klanten.",
        icon: Users
      },
      {
        title: "Schaalbaarheid",
        description:
          "Groei mee met je bedrijf zonder extra personeel. Het dashboard schaalt automatisch mee met jouw behoeften.",
        icon: Zap
      },
      {
        title: "Minder fouten",
        description:
          "Automatische synchronisatie voorkomt handmatige fouten. Data is altijd up-to-date en consistent tussen alle systemen.",
        icon: CheckCircle2
      }
    ]
  },
  ai: {
    title: "AI die voor je werkt, 24/7",
    subtitle:
      "DataDashboard.app gebruikt geavanceerde AI om je processen te automatiseren en proactieve inzichten te geven. Laat de technologie het werk doen, zodat jij je kunt focussen op groei.",
    highlights: [
      "Automatische data-analyse en rapportages",
      "Proactieve meldingen bij belangrijke events",
      "Voorspellende inzichten voor betere planning",
      "Intelligente automatisering van workflows"
    ]
  },
  cta: {
    title: "Stop met tijd verliezen. Start met groeien.",
    subtitle:
      "Ontdek hoe DataDashboard.app jouw organisatie transformeert. Vraag een gratis demo aan en zie wat er mogelijk is.",
    requestDemo: "Vraag demo aan",
    viewOptions: "Bekijk mogelijkheden"
  }
};

const features = [
  {
    title: "Integreer alles",
    description:
      "Verbind je CRM, planningstools, verkoopsystemen en meer. Ongeacht welke programma's je gebruikt - alles komt samen in één dashboard.",
    icon: Link2
  },
  {
    title: "Real-time inzicht",
    description:
      "Zie direct wat er gebeurt in je organisatie. Van verkoopcijfers tot planning, van klantstatus tot operationele metrics - alles real-time zichtbaar.",
    icon: BarChart3
  },
  {
    title: "AI-automatisering",
    description:
      "Laat AI repetitieve taken overnemen. Automatische rapportages, slimme voorspellingen en proactieve meldingen - 24/7 actief.",
    icon: Bot
  },
  {
    title: "Maatwerk processen",
    description:
      "Volledig ingericht op jouw bedrijfsproces. Geen one-size-fits-all, maar precies wat jij nodig hebt - van klantenbeheer tot planning.",
    icon: Workflow
  },
  {
    title: "Unified data",
    description:
      "Alle data op één plek, automatisch gesynchroniseerd. Geen handmatig kopiëren of switchen tussen systemen.",
    icon: Database
  },
  {
    title: "Veilig & betrouwbaar",
    description:
      "Enterprise-grade beveiliging en 99.9% uptime garantie. Je data is veilig en altijd beschikbaar.",
    icon: Shield
  }
];

export default function RootPage() {
  return (
    <div className="landing-page">
      <nav className="landing-nav">
        <div className="landing-nav__container">
          <div className="landing-nav__brand">
            <LayoutDashboard size={32} />
            <span className="landing-nav__brand-text">DataDashboard.app</span>
          </div>
          <div className="landing-nav__actions">
            <Link href="/login" className="landing-nav__link">
              {copy.nav.demo}
            </Link>
            <Link href="/login" className="landing-btn landing-btn--primary">
              {copy.nav.requestDemo}
            </Link>
          </div>
        </div>
      </nav>

      <section className="landing-hero">
        <div className="landing-hero__background">
          <div className="landing-hero__gradient"></div>
          <div className="landing-hero__grid"></div>
        </div>
        <div className="landing-hero__content">
          <div className="landing-hero__badge">
            <Sparkles size={14} />
            <span>{copy.hero.badge}</span>
          </div>
          <h1 className="landing-hero__title">
            {copy.hero.title}{" "}
            <span className="landing-hero__title-highlight">
              {copy.hero.titleHighlight}
            </span>
          </h1>
          <p className="landing-hero__subtitle">{copy.hero.subtitle}</p>
          <div className="landing-hero__cta">
            <Link href="/login" className="landing-btn landing-btn--large landing-btn--primary">
              {copy.hero.cta.requestDemo}
              <ArrowRight size={20} />
            </Link>
            <Link href="#features" className="landing-btn landing-btn--large landing-btn--secondary">
              {copy.hero.cta.discover}
            </Link>
          </div>
          <div className="landing-hero__stats">
            <div className="landing-stat">
              <div className="landing-stat__value">80%</div>
              <div className="landing-stat__label">{copy.hero.stats.timeSaving}</div>
            </div>
            <div className="landing-stat">
              <div className="landing-stat__value">100%</div>
              <div className="landing-stat__label">{copy.hero.stats.custom}</div>
            </div>
            <div className="landing-stat">
              <div className="landing-stat__value">24/7</div>
              <div className="landing-stat__label">{copy.hero.stats.automation}</div>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-section landing-section--problem">
        <div className="landing-section__container">
          <div className="landing-section__header">
            <div className="landing-problem-header-icon">
              <AlertTriangle size={48} />
            </div>
            <h2 className="landing-section__title">{copy.problem.title}</h2>
            <p className="landing-section__subtitle">{copy.problem.subtitle}</p>
          </div>
          <div className="landing-problems">
            {copy.problem.cards.map((card) => (
              <div className="landing-problem" key={card.title}>
                <div className="landing-problem__icon">
                  <card.icon size={48} />
                </div>
                <h3>{card.title}</h3>
                <p>{card.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="landing-section">
        <div className="landing-section__container">
          <div className="landing-section__header">
            <h2 className="landing-section__title">{copy.solution.title}</h2>
            <p className="landing-section__subtitle">{copy.solution.subtitle}</p>
          </div>
          <div className="landing-features">
            {features.map((feature) => (
              <div className="landing-feature" key={feature.title}>
                <div className="landing-feature__icon">
                  <feature.icon size={32} />
                </div>
                <h3 className="landing-feature__title">{feature.title}</h3>
                <p className="landing-feature__description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-section">
        <div className="landing-section__container">
          <div className="landing-benefits">
            <div className="landing-benefits__content">
              <h2 className="landing-section__title">{copy.benefits.title}</h2>
              <div className="landing-benefits__list">
                {copy.benefits.items.map((benefit) => (
                  <div className="landing-benefit" key={benefit.title}>
                    <benefit.icon size={24} className="landing-benefit__icon" />
                    <div>
                      <h3 className="landing-benefit__title">{benefit.title}</h3>
                      <p className="landing-benefit__description">{benefit.description}</p>
                    </div>
                  </div>
                ))}
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
                    {[60, 80, 45, 90, 70, 95].map((height, index) => (
                      <div
                        key={index}
                        className="landing-visual-chart__bar"
                        style={{ height: `${height}%` }}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-section landing-section--alt">
        <div className="landing-section__container">
          <div className="landing-ai">
            <div className="landing-ai__visual">
              <div className="landing-ai__glow"></div>
              <Brain size={120} className="landing-ai__icon" />
            </div>
            <div className="landing-ai__content">
              <h2 className="landing-section__title">{copy.ai.title}</h2>
              <p className="landing-section__subtitle">{copy.ai.subtitle}</p>
              <div className="landing-ai__features">
                {copy.ai.highlights.map((item) => (
                  <div className="landing-ai-feature" key={item}>
                    <Zap size={20} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-cta">
        <div className="landing-cta__background">
          <div className="landing-cta__gradient"></div>
        </div>
        <div className="landing-cta__content">
          <h2 className="landing-cta__title">{copy.cta.title}</h2>
          <p className="landing-cta__subtitle">{copy.cta.subtitle}</p>
          <div className="landing-cta__actions">
            <Link
              href="/login"
              className="landing-btn landing-btn--large landing-btn--primary landing-btn--white"
            >
              {copy.cta.requestDemo}
              <ArrowRight size={20} />
            </Link>
            <Link href="#features" className="landing-btn landing-btn--large landing-btn--outline">
              {copy.cta.viewOptions}
            </Link>
          </div>
        </div>
      </section>

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
