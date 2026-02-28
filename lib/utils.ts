import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  differenceInDays,
  differenceInMonths,
  differenceInYears,
  format,
  formatDistanceToNow,
  isPast,
  parse,
} from "date-fns";
import { Brand, ReceiptOCRResult, WarrantyStatus } from "./types";
import { brands } from "./mock-data";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getWarrantyStatus(endDate: string): WarrantyStatus {
  const end = new Date(endDate);
  const now = new Date();
  const daysLeft = differenceInDays(end, now);

  if (daysLeft < 0) return "expired";
  if (daysLeft <= 30) return "expiring";
  return "active";
}

export function getWarrantyRemaining(endDate: string): string {
  const end = new Date(endDate);
  const now = new Date();

  if (isPast(end)) {
    return `Expired ${formatDistanceToNow(end, { addSuffix: false })} ago`;
  }

  const years = differenceInYears(end, now);
  const months = differenceInMonths(end, now) % 12;
  const days = differenceInDays(end, now);

  if (years > 0) {
    return months > 0 ? `${years}y ${months}m remaining` : `${years}y remaining`;
  }
  if (months > 0) {
    return `${months}m remaining`;
  }
  return `${days}d remaining`;
}

export function getDaysRemaining(endDate: string): number {
  return differenceInDays(new Date(endDate), new Date());
}

export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

export function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  return format(date, "dd/MM/yyyy");
}

export function parseAUDate(dateStr: string): string {
  const parsed = parse(dateStr, "dd/MM/yyyy", new Date());
  return parsed.toISOString().split("T")[0];
}

export function detectBrandFromSerial(serial: string): Brand | null {
  const upper = serial.toUpperCase();
  for (const brand of brands) {
    for (const prefix of brand.serialPrefixes) {
      if (upper.startsWith(prefix.toUpperCase())) {
        return brand;
      }
    }
  }
  return null;
}

export function getBrand(brandId: string): Brand | undefined {
  return brands.find((b) => b.id === brandId);
}

export function simulateDelay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function generateClaimReference(): string {
  const year = new Date().getFullYear();
  const num = Math.floor(1000 + Math.random() * 9000);
  return `TV-${year}-${num}`;
}

export function generateToolId(): string {
  return `tool-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function getMockOCRResult(brandId: string): ReceiptOCRResult {
  const ocrMap: Record<string, ReceiptOCRResult> = {
    milwaukee: {
      storeName: "Total Tools Brendale",
      purchaseDate: format(new Date(), "dd/MM/yyyy"),
      amount: "$549.00",
      itemDescription: "Milwaukee M18 FUEL 1/2in Hammer Drill Kit",
    },
    makita: {
      storeName: "Sydney Tools Geebung",
      purchaseDate: format(new Date(), "dd/MM/yyyy"),
      amount: "$329.00",
      itemDescription: "Makita 18V LXT Brushless Circular Saw",
    },
    husqvarna: {
      storeName: "Tool Kit Depot Coopers Plains",
      purchaseDate: format(new Date(), "dd/MM/yyyy"),
      amount: "$1,099.00",
      itemDescription: "Husqvarna 545 Mark II Chainsaw",
    },
    stihl: {
      storeName: "Bunnings Stafford",
      purchaseDate: format(new Date(), "dd/MM/yyyy"),
      amount: "$949.00",
      itemDescription: "Stihl MS 261 C-M Professional Chainsaw",
    },
    dewalt: {
      storeName: "Bunnings Stafford",
      purchaseDate: format(new Date(), "dd/MM/yyyy"),
      amount: "$279.00",
      itemDescription: "DeWalt 20V MAX XR Brushless Impact Driver",
    },
    bosch: {
      storeName: "Sydney Tools Geebung",
      purchaseDate: format(new Date(), "dd/MM/yyyy"),
      amount: "$389.00",
      itemDescription: "Bosch 18V Brushless Rotary Hammer",
    },
  };

  return (
    ocrMap[brandId] ?? {
      storeName: "Total Tools Brendale",
      purchaseDate: format(new Date(), "dd/MM/yyyy"),
      amount: "$399.00",
      itemDescription: "Power Tool",
    }
  );
}
