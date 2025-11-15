"use client";

import { Suspense } from "react";
import { useSearchParams, useParams } from "next/navigation";
import { ArrowLeft, Sparkles, CheckCircle } from "lucide-react";
import Link from "next/link";

// Force dynamic rendering omdat we searchParams gebruiken
export const dynamic = 'force-dynamic';

// Ingrediënten database (per 100g) - zelfde als in schema detail pagina
const ingrediëntenDatabase = [
  // Vlees & Vis
  { naam: "Kipfilet", kcal: 165, eiwit: 31, koolhydraten: 0, vetten: 3.6 },
  { naam: "Kippendij", kcal: 209, eiwit: 26, koolhydraten: 0, vetten: 10.9 },
  { naam: "Rundvlees (mager)", kcal: 250, eiwit: 26, koolhydraten: 0, vetten: 15 },
  { naam: "Varkenshaas", kcal: 143, eiwit: 22, koolhydraten: 0, vetten: 6 },
  { naam: "Zalm", kcal: 208, eiwit: 20, koolhydraten: 0, vetten: 13 },
  { naam: "Tonijn (vers)", kcal: 144, eiwit: 30, koolhydraten: 0, vetten: 1 },
  { naam: "Kabeljauw", kcal: 82, eiwit: 18, koolhydraten: 0, vetten: 0.7 },
  { naam: "Garnalen", kcal: 99, eiwit: 24, koolhydraten: 0, vetten: 0.3 },
  { naam: "Kalkoenfilet", kcal: 135, eiwit: 30, koolhydraten: 0, vetten: 1 },
  
  // Eieren & Zuivel
  { naam: "Ei (heel)", kcal: 155, eiwit: 13, koolhydraten: 1.1, vetten: 11 },
  { naam: "Eiwit", kcal: 52, eiwit: 11, koolhydraten: 0.7, vetten: 0.2 },
  { naam: "Griekse yoghurt (vol)", kcal: 97, eiwit: 10, koolhydraten: 3.6, vetten: 5 },
  { naam: "Griekse yoghurt (mager)", kcal: 59, eiwit: 10, koolhydraten: 3.6, vetten: 0.4 },
  { naam: "Kwark (vol)", kcal: 98, eiwit: 12, koolhydraten: 3.5, vetten: 4.3 },
  { naam: "Kwark (mager)", kcal: 57, eiwit: 10, koolhydraten: 3.5, vetten: 0.2 },
  { naam: "Skyr", kcal: 59, eiwit: 11, koolhydraten: 4, vetten: 0.2 },
  { naam: "Feta", kcal: 250, eiwit: 14, koolhydraten: 2, vetten: 20 },
  { naam: "Tofu", kcal: 76, eiwit: 8, koolhydraten: 1.9, vetten: 4.8 },
  
  // Granen & Zetmeel
  { naam: "Havermout (droog)", kcal: 389, eiwit: 17, koolhydraten: 66, vetten: 7 },
  { naam: "Quinoa (gekookt)", kcal: 120, eiwit: 4.4, koolhydraten: 22, vetten: 1.9 },
  { naam: "Rijst (gekookt)", kcal: 130, eiwit: 2.7, koolhydraten: 28, vetten: 0.3 },
  { naam: "Bruine rijst (gekookt)", kcal: 111, eiwit: 2.6, koolhydraten: 23, vetten: 0.9 },
  { naam: "Pasta (gekookt)", kcal: 131, eiwit: 5, koolhydraten: 25, vetten: 1.1 },
  { naam: "Volkoren pasta (gekookt)", kcal: 124, eiwit: 5, koolhydraten: 25, vetten: 1.1 },
  { naam: "Zoete aardappel (gekookt)", kcal: 86, eiwit: 1.6, koolhydraten: 20, vetten: 0.1 },
  { naam: "Aardappel (gekookt)", kcal: 87, eiwit: 2, koolhydraten: 20, vetten: 0.1 },
  { naam: "Brood (volkoren)", kcal: 247, eiwit: 13, koolhydraten: 41, vetten: 4.2 },
  
  // Groenten
  { naam: "Broccoli", kcal: 34, eiwit: 2.8, koolhydraten: 7, vetten: 0.4 },
  { naam: "Spinazie (rauw)", kcal: 23, eiwit: 2.9, koolhydraten: 3.6, vetten: 0.4 },
  { naam: "Wortelen (rauw)", kcal: 41, eiwit: 0.9, koolhydraten: 10, vetten: 0.2 },
  { naam: "Paprika (rood)", kcal: 31, eiwit: 1, koolhydraten: 7, vetten: 0.3 },
  { naam: "Courgette", kcal: 17, eiwit: 1.2, koolhydraten: 3.1, vetten: 0.3 },
  { naam: "Tomaten", kcal: 18, eiwit: 0.9, koolhydraten: 3.9, vetten: 0.2 },
  { naam: "Komkommer", kcal: 16, eiwit: 0.7, koolhydraten: 4, vetten: 0.1 },
  { naam: "Bloemkool", kcal: 25, eiwit: 1.9, koolhydraten: 5, vetten: 0.3 },
  { naam: "Boerenkool", kcal: 49, eiwit: 4.3, koolhydraten: 9, vetten: 0.9 },
  { naam: "Groene bonen", kcal: 31, eiwit: 1.8, koolhydraten: 7, vetten: 0.1 },
  { naam: "Doperwten", kcal: 81, eiwit: 5.4, koolhydraten: 14, vetten: 0.4 },
  
  // Fruit
  { naam: "Banaan", kcal: 89, eiwit: 1.1, koolhydraten: 23, vetten: 0.3 },
  { naam: "Appel", kcal: 52, eiwit: 0.3, koolhydraten: 14, vetten: 0.2 },
  { naam: "Blauwe bessen", kcal: 57, eiwit: 0.7, koolhydraten: 14, vetten: 0.3 },
  { naam: "Aardbeien", kcal: 32, eiwit: 0.7, koolhydraten: 8, vetten: 0.3 },
  
  // Vetten & Oliën
  { naam: "Olijfolie", kcal: 884, eiwit: 0, koolhydraten: 0, vetten: 100 },
  { naam: "Avocado", kcal: 160, eiwit: 2, koolhydraten: 9, vetten: 15 },
  { naam: "Boter", kcal: 717, eiwit: 0.9, koolhydraten: 0.1, vetten: 81 },
  
  // Noten & Zaden
  { naam: "Amandelen", kcal: 579, eiwit: 21, koolhydraten: 22, vetten: 50 },
  { naam: "Walnoten", kcal: 654, eiwit: 15, koolhydraten: 14, vetten: 65 },
  { naam: "Chiazaad", kcal: 486, eiwit: 17, koolhydraten: 42, vetten: 31 },
];

// Functie om maaltijden te genereren op basis van voorkeuren
function genereerMaaltijden(
  aantalMaaltijden: number,
  doelKcal: number,
  doelEiwit: number,
  doelKoolhydraten: number,
  doelVetten: number,
  soortMaaltijden: string[],
  vleesOpties: string[],
  groentenOpties: string[]
) {
  const kcalPerMaaltijd = Math.round(doelKcal / aantalMaaltijden);
  const eiwitPerMaaltijd = doelEiwit / aantalMaaltijden;
  const koolhydratenPerMaaltijd = doelKoolhydraten / aantalMaaltijden;
  const vettenPerMaaltijd = doelVetten / aantalMaaltijden;

  const maaltijdNamen = ["Ontbijt", "Lunch", "Diner", "Snack 1", "Snack 2", "Snack 3"];
  const tijden = ["08:00", "12:30", "18:00", "10:00", "15:00", "20:00"];

  // Filter ingrediënten op basis van voorkeuren
  const beschikbaarVlees = vleesOpties.length > 0
    ? ingrediëntenDatabase.filter((ing) =>
        vleesOpties.some((v) => ing.naam.toLowerCase().includes(v.toLowerCase()))
      )
    : ingrediëntenDatabase.filter((ing) =>
        ["kip", "rund", "varken", "zalm", "tonijn", "kabeljauw", "garnalen", "kalkoen", "ei", "tofu"].some((v) =>
          ing.naam.toLowerCase().includes(v)
        )
      );

  const beschikbaarGroenten = groentenOpties.length > 0
    ? ingrediëntenDatabase.filter((ing) =>
        groentenOpties.some((g) => ing.naam.toLowerCase().includes(g.toLowerCase()))
      )
    : ingrediëntenDatabase.filter((ing) =>
        ["broccoli", "spinazie", "wortel", "paprika", "courgette", "tomaat", "komkommer", "bloemkool", "boerenkool", "bonen", "erwten"].some((g) =>
          ing.naam.toLowerCase().includes(g)
        )
      );

  const beschikbaarKoolhydraten = ingrediëntenDatabase.filter((ing) =>
    ["havermout", "quinoa", "rijst", "pasta", "aardappel", "brood"].some((k) =>
      ing.naam.toLowerCase().includes(k)
    )
  );

  const beschikbaarFruit = ingrediëntenDatabase.filter((ing) =>
    ["banaan", "appel", "blauwe bessen", "aardbeien"].some((f) =>
      ing.naam.toLowerCase().includes(f)
    )
  );

  const isEiwitrijk = soortMaaltijden.includes("Eiwitrijk");
  const isKoolhydraatrijk = soortMaaltijden.includes("Koolhydraatrijk");
  const isVetrijk = soortMaaltijden.includes("Vetrijk");
  const isVegan = soortMaaltijden.includes("Vegan");
  const isVegetarisch = soortMaaltijden.includes("Vegetarisch");
  const isKeto = soortMaaltijden.includes("Keto");
  const isLowCarb = soortMaaltijden.includes("Low-carb");

  return Array.from({ length: aantalMaaltijden }).map((_, index) => {
    const maaltijdNaam = maaltijdNamen[index] || `Maaltijd ${index + 1}`;
    const isOntbijt = index === 0;
    const isLunch = index === 1;
    const isDiner = index === 2;
    const isSnack = index >= 3;

    let ingrediënten: Array<{ naam: string; portie: string; kcal: number; eiwit: number; koolhydraten: number; vetten: number }> = [];

    if (isSnack) {
      // Snacks zijn kleiner en eenvoudiger
      if (isEiwitrijk || isLowCarb || isKeto) {
        const eiwitBron = isVegan || isVegetarisch
          ? beschikbaarVlees.find((v) => v.naam.toLowerCase().includes("tofu")) || beschikbaarVlees.find((v) => v.naam.toLowerCase().includes("ei"))
          : beschikbaarVlees[Math.floor(Math.random() * beschikbaarVlees.length)];
        
        if (eiwitBron) {
          const portie = Math.round((kcalPerMaaltijd * 0.6) / (eiwitBron.kcal / 100));
          ingrediënten.push({
            naam: eiwitBron.naam,
            portie: `${portie}g`,
            kcal: Math.round((eiwitBron.kcal / 100) * portie),
            eiwit: Math.round((eiwitBron.eiwit / 100) * portie * 10) / 10,
            koolhydraten: Math.round((eiwitBron.koolhydraten / 100) * portie * 10) / 10,
            vetten: Math.round((eiwitBron.vetten / 100) * portie * 10) / 10,
          });
        }
        
        if (!isKeto && beschikbaarFruit.length > 0) {
          const fruit = beschikbaarFruit[Math.floor(Math.random() * beschikbaarFruit.length)];
          const portie = Math.round((kcalPerMaaltijd * 0.4) / (fruit.kcal / 100));
          ingrediënten.push({
            naam: fruit.naam,
            portie: `${portie}g`,
            kcal: Math.round((fruit.kcal / 100) * portie),
            eiwit: Math.round((fruit.eiwit / 100) * portie * 10) / 10,
            koolhydraten: Math.round((fruit.koolhydraten / 100) * portie * 10) / 10,
            vetten: Math.round((fruit.vetten / 100) * portie * 10) / 10,
          });
        }
      } else {
        // Gebalanceerde snack
        const fruit = beschikbaarFruit[Math.floor(Math.random() * beschikbaarFruit.length)];
        const portie = Math.round((kcalPerMaaltijd * 0.7) / (fruit.kcal / 100));
        ingrediënten.push({
          naam: fruit.naam,
          portie: `${portie}g`,
          kcal: Math.round((fruit.kcal / 100) * portie),
          eiwit: Math.round((fruit.eiwit / 100) * portie * 10) / 10,
          koolhydraten: Math.round((fruit.koolhydraten / 100) * portie * 10) / 10,
          vetten: Math.round((fruit.vetten / 100) * portie * 10) / 10,
        });
        
        if (beschikbaarVlees.length > 0 && !isVegan) {
          const eiwitBron = isVegetarisch
            ? beschikbaarVlees.find((v) => v.naam.toLowerCase().includes("ei") || v.naam.toLowerCase().includes("yoghurt"))
            : beschikbaarVlees[Math.floor(Math.random() * beschikbaarVlees.length)];
          
          if (eiwitBron) {
            const portie = Math.round((kcalPerMaaltijd * 0.3) / (eiwitBron.kcal / 100));
            ingrediënten.push({
              naam: eiwitBron.naam,
              portie: `${portie}g`,
              kcal: Math.round((eiwitBron.kcal / 100) * portie),
              eiwit: Math.round((eiwitBron.eiwit / 100) * portie * 10) / 10,
              koolhydraten: Math.round((eiwitBron.koolhydraten / 100) * portie * 10) / 10,
              vetten: Math.round((eiwitBron.vetten / 100) * portie * 10) / 10,
            });
          }
        }
      }
    } else {
      // Hoofdmaaltijden
      // Eiwitbron (30-40% van kcal)
      if (beschikbaarVlees.length > 0) {
        let eiwitBron;
        if (isVegan) {
          eiwitBron = beschikbaarVlees.find((v) => v.naam.toLowerCase().includes("tofu"));
        } else if (isVegetarisch) {
          eiwitBron = beschikbaarVlees.find((v) => v.naam.toLowerCase().includes("ei") || v.naam.toLowerCase().includes("yoghurt") || v.naam.toLowerCase().includes("kwark"));
        } else {
          eiwitBron = beschikbaarVlees[Math.floor(Math.random() * beschikbaarVlees.length)];
        }
        
        if (eiwitBron) {
          const eiwitPercentage = isEiwitrijk ? 0.45 : isKeto ? 0.4 : 0.35;
          const portie = Math.round((kcalPerMaaltijd * eiwitPercentage) / (eiwitBron.kcal / 100));
          ingrediënten.push({
            naam: eiwitBron.naam,
            portie: `${portie}g`,
            kcal: Math.round((eiwitBron.kcal / 100) * portie),
            eiwit: Math.round((eiwitBron.eiwit / 100) * portie * 10) / 10,
            koolhydraten: Math.round((eiwitBron.koolhydraten / 100) * portie * 10) / 10,
            vetten: Math.round((eiwitBron.vetten / 100) * portie * 10) / 10,
          });
        }
      }

      // Koolhydraten (30-50% van kcal, afhankelijk van voorkeur)
      if (!isKeto && !isLowCarb && beschikbaarKoolhydraten.length > 0) {
        const koolhydraatBron = beschikbaarKoolhydraten[Math.floor(Math.random() * beschikbaarKoolhydraten.length)];
        const koolhydraatPercentage = isKoolhydraatrijk ? 0.5 : isOntbijt ? 0.4 : 0.35;
        const portie = Math.round((kcalPerMaaltijd * koolhydraatPercentage) / (koolhydraatBron.kcal / 100));
        ingrediënten.push({
          naam: koolhydraatBron.naam,
          portie: `${portie}g`,
          kcal: Math.round((koolhydraatBron.kcal / 100) * portie),
          eiwit: Math.round((koolhydraatBron.eiwit / 100) * portie * 10) / 10,
          koolhydraten: Math.round((koolhydraatBron.koolhydraten / 100) * portie * 10) / 10,
          vetten: Math.round((koolhydraatBron.vetten / 100) * portie * 10) / 10,
        });
      }

      // Groenten (10-15% van kcal)
      if (beschikbaarGroenten.length > 0) {
        const groente = beschikbaarGroenten[Math.floor(Math.random() * beschikbaarGroenten.length)];
        const portie = Math.round((kcalPerMaaltijd * 0.12) / (groente.kcal / 100));
        ingrediënten.push({
          naam: groente.naam,
          portie: `${portie}g`,
          kcal: Math.round((groente.kcal / 100) * portie),
          eiwit: Math.round((groente.eiwit / 100) * portie * 10) / 10,
          koolhydraten: Math.round((groente.koolhydraten / 100) * portie * 10) / 10,
          vetten: Math.round((groente.vetten / 100) * portie * 10) / 10,
        });
      }

      // Vetten (indien nodig, vooral voor keto/vetrijk)
      if ((isVetrijk || isKeto) && ingrediënten.length > 0) {
        const vetBron = ingrediëntenDatabase.find((ing) => ing.naam.toLowerCase().includes("olijfolie")) ||
                        ingrediëntenDatabase.find((ing) => ing.naam.toLowerCase().includes("avocado"));
        if (vetBron) {
          const huidigeKcal = ingrediënten.reduce((sum, ing) => sum + ing.kcal, 0);
          const resterendeKcal = Math.max(0, kcalPerMaaltijd - huidigeKcal);
          if (resterendeKcal > 50) {
            const portie = Math.round((resterendeKcal * 0.8) / (vetBron.kcal / 100));
            ingrediënten.push({
              naam: vetBron.naam,
              portie: `${portie}g`,
              kcal: Math.round((vetBron.kcal / 100) * portie),
              eiwit: Math.round((vetBron.eiwit / 100) * portie * 10) / 10,
              koolhydraten: Math.round((vetBron.koolhydraten / 100) * portie * 10) / 10,
              vetten: Math.round((vetBron.vetten / 100) * portie * 10) / 10,
            });
          }
        }
      }
    }

    // Bereken totaal
    const totaal = ingrediënten.reduce(
      (acc, ing) => ({
        kcal: acc.kcal + ing.kcal,
        eiwit: acc.eiwit + ing.eiwit,
        koolhydraten: acc.koolhydraten + ing.koolhydraten,
        vetten: acc.vetten + ing.vetten,
      }),
      { kcal: 0, eiwit: 0, koolhydraten: 0, vetten: 0 }
    );

    return {
      id: `maaltijd-${index + 1}`,
      naam: maaltijdNaam,
      tijd: tijden[index] || "TBD",
      ingrediënten,
      totaal: {
        kcal: Math.round(totaal.kcal),
        eiwit: Math.round(totaal.eiwit * 10) / 10,
        koolhydraten: Math.round(totaal.koolhydraten * 10) / 10,
        vetten: Math.round(totaal.vetten * 10) / 10,
      },
    };
  });
}

function AIPlanPageContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const clientId = params.client as string;

  // Haal data uit URL parameters
  const klantNaam = searchParams.get("klantNaam") || "Nieuwe Klant";
  const doelKcal = parseInt(searchParams.get("doelKcal") || "2000");
  const eiwit = parseInt(searchParams.get("eiwit") || "150");
  const koolhydraten = parseInt(searchParams.get("koolhydraten") || "200");
  const vetten = parseInt(searchParams.get("vetten") || "65");
  const doel = searchParams.get("doel") || "onderhoud";
  const aantalMaaltijden = parseInt(searchParams.get("aantalMaaltijden") || "3");
  const soortMaaltijden = searchParams.get("soortMaaltijden")?.split(",") || [];
  const vlees = searchParams.get("vlees")?.split(",").filter(Boolean) || [];
  const groenten = searchParams.get("groenten")?.split(",").filter(Boolean) || [];

  // Bereken percentages
  const eiwitKcal = eiwit * 4;
  const koolhydratenKcal = koolhydraten * 4;
  const vettenKcal = vetten * 9;
  const eiwitPercentage = Math.round((eiwitKcal / doelKcal) * 100);
  const koolhydratenPercentage = Math.round((koolhydratenKcal / doelKcal) * 100);
  const vettenPercentage = Math.round((vettenKcal / doelKcal) * 100);

  // Bepaal type op basis van doel
  const typeMap: { [key: string]: string } = {
    afvallen: "Gewichtsverlies",
    onderhoud: "Onderhoud",
    aankomen: "Spiermassa Opbouw",
  };
  const type = typeMap[doel] || "Onderhoud";

  const kcalPerMaaltijd = Math.round(doelKcal / aantalMaaltijden);
  const eiwitPerMaaltijd = Math.round(eiwit / aantalMaaltijden);
  const koolhydratenPerMaaltijd = Math.round(koolhydraten / aantalMaaltijden);
  const vettenPerMaaltijd = Math.round(vetten / aantalMaaltijden);

  // Genereer maaltijden op basis van voorkeuren
  const gegenereerdeMaaltijden = genereerMaaltijden(
    aantalMaaltijden,
    doelKcal,
    eiwit,
    koolhydraten,
    vetten,
    soortMaaltijden,
    vlees,
    groenten
  );

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
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
            <Sparkles size={24} style={{ color: "var(--client-brand)" }} />
            <h1>AI Voedingsplan voor {klantNaam}</h1>
          </div>
          <p style={{ color: "#64748b", marginTop: "0.5rem" }}>
            {type} • {doelKcal} kcal per dag • {aantalMaaltijden} maaltijden
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#10b981" }}>
          <CheckCircle size={20} />
          <span style={{ fontWeight: 600 }}>Plan Gegenereerd</span>
        </div>
      </div>

      {/* Success Message */}
      <div
        className="page-card"
        style={{
          background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
          color: "white",
          marginBottom: "2rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <CheckCircle size={32} />
          <div>
            <h3 style={{ margin: 0, marginBottom: "0.25rem" }}>AI Plan Succesvol Gegenereerd!</h3>
            <p style={{ margin: 0, opacity: 0.9 }}>
              Je voedingsplan is aangepast aan je voorkeuren en doelstellingen.
            </p>
          </div>
        </div>
      </div>

      {/* Target Kcal en Macros - 4 Cards naast elkaar */}
      <div className="page-section">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem" }}>
          {/* Target Kcal Card */}
          <div className="page-card" style={{ textAlign: "center", padding: "1.5rem" }}>
            <h3 style={{ fontSize: "0.9rem", marginBottom: "0.75rem", color: "#64748b", fontWeight: 500 }}>
              Target Kcal
            </h3>
            <h2 style={{ fontSize: "2rem", fontWeight: "bold", color: "var(--client-brand)", margin: "0" }}>
              {doelKcal} <span style={{ fontSize: "1.2rem", fontWeight: "normal" }}>kcal</span>
            </h2>
          </div>

          {/* Eiwit Card */}
          <div className="page-card" style={{ padding: "1.5rem" }}>
            <h3 style={{ fontSize: "0.9rem", marginBottom: "0.75rem", color: "#64748b", fontWeight: 500 }}>
              Eiwit
            </h3>
            <div style={{ fontSize: "1.75rem", fontWeight: "bold", color: "#3b82f6", marginBottom: "0.5rem" }}>
              {eiwit}g
            </div>
            <div style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "0.5rem" }}>
              {eiwitPercentage}% • {eiwitKcal} kcal
            </div>
            <div className="dashboard-progress" style={{ height: "8px", background: "#e0e7ff" }}>
              <div
                className="dashboard-progress__bar"
                style={{
                  width: `${eiwitPercentage}%`,
                  backgroundColor: "#3b82f6",
                  height: "100%",
                }}
              ></div>
            </div>
          </div>

          {/* Koolhydraten Card */}
          <div className="page-card" style={{ padding: "1.5rem" }}>
            <h3 style={{ fontSize: "0.9rem", marginBottom: "0.75rem", color: "#64748b", fontWeight: 500 }}>
              Koolhydraten
            </h3>
            <div style={{ fontSize: "1.75rem", fontWeight: "bold", color: "#10b981", marginBottom: "0.5rem" }}>
              {koolhydraten}g
            </div>
            <div style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "0.5rem" }}>
              {koolhydratenPercentage}% • {koolhydratenKcal} kcal
            </div>
            <div className="dashboard-progress" style={{ height: "8px", background: "#d1fae5" }}>
              <div
                className="dashboard-progress__bar"
                style={{
                  width: `${koolhydratenPercentage}%`,
                  backgroundColor: "#10b981",
                  height: "100%",
                }}
              ></div>
            </div>
          </div>

          {/* Vetten Card */}
          <div className="page-card" style={{ padding: "1.5rem" }}>
            <h3 style={{ fontSize: "0.9rem", marginBottom: "0.75rem", color: "#64748b", fontWeight: 500 }}>
              Vetten
            </h3>
            <div style={{ fontSize: "1.75rem", fontWeight: "bold", color: "#f59e0b", marginBottom: "0.5rem" }}>
              {vetten}g
            </div>
            <div style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "0.5rem" }}>
              {vettenPercentage}% • {vettenKcal} kcal
            </div>
            <div className="dashboard-progress" style={{ height: "8px", background: "#fef3c7" }}>
              <div
                className="dashboard-progress__bar"
                style={{
                  width: `${vettenPercentage}%`,
                  backgroundColor: "#f59e0b",
                  height: "100%",
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Plan Details */}
      <div className="page-section">
        <div className="page-card">
          <h2 style={{ marginBottom: "1.5rem" }}>AI Plan Details</h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "2rem", marginBottom: "2rem" }}>
            <div>
              <h3 style={{ fontSize: "1rem", marginBottom: "1rem", color: "#64748b" }}>Plan Instellingen</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Aantal maaltijden:</span>
                  <strong>{aantalMaaltijden} per dag</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Kcal per maaltijd:</span>
                  <strong>~{kcalPerMaaltijd} kcal</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Eiwit per maaltijd:</span>
                  <strong>~{eiwitPerMaaltijd}g</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Koolhydraten per maaltijd:</span>
                  <strong>~{koolhydratenPerMaaltijd}g</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Vetten per maaltijd:</span>
                  <strong>~{vettenPerMaaltijd}g</strong>
                </div>
              </div>
            </div>

            <div>
              <h3 style={{ fontSize: "1rem", marginBottom: "1rem", color: "#64748b" }}>Voorkeuren</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {soortMaaltijden.length > 0 && (
                  <div>
                    <span style={{ display: "block", marginBottom: "0.25rem", fontSize: "0.9rem" }}>
                      Soort maaltijden:
                    </span>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                      {soortMaaltijden.map((soort) => (
                        <span
                          key={soort}
                          style={{
                            padding: "0.25rem 0.75rem",
                            background: "var(--client-brand)",
                            color: "white",
                            borderRadius: "1rem",
                            fontSize: "0.85rem",
                          }}
                        >
                          {soort}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {vlees.length > 0 && (
                  <div>
                    <span style={{ display: "block", marginBottom: "0.25rem", fontSize: "0.9rem" }}>
                      Eiwitbronnen:
                    </span>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                      {vlees.map((v) => (
                        <span
                          key={v}
                          style={{
                            padding: "0.25rem 0.75rem",
                            background: "var(--client-surface)",
                            borderRadius: "1rem",
                            fontSize: "0.85rem",
                          }}
                        >
                          {v}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {groenten.length > 0 && (
                  <div>
                    <span style={{ display: "block", marginBottom: "0.25rem", fontSize: "0.9rem" }}>
                      Groenten:
                    </span>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                      {groenten.map((g) => (
                        <span
                          key={g}
                          style={{
                            padding: "0.25rem 0.75rem",
                            background: "var(--client-surface)",
                            borderRadius: "1rem",
                            fontSize: "0.85rem",
                          }}
                        >
                          {g}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Maaltijden Overzicht */}
      <div className="page-section">
        <div className="page-card">
          <h2 style={{ marginBottom: "1.5rem" }}>Dagelijks Maaltijden Overzicht</h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {gegenereerdeMaaltijden.map((maaltijd) => (
              <div
                key={maaltijd.id}
                style={{
                  padding: "1.5rem",
                  background: "var(--client-surface)",
                  borderRadius: "0.75rem",
                  border: "1px solid var(--client-border)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", paddingBottom: "1rem", borderBottom: "2px solid var(--client-border)" }}>
                  <div>
                    <h3 style={{ fontSize: "1.25rem", margin: 0 }}>{maaltijd.naam}</h3>
                    <span className="dashboard-table__meta">{maaltijd.tijd}</span>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "var(--client-primary)" }}>
                      {maaltijd.totaal.kcal} <span style={{ fontSize: "1rem", fontWeight: "normal" }}>kcal</span>
                    </div>
                    <div className="dashboard-table__meta" style={{ marginTop: "0.25rem" }}>
                      E: {maaltijd.totaal.eiwit}g • K: {maaltijd.totaal.koolhydraten}g • V: {maaltijd.totaal.vetten}g
                    </div>
                  </div>
                </div>

                {/* Ingrediënten Tabel */}
                {maaltijd.ingrediënten.length > 0 && (
                  <div className="dashboard-table">
                    <table>
                      <thead>
                        <tr>
                          <th>Ingrediënt</th>
                          <th>Portiegrootte</th>
                          <th>Kcal</th>
                          <th>Eiwit (g)</th>
                          <th>Koolhydraten (g)</th>
                          <th>Vetten (g)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {maaltijd.ingrediënten.map((ingrediënt, idx) => (
                          <tr key={idx}>
                            <td><strong>{ingrediënt.naam}</strong></td>
                            <td>{ingrediënt.portie}</td>
                            <td>{ingrediënt.kcal}</td>
                            <td>{ingrediënt.eiwit}</td>
                            <td>{ingrediënt.koolhydraten}</td>
                            <td>{ingrediënt.vetten}</td>
                          </tr>
                        ))}
                        {/* Totaal rij */}
                        <tr style={{ borderTop: "2px solid var(--client-border)", fontWeight: "bold", background: "rgba(0,0,0,0.02)" }}>
                          <td>Totaal</td>
                          <td>-</td>
                          <td>{maaltijd.totaal.kcal}</td>
                          <td>{maaltijd.totaal.eiwit}</td>
                          <td>{maaltijd.totaal.koolhydraten}</td>
                          <td>{maaltijd.totaal.vetten}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Actie Buttons */}
      <div className="page-section">
        <div style={{ display: "flex", gap: "1rem" }}>
          <button className="btn btn--primary">
            <Sparkles size={16} />
            Plan Opslaan
          </button>
          <button className="btn btn--secondary">
            Plan Aanpassen
          </button>
          <Link href={`/clients/${clientId}/voeding`} className="btn btn--secondary">
            Annuleren
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AIPlanPage() {
  return (
    <Suspense fallback={
      <div className="page-admin" style={{ padding: "2rem", textAlign: "center" }}>
        <div>Laden...</div>
      </div>
    }>
      <AIPlanPageContent />
    </Suspense>
  );
}

