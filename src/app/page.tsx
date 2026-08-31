import { redirect } from "next/navigation";
import { getSession, homeForRole } from "@/lib/auth";

export default async function Home() {
  const session = await getSession();
  if (!session) redirect("/login");
  redirect(homeForRole(session.role));
}
