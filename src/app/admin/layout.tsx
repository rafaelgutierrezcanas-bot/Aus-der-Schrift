import { headers } from "next/headers";
import { AdminNav } from "@/components/admin/AdminNav";
import { AdminMobileNav } from "@/components/admin/AdminMobileNav";
import CommandPalette from "@/components/admin/CommandPalette";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const h = await headers();
  const pathname = h.get("x-pathname") ?? "";

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  // Article editor pages get wider layout (no max-w-4xl)
  const isEditorPage = /^\/admin\/[^/]+$/.test(pathname) && pathname !== "/admin/login" && pathname !== "/admin/artikel" && pathname !== "/admin/neu";
  const mainClass = isEditorPage
    ? "flex-1 px-6 py-8 pb-24 md:pb-8 w-full"
    : "flex-1 px-6 py-8 pb-24 md:pb-8 max-w-4xl w-full mx-auto";

  return (
    <div className="min-h-screen bg-[var(--color-background)] flex">
      <div className="sticky top-0 h-screen overflow-y-auto">
        <AdminNav />
      </div>
      <div className="flex-1 flex flex-col min-h-screen">
        <main className={mainClass}>
          {children}
        </main>
      </div>
      <AdminMobileNav />
      <CommandPalette />
    </div>
  );
}
