import Link from "next/link";
import { Layout } from "lucide-react";
import { AdminLoginForm } from "./login-form";

export const metadata = { title: "Admin Login - Virtual Studio" };

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-secondary rounded-2xl flex items-center justify-center shadow-lg mb-4 mx-auto">
            <Layout className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-serif italic text-secondary">
            Admin Panel
          </h1>
          <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mt-1">
            Dashboard Access
          </p>
        </div>
        <div className="bg-white p-7 rounded-2xl shadow-lg border border-gray-100">
          <AdminLoginForm />
        </div>
      </div>
    </div>
  );
}
