"use client";

import Link from "next/link";
import { Tool } from "@/lib/types";
import { cn, formatCurrency, getBrand } from "@/lib/utils";
import { WarrantyBadge } from "./warranty-badge";
import { BrandLogo } from "./brand-logo";
import { ChevronRight } from "lucide-react";

interface ToolCardProps {
  tool: Tool;
}

export function ToolCard({ tool }: ToolCardProps) {
  const brand = getBrand(tool.brand);
  const borderColor = brand?.color ?? "#888";

  return (
    <Link href={`/tool/${tool.id}`}>
      <div
        className={cn(
          "relative bg-zinc-900 rounded-xl border border-zinc-800 p-4 transition-all",
          "active:scale-[0.98] hover:border-zinc-700"
        )}
        style={{ borderLeftColor: borderColor, borderLeftWidth: "3px" }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <BrandLogo brand={tool.brand} />
            </div>
            <h3 className="font-semibold text-sm text-zinc-100 truncate">
              {tool.name}
            </h3>
            <p className="text-xs text-zinc-500 font-mono mt-0.5">
              {tool.serialNumber}
            </p>
            <div className="flex items-center justify-between mt-2">
              <WarrantyBadge endDate={tool.warrantyEndDate} />
              <span className="text-xs text-zinc-400 font-medium">
                {formatCurrency(tool.purchasePrice)}
              </span>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-zinc-600 shrink-0 mt-1" />
        </div>
      </div>
    </Link>
  );
}
