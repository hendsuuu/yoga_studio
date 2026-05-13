import Link from "next/link";
import Image from "next/image";
import { CalendarDays } from "lucide-react";
import { LoginForm } from "@/components/auth/login-form";

export const metadata = { title: "Login - Virtual Studio" };

export default function LoginPage() {
  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <Image
          src="/images/yoga.png"
          alt="Virtual Studio"
          width={72}
          height={72}
          className="mx-auto mb-4 rounded-2xl shadow-lg border-2 border-white"
        />
        <h1 className="text-2xl font-serif italic text-secondary">
          Virtual Studio
        </h1>
        <p className="text-[10px] font-bold text-primary tracking-widest uppercase opacity-60 mt-1">
          Member Access
        </p>
      </div>

      <div className="bg-white/80 backdrop-blur-xl p-7 rounded-3xl shadow-xl border border-white/50 space-y-5">
        <LoginForm />
        <Link
          href="/booking"
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-primary/20 bg-rose-soft px-4 py-3 text-sm font-semibold text-primary transition-all hover:bg-rose-bg">
          <CalendarDays className="h-4 w-4" />
          Booking Private Yoga
        </Link>
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
