"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { IconHome, IconCompass, IconTimer, IconJournal, IconUser } from "./icons";

const tabs = [
  { href: "/today", label: "Today", Icon: IconHome },
  { href: "/journeys", label: "Journeys", Icon: IconCompass },
  { href: "/focus", label: "Focus", Icon: IconTimer },
  { href: "/reflect", label: "Reflect", Icon: IconJournal },
  { href: "/you", label: "You", Icon: IconUser },
] as const;

export function TabBar() {
  const pathname = usePathname();

  return (
    <nav className="tab-bar">
      <div className="flex justify-around items-center max-w-lg mx-auto h-16">
        {tabs.map((tab) => {
          const isActive = pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-col items-center justify-center w-16 h-full relative group"
            >
              <motion.div
                className="flex flex-col items-center"
                animate={{
                  y: isActive ? -2 : 0,
                }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <tab.Icon
                  size={22}
                  color={isActive ? "#E8985E" : "#C4A882"}
                  className={`transition-colors duration-300 ${
                    !isActive ? "group-hover:stroke-slate-deep" : ""
                  }`}
                />
                <span
                  className={`text-[10px] font-medium mt-1 transition-colors duration-300 ${
                    isActive
                      ? "text-amber-warm"
                      : "text-sand-stone group-hover:text-slate-deep"
                  }`}
                >
                  {tab.label}
                </span>
              </motion.div>
              {/* Active indicator dot */}
              {isActive && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute -bottom-0 w-5 h-0.5 rounded-full bg-amber-warm"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
