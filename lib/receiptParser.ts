export interface ParsedReceipt {
  storeName: string | null;
  purchaseDate: string | null;
  itemDescription: string | null;
  price: string | null;
  rawText: string;
  confidence: {
    store: number;
    date: number;
    item: number;
    price: number;
  };
}

const KNOWN_RETAILERS = [
  "bunnings",
  "total tools",
  "sydney tools",
  "mitre 10",
  "trade tools",
  "tool kit depot",
  "masters",
  "supercheap auto",
  "repco",
];

const DATE_PATTERNS = [
  /(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})/,
  /(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2})/,
  /(\d{1,2})\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+(\d{4})/i,
  /(\d{1,2})\s+(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{4})/i,
];

const PRICE_PATTERN = /\$[\d,]+\.\d{2}/g;

const MONTH_MAP: Record<string, string> = {
  jan: "01", january: "01",
  feb: "02", february: "02",
  mar: "03", march: "03",
  apr: "04", april: "04",
  may: "05",
  jun: "06", june: "06",
  jul: "07", july: "07",
  aug: "08", august: "08",
  sep: "09", september: "09",
  oct: "10", october: "10",
  nov: "11", november: "11",
  dec: "12", december: "12",
};

function extractStore(lines: string[]): { value: string | null; confidence: number } {
  const top = lines.slice(0, 5);
  for (const line of top) {
    const lower = line.toLowerCase().trim();
    for (const retailer of KNOWN_RETAILERS) {
      if (lower.includes(retailer)) {
        const titleCase = line.trim().replace(/\b\w/g, (c) => c.toUpperCase());
        return { value: titleCase, confidence: 95 };
      }
    }
  }

  const firstNonEmpty = lines.find((l) => l.trim().length > 3);
  if (firstNonEmpty) {
    return { value: firstNonEmpty.trim(), confidence: 40 };
  }

  return { value: null, confidence: 0 };
}

function extractDate(text: string): { value: string | null; confidence: number } {
  for (const pattern of DATE_PATTERNS) {
    const match = text.match(pattern);
    if (!match) continue;

    if (pattern === DATE_PATTERNS[0]) {
      const [, d, m, y] = match;
      return { value: `${d.padStart(2, "0")}/${m.padStart(2, "0")}/${y}`, confidence: 90 };
    }
    if (pattern === DATE_PATTERNS[1]) {
      const [, d, m, yy] = match;
      const fullYear = parseInt(yy, 10) > 50 ? `19${yy}` : `20${yy}`;
      return {
        value: `${d.padStart(2, "0")}/${m.padStart(2, "0")}/${fullYear}`,
        confidence: 75,
      };
    }
    if (pattern === DATE_PATTERNS[2] || pattern === DATE_PATTERNS[3]) {
      const [, d, monthStr, y] = match;
      const mm = MONTH_MAP[monthStr.toLowerCase()];
      if (mm) {
        return { value: `${d.padStart(2, "0")}/${mm}/${y}`, confidence: 85 };
      }
    }
  }

  return { value: null, confidence: 0 };
}

function extractPrice(text: string): { value: string | null; confidence: number } {
  const matches = text.match(PRICE_PATTERN);
  if (!matches || matches.length === 0) {
    return { value: null, confidence: 0 };
  }

  const last = matches[matches.length - 1];

  const amounts = matches.map((m) => parseFloat(m.replace(/[$,]/g, "")));
  const max = Math.max(...amounts);
  const maxStr = `$${max.toLocaleString("en-AU", { minimumFractionDigits: 2 })}`;

  if (last === maxStr) {
    return { value: last, confidence: 85 };
  }

  return { value: last, confidence: 65 };
}

function extractItemDescription(
  lines: string[],
  storeName: string | null,
  dateStr: string | null
): { value: string | null; confidence: number } {
  const topHalf = lines.slice(0, Math.ceil(lines.length / 2));

  const candidates = topHalf
    .map((l) => l.trim())
    .filter((l) => {
      if (l.length < 5) return false;
      if (PRICE_PATTERN.test(l)) return false;
      if (storeName && l.toLowerCase().includes(storeName.toLowerCase().slice(0, 10)))
        return false;
      if (dateStr && l.includes(dateStr)) return false;
      if (/^(subtotal|total|gst|tax|change|cash|eftpos|visa|mastercard|amex)/i.test(l))
        return false;
      if (/^\d+$/.test(l)) return false;
      return true;
    });

  if (candidates.length === 0) {
    return { value: null, confidence: 0 };
  }

  const longest = candidates.reduce((a, b) => (a.length >= b.length ? a : b));
  return { value: longest, confidence: 55 };
}

export function parseReceipt(rawText: string): ParsedReceipt {
  const lines = rawText.split("\n").filter((l) => l.trim().length > 0);

  const store = extractStore(lines);
  const date = extractDate(rawText);
  const price = extractPrice(rawText);
  const item = extractItemDescription(lines, store.value, date.value);

  return {
    storeName: store.value,
    purchaseDate: date.value,
    itemDescription: item.value,
    price: price.value,
    rawText,
    confidence: {
      store: store.confidence,
      date: date.confidence,
      item: item.confidence,
      price: price.confidence,
    },
  };
}
