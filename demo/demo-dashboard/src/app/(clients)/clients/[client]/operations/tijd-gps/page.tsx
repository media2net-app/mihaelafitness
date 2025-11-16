import { notFound } from "next/navigation";
import { findClient } from "@/lib/clients";
import Link from "next/link";

type PageProps = { params: Promise<{ client: string }> | { client: string } };

export default async function TijdGpsPage({ params }: PageProps) {
  const resolvedParams = await Promise.resolve(params);
  const client = findClient(resolvedParams.client);
  if (!client || client.id !== "rimato") {
    notFound();
  }
  return (
    <div className="page-admin">
      <div className="page-header">
        <div>
          <div className="client-breadcrumb">Rimato • Operatie • Tijd & GPS</div>
          <h1>Tijd & GPS</h1>
          <p style={{ color: "#64748b", marginTop: "0.5rem" }}>
            Placeholder voor klokregistratie, geofencing en locatiehistorie.
          </p>
        </div>
        <Link href={`/clients/${client.id}/operations`} className="btn">← Terug</Link>
      </div>
      <div className="dashboard-card">
        <h2>Placeholder</h2>
        <p style={{ color: "#64748b" }}>
          Hier komt het in-/uitklokken en GPS-logging component.
        </p>
      </div>
    </div>
  );
}


