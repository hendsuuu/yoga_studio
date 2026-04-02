import { redirect } from "next/navigation";
import { getMemberSession } from "@/lib/auth/session";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getMemberSession();
  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-surface-light to-rose-bg flex items-center justify-center p-4">
      {children}
    </div>
  );
}
