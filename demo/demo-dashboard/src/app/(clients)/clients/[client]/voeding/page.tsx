import { notFound } from "next/navigation";
import { findClient } from "@/lib/clients";
import { UtensilsCrossed, FileText, Plus } from "lucide-react";
import Link from "next/link";

type VoedingPageProps = {
  params: Promise<{ client: string }> | { client: string };
};

export default async function VoedingPage({ params }: VoedingPageProps) {
  const resolvedParams = await Promise.resolve(params);
  const client = findClient(resolvedParams.client);

  if (!client || client.id !== "neumann") {
    notFound();
  }

  // Klanten met hun voedingsplannen
  const klantenMetPlannen = [
    {
      klantId: "1",
      klantNaam: "Marijn Besseler",
      email: "marijn@example.nl",
      voedingsplan: {
        id: "1",
        naam: "Revalidatie Schema - Zachte Start",
        type: "Revalidatie",
        kcal: 2000,
        status: "Actief",
        aangemaakt: "2024-11-10",
        laatsteUpdate: "2024-12-10",
      },
    },
    {
      klantId: "2",
      klantNaam: "Kristel Kwant",
      email: "kristel@example.nl",
      voedingsplan: {
        id: "2",
        naam: "Revalidatie Schema - Zachte Start",
        type: "Revalidatie",
        kcal: 1800,
        status: "Actief",
        aangemaakt: "2024-10-15",
        laatsteUpdate: "2024-12-05",
      },
    },
    {
      klantId: "3",
      klantNaam: "Heather Court",
      email: "heather@example.nl",
      voedingsplan: {
        id: "3",
        naam: "Afval Schema - 1500 kcal",
        type: "Gewichtsverlies",
        kcal: 1500,
        status: "Voltooid",
        aangemaakt: "2024-06-01",
        laatsteUpdate: "2024-11-15",
      },
    },
    {
      klantId: "4",
      klantNaam: "Fadil Deniz",
      email: "fadil@example.nl",
      voedingsplan: {
        id: "4",
        naam: "Spiermassa Opbouw - 2500 kcal",
        type: "Bulk",
        kcal: 2500,
        status: "Actief",
        aangemaakt: "2024-08-10",
        laatsteUpdate: "2024-12-01",
      },
    },
    {
      klantId: "5",
      klantNaam: "Sarah de Vries",
      email: "sarah@example.nl",
      voedingsplan: {
        id: "5",
        naam: "Afval Schema - 1500 kcal",
        type: "Gewichtsverlies",
        kcal: 1500,
        status: "Actief",
        aangemaakt: "2024-10-01",
        laatsteUpdate: "2024-12-10",
      },
    },
    {
      klantId: "6",
      klantNaam: "Mark Jansen",
      email: "mark@example.nl",
      voedingsplan: {
        id: "6",
        naam: "Spiermassa Opbouw - 2500 kcal",
        type: "Bulk",
        kcal: 2500,
        status: "Actief",
        aangemaakt: "2024-09-15",
        laatsteUpdate: "2024-12-05",
      },
    },
    {
      klantId: "7",
      klantNaam: "Emma Bakker",
      email: "emma@example.nl",
      voedingsplan: {
        id: "7",
        naam: "Onderhoud Schema - 2000 kcal",
        type: "Onderhoud",
        kcal: 2000,
        status: "Voltooid",
        aangemaakt: "2024-05-01",
        laatsteUpdate: "2024-10-15",
      },
    },
    {
      klantId: "8",
      klantNaam: "Erwin Altena",
      email: "erwin@example.nl",
      voedingsplan: {
        id: "8",
        naam: "Onderhoud Schema - 2000 kcal",
        type: "Onderhoud",
        kcal: 2000,
        status: "Actief",
        aangemaakt: "2024-09-20",
        laatsteUpdate: "2024-12-12",
      },
    },
  ];

  const adviezen = [
    {
      id: "1",
      klant: "Marijn Besseler",
      onderwerp: "Eiwitinname verhogen",
      datum: "2024-12-15",
      status: "Afgerond",
    },
    {
      id: "2",
      klant: "Erwin Altena",
      onderwerp: "Meal prep strategie",
      datum: "2024-12-14",
      status: "In behandeling",
    },
    {
      id: "3",
      klant: "Sarah de Vries",
      onderwerp: "Koolhydraat timing",
      datum: "2024-12-13",
      status: "Afgerond",
    },
  ];

  const stats = {
    totalKlanten: klantenMetPlannen.length,
    actievePlannen: klantenMetPlannen.filter((k) => k.voedingsplan.status === "Actief").length,
    openstaandeAdviezen: adviezen.filter((a) => a.status === "In behandeling").length,
  };

  return (
    <div className="page-admin">
      <div className="page-header">
        <h1>Voedingsplannen</h1>
        <Link href={`/clients/${client.id}/voeding/nieuw`} className="btn btn--primary">
          <Plus size={16} />
          Nieuw Plan
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="page-stats">
        <div className="page-stat-card">
          <h3>{stats.totalKlanten}</h3>
          <p>Totaal Klanten</p>
        </div>
        <div className="page-stat-card page-stat-card--active">
          <h3>{stats.actievePlannen}</h3>
          <p>Actieve Plannen</p>
        </div>
        <div className="page-stat-card">
          <h3>{stats.openstaandeAdviezen}</h3>
          <p>Openstaande Adviezen</p>
        </div>
      </div>

      {/* Klanten met Voedingsplannen */}
      <div className="page-section">
        <h2 className="page-section__title">Klanten & Voedingsplannen</h2>
        <div className="page-card">
          <div className="dashboard-table">
            <table>
              <thead>
                <tr>
                  <th>Klant</th>
                  <th>Voedingsplan</th>
                  <th>Type</th>
                  <th>Kcal</th>
                  <th>Status</th>
                  <th>Laatste Update</th>
                  <th>Acties</th>
                </tr>
              </thead>
              <tbody>
                {klantenMetPlannen.map((item) => (
                  <tr key={item.klantId} className="dashboard-table__row--clickable">
                    <td>
                      <Link href={`/clients/${client.id}/voeding/${item.voedingsplan.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                        <strong>{item.klantNaam}</strong>
                        <span className="dashboard-table__meta">{item.email}</span>
                      </Link>
                    </td>
                    <td>
                      <Link href={`/clients/${client.id}/voeding/${item.voedingsplan.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                        {item.voedingsplan.naam}
                      </Link>
                    </td>
                    <td>
                      <Link href={`/clients/${client.id}/voeding/${item.voedingsplan.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                        <span className="dashboard-table__type">{item.voedingsplan.type}</span>
                      </Link>
                    </td>
                    <td>
                      <Link href={`/clients/${client.id}/voeding/${item.voedingsplan.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                        {item.voedingsplan.kcal} kcal
                      </Link>
                    </td>
                    <td>
                      <Link href={`/clients/${client.id}/voeding/${item.voedingsplan.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                        <span className={`dashboard-badge dashboard-badge--${item.voedingsplan.status.toLowerCase()}`}>
                          {item.voedingsplan.status}
                        </span>
                      </Link>
                    </td>
                    <td>
                      <Link href={`/clients/${client.id}/voeding/${item.voedingsplan.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                        {new Date(item.voedingsplan.laatsteUpdate).toLocaleDateString("nl-NL")}
                      </Link>
                    </td>
                    <td>
                      <div className="dashboard-actions">
                        <Link href={`/clients/${client.id}/voeding/${item.voedingsplan.id}`} className="dashboard-action-btn" title="Bekijken">
                          <FileText size={16} />
                        </Link>
                        <button className="dashboard-action-btn" title="Bewerken">
                          <UtensilsCrossed size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Recente Adviezen */}
      <div className="page-section">
        <h2 className="page-section__title">Recente Voedingsadviezen</h2>
        <div className="page-card">
          <div className="dashboard-table">
            <table>
              <thead>
                <tr>
                  <th>Klant</th>
                  <th>Onderwerp</th>
                  <th>Datum</th>
                  <th>Status</th>
                  <th>Acties</th>
                </tr>
              </thead>
              <tbody>
                {adviezen.map((advies) => (
                  <tr key={advies.id}>
                    <td>
                      <strong>{advies.klant}</strong>
                    </td>
                    <td>{advies.onderwerp}</td>
                    <td>{new Date(advies.datum).toLocaleDateString("nl-NL")}</td>
                    <td>
                      <span className={`dashboard-badge dashboard-badge--${advies.status.toLowerCase().replace(" ", "-")}`}>
                        {advies.status}
                      </span>
                    </td>
                    <td>
                      <div className="dashboard-actions">
                        <button className="dashboard-action-btn" title="Bekijken">
                          <FileText size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

