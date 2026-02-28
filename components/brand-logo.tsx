import { cn, getBrand } from "@/lib/utils";

interface BrandLogoProps {
  brand: string;
  size?: "sm" | "md";
}

export function BrandLogo({ brand, size = "sm" }: BrandLogoProps) {
  const brandData = getBrand(brand);
  const name = brandData?.name ?? brand;
  const color = brandData?.color ?? "#888";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-semibold",
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-xs"
      )}
      style={{
        backgroundColor: `${color}18`,
        color: color,
      }}
    >
      {name}
    </span>
  );
}
