import { notFound } from "next/navigation";
import { findClient } from "@/lib/clients";
import Link from "next/link";

type PageProps = { params: Promise<{ client: string }> | { client: string } };

export default async function WerkbonPage({ params }: PageProps) {
  const resolvedParams = await Promise.resolve(params);
  const client = findClient(resolvedParams.client);
  if (!client || client.id !== "rimato") {
    notFound();
  }
  return (
    <div className="page-admin">
      <div className="page-header">
        <div>
          <div className="client-breadcrumb">Rimato • Operatie • Werkbon</div>
          <h1>Digitale Werkbon</h1>
          <p style={{ color: "#64748b", marginTop: "0.5rem" }}>
            Placeholder voor werkbon-formulieren en ondertekening.
          </p>
        </div>
        <Link href={`/clients/${client.id}/operations`} className="btn">← Terug</Link>
      </div>
      <div className="dashboard-card">
        <h2>Placeholder</h2>
        <p style={{ color: "#64748b" }}>
          Dagplanning, jobdetails en upload van handtekeningen komen hier.
        </p>
      </div>
    </div>
  );
}


