"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/today", label: "Today", icon: "\u2600\uFE0F" },
  { href: "/journeys", label: "Journeys", icon: "\uD83D\uDDFA\uFE0F" },
  { href: "/focus", label: "Focus", icon: "\uD83C\uDFAF" },
  { href: "/reflect", label: "Reflect", icon: "\uD83D\uDCDD" },
  { href: "/you", label: "You", icon: "\uD83D\uDC64" },
] as const;

export function TabBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-sand-stone/30 px-2 pb-safe">
      <div className="flex justify-around items-center max-w-lg mx-auto h-16">
        {tabs.map((tab) => {
          const isActive = pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center w-16 h-full transition-colors ${
                isActive
                  ? "text-amber-warm"
                  : "text-sand-stone hover:text-slate-deep"
              }`}
            >
              <span className="text-xl mb-0.5">{tab.icon}</span>
              <span className="text-[10px] font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
