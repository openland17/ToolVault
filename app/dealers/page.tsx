"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  Phone,
  Clock,
  Navigation,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/brand-logo";
import { dealers, brands } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export default function DealersPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-8 h-8 border-2 border-amber-accent border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <DealersContent />
    </Suspense>
  );
}

function DealersContent() {
  const searchParams = useSearchParams();
  const brandParam = searchParams.get("brand");
  const [selectedBrand, setSelectedBrand] = useState<string>(brandParam ?? "all");

  const filteredDealers = useMemo(() => {
    if (selectedBrand === "all") return dealers;
    return dealers.filter((d) =>
      d.authorizedBrands.includes(selectedBrand)
    );
  }, [selectedBrand]);

  return (
    <div className="max-w-lg mx-auto px-4 pt-4 pb-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-1">
        <Link href="/" className="p-2 -ml-2 rounded-lg hover:bg-zinc-800">
          <ArrowLeft className="h-5 w-5 text-zinc-400" />
        </Link>
        <h1 className="text-lg font-bold">Service Centres</h1>
      </div>
      <div className="flex items-center gap-1.5 mb-5 ml-9">
        <MapPin className="h-3.5 w-3.5 text-amber-accent" />
        <span className="text-xs text-zinc-400">Brisbane, QLD</span>
      </div>

      {/* Brand filter */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 mb-4 -mx-4 px-4">
        <FilterPill
          label="All"
          active={selectedBrand === "all"}
          onClick={() => setSelectedBrand("all")}
        />
        {brands.map((brand) => (
          <FilterPill
            key={brand.id}
            label={brand.name}
            active={selectedBrand === brand.id}
            onClick={() => setSelectedBrand(brand.id)}
            color={brand.color}
          />
        ))}
      </div>

      {/* Dealer cards */}
      <div className="space-y-3">
        {filteredDealers.length > 0 ? (
          filteredDealers.map((dealer, i) => (
            <div
              key={dealer.id}
              className="animate-fade-in bg-zinc-900 border border-zinc-800 rounded-xl p-4"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-sm text-zinc-100">
                    {dealer.name}
                  </h3>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {dealer.address}, {dealer.suburb} {dealer.state}{" "}
                    {dealer.postcode}
                  </p>
                </div>
                <span className="text-xs font-medium text-amber-accent bg-amber-accent/10 px-2 py-0.5 rounded-full shrink-0">
                  {dealer.distance} km
                </span>
              </div>

              {/* Authorized brands */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {dealer.authorizedBrands.map((brandId) => (
                  <BrandLogo key={brandId} brand={brandId} size="sm" />
                ))}
              </div>

              {/* Details */}
              <div className="space-y-1.5 mb-3">
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <Phone className="h-3.5 w-3.5 shrink-0" />
                  <a
                    href={`tel:${dealer.phone.replace(/\s/g, "")}`}
                    className="hover:text-amber-accent transition-colors"
                  >
                    {dealer.phone}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <Clock className="h-3.5 w-3.5 shrink-0" />
                  <span>{dealer.hours}</span>
                </div>
              </div>

              {/* Get directions */}
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${dealer.lat},${dealer.lng}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                >
                  <Navigation className="h-3.5 w-3.5 mr-1.5" />
                  Get Directions
                </Button>
              </a>
            </div>
          ))
        ) : (
          <p className="text-center text-zinc-500 text-sm py-8">
            No service centres found for this brand in your area.
          </p>
        )}
      </div>
    </div>
  );
}

function FilterPill({
  label,
  active,
  onClick,
  color,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  color?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors shrink-0",
        active
          ? "text-zinc-900"
          : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
      )}
      style={
        active
          ? { backgroundColor: color ?? "#F59E0B", color: color ? "#fff" : "#18181b" }
          : undefined
      }
    >
      {label}
    </button>
  );
}
