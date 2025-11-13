import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import LoginForm from "./LoginForm";
import {
  clientDashboardPath,
  isClientId,
  listClients,
} from "@/lib/clients";

async function loginAction(formData: FormData) {
  "use server";

  const selectedClient = formData.get("client");

  if (typeof selectedClient !== "string" || !isClientId(selectedClient)) {
    redirect("/login");
  }

  // In Next.js 16, cookies() needs to be awaited in server actions
  const cookieStore = await cookies();
  
  // Set the cookie - in server actions, cookies() returns a mutable RequestCookies
  (cookieStore as any).set("demo-client", selectedClient, {
    path: "/",
    httpOnly: false,
    maxAge: 60 * 60 * 8,
    sameSite: "lax",
  });

  // Redirect to the client dashboard
  redirect(clientDashboardPath(selectedClient));
}

export default function LoginPage() {
  const clients = listClients();

  return (
    <div className="login-page">
      <LoginForm clients={clients} loginAction={loginAction} />
    </div>
  );
}

