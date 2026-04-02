"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, User, Phone } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { registerSchema, type RegisterInput } from "@/lib/validators/auth";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Button } from "@/components/ui/button";

export function RegisterForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(data: RegisterInput) {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const body = await res.json();

      if (!res.ok) {
        toast.error(body.error || "Registrasi gagal");
        return;
      }

      toast.success("Registrasi berhasil! Silakan login.");
      router.push("/login");
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Nama Lengkap"
        placeholder="Nama lengkap Anda"
        icon={<User className="w-4 h-4" />}
        error={errors.fullName?.message}
        {...register("fullName")}
      />
      <Input
        label="Email"
        placeholder="email@example.com"
        icon={<Mail className="w-4 h-4" />}
        error={errors.email?.message}
        {...register("email")}
      />
      <Input
        label="No. HP"
        placeholder="6281234567890"
        icon={<Phone className="w-4 h-4" />}
        error={errors.phone?.message}
        {...register("phone")}
      />
      <PasswordInput
        label="Password"
        placeholder="Minimal 8 karakter"
        icon={<Lock className="w-4 h-4" />}
        error={errors.password?.message}
        {...register("password")}
      />
      <PasswordInput
        label="Konfirmasi Password"
        placeholder="Ulangi password"
        icon={<Lock className="w-4 h-4" />}
        error={errors.confirmPassword?.message}
        {...register("confirmPassword")}
      />
      <Button type="submit" loading={loading} className="w-full" size="lg">
        DAFTAR SEKARANG
      </Button>
    </form>
  );
}
