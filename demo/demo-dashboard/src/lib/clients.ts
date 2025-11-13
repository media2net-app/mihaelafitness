export type ClientSidebarLink = {
  label: string;
  href: string;
  description?: string;
};

type ClientDefinition = {
  id: string;
  name: string;
  tagline: string;
  logo: string;
  summary: string;
  contact: {
    phone?: string;
    email?: string;
    address?: string;
  };
  highlights: string[];
  quickStats: { label: string; value: string }[];
  sidebarLinks: ClientSidebarLink[];
  resources?: { label: string; href: string }[];
};

const clientDefinitions = [
  {
    id: "rimato",
    name: "Rimato",
    tagline: "Industriële reiniging, rioolbeheer en gevelbeheer",
    logo: "/clients/rimato/logo (1).svg",
    summary:
      "Dienstverlener voor industriële reiniging, riool- en gevelbeheer vanuit Hoogeveen. Rimato werkt sinds 1980 met korte lijnen en gecertificeerde specialisten.",
    contact: {
      phone: "0528 - 270 269",
      email: "info@rimato.nl",
      address: "Dr. Anton Philipsstraat 31, 7903 AL Hoogeveen",
    },
    highlights: [
      "35 gekwalificeerde medewerkers met korte communicatielijnen",
      "ISO 9001, ISO 14001, VCA** en SIR gecertificeerd",
      "CO2-Prestatieladder niveau 5 sinds 2022",
    ],
    quickStats: [
      { label: "Medewerkers", value: "35" },
      { label: "Disciplines", value: "3 kernspecialismen" },
      { label: "CO2-ladder", value: "Niveau 5" },
    ],
    sidebarLinks: [
      { label: "Dashboard", href: "/rimato/dashboard" },
      {
        label: "Projecten",
        href: "/rimato/projects",
        description: "Lopende opdrachten",
      },
      {
        label: "Rapportages",
        href: "/rimato/reports",
        description: "Inspecties & audits",
      },
    ],
  },
  {
    id: "neumann",
    name: "Neumann Personal Training",
    tagline: "Van liggen voor de buis naar personal training aan huis!",
    logo: "/clients/neumann/Neumann-PT-logo.png",
    summary:
      "Nick Neumann, 30 jaar en woonachtig in Hoogeveen, helpt klanten met effectieve en gevarieerde trainingen, op maat gemaakte voedingsschema's en de juiste coaching om hun doelen te behalen.",
    contact: {
      phone: "06 8360 9297",
      email: "info@neumannpt.nl",
      address: "Hoogeveen",
    },
    highlights: [
      "Personal training aan huis in Hoogeveen en omgeving",
      "Op maat gemaakte voedingsschema's en online coaching",
      "Ervaring met revalidatie na blessures (hernia, artrose, knie- en schouderklachten)",
      "Aangesloten bij Bedrijfsfitness Nederland",
    ],
    quickStats: [
      { label: "Coach", value: "Nick Neumann" },
      { label: "Ervaring", value: "Sinds 2018" },
      { label: "Regio", value: "Hoogeveen e.o." },
    ],
    sidebarLinks: [
      {
        label: "Klanten",
        href: "/neumann/clients",
        description: "Klanten & trajecten",
      },
      {
        label: "Agenda",
        href: "/neumann/agenda",
        description: "Weekoverzicht & afspraken",
      },
      {
        label: "Voedingsplannen",
        href: "/neumann/voeding",
        description: "Voedingsadvisering & schema's",
      },
    ],
  },
] as const satisfies readonly ClientDefinition[];

export type ClientConfig = (typeof clientDefinitions)[number];
export type ClientId = ClientConfig["id"];

export const clients: readonly ClientConfig[] = clientDefinitions;

export function listClients(): readonly ClientConfig[] {
  return clients;
}

export function findClient(clientId: string): ClientConfig | undefined {
  return clients.find((client) => client.id === clientId);
}

export function getClient(clientId: string): ClientConfig {
  const client = findClient(clientId);

  if (!client) {
    throw new Error(`Onbekende klant: ${clientId}`);
  }

  return client;
}

export function isClientId(clientId: string): clientId is ClientId {
  return clients.some((client) => client.id === clientId);
}

export function clientDashboardPath(clientId: ClientId): string {
  return `/${clientId}/dashboard`;
}

