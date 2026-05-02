import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-white border-b border-stone-200 px-6 py-4 flex items-center justify-between">
        <Link href="/admin" className="text-lg font-semibold text-stone-800">
          ✍️ aus-der-schrift Admin
        </Link>
        <Link
          href="/admin/neu"
          className="bg-stone-800 text-white text-sm rounded-lg px-4 py-2 hover:bg-stone-700 transition-colors"
        >
          + Neuer Artikel
        </Link>
      </header>
      <main className="max-w-4xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
