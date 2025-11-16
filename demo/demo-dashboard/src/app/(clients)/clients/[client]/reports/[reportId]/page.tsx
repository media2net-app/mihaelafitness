import { notFound } from "next/navigation";
import { findClient } from "@/lib/clients";
import Link from "next/link";

// Minimal mock extractor; the listing already contains inline mock data,
// so here we accept any id and render a placeholder.

type PageProps = { params: Promise<{ client: string; reportId: string }> | { client: string; reportId: string } };

export default async function ReportDetailPage({ params }: PageProps) {
  const resolvedParams = await Promise.resolve(params);
  const client = findClient(resolvedParams.client);
  if (!client || client.id !== "rimato") {
    notFound();
  }
  const { reportId } = resolvedParams;
  return (
    <div className="page-admin">
      <div className="page-header">
        <div>
          <h1>Rapport #{reportId}</h1>
          <p style={{ color: "#64748b", marginTop: "0.5rem" }}>
            Detailweergave en export van het geselecteerde rapport.
          </p>
        </div>
        <Link href={`/clients/${client.id}/reports`} className="btn">← Terug</Link>
      </div>
      <div className="dashboard-card">
        <h2>Placeholder</h2>
        <p style={{ color: "#64748b" }}>
          Hier komt het volledige rapport, bevindingen, bestanden en ondertekening.
        </p>
      </div>
    </div>
  );
}


