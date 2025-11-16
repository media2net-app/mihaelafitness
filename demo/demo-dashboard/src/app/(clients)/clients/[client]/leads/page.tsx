import { notFound } from "next/navigation";
import { findClient } from "@/lib/clients";
import Link from "next/link";
import { BarChart3, FileSignature, ClipboardList, Send } from "lucide-react";

type LeadsPageProps = {
  params: Promise<{ client: string }> | { client: string };
};

export default async function LeadsPage({ params }: LeadsPageProps) {
  const resolvedParams = await Promise.resolve(params);
  const client = findClient(resolvedParams.client);

  if (!client || client.id !== "rimato") {
    notFound();
  }

  return (
    <div className="page-admin">
      <div className="page-header">
        <div>
          <h1>Leads & Sales</h1>
          <p style={{ color: "#64748b", marginTop: "0.5rem" }}>
            Gecentraliseerde intake, offertegenerator en pipeline-tracking
          </p>
        </div>
      </div>

      <div className="dashboard-grid">
        <Link href={`/clients/${client.id}/leads/offertegenerator`} className="dashboard-card" style={{ textDecoration: "none", color: "inherit" }}>
          <div className="dashboard-card__header">
            <h2>Offertegenerator</h2>
          </div>
          <p style={{ margin: 0, color: "#64748b" }}>
            Gestandaardiseerde sjablonen per discipline; automatische kostencalculatie op parameters.
          </p>
        </Link>
        <Link href={`/clients/${client.id}/leads/lead-intake`} className="dashboard-card" style={{ textDecoration: "none", color: "inherit" }}>
          <div className="dashboard-card__header">
            <h2>Lead Intake</h2>
          </div>
          <p style={{ margin: 0, color: "#64748b" }}>
            Automatische aanmaak via webformulieren en e-mail; handmatige telefonische invoer.
          </p>
        </Link>
        <Link href={`/clients/${client.id}/leads/pipeline`} className="dashboard-card" style={{ textDecoration: "none", color: "inherit" }}>
          <div className="dashboard-card__header">
            <h2>Pipeline</h2>
          </div>
          <p style={{ margin: 0, color: "#64748b" }}>
            Statussen: Nieuw, Gekwalificeerd, Offerte, Winst, Verlies – met opvolgtaken.
          </p>
        </Link>
      </div>
    </div>
  );
}


