import { AdminNav } from "@/components/admin/AdminNav";
import { AdminMobileNav } from "@/components/admin/AdminMobileNav";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--color-background)] flex">
      <AdminNav />
      <div className="flex-1 flex flex-col min-h-screen">
        <main className="flex-1 px-6 py-8 pb-24 md:pb-8 max-w-4xl w-full mx-auto">
          {children}
        </main>
      </div>
      <AdminMobileNav />
    </div>
  );
}
