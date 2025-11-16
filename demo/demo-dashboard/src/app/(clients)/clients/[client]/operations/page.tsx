import { notFound } from "next/navigation";
import { findClient } from "@/lib/clients";
import Link from "next/link";
import { ClipboardCheck, MapPin, Camera, CheckSquare } from "lucide-react";

type OperationsPageProps = {
  params: Promise<{ client: string }> | { client: string };
};

export default async function OperationsPage({ params }: OperationsPageProps) {
  const resolvedParams = await Promise.resolve(params);
  const client = findClient(resolvedParams.client);

  if (!client || client.id !== "rimato") {
    notFound();
  }

  return (
    <div className="page-admin">
      <div className="page-header">
        <div>
          <h1>Operatie</h1>
          <p style={{ color: "#64748b", marginTop: "0.5rem" }}>
            Mobiele werkbonnen, LMRA-checklists, tijd- & GPS-registratie
          </p>
        </div>
      </div>

      <div className="dashboard-grid">
        <Link href={`/clients/${client.id}/operations/werkbon`} className="dashboard-card" style={{ textDecoration: "none", color: "inherit" }}>
          <div className="dashboard-card__header">
            <h2>Digitale Werkbon</h2>
          </div>
          <p style={{ margin: 0, color: "#64748b" }}>
            Dagplanning op mobiel; real-time status en ondertekening.
          </p>
        </Link>
        <Link href={`/clients/${client.id}/operations/lmra`} className="dashboard-card" style={{ textDecoration: "none", color: "inherit" }}>
          <div className="dashboard-card__header">
            <h2>LMRA & VCA</h2>
          </div>
          <p style={{ margin: 0, color: "#64748b" }}>
            Verplichte pre-start checklists met audit-proof registraties.
          </p>
        </Link>
        <Link href={`/clients/${client.id}/operations/tijd-gps`} className="dashboard-card" style={{ textDecoration: "none", color: "inherit" }}>
          <div className="dashboard-card__header">
            <h2>Tijd & GPS</h2>
          </div>
          <p style={{ margin: 0, color: "#64748b" }}>
            In-/uitklokken op locatie met optionele geofencing-controle.
          </p>
        </Link>
      </div>
    </div>
  );
}


