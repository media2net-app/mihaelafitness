import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import LogoutButton from "@/components/LogoutButton";
import {
  clientDashboardPath,
  findClient,
  isClientId,
  listClients,
} from "@/lib/clients";

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
  const cookieStore = await cookies();
  const sessionClient = cookieStore.get("demo-client");

  if (!sessionClient) {
    redirect("/login");
  }

  if (sessionClient.value !== clientConfig.id) {
    if (isClientId(sessionClient.value)) {
      redirect(clientDashboardPath(sessionClient.value));
    }

    redirect("/login");
  }

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
          <LogoutButton />
        </header>
        <div className="client-content">{children}</div>
      </div>
    </div>
  );
}
