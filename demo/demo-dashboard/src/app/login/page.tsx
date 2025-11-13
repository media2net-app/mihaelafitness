import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import LoginForm from "./LoginForm";
import {
  clientDashboardPath,
  isClientId,
  listClients,
} from "@/lib/clients";

async function loginAction(clientId: string) {
  "use server";

  if (!isClientId(clientId)) {
    redirect("/login");
  }

  // In Next.js 16, cookies() needs to be awaited in server actions
  const cookieStore = await cookies();
  
  // Set the cookie - in server actions, cookies() returns a mutable RequestCookies
  (cookieStore as any).set("demo-client", clientId, {
    path: "/",
    httpOnly: false,
    maxAge: 60 * 60 * 8,
    sameSite: "lax",
  });

  // Redirect to the client dashboard
  redirect(clientDashboardPath(clientId));
}

export default function LoginPage() {
  const clients = listClients();

  return (
    <div className="login-page">
      <LoginForm clients={clients} loginAction={loginAction} />
    </div>
  );
}

