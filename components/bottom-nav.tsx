"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MapPin, PlusCircle, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Tools", icon: Home },
  { href: "/dealers", label: "Dealers", icon: MapPin },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-zinc-900/80 backdrop-blur-xl border-t border-zinc-800 safe-area-bottom">
      <div className="max-w-lg mx-auto flex items-center justify-around px-2 h-16">
        {navItems.slice(0, 1).map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-2 min-w-[64px] transition-colors",
                isActive ? "text-amber-accent" : "text-zinc-500"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}

        <Link
          href="/add-tool"
          className="flex flex-col items-center justify-center gap-1 -mt-4"
        >
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-amber-accent text-zinc-900 shadow-lg shadow-amber-accent/25 active:scale-95 transition-transform">
            <PlusCircle className="h-6 w-6" />
          </div>
          <span className="text-[10px] font-medium text-amber-accent">Add</span>
        </Link>

        {navItems.slice(1).map((item) => {
          const isActive = pathname.startsWith(item.href) && item.href !== "/";
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-2 min-w-[64px] transition-colors",
                isActive ? "text-amber-accent" : "text-zinc-500"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
