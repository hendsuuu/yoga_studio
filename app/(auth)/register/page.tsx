import Link from "next/link";
import Image from "next/image";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata = { title: "Register - Virtual Studio" };

export default function RegisterPage() {
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
          Daftar Member
        </h1>
        <p className="text-[10px] font-bold text-primary tracking-widest uppercase opacity-60 mt-1">
          Bergabung Sekarang
        </p>
      </div>

      <div className="bg-white/80 backdrop-blur-xl p-7 rounded-3xl shadow-xl border border-white/50 space-y-5">
        <RegisterForm />
        <p className="text-center text-xs text-gray-400">
          Sudah punya akun?{" "}
          <Link
            href="/login"
            className="text-primary font-semibold hover:underline">
            Masuk di sini
          </Link>
        </p>
      </div>
    </div>
  );
}
