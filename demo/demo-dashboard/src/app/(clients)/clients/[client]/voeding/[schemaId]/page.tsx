"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { Edit, ArrowLeft, Plus, X, Search, Clock, UtensilsCrossed, Sparkles } from "lucide-react";
import Link from "next/link";

export default function SchemaDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const clientId = params.client as string;

  // Haal data uit URL parameters (van calculator)
  const klantNaam = searchParams.get("klantNaam") || "Nieuwe Klant";
  const doelKcal = parseInt(searchParams.get("doelKcal") || "2000");
  const eiwit = parseInt(searchParams.get("eiwit") || "150");
  const koolhydraten = parseInt(searchParams.get("koolhydraten") || "200");
  const vetten = parseInt(searchParams.get("vetten") || "65");
  const doel = searchParams.get("doel") || "onderhoud";

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

  const schema = {
    id: params.schemaId as string,
    naam: `${type} Schema - ${doelKcal} kcal`,
    type,
    calorieën: doelKcal,
    eiwit,
    koolhydraten,
    vetten,
    klantNaam,
    status: "Actief",
    aangemaakt: new Date().toISOString().split("T")[0],
  };

  // Helper functie om maaltijden te genereren
  const genereerMaaltijden = () => {
    return [
      {
        id: "1",
        naam: "Ontbijt",
        tijd: "08:00",
        ingrediënten: [
          { naam: "Havermout", portie: "50g", kcal: 180, eiwit: 6, koolhydraten: 30, vetten: 3 },
          { naam: "Banaan", portie: "1 middelgroot", kcal: 105, eiwit: 1, koolhydraten: 27, vetten: 0 },
          { naam: "Griekse yoghurt", portie: "100g", kcal: 130, eiwit: 10, koolhydraten: 9, vetten: 5 },
          { naam: "Blauwe bessen", portie: "50g", kcal: 28, eiwit: 0, koolhydraten: 7, vetten: 0 },
        ],
      },
      {
        id: "2",
        naam: "Lunch",
        tijd: "12:30",
        ingrediënten: [
          { naam: "Kipfilet", portie: "150g", kcal: 248, eiwit: 46, koolhydraten: 0, vetten: 5 },
          { naam: "Zoete aardappel", portie: "200g", kcal: 180, eiwit: 4, koolhydraten: 41, vetten: 0 },
          { naam: "Broccoli", portie: "150g", kcal: 51, eiwit: 4, koolhydraten: 10, vetten: 1 },
          { naam: "Olijfolie", portie: "1 eetlepel", kcal: 120, eiwit: 0, koolhydraten: 0, vetten: 14 },
        ],
      },
      {
        id: "3",
        naam: "Diner",
        tijd: "18:00",
        ingrediënten: [
          { naam: "Zalm", portie: "150g", kcal: 312, eiwit: 44, koolhydraten: 0, vetten: 14 },
          { naam: "Quinoa", portie: "100g (gekookt)", kcal: 120, eiwit: 4, koolhydraten: 22, vetten: 2 },
          { naam: "Groene bonen", portie: "150g", kcal: 44, eiwit: 2, koolhydraten: 10, vetten: 0 },
          { naam: "Avocado", portie: "50g", kcal: 80, eiwit: 1, koolhydraten: 4, vetten: 7 },
        ],
      },
      {
        id: "4",
        naam: "Snacks",
        tijd: "10:00 & 15:00",
        ingrediënten: [
          { naam: "Amandelen", portie: "20g", kcal: 116, eiwit: 4, koolhydraten: 4, vetten: 10 },
          { naam: "Appel", portie: "1 middelgroot", kcal: 95, eiwit: 0, koolhydraten: 25, vetten: 0 },
        ],
      },
    ];
  };

  // Genereer weekmenu (maandag t/m zondag)
  const dagen = ["Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag", "Zondag"];
  
  const weekmenu = dagen.map((dagNaam) => {
    const maaltijden = genereerMaaltijden();
    
    // Bereken totaal per dag
    const dagTotaal = maaltijden.reduce((acc, maaltijd) => {
      const maaltijdTotaal = maaltijd.ingrediënten.reduce(
        (sum, ing) => ({
          kcal: sum.kcal + ing.kcal,
          eiwit: sum.eiwit + ing.eiwit,
          koolhydraten: sum.koolhydraten + ing.koolhydraten,
          vetten: sum.vetten + ing.vetten,
        }),
        { kcal: 0, eiwit: 0, koolhydraten: 0, vetten: 0 }
      );
      return {
        kcal: acc.kcal + maaltijdTotaal.kcal,
        eiwit: acc.eiwit + maaltijdTotaal.eiwit,
        koolhydraten: acc.koolhydraten + maaltijdTotaal.koolhydraten,
        vetten: acc.vetten + maaltijdTotaal.vetten,
      };
    }, { kcal: 0, eiwit: 0, koolhydraten: 0, vetten: 0 });

    // Bereken percentages van doel
    const eiwitPercentage = Math.round((dagTotaal.eiwit / eiwit) * 100);
    const koolhydratenPercentage = Math.round((dagTotaal.koolhydraten / koolhydraten) * 100);
    const vettenPercentage = Math.round((dagTotaal.vetten / vetten) * 100);
    const kcalPercentage = Math.round((dagTotaal.kcal / doelKcal) * 100);

    // Bereken wat er nog nodig is
    const nogNodig = {
      eiwit: Math.max(0, eiwit - dagTotaal.eiwit),
      koolhydraten: Math.max(0, koolhydraten - dagTotaal.koolhydraten),
      vetten: Math.max(0, vetten - dagTotaal.vetten),
      kcal: Math.max(0, doelKcal - dagTotaal.kcal),
    };

    return {
      dag: dagNaam,
      maaltijden: maaltijden.map((m) => ({
        ...m,
        totaleKcal: m.ingrediënten.reduce((sum, ing) => sum + ing.kcal, 0),
        eiwit: m.ingrediënten.reduce((sum, ing) => sum + ing.eiwit, 0),
        koolhydraten: m.ingrediënten.reduce((sum, ing) => sum + ing.koolhydraten, 0),
        vetten: m.ingrediënten.reduce((sum, ing) => sum + ing.vetten, 0),
      })),
      dagTotaal,
      percentages: {
        eiwit: eiwitPercentage,
        koolhydraten: koolhydratenPercentage,
        vetten: vettenPercentage,
        kcal: kcalPercentage,
      },
      nogNodig,
    };
  });

  // State voor actieve tab
  const [actieveDag, setActieveDag] = useState(dagen[0]);
  const geselecteerdeDag = weekmenu.find((d) => d.dag === actieveDag) || weekmenu[0];

  // State voor modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<"maaltijd" | "ingrediënten" | "recepten">("maaltijd");
  
  // State voor AI Generator modal
  const [isAIGeneratorOpen, setIsAIGeneratorOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const defaultAiOptions = {
    aantalMaaltijden: "3",
    soortMaaltijden: ["Gebalanceerd"] as string[],
    vlees: [] as string[],
    groenten: [] as string[],
  };
  const [aiOptions, setAiOptions] = useState(defaultAiOptions);
  
  // State voor nieuwe maaltijd
  const [nieuweMaaltijd, setNieuweMaaltijd] = useState({
    naam: "",
    tijd: "",
    type: "Ontbijt" as "Ontbijt" | "Lunch" | "Diner" | "Snacks",
  });

  // State voor nieuwe ingrediënt
  const [nieuwIngrediënt, setNieuwIngrediënt] = useState({
    naam: "",
    portie: "",
    kcal: "",
    eiwit: "",
    koolhydraten: "",
    vetten: "",
  });

  // Ingrediënten database (per 100g)
  const ingrediëntenDatabase = [
    // Vlees & Vis
    { naam: "Kipfilet", kcal: 165, eiwit: 31, koolhydraten: 0, vetten: 3.6 },
    { naam: "Kippendij", kcal: 209, eiwit: 26, koolhydraten: 0, vetten: 10.9 },
    { naam: "Rundvlees (mager)", kcal: 250, eiwit: 26, koolhydraten: 0, vetten: 15 },
    { naam: "Rundergehakt (mager)", kcal: 250, eiwit: 26, koolhydraten: 0, vetten: 15 },
    { naam: "Varkenshaas", kcal: 143, eiwit: 22, koolhydraten: 0, vetten: 6 },
    { naam: "Varkensvlees (mager)", kcal: 242, eiwit: 27, koolhydraten: 0, vetten: 14 },
    { naam: "Zalm", kcal: 208, eiwit: 20, koolhydraten: 0, vetten: 13 },
    { naam: "Tonijn (vers)", kcal: 144, eiwit: 30, koolhydraten: 0, vetten: 1 },
    { naam: "Tonijn (in blik)", kcal: 184, eiwit: 30, koolhydraten: 0, vetten: 6 },
    { naam: "Kabeljauw", kcal: 82, eiwit: 18, koolhydraten: 0, vetten: 0.7 },
    { naam: "Pangasius", kcal: 90, eiwit: 15, koolhydraten: 0, vetten: 2 },
    { naam: "Garnalen", kcal: 99, eiwit: 24, koolhydraten: 0, vetten: 0.3 },
    { naam: "Kalkoenfilet", kcal: 135, eiwit: 30, koolhydraten: 0, vetten: 1 },
    
    // Eieren & Zuivel
    { naam: "Ei (heel)", kcal: 155, eiwit: 13, koolhydraten: 1.1, vetten: 11 },
    { naam: "Eiwit", kcal: 52, eiwit: 11, koolhydraten: 0.7, vetten: 0.2 },
    { naam: "Eigeel", kcal: 322, eiwit: 16, koolhydraten: 0.6, vetten: 27 },
    { naam: "Griekse yoghurt (vol)", kcal: 97, eiwit: 10, koolhydraten: 3.6, vetten: 5 },
    { naam: "Griekse yoghurt (mager)", kcal: 59, eiwit: 10, koolhydraten: 3.6, vetten: 0.4 },
    { naam: "Kwark (vol)", kcal: 98, eiwit: 12, koolhydraten: 3.5, vetten: 4.3 },
    { naam: "Kwark (mager)", kcal: 57, eiwit: 10, koolhydraten: 3.5, vetten: 0.2 },
    { naam: "Skyr", kcal: 59, eiwit: 11, koolhydraten: 4, vetten: 0.2 },
    { naam: "Melk (vol)", kcal: 61, eiwit: 3.2, koolhydraten: 4.8, vetten: 3.3 },
    { naam: "Melk (halfvol)", kcal: 50, eiwit: 3.3, koolhydraten: 4.9, vetten: 1.6 },
    { naam: "Melk (mager)", kcal: 34, eiwit: 3.4, koolhydraten: 5, vetten: 0.1 },
    { naam: "Kaas (Goudse 48+)", kcal: 356, eiwit: 25, koolhydraten: 0, vetten: 28 },
    { naam: "Feta", kcal: 250, eiwit: 14, koolhydraten: 2, vetten: 20 },
    { naam: "Mozzarella", kcal: 280, eiwit: 18, koolhydraten: 3, vetten: 22 },
    { naam: "Cottage cheese", kcal: 98, eiwit: 11, koolhydraten: 3.4, vetten: 4.3 },
    
    // Peulvruchten & Noten
    { naam: "Kikkererwten (gekookt)", kcal: 164, eiwit: 8.9, koolhydraten: 27, vetten: 2.6 },
    { naam: "Linzen (gekookt)", kcal: 116, eiwit: 9, koolhydraten: 20, vetten: 0.4 },
    { naam: "Bruine bonen (gekookt)", kcal: 127, eiwit: 8.7, koolhydraten: 23, vetten: 0.5 },
    { naam: "Zwarte bonen (gekookt)", kcal: 132, eiwit: 8.9, koolhydraten: 24, vetten: 0.5 },
    { naam: "Kidneybonen (gekookt)", kcal: 127, eiwit: 8.7, koolhydraten: 23, vetten: 0.5 },
    { naam: "Amandelen", kcal: 579, eiwit: 21, koolhydraten: 22, vetten: 50 },
    { naam: "Walnoten", kcal: 654, eiwit: 15, koolhydraten: 14, vetten: 65 },
    { naam: "Cashewnoten", kcal: 553, eiwit: 18, koolhydraten: 30, vetten: 44 },
    { naam: "Pinda's", kcal: 567, eiwit: 26, koolhydraten: 16, vetten: 49 },
    { naam: "Hazelnoten", kcal: 628, eiwit: 15, koolhydraten: 17, vetten: 61 },
    { naam: "Pecannoten", kcal: 691, eiwit: 9, koolhydraten: 14, vetten: 72 },
    { naam: "Pistachenoten", kcal: 560, eiwit: 20, koolhydraten: 28, vetten: 45 },
    
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
    { naam: "Brood (wit)", kcal: 265, eiwit: 9, koolhydraten: 49, vetten: 3.2 },
    { naam: "Bulgur (gekookt)", kcal: 83, eiwit: 3.1, koolhydraten: 19, vetten: 0.2 },
    { naam: "Couscous (gekookt)", kcal: 112, eiwit: 3.8, koolhydraten: 23, vetten: 0.2 },
    { naam: "Buchweit (gekookt)", kcal: 92, eiwit: 3.4, koolhydraten: 20, vetten: 0.6 },
    
    // Groenten
    { naam: "Broccoli", kcal: 34, eiwit: 2.8, koolhydraten: 7, vetten: 0.4 },
    { naam: "Spinazie (rauw)", kcal: 23, eiwit: 2.9, koolhydraten: 3.6, vetten: 0.4 },
    { naam: "Spinazie (gekookt)", kcal: 23, eiwit: 3, koolhydraten: 3.8, vetten: 0.3 },
    { naam: "Wortelen (rauw)", kcal: 41, eiwit: 0.9, koolhydraten: 10, vetten: 0.2 },
    { naam: "Paprika (rood)", kcal: 31, eiwit: 1, koolhydraten: 7, vetten: 0.3 },
    { naam: "Paprika (geel)", kcal: 27, eiwit: 1, koolhydraten: 6, vetten: 0.2 },
    { naam: "Paprika (groen)", kcal: 20, eiwit: 1, koolhydraten: 5, vetten: 0.2 },
    { naam: "Courgette", kcal: 17, eiwit: 1.2, koolhydraten: 3.1, vetten: 0.3 },
    { naam: "Tomaten", kcal: 18, eiwit: 0.9, koolhydraten: 3.9, vetten: 0.2 },
    { naam: "Komkommer", kcal: 16, eiwit: 0.7, koolhydraten: 4, vetten: 0.1 },
    { naam: "Bloemkool", kcal: 25, eiwit: 1.9, koolhydraten: 5, vetten: 0.3 },
    { naam: "Boerenkool", kcal: 49, eiwit: 4.3, koolhydraten: 9, vetten: 0.9 },
    { naam: "Spruitjes", kcal: 43, eiwit: 3.4, koolhydraten: 9, vetten: 0.3 },
    { naam: "Witte kool", kcal: 25, eiwit: 1.3, koolhydraten: 6, vetten: 0.1 },
    { naam: "Rode kool", kcal: 31, eiwit: 1.4, koolhydraten: 7, vetten: 0.2 },
    { naam: "Sla (ijsberg)", kcal: 14, eiwit: 0.9, koolhydraten: 3, vetten: 0.1 },
    { naam: "Rucola", kcal: 25, eiwit: 2.6, koolhydraten: 3.7, vetten: 0.7 },
    { naam: "Andijvie", kcal: 17, eiwit: 1.7, koolhydraten: 3.4, vetten: 0.2 },
    { naam: "Witlof", kcal: 17, eiwit: 1, koolhydraten: 4, vetten: 0.1 },
    { naam: "Prei", kcal: 61, eiwit: 1.5, koolhydraten: 14, vetten: 0.3 },
    { naam: "Ui", kcal: 40, eiwit: 1.1, koolhydraten: 9, vetten: 0.1 },
    { naam: "Knoflook", kcal: 149, eiwit: 6.4, koolhydraten: 33, vetten: 0.5 },
    { naam: "Aubergine", kcal: 25, eiwit: 1, koolhydraten: 6, vetten: 0.2 },
    { naam: "Asperges", kcal: 20, eiwit: 2.2, koolhydraten: 3.9, vetten: 0.1 },
    { naam: "Groene bonen", kcal: 31, eiwit: 1.8, koolhydraten: 7, vetten: 0.1 },
    { naam: "Snijbonen", kcal: 31, eiwit: 1.8, koolhydraten: 7, vetten: 0.1 },
    { naam: "Doperwten", kcal: 81, eiwit: 5.4, koolhydraten: 14, vetten: 0.4 },
    { naam: "Maïs (gekookt)", kcal: 96, eiwit: 3.4, koolhydraten: 21, vetten: 1.2 },
    { naam: "Pompoen", kcal: 26, eiwit: 1, koolhydraten: 7, vetten: 0.1 },
    { naam: "Bietjes (gekookt)", kcal: 44, eiwit: 1.6, koolhydraten: 10, vetten: 0.2 },
    
    // Fruit
    { naam: "Banaan", kcal: 89, eiwit: 1.1, koolhydraten: 23, vetten: 0.3 },
    { naam: "Appel", kcal: 52, eiwit: 0.3, koolhydraten: 14, vetten: 0.2 },
    { naam: "Sinaasappel", kcal: 47, eiwit: 0.9, koolhydraten: 12, vetten: 0.1 },
    { naam: "Blauwe bessen", kcal: 57, eiwit: 0.7, koolhydraten: 14, vetten: 0.3 },
    { naam: "Aardbeien", kcal: 32, eiwit: 0.7, koolhydraten: 8, vetten: 0.3 },
    { naam: "Frambozen", kcal: 52, eiwit: 1.2, koolhydraten: 12, vetten: 0.7 },
    { naam: "Druiven", kcal: 69, eiwit: 0.7, koolhydraten: 18, vetten: 0.2 },
    { naam: "Mango", kcal: 60, eiwit: 0.8, koolhydraten: 15, vetten: 0.4 },
    { naam: "Ananas", kcal: 50, eiwit: 0.5, koolhydraten: 13, vetten: 0.1 },
    { naam: "Kiwi", kcal: 61, eiwit: 1.1, koolhydraten: 15, vetten: 0.5 },
    { naam: "Peer", kcal: 57, eiwit: 0.4, koolhydraten: 15, vetten: 0.1 },
    { naam: "Perzik", kcal: 39, eiwit: 0.9, koolhydraten: 10, vetten: 0.3 },
    
    // Vetten & Oliën
    { naam: "Olijfolie", kcal: 884, eiwit: 0, koolhydraten: 0, vetten: 100 },
    { naam: "Kokosolie", kcal: 862, eiwit: 0, koolhydraten: 0, vetten: 100 },
    { naam: "Avocado", kcal: 160, eiwit: 2, koolhydraten: 9, vetten: 15 },
    { naam: "Avocado olie", kcal: 884, eiwit: 0, koolhydraten: 0, vetten: 100 },
    { naam: "Boter", kcal: 717, eiwit: 0.9, koolhydraten: 0.1, vetten: 81 },
    { naam: "Margarine", kcal: 717, eiwit: 0.2, koolhydraten: 0.7, vetten: 81 },
    
    // Overig
    { naam: "Eiwitpoeder (wei)", kcal: 400, eiwit: 80, koolhydraten: 8, vetten: 4 },
    { naam: "Eiwitpoeder (caseïne)", kcal: 400, eiwit: 80, koolhydraten: 8, vetten: 4 },
    { naam: "Eiwitpoeder (plantaardig)", kcal: 380, eiwit: 75, koolhydraten: 10, vetten: 3 },
    { naam: "Tofu", kcal: 76, eiwit: 8, koolhydraten: 1.9, vetten: 4.8 },
    { naam: "Tempeh", kcal: 193, eiwit: 19, koolhydraten: 9, vetten: 11 },
    { naam: "Chiazaad", kcal: 486, eiwit: 17, koolhydraten: 42, vetten: 31 },
    { naam: "Lijnzaad", kcal: 534, eiwit: 18, koolhydraten: 29, vetten: 42 },
    { naam: "Hennepzaad", kcal: 553, eiwit: 31, koolhydraten: 8, vetten: 49 },
    { naam: "Zonnebloempitten", kcal: 584, eiwit: 21, koolhydraten: 20, vetten: 51 },
    { naam: "Pompoenpitten", kcal: 559, eiwit: 30, koolhydraten: 10, vetten: 49 },
  ];

  const [ingrediëntZoekterm, setIngrediëntZoekterm] = useState("");
  const gefilterdeIngrediënten = ingrediëntenDatabase.filter((ing) =>
    ing.naam.toLowerCase().includes(ingrediëntZoekterm.toLowerCase())
  );

  // Dummy recepten database
  const recepten = [
    {
      id: "1",
      naam: "Havermout met bessen",
      tijd: "10 min",
      porties: 1,
      ingrediënten: [
        { naam: "Havermout", portie: "50g", kcal: 180, eiwit: 6, koolhydraten: 30, vetten: 3 },
        { naam: "Banaan", portie: "1 middelgroot", kcal: 105, eiwit: 1, koolhydraten: 27, vetten: 0 },
        { naam: "Blauwe bessen", portie: "50g", kcal: 28, eiwit: 0, koolhydraten: 7, vetten: 0 },
      ],
      totaal: { kcal: 313, eiwit: 7, koolhydraten: 64, vetten: 3 },
    },
    {
      id: "2",
      naam: "Griekse salade met kip",
      tijd: "20 min",
      porties: 1,
      ingrediënten: [
        { naam: "Kipfilet", portie: "150g", kcal: 248, eiwit: 46, koolhydraten: 0, vetten: 5 },
        { naam: "Komkommer", portie: "100g", kcal: 16, eiwit: 1, koolhydraten: 4, vetten: 0 },
        { naam: "Tomaat", portie: "100g", kcal: 18, eiwit: 1, koolhydraten: 4, vetten: 0 },
        { naam: "Feta", portie: "50g", kcal: 125, eiwit: 7, koolhydraten: 2, vetten: 10 },
      ],
      totaal: { kcal: 407, eiwit: 55, koolhydraten: 10, vetten: 15 },
    },
    {
      id: "3",
      naam: "Zalm met groenten",
      tijd: "25 min",
      porties: 1,
      ingrediënten: [
        { naam: "Zalm", portie: "150g", kcal: 312, eiwit: 44, koolhydraten: 0, vetten: 14 },
        { naam: "Broccoli", portie: "150g", kcal: 51, eiwit: 4, koolhydraten: 10, vetten: 1 },
        { naam: "Zoete aardappel", portie: "200g", kcal: 180, eiwit: 4, koolhydraten: 41, vetten: 0 },
      ],
      totaal: { kcal: 543, eiwit: 52, koolhydraten: 51, vetten: 15 },
    },
    {
      id: "4",
      naam: "Eiwitrijke smoothie",
      tijd: "5 min",
      porties: 1,
      ingrediënten: [
        { naam: "Griekse yoghurt", portie: "200g", kcal: 260, eiwit: 20, koolhydraten: 18, vetten: 10 },
        { naam: "Banaan", portie: "1 middelgroot", kcal: 105, eiwit: 1, koolhydraten: 27, vetten: 0 },
        { naam: "Eiwitpoeder", portie: "30g", kcal: 120, eiwit: 24, koolhydraten: 3, vetten: 1 },
      ],
      totaal: { kcal: 485, eiwit: 45, koolhydraten: 48, vetten: 11 },
    },
  ];

  const [receptZoekterm, setReceptZoekterm] = useState("");
  const gefilterdeRecepten = recepten.filter((r) =>
    r.naam.toLowerCase().includes(receptZoekterm.toLowerCase())
  );

  return (
    <div className="page-admin">
      <div className="page-header">
        <div>
          <Link href={`/clients/${clientId}/voeding`} className="dashboard-card__link" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <ArrowLeft size={16} />
            Terug naar Voedingsplannen
          </Link>
          <h1>Voedingsplan voor {schema.klantNaam}</h1>
          <p style={{ color: '#64748b', marginTop: '0.5rem' }}>{schema.type} • {schema.calorieën} kcal per dag</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            className="btn btn--secondary"
            onClick={() => setIsAIGeneratorOpen(true)}
          >
            <Sparkles size={16} />
            Voedingsplan AI Generator
          </button>
          <button className="btn btn--primary">
            <Edit size={16} />
            Bewerken
          </button>
        </div>
      </div>

      {/* Target Kcal en Macros - 4 Cards naast elkaar */}
      <div className="page-section">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
          {/* Target Kcal Card */}
          <div className="page-card" style={{ textAlign: 'center', padding: '1.5rem' }}>
            <h3 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', color: '#64748b', fontWeight: 500 }}>Target Kcal</h3>
            <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--client-brand)', margin: '0' }}>
              {schema.calorieën} <span style={{ fontSize: '1.2rem', fontWeight: 'normal' }}>kcal</span>
            </h2>
          </div>

          {/* Eiwit Card */}
          <div className="page-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', color: '#64748b', fontWeight: 500 }}>Eiwit</h3>
            <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#3b82f6', marginBottom: '0.5rem' }}>
              {schema.eiwit}g
            </div>
            <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.5rem' }}>
              {eiwitPercentage}% • {eiwitKcal} kcal
            </div>
            <div className="dashboard-progress" style={{ height: '8px', background: '#e0e7ff' }}>
              <div 
                className="dashboard-progress__bar" 
                style={{ 
                  width: `${eiwitPercentage}%`, 
                  backgroundColor: '#3b82f6',
                  height: '100%'
                }}
              ></div>
            </div>
          </div>

          {/* Koolhydraten Card */}
          <div className="page-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', color: '#64748b', fontWeight: 500 }}>Koolhydraten</h3>
            <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#10b981', marginBottom: '0.5rem' }}>
              {schema.koolhydraten}g
            </div>
            <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.5rem' }}>
              {koolhydratenPercentage}% • {koolhydratenKcal} kcal
            </div>
            <div className="dashboard-progress" style={{ height: '8px', background: '#d1fae5' }}>
              <div 
                className="dashboard-progress__bar" 
                style={{ 
                  width: `${koolhydratenPercentage}%`, 
                  backgroundColor: '#10b981',
                  height: '100%'
                }}
              ></div>
            </div>
          </div>

          {/* Vetten Card */}
          <div className="page-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', color: '#64748b', fontWeight: 500 }}>Vetten</h3>
            <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#f59e0b', marginBottom: '0.5rem' }}>
              {schema.vetten}g
            </div>
            <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.5rem' }}>
              {vettenPercentage}% • {vettenKcal} kcal
            </div>
            <div className="dashboard-progress" style={{ height: '8px', background: '#fef3c7' }}>
              <div 
                className="dashboard-progress__bar" 
                style={{ 
                  width: `${vettenPercentage}%`, 
                  backgroundColor: '#f59e0b',
                  height: '100%'
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Weekmenu met Tabs */}
      <div className="page-section">
        <div className="page-card">
          <div className="dashboard-card__header">
            <h2>Weekmenu</h2>
            <button 
              className="btn btn--secondary"
              onClick={() => setIsModalOpen(true)}
            >
              <Plus size={16} />
              Maaltijd Toevoegen
            </button>
          </div>

          {/* Tabs voor dagen */}
          <div style={{ 
            display: 'flex', 
            gap: '0.5rem', 
            marginBottom: '2rem',
            borderBottom: '2px solid var(--client-border)',
            paddingBottom: '0.5rem'
          }}>
            {dagen.map((dag) => (
              <button
                key={dag}
                onClick={() => setActieveDag(dag)}
                style={{
                  padding: '0.75rem 1.5rem',
                  border: 'none',
                  background: actieveDag === dag ? 'var(--client-brand)' : 'transparent',
                  color: actieveDag === dag ? 'white' : '#64748b',
                  borderRadius: '0.5rem 0.5rem 0 0',
                  cursor: 'pointer',
                  fontWeight: actieveDag === dag ? 600 : 400,
                  transition: 'all 0.2s',
                  borderBottom: actieveDag === dag ? '2px solid var(--client-brand)' : '2px solid transparent',
                  marginBottom: actieveDag === dag ? '-2px' : '0',
                }}
              >
                {dag}
              </button>
            ))}
          </div>

          {/* Content voor geselecteerde dag */}
          <div>
            {/* Dag Header met Macro Overzicht */}
            <div style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '2px solid var(--client-border)' }}>
              <h3 style={{ fontSize: '1.5rem', margin: 0, marginBottom: '1rem' }}>{geselecteerdeDag.dag}</h3>
              
              {/* Macro Status Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
                {/* Eiwit */}
                <div style={{ padding: '1rem', background: 'var(--client-surface)', borderRadius: '0.5rem', border: '1px solid var(--client-border)' }}>
                  <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.5rem' }}>Eiwit</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3b82f6', marginBottom: '0.25rem' }}>
                    {geselecteerdeDag.dagTotaal.eiwit}g / {eiwit}g
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
                    {geselecteerdeDag.percentages.eiwit}% van doel
                  </div>
                  <div className="dashboard-progress" style={{ height: '6px', marginTop: '0.5rem', background: '#e0e7ff' }}>
                    <div 
                      className="dashboard-progress__bar" 
                      style={{ 
                        width: `${Math.min(100, geselecteerdeDag.percentages.eiwit)}%`, 
                        backgroundColor: '#3b82f6',
                        height: '100%'
                      }}
                    ></div>
                  </div>
                  {geselecteerdeDag.nogNodig.eiwit > 0 && (
                    <div style={{ fontSize: '0.8rem', color: '#ef4444', marginTop: '0.5rem', fontWeight: 500 }}>
                      Nog nodig: {geselecteerdeDag.nogNodig.eiwit}g
                    </div>
                  )}
                </div>

                {/* Koolhydraten */}
                <div style={{ padding: '1rem', background: 'var(--client-surface)', borderRadius: '0.5rem', border: '1px solid var(--client-border)' }}>
                  <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.5rem' }}>Koolhydraten</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981', marginBottom: '0.25rem' }}>
                    {geselecteerdeDag.dagTotaal.koolhydraten}g / {koolhydraten}g
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
                    {geselecteerdeDag.percentages.koolhydraten}% van doel
                  </div>
                  <div className="dashboard-progress" style={{ height: '6px', marginTop: '0.5rem', background: '#d1fae5' }}>
                    <div 
                      className="dashboard-progress__bar" 
                      style={{ 
                        width: `${Math.min(100, geselecteerdeDag.percentages.koolhydraten)}%`, 
                        backgroundColor: '#10b981',
                        height: '100%'
                      }}
                    ></div>
                  </div>
                  {geselecteerdeDag.nogNodig.koolhydraten > 0 && (
                    <div style={{ fontSize: '0.8rem', color: '#ef4444', marginTop: '0.5rem', fontWeight: 500 }}>
                      Nog nodig: {geselecteerdeDag.nogNodig.koolhydraten}g
                    </div>
                  )}
                </div>

                {/* Vetten */}
                <div style={{ padding: '1rem', background: 'var(--client-surface)', borderRadius: '0.5rem', border: '1px solid var(--client-border)' }}>
                  <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.5rem' }}>Vetten</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f59e0b', marginBottom: '0.25rem' }}>
                    {geselecteerdeDag.dagTotaal.vetten}g / {vetten}g
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
                    {geselecteerdeDag.percentages.vetten}% van doel
                  </div>
                  <div className="dashboard-progress" style={{ height: '6px', marginTop: '0.5rem', background: '#fef3c7' }}>
                    <div 
                      className="dashboard-progress__bar" 
                      style={{ 
                        width: `${Math.min(100, geselecteerdeDag.percentages.vetten)}%`, 
                        backgroundColor: '#f59e0b',
                        height: '100%'
                      }}
                    ></div>
                  </div>
                  {geselecteerdeDag.nogNodig.vetten > 0 && (
                    <div style={{ fontSize: '0.8rem', color: '#ef4444', marginTop: '0.5rem', fontWeight: 500 }}>
                      Nog nodig: {geselecteerdeDag.nogNodig.vetten}g
                    </div>
                  )}
                </div>

                {/* Kcal */}
                <div style={{ padding: '1rem', background: 'var(--client-surface)', borderRadius: '0.5rem', border: '1px solid var(--client-border)' }}>
                  <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.5rem' }}>Calorieën</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--client-brand)', marginBottom: '0.25rem' }}>
                    {geselecteerdeDag.dagTotaal.kcal} / {doelKcal}
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
                    {geselecteerdeDag.percentages.kcal}% van doel
                  </div>
                  <div className="dashboard-progress" style={{ height: '6px', marginTop: '0.5rem', background: 'var(--client-surface)' }}>
                    <div 
                      className="dashboard-progress__bar" 
                      style={{ 
                        width: `${Math.min(100, geselecteerdeDag.percentages.kcal)}%`, 
                        backgroundColor: 'var(--client-brand)',
                        height: '100%'
                      }}
                    ></div>
                  </div>
                  {geselecteerdeDag.nogNodig.kcal > 0 && (
                    <div style={{ fontSize: '0.8rem', color: '#ef4444', marginTop: '0.5rem', fontWeight: 500 }}>
                      Nog nodig: {geselecteerdeDag.nogNodig.kcal} kcal
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Maaltijden per dag */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {geselecteerdeDag.maaltijden.map((maaltijd) => (
                <div 
                  key={maaltijd.id} 
                  style={{ 
                    padding: '1rem', 
                    background: 'white', 
                    borderRadius: '0.5rem', 
                    border: '1px solid var(--client-border)' 
                  }}
                >
                  {/* Maaltijd Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <div>
                      <h4 style={{ fontSize: '1rem', margin: 0 }}>{maaltijd.naam}</h4>
                      <span className="dashboard-table__meta">{maaltijd.tijd}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--client-primary)' }}>
                        {maaltijd.totaleKcal} <span style={{ fontSize: '0.9rem', fontWeight: 'normal' }}>kcal</span>
                      </div>
                      <div className="dashboard-table__meta" style={{ marginTop: '0.25rem', fontSize: '0.85rem' }}>
                        E: {maaltijd.eiwit}g • K: {maaltijd.koolhydraten}g • V: {maaltijd.vetten}g
                      </div>
                    </div>
                  </div>

                  {/* Ingrediënten Tabel */}
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
                        <tr style={{ borderTop: '2px solid var(--client-border)', fontWeight: 'bold', background: 'rgba(0,0,0,0.02)' }}>
                          <td>Totaal</td>
                          <td>-</td>
                          <td>{maaltijd.totaleKcal}</td>
                          <td>{maaltijd.eiwit}</td>
                          <td>{maaltijd.koolhydraten}</td>
                          <td>{maaltijd.vetten}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal voor Maaltijd Toevoegen */}
      {isModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "2rem",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsModalOpen(false);
            }
          }}
        >
          <div
            className="page-card"
            style={{
              maxWidth: "800px",
              width: "100%",
              maxHeight: "90vh",
              overflow: "auto",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1.5rem",
                paddingBottom: "1rem",
                borderBottom: "2px solid var(--client-border)",
              }}
            >
              <h2>Maaltijd Toevoegen</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: "0.5rem",
                  display: "flex",
                  alignItems: "center",
                  color: "#64748b",
                }}
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Tabs */}
            <div
              style={{
                display: "flex",
                gap: "0.5rem",
                marginBottom: "2rem",
                borderBottom: "1px solid var(--client-border)",
              }}
            >
              <button
                onClick={() => setModalTab("maaltijd")}
                style={{
                  padding: "0.75rem 1.5rem",
                  border: "none",
                  background: modalTab === "maaltijd" ? "var(--client-brand)" : "transparent",
                  color: modalTab === "maaltijd" ? "white" : "#64748b",
                  borderRadius: "0.5rem 0.5rem 0 0",
                  cursor: "pointer",
                  fontWeight: modalTab === "maaltijd" ? 600 : 400,
                  transition: "all 0.2s",
                  borderBottom: modalTab === "maaltijd" ? "2px solid var(--client-brand)" : "2px solid transparent",
                  marginBottom: modalTab === "maaltijd" ? "-1px" : "0",
                }}
              >
                <Clock size={16} style={{ display: "inline", marginRight: "0.5rem", verticalAlign: "middle" }} />
                Maaltijd
              </button>
              <button
                onClick={() => setModalTab("ingrediënten")}
                style={{
                  padding: "0.75rem 1.5rem",
                  border: "none",
                  background: modalTab === "ingrediënten" ? "var(--client-brand)" : "transparent",
                  color: modalTab === "ingrediënten" ? "white" : "#64748b",
                  borderRadius: "0.5rem 0.5rem 0 0",
                  cursor: "pointer",
                  fontWeight: modalTab === "ingrediënten" ? 600 : 400,
                  transition: "all 0.2s",
                  borderBottom: modalTab === "ingrediënten" ? "2px solid var(--client-brand)" : "2px solid transparent",
                  marginBottom: modalTab === "ingrediënten" ? "-1px" : "0",
                }}
              >
                <UtensilsCrossed size={16} style={{ display: "inline", marginRight: "0.5rem", verticalAlign: "middle" }} />
                Ingrediënten
              </button>
              <button
                onClick={() => setModalTab("recepten")}
                style={{
                  padding: "0.75rem 1.5rem",
                  border: "none",
                  background: modalTab === "recepten" ? "var(--client-brand)" : "transparent",
                  color: modalTab === "recepten" ? "white" : "#64748b",
                  borderRadius: "0.5rem 0.5rem 0 0",
                  cursor: "pointer",
                  fontWeight: modalTab === "recepten" ? 600 : 400,
                  transition: "all 0.2s",
                  borderBottom: modalTab === "recepten" ? "2px solid var(--client-brand)" : "2px solid transparent",
                  marginBottom: modalTab === "recepten" ? "-1px" : "0",
                }}
              >
                <Search size={16} style={{ display: "inline", marginRight: "0.5rem", verticalAlign: "middle" }} />
                Recepten
              </button>
            </div>

            {/* Modal Content */}
            <div>
              {/* Maaltijd Tab */}
              {modalTab === "maaltijd" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                  <div>
                    <label
                      htmlFor="maaltijdNaam"
                      style={{
                        display: "block",
                        marginBottom: "0.5rem",
                        fontWeight: 500,
                      }}
                    >
                      Maaltijd Naam *
                    </label>
                    <input
                      type="text"
                      id="maaltijdNaam"
                      value={nieuweMaaltijd.naam}
                      onChange={(e) =>
                        setNieuweMaaltijd({ ...nieuweMaaltijd, naam: e.target.value })
                      }
                      className="page-filter"
                      style={{ width: "100%" }}
                      placeholder="Bijv. Ontbijt, Lunch, Diner"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="maaltijdType"
                      style={{
                        display: "block",
                        marginBottom: "0.5rem",
                        fontWeight: 500,
                      }}
                    >
                      Type *
                    </label>
                    <select
                      id="maaltijdType"
                      value={nieuweMaaltijd.type}
                      onChange={(e) =>
                        setNieuweMaaltijd({
                          ...nieuweMaaltijd,
                          type: e.target.value as "Ontbijt" | "Lunch" | "Diner" | "Snacks",
                        })
                      }
                      className="page-filter"
                      style={{ width: "100%" }}
                    >
                      <option value="Ontbijt">Ontbijt</option>
                      <option value="Lunch">Lunch</option>
                      <option value="Diner">Diner</option>
                      <option value="Snacks">Snacks</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="maaltijdTijd"
                      style={{
                        display: "block",
                        marginBottom: "0.5rem",
                        fontWeight: 500,
                      }}
                    >
                      Tijd *
                    </label>
                    <input
                      type="time"
                      id="maaltijdTijd"
                      value={nieuweMaaltijd.tijd}
                      onChange={(e) =>
                        setNieuweMaaltijd({ ...nieuweMaaltijd, tijd: e.target.value })
                      }
                      className="page-filter"
                      style={{ width: "100%" }}
                    />
                  </div>

                  <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                    <button
                      type="button"
                      className="btn btn--primary"
                      onClick={() => {
                        // Hier zou je de maaltijd toevoegen aan de geselecteerde dag
                        alert(`Maaltijd "${nieuweMaaltijd.naam}" toegevoegd voor ${actieveDag} om ${nieuweMaaltijd.tijd}`);
                        setIsModalOpen(false);
                        setNieuweMaaltijd({ naam: "", tijd: "", type: "Ontbijt" });
                      }}
                    >
                      Maaltijd Toevoegen
                    </button>
                    <button
                      type="button"
                      className="btn btn--secondary"
                      onClick={() => setIsModalOpen(false)}
                    >
                      Annuleren
                    </button>
                  </div>
                </div>
              )}

              {/* Ingrediënten Tab */}
              {modalTab === "ingrediënten" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                  {/* Zoekbalk voor ingrediënten */}
                  <div>
                    <label
                      htmlFor="ingrediëntZoek"
                      style={{
                        display: "block",
                        marginBottom: "0.5rem",
                        fontWeight: 500,
                      }}
                    >
                      Zoek Ingrediënt ({ingrediëntenDatabase.length} beschikbaar)
                    </label>
                    <div style={{ position: "relative" }}>
                      <Search
                        size={18}
                        style={{
                          position: "absolute",
                          left: "0.75rem",
                          top: "50%",
                          transform: "translateY(-50%)",
                          color: "#64748b",
                        }}
                      />
                      <input
                        type="text"
                        id="ingrediëntZoek"
                        value={ingrediëntZoekterm}
                        onChange={(e) => setIngrediëntZoekterm(e.target.value)}
                        className="page-filter"
                        style={{ width: "100%", paddingLeft: "2.5rem" }}
                        placeholder="Zoek naar ingrediënten (bijv. Kipfilet, Broccoli)..."
                      />
                    </div>
                  </div>

                  {/* Ingrediënten Database Grid */}
                  <div
                    style={{
                      maxHeight: "300px",
                      overflowY: "auto",
                      border: "1px solid var(--client-border)",
                      borderRadius: "0.5rem",
                      padding: "0.5rem",
                    }}
                  >
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                        gap: "0.5rem",
                      }}
                    >
                      {gefilterdeIngrediënten.map((ing) => (
                        <div
                          key={ing.naam}
                          onClick={() => {
                            setNieuwIngrediënt({
                              naam: ing.naam,
                              portie: "100",
                              kcal: ing.kcal.toString(),
                              eiwit: ing.eiwit.toString(),
                              koolhydraten: ing.koolhydraten.toString(),
                              vetten: ing.vetten.toString(),
                            });
                            setIngrediëntZoekterm("");
                          }}
                          style={{
                            padding: "0.75rem",
                            background: "var(--client-surface)",
                            borderRadius: "0.5rem",
                            border: "1px solid var(--client-border)",
                            cursor: "pointer",
                            transition: "all 0.2s",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = "var(--client-brand)";
                            e.currentTarget.style.transform = "translateY(-2px)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = "var(--client-border)";
                            e.currentTarget.style.transform = "translateY(0)";
                          }}
                        >
                          <div style={{ fontWeight: 600, fontSize: "0.9rem", marginBottom: "0.25rem" }}>
                            {ing.naam}
                          </div>
                          <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                            {ing.kcal} kcal • E: {ing.eiwit}g • K: {ing.koolhydraten}g • V: {ing.vetten}g
                          </div>
                          <div style={{ fontSize: "0.7rem", color: "#94a3b8", marginTop: "0.25rem" }}>
                            per 100g
                          </div>
                        </div>
                      ))}
                    </div>
                    {gefilterdeIngrediënten.length === 0 && (
                      <div style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>
                        Geen ingrediënten gevonden
                      </div>
                    )}
                  </div>

                  {/* Geselecteerd Ingrediënt Formulier */}
                  {nieuwIngrediënt.naam && (
                    <div
                      style={{
                        padding: "1rem",
                        background: "var(--client-surface)",
                        borderRadius: "0.5rem",
                        border: "2px solid var(--client-brand)",
                      }}
                    >
                      <h4 style={{ marginBottom: "1rem", fontSize: "1rem" }}>
                        Geselecteerd: {nieuwIngrediënt.naam}
                      </h4>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                        <div>
                          <label
                            htmlFor="ingrediëntPortie"
                            style={{
                              display: "block",
                              marginBottom: "0.5rem",
                              fontWeight: 500,
                              fontSize: "0.9rem",
                            }}
                          >
                            Portiegrootte (gram) *
                          </label>
                          <input
                            type="number"
                            id="ingrediëntPortie"
                            value={nieuwIngrediënt.portie}
                            onChange={(e) => {
                              const portie = parseFloat(e.target.value) || 0;
                              const geselecteerdIng = ingrediëntenDatabase.find(
                                (i) => i.naam === nieuwIngrediënt.naam
                              );
                              if (geselecteerdIng) {
                                const factor = portie / 100;
                                setNieuwIngrediënt({
                                  ...nieuwIngrediënt,
                                  portie: e.target.value,
                                  kcal: Math.round(geselecteerdIng.kcal * factor).toString(),
                                  eiwit: (geselecteerdIng.eiwit * factor).toFixed(1),
                                  koolhydraten: (geselecteerdIng.koolhydraten * factor).toFixed(1),
                                  vetten: (geselecteerdIng.vetten * factor).toFixed(1),
                                });
                              }
                            }}
                            className="page-filter"
                            style={{ width: "100%" }}
                            placeholder="Bijv. 150"
                          />
                        </div>
                        <div style={{ display: "flex", alignItems: "flex-end" }}>
                          <div style={{ fontSize: "0.85rem", color: "#64748b" }}>
                            Voedingswaarden worden automatisch berekend
                          </div>
                        </div>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem" }}>
                        <div>
                          <label
                            htmlFor="ingrediëntKcal"
                            style={{
                              display: "block",
                              marginBottom: "0.5rem",
                              fontWeight: 500,
                              fontSize: "0.9rem",
                            }}
                          >
                            Kcal
                          </label>
                          <input
                            type="number"
                            id="ingrediëntKcal"
                            value={nieuwIngrediënt.kcal}
                            readOnly
                            className="page-filter"
                            style={{ width: "100%", background: "#f1f5f9" }}
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="ingrediëntEiwit"
                            style={{
                              display: "block",
                              marginBottom: "0.5rem",
                              fontWeight: 500,
                              fontSize: "0.9rem",
                            }}
                          >
                            Eiwit (g)
                          </label>
                          <input
                            type="number"
                            id="ingrediëntEiwit"
                            value={nieuwIngrediënt.eiwit}
                            readOnly
                            className="page-filter"
                            style={{ width: "100%", background: "#f1f5f9" }}
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="ingrediëntKoolhydraten"
                            style={{
                              display: "block",
                              marginBottom: "0.5rem",
                              fontWeight: 500,
                              fontSize: "0.9rem",
                            }}
                          >
                            Koolhydraten (g)
                          </label>
                          <input
                            type="number"
                            id="ingrediëntKoolhydraten"
                            value={nieuwIngrediënt.koolhydraten}
                            readOnly
                            className="page-filter"
                            style={{ width: "100%", background: "#f1f5f9" }}
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="ingrediëntVetten"
                            style={{
                              display: "block",
                              marginBottom: "0.5rem",
                              fontWeight: 500,
                              fontSize: "0.9rem",
                            }}
                          >
                            Vetten (g)
                          </label>
                          <input
                            type="number"
                            id="ingrediëntVetten"
                            value={nieuwIngrediënt.vetten}
                            readOnly
                            className="page-filter"
                            style={{ width: "100%", background: "#f1f5f9" }}
                          />
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                        <button
                          type="button"
                          className="btn btn--primary"
                          onClick={() => {
                            if (!nieuwIngrediënt.portie || parseFloat(nieuwIngrediënt.portie) <= 0) {
                              alert("Voer een geldige portiegrootte in");
                              return;
                            }
                            alert(
                              `Ingrediënt "${nieuwIngrediënt.naam}" (${nieuwIngrediënt.portie}g) toegevoegd: ${nieuwIngrediënt.kcal} kcal, ${nieuwIngrediënt.eiwit}g eiwit, ${nieuwIngrediënt.koolhydraten}g koolhydraten, ${nieuwIngrediënt.vetten}g vetten`
                            );
                            setNieuwIngrediënt({
                              naam: "",
                              portie: "",
                              kcal: "",
                              eiwit: "",
                              koolhydraten: "",
                              vetten: "",
                            });
                          }}
                        >
                          Ingrediënt Toevoegen
                        </button>
                        <button
                          type="button"
                          className="btn btn--secondary"
                          onClick={() => {
                            setNieuwIngrediënt({
                              naam: "",
                              portie: "",
                              kcal: "",
                              eiwit: "",
                              koolhydraten: "",
                              vetten: "",
                            });
                          }}
                        >
                          Wissen
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Recepten Tab */}
              {modalTab === "recepten" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                  <div>
                    <label
                      htmlFor="receptZoek"
                      style={{
                        display: "block",
                        marginBottom: "0.5rem",
                        fontWeight: 500,
                      }}
                    >
                      Zoek Recept
                    </label>
                    <div style={{ position: "relative" }}>
                      <Search
                        size={18}
                        style={{
                          position: "absolute",
                          left: "0.75rem",
                          top: "50%",
                          transform: "translateY(-50%)",
                          color: "#64748b",
                        }}
                      />
                      <input
                        type="text"
                        id="receptZoek"
                        value={receptZoekterm}
                        onChange={(e) => setReceptZoekterm(e.target.value)}
                        className="page-filter"
                        style={{ width: "100%", paddingLeft: "2.5rem" }}
                        placeholder="Zoek naar recepten..."
                      />
                    </div>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(2, 1fr)",
                      gap: "1rem",
                      maxHeight: "400px",
                      overflowY: "auto",
                    }}
                  >
                    {gefilterdeRecepten.map((recept) => (
                      <div
                        key={recept.id}
                        style={{
                          padding: "1rem",
                          background: "var(--client-surface)",
                          borderRadius: "0.5rem",
                          border: "1px solid var(--client-border)",
                          cursor: "pointer",
                          transition: "all 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = "var(--client-brand)";
                          e.currentTarget.style.transform = "translateY(-2px)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = "var(--client-border)";
                          e.currentTarget.style.transform = "translateY(0)";
                        }}
                        onClick={() => {
                          alert(`Recept "${recept.naam}" geselecteerd. Ingrediënten worden toegevoegd aan de maaltijd.`);
                          setIsModalOpen(false);
                        }}
                      >
                        <h4 style={{ margin: 0, marginBottom: "0.5rem", fontSize: "1rem" }}>
                          {recept.naam}
                        </h4>
                        <div
                          style={{
                            fontSize: "0.85rem",
                            color: "#64748b",
                            marginBottom: "0.75rem",
                          }}
                        >
                          <Clock size={12} style={{ display: "inline", marginRight: "0.25rem" }} />
                          {recept.tijd} • {recept.porties} portie{recept.porties > 1 ? "s" : ""}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            gap: "0.5rem",
                            fontSize: "0.85rem",
                            marginBottom: "0.5rem",
                          }}
                        >
                          <span>
                            <strong>{recept.totaal.kcal}</strong> kcal
                          </span>
                          <span>•</span>
                          <span>
                            E: <strong>{recept.totaal.eiwit}g</strong>
                          </span>
                          <span>•</span>
                          <span>
                            K: <strong>{recept.totaal.koolhydraten}g</strong>
                          </span>
                          <span>•</span>
                          <span>
                            V: <strong>{recept.totaal.vetten}g</strong>
                          </span>
                        </div>
                        <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
                          {recept.ingrediënten.length} ingrediënt{recept.ingrediënten.length > 1 ? "en" : ""}
                        </div>
                      </div>
                    ))}
                  </div>

                  {gefilterdeRecepten.length === 0 && (
                    <div style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>
                      Geen recepten gevonden
                    </div>
                  )}

                  <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                    <button
                      type="button"
                      className="btn btn--secondary"
                      onClick={() => setIsModalOpen(false)}
                    >
                      Sluiten
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* AI Generator Modal */}
      {isAIGeneratorOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "2rem",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget && !isGenerating) {
              setIsAIGeneratorOpen(false);
            }
          }}
        >
          <div
            className="page-card"
            style={{
              maxWidth: "700px",
              width: "100%",
              maxHeight: "90vh",
              overflow: "auto",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1.5rem",
                paddingBottom: "1rem",
                borderBottom: "2px solid var(--client-border)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <Sparkles size={24} style={{ color: "var(--client-brand)" }} />
                <h2>Voedingsplan AI Generator</h2>
              </div>
              <button
                onClick={() => !isGenerating && setIsAIGeneratorOpen(false)}
                disabled={isGenerating}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: isGenerating ? "not-allowed" : "pointer",
                  padding: "0.5rem",
                  display: "flex",
                  alignItems: "center",
                  color: "#64748b",
                  opacity: isGenerating ? 0.5 : 1,
                }}
              >
                <X size={24} />
              </button>
            </div>

            {/* AI Generator Content */}
            {!isGenerating ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                {/* Aantal Maaltijden */}
                <div>
                  <label
                    htmlFor="aantalMaaltijden"
                    style={{
                      display: "block",
                      marginBottom: "0.75rem",
                      fontWeight: 600,
                      fontSize: "1rem",
                    }}
                  >
                    Aantal Maaltijden per Dag *
                  </label>
                  <select
                    id="aantalMaaltijden"
                    value={aiOptions.aantalMaaltijden}
                    onChange={(e) =>
                      setAiOptions({ ...aiOptions, aantalMaaltijden: e.target.value })
                    }
                    className="page-filter"
                    style={{ width: "100%" }}
                  >
                    <option value="3">3 maaltijden</option>
                    <option value="4">4 maaltijden</option>
                    <option value="5">5 maaltijden</option>
                    <option value="6">6 maaltijden</option>
                  </select>
                </div>

                {/* Soort Maaltijden */}
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.75rem",
                      fontWeight: 600,
                      fontSize: "1rem",
                    }}
                  >
                    Soort Maaltijden (meerdere mogelijk) *
                  </label>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(2, 1fr)",
                      gap: "0.75rem",
                    }}
                  >
                    {[
                      "Eiwitrijk",
                      "Koolhydraatrijk",
                      "Vetrijk",
                      "Gebalanceerd",
                      "Vegan",
                      "Vegetarisch",
                      "Keto",
                      "Low-carb",
                    ].map((soort) => (
                      <label
                        key={soort}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          padding: "0.75rem",
                          background: "var(--client-surface)",
                          borderRadius: "0.5rem",
                          border: "1px solid var(--client-border)",
                          cursor: "pointer",
                          transition: "all 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = "var(--client-brand)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = "var(--client-border)";
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={aiOptions.soortMaaltijden.includes(soort)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setAiOptions({
                                ...aiOptions,
                                soortMaaltijden: [...aiOptions.soortMaaltijden, soort],
                              });
                            } else {
                              setAiOptions({
                                ...aiOptions,
                                soortMaaltijden: aiOptions.soortMaaltijden.filter((s) => s !== soort),
                              });
                            }
                          }}
                          style={{ cursor: "pointer" }}
                        />
                        <span>{soort}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Vlees Opties */}
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.75rem",
                      fontWeight: 600,
                      fontSize: "1rem",
                    }}
                  >
                    Vlees / Eiwitbronnen (meerdere mogelijk)
                  </label>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3, 1fr)",
                      gap: "0.75rem",
                    }}
                  >
                    {[
                      "Kip",
                      "Rundvlees",
                      "Varkensvlees",
                      "Vis",
                      "Zalm",
                      "Tonijn",
                      "Eieren",
                      "Tofu",
                      "Tempeh",
                    ].map((vlees) => (
                      <label
                        key={vlees}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          padding: "0.75rem",
                          background: "var(--client-surface)",
                          borderRadius: "0.5rem",
                          border: "1px solid var(--client-border)",
                          cursor: "pointer",
                          transition: "all 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = "var(--client-brand)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = "var(--client-border)";
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={aiOptions.vlees.includes(vlees)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setAiOptions({
                                ...aiOptions,
                                vlees: [...aiOptions.vlees, vlees],
                              });
                            } else {
                              setAiOptions({
                                ...aiOptions,
                                vlees: aiOptions.vlees.filter((v) => v !== vlees),
                              });
                            }
                          }}
                          style={{ cursor: "pointer" }}
                        />
                        <span>{vlees}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Groenten Opties */}
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.75rem",
                      fontWeight: 600,
                      fontSize: "1rem",
                    }}
                  >
                    Groenten (meerdere mogelijk)
                  </label>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3, 1fr)",
                      gap: "0.75rem",
                    }}
                  >
                    {[
                      "Broccoli",
                      "Spinazie",
                      "Wortelen",
                      "Paprika",
                      "Courgette",
                      "Tomaten",
                      "Komkommer",
                      "Bloemkool",
                      "Boerenkool",
                    ].map((groente) => (
                      <label
                        key={groente}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          padding: "0.75rem",
                          background: "var(--client-surface)",
                          borderRadius: "0.5rem",
                          border: "1px solid var(--client-border)",
                          cursor: "pointer",
                          transition: "all 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = "var(--client-brand)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = "var(--client-border)";
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={aiOptions.groenten.includes(groente)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setAiOptions({
                                ...aiOptions,
                                groenten: [...aiOptions.groenten, groente],
                              });
                            } else {
                              setAiOptions({
                                ...aiOptions,
                                groenten: aiOptions.groenten.filter((g) => g !== groente),
                              });
                            }
                          }}
                          style={{ cursor: "pointer" }}
                        />
                        <span>{groente}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Generate Button */}
                <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                  <button
                    type="button"
                    className="btn btn--primary"
                    onClick={() => {
                      setIsGenerating(true);
                      
                      // Simuleer AI generatie (2 seconden)
                      setTimeout(() => {
                        const aantalMaaltijden = parseInt(aiOptions.aantalMaaltijden);
                        const geselecteerdeSoorten =
                          aiOptions.soortMaaltijden.length > 0
                            ? aiOptions.soortMaaltijden
                            : ["Gebalanceerd"];
                        
                        const aiPlanParams = new URLSearchParams({
                          klantNaam: klantNaam,
                          doelKcal: doelKcal.toString(),
                          eiwit: eiwit.toString(),
                          koolhydraten: koolhydraten.toString(),
                          vetten: vetten.toString(),
                          doel: doel,
                          aantalMaaltijden: aantalMaaltijden.toString(),
                          soortMaaltijden: geselecteerdeSoorten.join(","),
                          vlees: aiOptions.vlees.join(","),
                          groenten: aiOptions.groenten.join(","),
                        });
                        
                        setIsGenerating(false);
                        setIsAIGeneratorOpen(false);
                        setAiOptions(defaultAiOptions);
                        router.push(`/clients/${clientId}/voeding/ai-plan?${aiPlanParams.toString()}`);
                      }, 2000);
                    }}
                    disabled={isGenerating}
                    style={{
                      opacity: isGenerating ? 0.5 : 1,
                      cursor: isGenerating ? "not-allowed" : "pointer",
                    }}
                  >
                    <Sparkles size={16} />
                    Generate Plan
                  </button>
                  <button
                    type="button"
                    className="btn btn--secondary"
                    onClick={() => setIsAIGeneratorOpen(false)}
                  >
                    Annuleren
                  </button>
                </div>
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "4rem 2rem",
                  gap: "1.5rem",
                }}
              >
                <div
                  style={{
                    width: "60px",
                    height: "60px",
                    border: "4px solid var(--client-border)",
                    borderTop: "4px solid var(--client-brand)",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                  }}
                ></div>
                <div>
                  <h3 style={{ textAlign: "center", marginBottom: "0.5rem" }}>
                    AI Plan wordt gegenereerd...
                  </h3>
                  <p style={{ textAlign: "center", color: "#64748b", fontSize: "0.9rem" }}>
                    We analyseren je voorkeuren en maken een op maat gemaakt voedingsplan
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
