import { TabBar } from "@/components/ui/tab-bar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen gradient-warm-bg pb-20">
      <main className="max-w-lg mx-auto px-4 pt-6">{children}</main>
      <TabBar />
    </div>
  );
}
