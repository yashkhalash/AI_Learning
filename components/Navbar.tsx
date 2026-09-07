"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { LayoutDashboard, CalendarDays, History, Settings, Sparkles } from "lucide-react";
import { useState } from "react";

const links = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/history", label: "History", icon: History },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30">
      <div className="glass border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-extrabold text-lg">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-accent2 shadow-glow">
              <Sparkles size={16} className="text-bg" />
            </span>
            <span className="bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              Roadmap Tracker
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {links.map((l) => {
              const active = pathname === l.href;
              const Icon = l.icon;
              return (
                <Link key={l.href} href={l.href} className="relative px-4 py-2 rounded-full text-sm font-medium">
                  {active && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 bg-gradient-to-r from-accent to-accent2 rounded-full"
                      transition={{ type: "spring", duration: 0.5 }}
                    />
                  )}
                  <span className={`relative z-10 flex items-center gap-1.5 ${active ? "text-bg font-semibold" : "text-slate-300 hover:text-white"}`}>
                    <Icon size={15} />
                    {l.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          <button
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg glass"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            <div className="space-y-1">
              <span className="block w-4 h-0.5 bg-white" />
              <span className="block w-4 h-0.5 bg-white" />
              <span className="block w-4 h-0.5 bg-white" />
            </div>
          </button>
        </div>

        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t border-white/5"
          >
            <div className="px-4 py-3 flex flex-col gap-1">
              {links.map((l) => {
                const active = pathname === l.href;
                const Icon = l.icon;
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                      active ? "bg-gradient-to-r from-accent to-accent2 text-bg" : "text-slate-300"
                    }`}
                  >
                    <Icon size={15} />
                    {l.label}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </header>
  );
}
