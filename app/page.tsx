import { redirect } from "next/navigation";
import { getMemberSession } from "@/lib/auth/session";

export default async function HomePage() {
  const session = await getMemberSession();
  if (session) {
    redirect("/dashboard");
  }
  redirect("/login");
}
