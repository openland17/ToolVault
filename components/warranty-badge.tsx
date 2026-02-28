import { cn, getWarrantyRemaining, getWarrantyStatus } from "@/lib/utils";
import { WarrantyStatus } from "@/lib/types";

interface WarrantyBadgeProps {
  endDate: string;
  size?: "sm" | "md";
}

const statusConfig: Record<
  WarrantyStatus,
  { label: string; dotClass: string; textClass: string; bgClass: string }
> = {
  active: {
    label: "Active",
    dotClass: "bg-status-active",
    textClass: "text-status-active",
    bgClass: "bg-status-active/10",
  },
  expiring: {
    label: "Expiring Soon",
    dotClass: "bg-status-expiring animate-pulse-amber",
    textClass: "text-status-expiring",
    bgClass: "bg-status-expiring/10",
  },
  expired: {
    label: "Expired",
    dotClass: "bg-status-expired",
    textClass: "text-status-expired",
    bgClass: "bg-status-expired/10",
  },
};

export function WarrantyBadge({ endDate, size = "sm" }: WarrantyBadgeProps) {
  const status = getWarrantyStatus(endDate);
  const remaining = getWarrantyRemaining(endDate);
  const config = statusConfig[status];

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium",
        config.bgClass,
        config.textClass,
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm"
      )}
    >
      <span
        className={cn("rounded-full shrink-0", config.dotClass, size === "sm" ? "h-1.5 w-1.5" : "h-2 w-2")}
      />
      <span>{remaining}</span>
    </div>
  );
}
