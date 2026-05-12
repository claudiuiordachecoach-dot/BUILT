import { ClientNav } from "@/components/ClientNav";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <ClientNav />
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
