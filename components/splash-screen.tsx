"use client";

import { useEffect, useState } from "react";
import { Shield } from "lucide-react";

export function SplashScreen() {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const seen = sessionStorage.getItem("toolvault-splash-seen");
    if (seen) {
      setVisible(false);
      return;
    }

    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => {
        setVisible(false);
        sessionStorage.setItem("toolvault-splash-seen", "1");
      }, 400);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#0A0A0B] transition-opacity duration-400 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="flex items-center gap-2.5 mb-3 animate-fade-in">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-amber-accent/15">
          <Shield className="h-5 w-5 text-amber-accent" />
        </div>
        <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">
          ToolVault
        </h1>
      </div>
      <p
        className="text-sm text-zinc-500 animate-fade-in"
        style={{ animationDelay: "200ms" }}
      >
        Your tools. Your warranties. Sorted.
      </p>
    </div>
  );
}
