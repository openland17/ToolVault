"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Search, Wrench } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ToolCard } from "@/components/tool-card";
import { StatCard } from "@/components/stat-card";
import { useTools } from "@/lib/hooks/use-tools";
import { getWarrantyStatus, cn } from "@/lib/utils";
import { WarrantyStatus } from "@/lib/types";

const filters: { label: string; value: WarrantyStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Expiring", value: "expiring" },
  { label: "Expired", value: "expired" },
];

export default function DashboardPage() {
  const { tools, loaded } = useTools();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<WarrantyStatus | "all">("all");

  const stats = useMemo(() => {
    const totalTools = tools.length;
    const totalValue = tools.reduce((sum, t) => sum + t.purchasePrice, 0);
    const active = tools.filter(
      (t) => getWarrantyStatus(t.warrantyEndDate) === "active"
    ).length;
    const expiring = tools.filter(
      (t) => getWarrantyStatus(t.warrantyEndDate) === "expiring"
    ).length;
    return { totalTools, totalValue, active, expiring };
  }, [tools]);

  const filteredTools = useMemo(() => {
    return tools.filter((t) => {
      if (filter !== "all" && getWarrantyStatus(t.warrantyEndDate) !== filter) {
        return false;
      }
      if (search) {
        const q = search.toLowerCase();
        return (
          t.name.toLowerCase().includes(q) ||
          t.brand.toLowerCase().includes(q) ||
          t.serialNumber.toLowerCase().includes(q) ||
          t.purchaseStore.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [tools, filter, search]);

  if (!loaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-amber-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 pt-4 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-zinc-100">ToolVault</h1>
          <p className="text-sm text-zinc-500">G&apos;day, Matt 👋</p>
        </div>
        <div className="flex items-center justify-center w-9 h-9 rounded-full bg-amber-accent/10">
          <Wrench className="h-4 w-4 text-amber-accent" />
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 mb-4 -mx-4 px-4">
        <StatCard value={stats.totalTools} label="Total Tools" />
        <StatCard
          value={Math.round(stats.totalValue / 100)}
          label="Total Value"
          prefix="$"
        />
        <StatCard value={stats.active} label="Active Warranties" variant="green" />
        <StatCard
          value={stats.expiring}
          label="Expiring Soon"
          variant="amber"
          pulse={stats.expiring > 0}
        />
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-3">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
              filter === f.value
                ? "bg-amber-accent text-zinc-900"
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search tools, brands, serials..."
          className="pl-9 bg-zinc-900 border-zinc-800 text-zinc-200 placeholder:text-zinc-600 h-10"
        />
      </div>

      {/* Tool list */}
      {filteredTools.length > 0 ? (
        <div className="space-y-3">
          {filteredTools.map((tool, i) => (
            <div
              key={tool.id}
              className="animate-fade-in"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <ToolCard tool={tool} />
            </div>
          ))}
        </div>
      ) : tools.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="text-center py-12">
          <p className="text-zinc-500 text-sm">No tools match your search</p>
        </div>
      )}

      {/* FAB */}
      <Link
        href="/add-tool"
        className="fixed bottom-20 right-4 z-40 flex items-center justify-center w-14 h-14 rounded-full bg-amber-accent text-zinc-900 shadow-lg shadow-amber-accent/25 active:scale-95 transition-transform"
      >
        <Plus className="h-6 w-6" />
      </Link>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-16">
      <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-zinc-800">
        <Wrench className="h-8 w-8 text-zinc-600" />
      </div>
      <h3 className="text-base font-semibold text-zinc-300 mb-1">
        No tools yet
      </h3>
      <p className="text-sm text-zinc-500 mb-6 max-w-xs mx-auto">
        Add your first tool to start tracking warranties and never miss a claim.
      </p>
      <Link
        href="/add-tool"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-accent text-zinc-900 font-semibold text-sm active:scale-95 transition-transform"
      >
        <Plus className="h-4 w-4" />
        Add Your First Tool
      </Link>
    </div>
  );
}
