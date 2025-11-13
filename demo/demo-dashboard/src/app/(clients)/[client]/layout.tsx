import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { findClient, listClients } from "@/lib/clients";

type ClientLayoutProps = {
  children: ReactNode;
  params: Promise<{ client: string }> | { client: string };
};

export function generateStaticParams() {
  return listClients().map((client) => ({ client: client.id }));
}

export default async function ClientLayout({
  children,
  params,
}: ClientLayoutProps) {
  const resolvedParams = await Promise.resolve(params);
  const client = findClient(resolvedParams.client);

  if (!client) {
    notFound();
  }

  const clientConfig = client;

  // Geen login vereist - directe toegang tot alle client dashboards
  return (
    <div data-client={clientConfig.id} className="client-shell">
      <Sidebar client={clientConfig} />
      <div className="client-main">
        <header className="client-header">
          <div className="client-header__content">
            <p className="client-breadcrumb">Demo dashboard</p>
            <h1 className="client-title">{clientConfig.name}</h1>
            <p className="client-tagline">{clientConfig.tagline}</p>
          </div>
        </header>
        <div className="client-content">{children}</div>
      </div>
    </div>
  );
}
