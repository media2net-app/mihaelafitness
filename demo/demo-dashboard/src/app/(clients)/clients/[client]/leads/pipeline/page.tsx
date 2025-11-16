import { notFound } from "next/navigation";
import { findClient } from "@/lib/clients";
import Link from "next/link";

type PageProps = { params: Promise<{ client: string }> | { client: string } };

export default async function PipelinePage({ params }: PageProps) {
  const resolvedParams = await Promise.resolve(params);
  const client = findClient(resolvedParams.client);
  if (!client || client.id !== "rimato") {
    notFound();
  }
  return (
    <div className="page-admin">
      <div className="page-header">
        <div>
          <div className="client-breadcrumb">Rimato • Leads • Pipeline</div>
          <h1>Sales Pipeline</h1>
          <p style={{ color: "#64748b", marginTop: "0.5rem" }}>
            Statussen: Nieuw, Gekwalificeerd, Offerte, Winst, Verlies.
          </p>
        </div>
        <Link href={`/clients/${client.id}/leads`} className="btn">
          ← Terug
        </Link>
      </div>
      <div className="dashboard-card">
        <h2>Placeholder</h2>
        <p style={{ color: "#64748b" }}>
          Hier komt de kanban/gantt weergave met automatische opvolgtaken.
        </p>
      </div>
    </div>
  );
}


