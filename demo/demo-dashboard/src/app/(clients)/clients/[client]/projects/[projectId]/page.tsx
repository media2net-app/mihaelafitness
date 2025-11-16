import { notFound } from "next/navigation";
import { findClient } from "@/lib/clients";
import { rimatoDashboardData } from "@/lib/dashboard-data";
import Link from "next/link";

type PageProps = { params: Promise<{ client: string; projectId: string }> | { client: string; projectId: string } };

export default async function ProjectDetailPage({ params }: PageProps) {
  const resolvedParams = await Promise.resolve(params);
  const client = findClient(resolvedParams.client);
  if (!client || client.id !== "rimato") {
    notFound();
  }
  const all = rimatoDashboardData.recentProjects;
  const project = all.find(p => p.id === resolvedParams.projectId);
  if (!project) {
    notFound();
  }
  return (
    <div className="page-admin">
      <div className="page-header">
        <div>
          <div className="client-breadcrumb">Rimato • Projectbeheer • Projectdetail</div>
          <h1>{project.name}</h1>
          <p style={{ color: "#64748b", marginTop: "0.5rem" }}>
            {project.client} • {project.type}
          </p>
        </div>
        <Link href={`/clients/${client.id}/projects`} className="btn">← Terug</Link>
      </div>
      <div className="dashboard-grid">
        <section className="dashboard-card">
          <h2>Status</h2>
          <p><strong>Projectstatus:</strong> {project.status}</p>
          <p><strong>Prioriteit:</strong> {project.priority}</p>
          <p><strong>Waarde:</strong> €{project.value.toLocaleString("nl-NL")}</p>
        </section>
        <section className="dashboard-card">
          <h2>Planning</h2>
          <p><strong>Start:</strong> {project.startDate}</p>
          {project.nextService && <p><strong>Volgende service:</strong> {project.nextService}</p>}
        </section>
      </div>
    </div>
  );
}


