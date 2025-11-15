"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Calculator, Save } from "lucide-react";
import Link from "next/link";
import { neumannDashboardData } from "@/lib/dashboard-data";

export default function KcalCalculatorPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.client as string;

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

  const [formData, setFormData] = useState({
    klantId: "",
    klantNaam: "",
    geslacht: "man" as "man" | "vrouw",
    leeftijd: "",
    gewicht: "",
    lengte: "",
    activiteitsniveau: "licht" as "licht" | "matig" | "actief" | "zeer_actief",
    doel: "onderhoud" as "onderhoud" | "afvallen" | "aankomen",
  });

  const [resultaat, setResultaat] = useState<{
    bmr: number;
    tdee: number;
    doelKcal: number;
    eiwit: number;
    koolhydraten: number;
    vetten: number;
  } | null>(null);

  // Activiteitsfactoren
  const activiteitsfactoren = {
    licht: 1.2, // Weinig of geen beweging
    matig: 1.375, // Lichte beweging 1-3 dagen per week
    actief: 1.55, // Matige beweging 3-5 dagen per week
    zeer_actief: 1.725, // Zware beweging 6-7 dagen per week
  };

  // Doel aanpassingen
  const doelAanpassingen = {
    afvallen: -500, // 500 kcal deficit voor ~0.5kg per week
    onderhoud: 0,
    aankomen: 300, // 300 kcal surplus voor geleidelijke gewichtstoename
  };

  const handleKlantChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedKlantId = e.target.value;
    const selectedKlant = allClients.find((c) => c.id === selectedKlantId);
    setFormData((prev) => ({
      ...prev,
      klantId: selectedKlantId,
      klantNaam: selectedKlant ? selectedKlant.name : "",
    }));
  };

  const berekenKcal = () => {
    const leeftijd = parseFloat(formData.leeftijd);
    const gewicht = parseFloat(formData.gewicht);
    const lengte = parseFloat(formData.lengte);

    if (!leeftijd || !gewicht || !lengte || !formData.klantId || !formData.klantNaam) {
      alert("Vul alle velden in");
      return;
    }

    // Mifflin-St Jeor formule (meest accuraat)
    let bmr: number;
    if (formData.geslacht === "man") {
      bmr = 10 * gewicht + 6.25 * lengte - 5 * leeftijd + 5;
    } else {
      bmr = 10 * gewicht + 6.25 * lengte - 5 * leeftijd - 161;
    }

    // TDEE (Total Daily Energy Expenditure)
    const tdee = Math.round(bmr * activiteitsfactoren[formData.activiteitsniveau]);

    // Doel kcal
    const doelKcal = Math.round(tdee + doelAanpassingen[formData.doel]);

    // Macro's berekenen (standaard verdeling)
    let eiwit: number;
    let koolhydraten: number;
    let vetten: number;

    if (formData.doel === "afvallen") {
      // Bij afvallen: meer eiwit, minder koolhydraten
      eiwit = Math.round(gewicht * 2.2); // 2.2g per kg lichaamsgewicht
      vetten = Math.round((doelKcal * 0.25) / 9); // 25% van kcal uit vetten
      const eiwitKcal = eiwit * 4;
      const vettenKcal = vetten * 9;
      const koolhydratenKcal = doelKcal - eiwitKcal - vettenKcal;
      koolhydraten = Math.round(koolhydratenKcal / 4);
    } else if (formData.doel === "aankomen") {
      // Bij aankomen: meer koolhydraten
      eiwit = Math.round(gewicht * 2); // 2g per kg lichaamsgewicht
      vetten = Math.round((doelKcal * 0.25) / 9); // 25% van kcal uit vetten
      const eiwitKcal = eiwit * 4;
      const vettenKcal = vetten * 9;
      const koolhydratenKcal = doelKcal - eiwitKcal - vettenKcal;
      koolhydraten = Math.round(koolhydratenKcal / 4);
    } else {
      // Onderhoud: gebalanceerd
      eiwit = Math.round(gewicht * 1.8); // 1.8g per kg lichaamsgewicht
      koolhydraten = Math.round((doelKcal * 0.45) / 4); // 45% van kcal uit koolhydraten
      vetten = Math.round((doelKcal * 0.25) / 9); // 25% van kcal uit vetten
    }

    setResultaat({
      bmr: Math.round(bmr),
      tdee,
      doelKcal,
      eiwit,
      koolhydraten,
      vetten,
    });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    berekenKcal();
  };

  return (
    <div className="page-admin">
      <div className="page-header">
        <div>
          <Link
            href={`/clients/${clientId}/voeding`}
            className="dashboard-card__link"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              marginBottom: "1rem",
            }}
          >
            <ArrowLeft size={16} />
            Terug naar Voedingsplannen
          </Link>
          <h1>Kcal Calculator</h1>
          <p style={{ color: "#64748b", marginTop: "0.5rem" }}>
            Bereken de dagelijkse caloriebehoefte voor een klant
          </p>
        </div>
      </div>

      <div className="page-section">
        <div className="page-card">
          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gap: "1.5rem" }}>
              {/* Klant Selectie */}
              <div>
                <label
                  htmlFor="klantId"
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontWeight: 500,
                  }}
                >
                  Selecteer Klant *
                </label>
                <select
                  id="klantId"
                  name="klantId"
                  value={formData.klantId}
                  onChange={handleKlantChange}
                  required
                  className="page-filter"
                  style={{ width: "100%" }}
                >
                  <option value="">-- Selecteer een klant --</option>
                  {allClients.map((klant) => (
                    <option key={klant.id} value={klant.id}>
                      {klant.name} {klant.status === "Actief" ? "✓" : ""}
                    </option>
                  ))}
                </select>
                {formData.klantNaam && (
                  <span className="dashboard-table__meta" style={{ display: "block", marginTop: "0.5rem" }}>
                    Geselecteerd: {formData.klantNaam}
                  </span>
                )}
              </div>

              {/* Geslacht en Leeftijd */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label
                    htmlFor="geslacht"
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      fontWeight: 500,
                    }}
                  >
                    Geslacht *
                  </label>
                  <select
                    id="geslacht"
                    name="geslacht"
                    value={formData.geslacht}
                    onChange={handleInputChange}
                    required
                    className="page-filter"
                    style={{ width: "100%" }}
                  >
                    <option value="man">Man</option>
                    <option value="vrouw">Vrouw</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="leeftijd"
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      fontWeight: 500,
                    }}
                  >
                    Leeftijd (jaren) *
                  </label>
                  <input
                    type="number"
                    id="leeftijd"
                    name="leeftijd"
                    value={formData.leeftijd}
                    onChange={handleInputChange}
                    required
                    min="1"
                    max="120"
                    className="page-filter"
                    style={{ width: "100%" }}
                    placeholder="Bijv. 30"
                  />
                </div>
              </div>

              {/* Gewicht en Lengte */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label
                    htmlFor="gewicht"
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      fontWeight: 500,
                    }}
                  >
                    Gewicht (kg) *
                  </label>
                  <input
                    type="number"
                    id="gewicht"
                    name="gewicht"
                    value={formData.gewicht}
                    onChange={handleInputChange}
                    required
                    min="1"
                    step="0.1"
                    className="page-filter"
                    style={{ width: "100%" }}
                    placeholder="Bijv. 75"
                  />
                </div>

                <div>
                  <label
                    htmlFor="lengte"
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      fontWeight: 500,
                    }}
                  >
                    Lengte (cm) *
                  </label>
                  <input
                    type="number"
                    id="lengte"
                    name="lengte"
                    value={formData.lengte}
                    onChange={handleInputChange}
                    required
                    min="1"
                    className="page-filter"
                    style={{ width: "100%" }}
                    placeholder="Bijv. 175"
                  />
                </div>
              </div>

              {/* Activiteitsniveau */}
              <div>
                <label
                  htmlFor="activiteitsniveau"
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontWeight: 500,
                  }}
                >
                  Activiteitsniveau *
                </label>
                <select
                  id="activiteitsniveau"
                  name="activiteitsniveau"
                  value={formData.activiteitsniveau}
                  onChange={handleInputChange}
                  required
                  className="page-filter"
                  style={{ width: "100%" }}
                >
                  <option value="licht">Licht actief (weinig beweging)</option>
                  <option value="matig">Matig actief (1-3x per week sporten)</option>
                  <option value="actief">Actief (3-5x per week sporten)</option>
                  <option value="zeer_actief">Zeer actief (6-7x per week sporten)</option>
                </select>
              </div>

              {/* Doel */}
              <div>
                <label
                  htmlFor="doel"
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontWeight: 500,
                  }}
                >
                  Doel *
                </label>
                <select
                  id="doel"
                  name="doel"
                  value={formData.doel}
                  onChange={handleInputChange}
                  required
                  className="page-filter"
                  style={{ width: "100%" }}
                >
                  <option value="afvallen">Afvallen</option>
                  <option value="onderhoud">Onderhoud</option>
                  <option value="aankomen">Aankomen / Spieropbouw</option>
                </select>
              </div>

              {/* Bereken Button */}
              <button type="submit" className="btn btn--primary" style={{ width: "100%" }}>
                <Calculator size={16} />
                Bereken Dagelijkse Kcal
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Resultaten */}
      {resultaat && (
        <div className="page-section">
          <div className="page-card">
            <h2 style={{ marginBottom: "1.5rem" }}>Berekeningsresultaten</h2>

            {/* Stats Cards */}
            <div className="page-stats">
              <div className="page-stat-card">
                <h3>{resultaat.bmr}</h3>
                <p>BMR (kcal/dag)</p>
                <span className="dashboard-table__meta">Basale stofwisseling</span>
              </div>
              <div className="page-stat-card page-stat-card--active">
                <h3>{resultaat.tdee}</h3>
                <p>TDEE (kcal/dag)</p>
                <span className="dashboard-table__meta">Totaal energieverbruik</span>
              </div>
              <div className="page-stat-card page-stat-card--primary">
                <h3>{resultaat.doelKcal}</h3>
                <p>Doel Kcal/dag</p>
                <span className="dashboard-table__meta">Voor {formData.doel}</span>
              </div>
            </div>

            {/* Macro's */}
            <div style={{ marginTop: "2rem" }}>
              <h3 style={{ marginBottom: "1rem" }}>Macronutriënten Verdeling</h3>
              <div className="page-stats">
                <div className="page-stat-card">
                  <h3>{resultaat.eiwit}g</h3>
                  <p>Eiwit</p>
                  <span className="dashboard-table__meta">
                    {Math.round((resultaat.eiwit * 4 * 100) / resultaat.doelKcal)}% van kcal
                  </span>
                </div>
                <div className="page-stat-card">
                  <h3>{resultaat.koolhydraten}g</h3>
                  <p>Koolhydraten</p>
                  <span className="dashboard-table__meta">
                    {Math.round((resultaat.koolhydraten * 4 * 100) / resultaat.doelKcal)}% van kcal
                  </span>
                </div>
                <div className="page-stat-card">
                  <h3>{resultaat.vetten}g</h3>
                  <p>Vetten</p>
                  <span className="dashboard-table__meta">
                    {Math.round((resultaat.vetten * 9 * 100) / resultaat.doelKcal)}% van kcal
                  </span>
                </div>
              </div>
            </div>

            {/* Actie Buttons */}
            <div style={{ marginTop: "2rem", display: "flex", gap: "1rem" }}>
              <button
                className="btn btn--primary"
                onClick={() => {
                  // Genereer een nieuw schema ID en stuur door naar detail pagina
                  const schemaId = `schema-${Date.now()}`;
                  const params = new URLSearchParams({
                    klantNaam: formData.klantNaam,
                    doelKcal: resultaat.doelKcal.toString(),
                    eiwit: resultaat.eiwit.toString(),
                    koolhydraten: resultaat.koolhydraten.toString(),
                    vetten: resultaat.vetten.toString(),
                    bmr: resultaat.bmr.toString(),
                    tdee: resultaat.tdee.toString(),
                    doel: formData.doel,
                  });
                  router.push(`/clients/${clientId}/voeding/${schemaId}?${params.toString()}`);
                }}
              >
                <Save size={16} />
                Plan Aanmaken met deze Waarden
              </button>
              <button
                className="btn btn--secondary"
                onClick={() => {
                  setResultaat(null);
                  setFormData({
                    klantId: "",
                    klantNaam: "",
                    geslacht: "man",
                    leeftijd: "",
                    gewicht: "",
                    lengte: "",
                    activiteitsniveau: "licht",
                    doel: "onderhoud",
                  });
                }}
              >
                Nieuwe Berekening
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

