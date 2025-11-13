import { cookies } from "next/headers";
import { redirect } from "next/navigation";

async function logout() {
  "use server";

  const cookieStore = await cookies();
  cookieStore.delete("demo-client");
  redirect("/login");
}

export default function LogoutButton() {
  return (
    <form action={logout} className="logout-form">
      <button type="submit" className="logout-button">
        Uitloggen
      </button>
    </form>
  );
}

