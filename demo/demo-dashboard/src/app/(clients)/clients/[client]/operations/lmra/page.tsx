import { notFound } from "next/navigation";
import { findClient } from "@/lib/clients";
import Link from "next/link";

type PageProps = { params: Promise<{ client: string }> | { client: string } };

export default async function LmraPage({ params }: PageProps) {
  const resolvedParams = await Promise.resolve(params);
  const client = findClient(resolvedParams.client);
  if (!client || client.id !== "rimato") {
    notFound();
  }
  return (
    <div className="page-admin">
      <div className="page-header">
        <div>
          <h1>LMRA & VCA</h1>
          <p style={{ color: "#64748b", marginTop: "0.5rem" }}>
            Placeholder voor pre-start checklists en auditregistraties.
          </p>
        </div>
        <Link href={`/clients/${client.id}/operations`} className="btn">← Terug</Link>
      </div>
      <div className="dashboard-card">
        <h2>Placeholder</h2>
        <p style={{ color: "#64748b" }}>
          Digitale LMRA/VCA flows met verplichte stappen worden hier uitgewerkt.
        </p>
      </div>
    </div>
  );
}


