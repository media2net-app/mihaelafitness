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
  PieChart,
  XCircle,
  RefreshCw
} from "lucide-react";
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import UseCasesSection from "./UseCasesSection";
import LanguageSwitcher from "./LanguageSwitcher";

type LandingPageProps = {
  params: Promise<{ locale: string }> | { locale: string };
};

export default async function LandingPage({ params }: LandingPageProps) {
  const { locale } = await Promise.resolve(params);
  const t = await getTranslations();
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
            <LanguageSwitcher />
            <Link href="/login" className="landing-nav__link">
              {t('nav.demo')}
            </Link>
            <Link href="/login" className="landing-btn landing-btn--primary">
              {t('nav.requestDemo')}
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
            <span>{t('hero.badge')}</span>
          </div>
          <h1 className="landing-hero__title">
            {t('hero.title')}{" "}
            <span className="landing-hero__title-highlight">{t('hero.titleHighlight')}</span>
          </h1>
          <p className="landing-hero__subtitle">
            {t('hero.subtitle')}
          </p>
          <div className="landing-hero__cta">
            <Link href="/login" className="landing-btn landing-btn--large landing-btn--primary">
              {t('hero.cta.requestDemo')}
              <ArrowRight size={20} />
            </Link>
            <Link href="#features" className="landing-btn landing-btn--large landing-btn--secondary">
              {t('hero.cta.discover')}
            </Link>
          </div>
          <div className="landing-hero__stats">
            <div className="landing-stat">
              <div className="landing-stat__value">80%</div>
              <div className="landing-stat__label">{t('hero.stats.timeSaving')}</div>
            </div>
            <div className="landing-stat">
              <div className="landing-stat__value">100%</div>
              <div className="landing-stat__label">{t('hero.stats.custom')}</div>
            </div>
            <div className="landing-stat">
              <div className="landing-stat__value">24/7</div>
              <div className="landing-stat__label">{t('hero.stats.automation')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="landing-section landing-section--problem">
        <div className="landing-section__container">
          <div className="landing-section__header">
            <div className="landing-problem-header-icon">
              <AlertTriangle size={48} />
            </div>
            <h2 className="landing-section__title">
              {t('problem.title')}
            </h2>
            <p className="landing-section__subtitle">
              {t('problem.subtitle')}
            </p>
          </div>
          <div className="landing-problems">
            <div className="landing-problem">
              <div className="landing-problem__icon">
                <Clock size={48} />
              </div>
              <h3>{t('problem.timeLoss.title')}</h3>
              <p>{t('problem.timeLoss.description')}</p>
            </div>
            <div className="landing-problem">
              <div className="landing-problem__icon">
                <BarChart3 size={48} />
              </div>
              <h3>{t('problem.noOverview.title')}</h3>
              <p>{t('problem.noOverview.description')}</p>
            </div>
            <div className="landing-problem">
              <div className="landing-problem__icon">
                <RefreshCw size={48} />
              </div>
              <h3>{t('problem.manualWork.title')}</h3>
              <p>{t('problem.manualWork.description')}</p>
            </div>
            <div className="landing-problem">
              <div className="landing-problem__icon">
                <XCircle size={48} />
              </div>
              <h3>{t('problem.errors.title')}</h3>
              <p>{t('problem.errors.description')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section id="features" className="landing-section">
        <div className="landing-section__container">
          <div className="landing-section__header">
            <h2 className="landing-section__title">
              {t('solution.title')}
            </h2>
            <p className="landing-section__subtitle">
              {t('solution.subtitle')}
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
      <UseCasesSection />

      {/* Benefits Section */}
      <section className="landing-section">
        <div className="landing-section__container">
          <div className="landing-benefits">
            <div className="landing-benefits__content">
              <h2 className="landing-section__title">
                {t('benefits.title')}
              </h2>
              <div className="landing-benefits__list">
                <div className="landing-benefit">
                  <Clock size={24} className="landing-benefit__icon" />
                  <div>
                    <h3 className="landing-benefit__title">{t('benefits.timeSaving.title')}</h3>
                    <p className="landing-benefit__description">
                      {t('benefits.timeSaving.description')}
                    </p>
                  </div>
                </div>
                <div className="landing-benefit">
                  <TrendingUp size={24} className="landing-benefit__icon" />
                  <div>
                    <h3 className="landing-benefit__title">{t('benefits.decisions.title')}</h3>
                    <p className="landing-benefit__description">
                      {t('benefits.decisions.description')}
                    </p>
                  </div>
                </div>
                <div className="landing-benefit">
                  <DollarSign size={24} className="landing-benefit__icon" />
                  <div>
                    <h3 className="landing-benefit__title">{t('benefits.costs.title')}</h3>
                    <p className="landing-benefit__description">
                      {t('benefits.costs.description')}
                    </p>
                  </div>
                </div>
                <div className="landing-benefit">
                  <Users size={24} className="landing-benefit__icon" />
                  <div>
                    <h3 className="landing-benefit__title">{t('benefits.customers.title')}</h3>
                    <p className="landing-benefit__description">
                      {t('benefits.customers.description')}
                    </p>
                  </div>
                </div>
                <div className="landing-benefit">
                  <Zap size={24} className="landing-benefit__icon" />
                  <div>
                    <h3 className="landing-benefit__title">{t('benefits.scalability.title')}</h3>
                    <p className="landing-benefit__description">
                      {t('benefits.scalability.description')}
                    </p>
                  </div>
                </div>
                <div className="landing-benefit">
                  <CheckCircle2 size={24} className="landing-benefit__icon" />
                  <div>
                    <h3 className="landing-benefit__title">{t('benefits.errors.title')}</h3>
                    <p className="landing-benefit__description">
                      {t('benefits.errors.description')}
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
                {t('ai.title')}
              </h2>
              <p className="landing-section__subtitle">
                {t('ai.subtitle')}
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
            {t('cta.title')}
          </h2>
          <p className="landing-cta__subtitle">
            {t('cta.subtitle')}
          </p>
          <div className="landing-cta__actions">
            <Link href="/login" className="landing-btn landing-btn--large landing-btn--primary landing-btn--white">
              {t('cta.requestDemo')}
              <ArrowRight size={20} />
            </Link>
            <Link href="#features" className="landing-btn landing-btn--large landing-btn--outline">
              {t('cta.viewOptions')}
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
