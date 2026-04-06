import { Search, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6 animate-in">
        <div className="mx-auto w-16 h-16 bg-rose-light rounded-full flex items-center justify-center">
          <Search className="w-8 h-8 text-primary" />
        </div>
        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-primary font-serif">404</h1>
          <h2 className="text-xl font-bold text-secondary">
            Halaman Tidak Ditemukan
          </h2>
          <p className="text-secondary/70">
            Halaman yang kamu cari tidak ada atau sudah dipindahkan.
          </p>
        </div>
        <a
          href="/"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors">
          <Home className="w-4 h-4" />
          Kembali ke Beranda
        </a>
      </div>
    </div>
  );
}
