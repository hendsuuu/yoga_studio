import Link from "next/link";
import { Layout } from "lucide-react";
import { LoginForm } from "@/components/auth/login-form";

export const metadata = { title: "Login - Virtual Studio" };

export default function LoginPage() {
  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center shadow-lg mb-4 mx-auto border-2 border-white">
          <Layout className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl font-serif italic text-secondary">
          Virtual Studio
        </h1>
        <p className="text-[10px] font-bold text-primary tracking-widest uppercase opacity-60 mt-1">
          Member Access
        </p>
      </div>

      <div className="bg-white/80 backdrop-blur-xl p-7 rounded-3xl shadow-xl border border-white/50 space-y-5">
        <LoginForm />
        <p className="text-center text-xs text-gray-400">
          Belum punya akun?{" "}
          <Link
            href="/register"
            className="text-primary font-semibold hover:underline">
            Daftar di sini
          </Link>
        </p>
      </div>
    </div>
  );
}
