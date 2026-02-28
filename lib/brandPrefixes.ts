export interface BrandPrefixEntry {
  brandId: string;
  prefixes: string[];
}

export const brandPrefixes: BrandPrefixEntry[] = [
  { brandId: "milwaukee", prefixes: ["M18", "M12", "2"] },
  { brandId: "makita", prefixes: ["DH", "DF", "BL", "HP", "GA"] },
  { brandId: "dewalt", prefixes: ["DCD", "DCF", "DCS", "DWE"] },
  { brandId: "bosch", prefixes: ["GBH", "GSB", "GWS", "PSB"] },
  { brandId: "stihl", prefixes: ["MS", "HS", "BG", "BR"] },
  { brandId: "husqvarna", prefixes: ["HUS", "115", "120", "125", "130"] },
];

/**
 * Detect brand from a serial number using prefix matching.
 * Returns brandId and matched prefix, or null if no match.
 * Longer prefixes are checked first to avoid false positives (e.g. "M18" before "M1").
 */
export function detectBrandByPrefix(
  serial: string
): { brandId: string; prefix: string } | null {
  const upper = serial.toUpperCase().trim();
  if (!upper) return null;

  const allEntries: { brandId: string; prefix: string }[] = [];
  for (const entry of brandPrefixes) {
    for (const prefix of entry.prefixes) {
      allEntries.push({ brandId: entry.brandId, prefix: prefix.toUpperCase() });
    }
  }

  allEntries.sort((a, b) => b.prefix.length - a.prefix.length);

  for (const entry of allEntries) {
    if (upper.startsWith(entry.prefix)) {
      return entry;
    }
  }

  return null;
}
