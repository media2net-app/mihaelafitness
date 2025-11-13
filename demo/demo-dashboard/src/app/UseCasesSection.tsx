"use client";

import { useState } from "react";
import { 
  Users, 
  Calendar, 
  FileText, 
  BarChart3, 
  Target, 
  PieChart,
  Dumbbell,
  Heart,
  Wrench,
  ShoppingCart,
  Briefcase,
  GraduationCap,
  UtensilsCrossed,
  Building2,
  Megaphone,
  Truck,
  CheckCircle2
} from "lucide-react";

type UseCase = {
  title: string;
  description: string;
  icon: React.ComponentType<{ size?: number }>;
};

type Branch = {
  id: string;
  name: string;
  icon: React.ComponentType<{ size?: number }>;
  useCases: UseCase[];
};

const branches: Branch[] = [
  {
    id: "personal-training",
    name: "Personal Training & Fitness",
    icon: Dumbbell,
    useCases: [
      {
        title: "Klantenbeheer & Trajecten",
        description: "Centraal overzicht van alle klanten, trajecten en contactmomenten. Automatische synchronisatie met je CRM, real-time statusupdates en slimme reminders voor follow-ups.",
        icon: Users,
      },
      {
        title: "Planning & Agenda",
        description: "Weekoverzicht van alle afspraken en sessies. Automatische conflictdetectie, herinneringen naar klanten en integratie met je kalender.",
        icon: Calendar,
      },
      {
        title: "Voedingsplannen & Schema's",
        description: "Maak op maat gemaakte plannen met AI-ondersteuning. Automatische macro-berekeningen, ingrediëntendatabase en real-time aanpassingen per klant.",
        icon: FileText,
      },
      {
        title: "Progress Tracking & Doelen",
        description: "Volg de voortgang van klanten en projecten. Automatische updates, visuele progress indicators en slimme alerts bij mijlpalen.",
        icon: Target,
      },
      {
        title: "Financieel Overzicht & Facturering",
        description: "Inzicht in omzet, kosten en winstgevendheid. Automatische facturering, kosten tracking en financiële rapportages.",
        icon: PieChart,
      },
    ],
  },
  {
    id: "zorg-gezondheid",
    name: "Zorg & Gezondheid",
    icon: Heart,
    useCases: [
      {
        title: "Patiëntbeheer & Dossiers",
        description: "Centraal patiëntendossier met volledige geschiedenis, behandelplannen en medicatieoverzicht. Automatische synchronisatie tussen zorgverleners.",
        icon: Users,
      },
      {
        title: "Afsprakenplanning",
        description: "Intelligente planning van consulten en behandelingen. Automatische herinneringen, wachtlijstbeheer en beschikbaarheidscontrole.",
        icon: Calendar,
      },
      {
        title: "Behandelplannen & Protocollen",
        description: "Gestandaardiseerde behandelplannen met maatwerk aanpassingen. Automatische follow-ups en compliance tracking.",
        icon: FileText,
      },
      {
        title: "Medicatiebeheer",
        description: "Overzicht van medicatie, doseringen en interacties. Automatische waarschuwingen en herhaalrecepten.",
        icon: CheckCircle2,
      },
      {
        title: "Kwaliteitsrapportages",
        description: "Automatische rapportages over behandelresultaten, kwaliteitsindicatoren en compliance met richtlijnen.",
        icon: BarChart3,
      },
    ],
  },
  {
    id: "industrieele-dienstverlening",
    name: "Industriële Dienstverlening",
    icon: Wrench,
    useCases: [
      {
        title: "Projectbeheer & Opdrachten",
        description: "Overzicht van alle lopende projecten en opdrachten. Status tracking, planning en resource allocatie in één dashboard.",
        icon: Briefcase,
      },
      {
        title: "Planning & Planning",
        description: "Werkplanning voor teams en projecten. Automatische conflictdetectie en optimale resource inzet.",
        icon: Calendar,
      },
      {
        title: "Inspecties & Audits",
        description: "Planning en uitvoering van inspecties. Automatische herinneringen, digitale formulieren en foto's direct gekoppeld.",
        icon: FileText,
      },
      {
        title: "Certificering & Compliance",
        description: "Tracking van certificaten, vervaldatums en compliance status. Automatische waarschuwingen bij verlopen certificaten.",
        icon: CheckCircle2,
      },
      {
        title: "Rapportages & Documentatie",
        description: "Automatische generatie van inspectierapporten, werkbonnen en compliance documenten. Direct klaar voor klant.",
        icon: BarChart3,
      },
    ],
  },
  {
    id: "retail-ecommerce",
    name: "Retail & E-commerce",
    icon: ShoppingCart,
    useCases: [
      {
        title: "Klantenbeheer & CRM",
        description: "Volledig klantprofiel met aankoopgeschiedenis, voorkeuren en loyaliteitsprogramma. Automatische segmentatie en personalisatie.",
        icon: Users,
      },
      {
        title: "Voorraadbeheer",
        description: "Real-time voorraadniveaus, automatische bestelpunten en integratie met leveranciers. Voorkom voorraadtekorten.",
        icon: BarChart3,
      },
      {
        title: "Verkoop & Omzet Tracking",
        description: "Real-time verkoopcijfers, omzet per product/categorie en trendanalyse. Direct inzicht in wat verkoopt.",
        icon: PieChart,
      },
      {
        title: "Marketing & Campagnes",
        description: "Plan en track marketingcampagnes. Automatische rapportages over ROI, conversies en klantacquisitie.",
        icon: Megaphone,
      },
      {
        title: "Financieel Dashboard",
        description: "Overzicht van omzet, kosten, marge en winstgevendheid. Automatische financiële rapportages en forecasting.",
        icon: PieChart,
      },
    ],
  },
  {
    id: "advies-consultancy",
    name: "Advies & Consultancy",
    icon: Briefcase,
    useCases: [
      {
        title: "Klantportefeuille",
        description: "Overzicht van alle klanten, projecten en relaties. Automatische synchronisatie met CRM en e-mail systemen.",
        icon: Users,
      },
      {
        title: "Projectplanning & Milestones",
        description: "Plan projecten met duidelijke milestones en deliverables. Automatische updates naar klanten en teamleden.",
        icon: Calendar,
      },
      {
        title: "Urenregistratie & Facturering",
        description: "Eenvoudige urenregistratie per project. Automatische factuur generatie en kosten tracking.",
        icon: FileText,
      },
      {
        title: "Documentbeheer",
        description: "Centraal documentbeheer voor alle projecten. Versiecontrole, delen met klanten en automatische archivering.",
        icon: FileText,
      },
      {
        title: "Performance Analytics",
        description: "Inzicht in projectrendement, klanttevredenheid en team performance. Data-gedreven beslissingen.",
        icon: BarChart3,
      },
    ],
  },
  {
    id: "onderwijs-training",
    name: "Onderwijs & Training",
    icon: GraduationCap,
    useCases: [
      {
        title: "Studentenbeheer",
        description: "Volledig studentendossier met inschrijvingen, voortgang en contactgegevens. Automatische communicatie.",
        icon: Users,
      },
      {
        title: "Lesplanning & Roosters",
        description: "Intelligente roosterplanning met automatische conflictdetectie. Integratie met lokalen en docenten.",
        icon: Calendar,
      },
      {
        title: "Cursusbeheer",
        description: "Beheer van cursussen, modules en leerstof. Automatische toewijzing en voortgang tracking.",
        icon: FileText,
      },
      {
        title: "Voortgang & Cijfers",
        description: "Real-time overzicht van studentvoortgang, cijfers en aanwezigheid. Automatische rapportages naar studenten.",
        icon: Target,
      },
      {
        title: "Certificering & Diploma's",
        description: "Automatische generatie van certificaten en diploma's. Digitaal archief en verificatie mogelijk.",
        icon: CheckCircle2,
      },
    ],
  },
  {
    id: "horeca-events",
    name: "Horeca & Events",
    icon: UtensilsCrossed,
    useCases: [
      {
        title: "Reserveringen & Boekingen",
        description: "Centraal reserveringssysteem met real-time beschikbaarheid. Automatische bevestigingen en herinneringen.",
        icon: Calendar,
      },
      {
        title: "Planning & Roosters",
        description: "Personeelsplanning en roosters. Automatische conflictdetectie en optimale bezetting.",
        icon: Calendar,
      },
      {
        title: "Voorraad & Inkoop",
        description: "Real-time voorraadniveaus, automatische bestellingen en leveranciersbeheer. Voorkom tekorten.",
        icon: BarChart3,
      },
      {
        title: "Financieel Overzicht",
        description: "Real-time omzet, kosten en winstmarge per dag/week/maand. Automatische financiële rapportages.",
        icon: PieChart,
      },
      {
        title: "Klanttevredenheid",
        description: "Track klantbeoordelingen en feedback. Automatische follow-ups en verbeteracties.",
        icon: Target,
      },
    ],
  },
  {
    id: "vastgoed-facility",
    name: "Vastgoed & Facility Management",
    icon: Building2,
    useCases: [
      {
        title: "Objectbeheer & Portefeuille",
        description: "Overzicht van alle objecten, eigenschappen en waarde. Automatische waardering en marktanalyse.",
        icon: Building2,
      },
      {
        title: "Onderhoudsplanning",
        description: "Plan en track onderhoudswerkzaamheden. Automatische herinneringen en preventief onderhoud.",
        icon: Calendar,
      },
      {
        title: "Huurdersbeheer",
        description: "Volledig huurdersdossier met contracten, betalingen en communicatie. Automatische facturering.",
        icon: Users,
      },
      {
        title: "Financieel Overzicht",
        description: "Inzicht in huurinkomsten, kosten en winstgevendheid per object. Automatische financiële rapportages.",
        icon: PieChart,
      },
      {
        title: "Compliance & Certificaten",
        description: "Tracking van certificaten, keuringen en wettelijke verplichtingen. Automatische waarschuwingen.",
        icon: CheckCircle2,
      },
    ],
  },
  {
    id: "marketing-communicatie",
    name: "Marketing & Communicatie",
    icon: Megaphone,
    useCases: [
      {
        title: "Klantbeheer & Accounts",
        description: "Centraal overzicht van alle klanten en accounts. Automatische synchronisatie met CRM systemen.",
        icon: Users,
      },
      {
        title: "Campagneplanning",
        description: "Plan en track marketingcampagnes over alle kanalen. Automatische rapportages over performance.",
        icon: Calendar,
      },
      {
        title: "Content Planning",
        description: "Content kalender met automatische publicatie planning. Integratie met social media platforms.",
        icon: FileText,
      },
      {
        title: "Performance Tracking",
        description: "Real-time metrics van alle campagnes. Automatische analyse van ROI en conversies.",
        icon: BarChart3,
      },
      {
        title: "Rapportages & Analytics",
        description: "Automatische generatie van klantrapportages. Data-gedreven inzichten voor betere resultaten.",
        icon: BarChart3,
      },
    ],
  },
  {
    id: "logistiek-transport",
    name: "Logistiek & Transport",
    icon: Truck,
    useCases: [
      {
        title: "Orderbeheer",
        description: "Centraal overzicht van alle orders en zendingen. Real-time status tracking van begin tot eind.",
        icon: FileText,
      },
      {
        title: "Routeplanning",
        description: "Optimale routeplanning met automatische optimalisatie. Real-time tracking en ETAs.",
        icon: Calendar,
      },
      {
        title: "Voertuigbeheer",
        description: "Overzicht van voertuigen, onderhoud en brandstof. Automatische onderhoudsplanning en kosten tracking.",
        icon: Truck,
      },
      {
        title: "Levering Tracking",
        description: "Real-time tracking van leveringen met automatische updates naar klanten. Proof of delivery.",
        icon: Target,
      },
      {
        title: "Financieel Dashboard",
        description: "Inzicht in kosten per route, klant en voertuig. Automatische facturering en kostenanalyse.",
        icon: PieChart,
      },
    ],
  },
];

export default function UseCasesSection() {
  const [selectedBranch, setSelectedBranch] = useState<string>(branches[0].id);

  const currentBranch = branches.find((b) => b.id === selectedBranch) || branches[0];
  const BranchIcon = currentBranch.icon;

  return (
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

        {/* Branch Filter */}
        <div className="landing-branch-filter">
          {branches.map((branch) => {
            const Icon = branch.icon;
            const isSelected = selectedBranch === branch.id;
            return (
              <button
                key={branch.id}
                onClick={() => setSelectedBranch(branch.id)}
                className={`landing-branch-button ${isSelected ? "is-active" : ""}`}
              >
                <Icon size={20} />
                <span>{branch.name}</span>
              </button>
            );
          })}
        </div>

        {/* Selected Branch Header */}
        <div className="landing-branch-header">
          <div className="landing-branch-header__icon">
            <BranchIcon size={32} />
          </div>
          <h3 className="landing-branch-header__title">{currentBranch.name}</h3>
        </div>

        {/* Use Cases Grid */}
        <div className="landing-use-cases">
          {currentBranch.useCases.map((useCase, index) => {
            const UseCaseIcon = useCase.icon;
            return (
              <div key={index} className="landing-use-case">
                <div className="landing-use-case__icon">
                  <UseCaseIcon size={32} />
                </div>
                <h3>{useCase.title}</h3>
                <p>{useCase.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

