import { notFound } from "next/navigation";
import { findClient } from "@/lib/clients";
import { neumannDashboardData } from "@/lib/dashboard-data";
import { Suspense } from "react";
import AgendaContent from "./AgendaContent";

type AgendaPageProps = {
  params: Promise<{ client: string }> | { client: string };
};

export default async function AgendaPage({ params }: AgendaPageProps) {
  const resolvedParams = await Promise.resolve(params);
  const client = findClient(resolvedParams.client);

  if (!client || client.id !== "neumann") {
    notFound();
  }

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

  // Week van 13 november 2025 (maandag 13 nov = start van de week)
  const weekStart = new Date("2025-11-13");
  const dagen = ["Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag", "Zondag"];
  
  // Genereer datums voor de week
  const weekData = dagen.map((dagNaam, index) => {
    const datum = new Date(weekStart);
    datum.setDate(weekStart.getDate() + index);
    return {
      dag: dagNaam,
      datum: datum,
      datumString: datum.toISOString().split("T")[0],
    };
  });

  // Genereer tijdsloten van 06:00 tot 22:00 (elk uur)
  const tijdsloten: string[] = [];
  for (let uur = 6; uur <= 22; uur++) {
    tijdsloten.push(`${uur.toString().padStart(2, "0")}:00`);
  }

  // Dummy sessies/afspraken voor de week
  const sessies = [
    // Maandag
    { id: "1", klantId: "1", klantNaam: "Marijn Besseler", dag: "Maandag", tijd: "10:00", duur: 60, type: "1-op-1 Training", locatie: "Thuis", status: "Bevestigd" },
    { id: "2", klantId: "2", klantNaam: "Kristel Kwant", dag: "Maandag", tijd: "14:00", duur: 60, type: "1-op-1 Training", locatie: "Thuis", status: "Bevestigd" },
    { id: "3", klantId: "4", klantNaam: "Fadil Deniz", dag: "Maandag", tijd: "18:00", duur: 60, type: "1-op-1 Training", locatie: "Thuis", status: "Bevestigd" },
    
    // Dinsdag
    { id: "4", klantId: "1", klantNaam: "Marijn Besseler", dag: "Dinsdag", tijd: "09:00", duur: 60, type: "1-op-1 Training", locatie: "Thuis", status: "Bevestigd" },
    { id: "5", klantId: "5", klantNaam: "Sarah de Vries", dag: "Dinsdag", tijd: "11:00", duur: 60, type: "Duo Training", locatie: "Park", status: "Bevestigd" },
    { id: "6", klantId: "6", klantNaam: "Mark Jansen", dag: "Dinsdag", tijd: "16:00", duur: 60, type: "1-op-1 Training", locatie: "Thuis", status: "Bevestigd" },
    { id: "7", klantId: "8", klantNaam: "Erwin Altena", dag: "Dinsdag", tijd: "19:00", duur: 45, type: "1-op-1 Training", locatie: "Thuis", status: "Bevestigd" },
    
    // Woensdag
    { id: "8", klantId: "2", klantNaam: "Kristel Kwant", dag: "Woensdag", tijd: "10:00", duur: 60, type: "1-op-1 Training", locatie: "Thuis", status: "Bevestigd" },
    { id: "9", klantId: "4", klantNaam: "Fadil Deniz", dag: "Woensdag", tijd: "15:00", duur: 60, type: "1-op-1 Training", locatie: "Thuis", status: "Bevestigd" },
    { id: "10", klantId: "6", klantNaam: "Mark Jansen", dag: "Woensdag", tijd: "17:00", duur: 60, type: "1-op-1 Training", locatie: "Thuis", status: "Bevestigd" },
    
    // Donderdag
    { id: "11", klantId: "1", klantNaam: "Marijn Besseler", dag: "Donderdag", tijd: "08:00", duur: 60, type: "1-op-1 Training", locatie: "Thuis", status: "Bevestigd" },
    { id: "12", klantId: "5", klantNaam: "Sarah de Vries", dag: "Donderdag", tijd: "12:00", duur: 60, type: "Duo Training", locatie: "Park", status: "Bevestigd" },
    { id: "13", klantId: "2", klantNaam: "Kristel Kwant", dag: "Donderdag", tijd: "14:00", duur: 60, type: "1-op-1 Training", locatie: "Thuis", status: "Bevestigd" },
    { id: "14", klantId: "8", klantNaam: "Erwin Altena", dag: "Donderdag", tijd: "20:00", duur: 45, type: "1-op-1 Training", locatie: "Thuis", status: "Bevestigd" },
    
    // Vrijdag
    { id: "15", klantId: "4", klantNaam: "Fadil Deniz", dag: "Vrijdag", tijd: "09:00", duur: 60, type: "1-op-1 Training", locatie: "Thuis", status: "Bevestigd" },
    { id: "16", klantId: "6", klantNaam: "Mark Jansen", dag: "Vrijdag", tijd: "16:00", duur: 60, type: "1-op-1 Training", locatie: "Thuis", status: "Bevestigd" },
    
    // Zaterdag
    { id: "17", klantId: "1", klantNaam: "Marijn Besseler", dag: "Zaterdag", tijd: "10:00", duur: 60, type: "1-op-1 Training", locatie: "Thuis", status: "Bevestigd" },
    { id: "18", klantId: "2", klantNaam: "Kristel Kwant", dag: "Zaterdag", tijd: "11:00", duur: 60, type: "1-op-1 Training", locatie: "Thuis", status: "Bevestigd" },
    { id: "19", klantId: "5", klantNaam: "Sarah de Vries", dag: "Zaterdag", tijd: "14:00", duur: 60, type: "Duo Training", locatie: "Park", status: "Bevestigd" },
    
    // Zondag
    { id: "20", klantId: "4", klantNaam: "Fadil Deniz", dag: "Zondag", tijd: "11:00", duur: 60, type: "1-op-1 Training", locatie: "Thuis", status: "Bevestigd" },
    { id: "21", klantId: "8", klantNaam: "Erwin Altena", dag: "Zondag", tijd: "15:00", duur: 45, type: "1-op-1 Training", locatie: "Thuis", status: "Bevestigd" },
  ];


  return (
    <div className="page-admin">
      <Suspense fallback={
        <div style={{ padding: "2rem", textAlign: "center" }}>
          <div>Laden...</div>
        </div>
      }>
        <AgendaContent 
          weekStart={weekStart}
          weekData={weekData}
          sessies={sessies}
          tijdsloten={tijdsloten}
        />
      </Suspense>
    </div>
  );
}

