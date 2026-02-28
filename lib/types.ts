export type WarrantyStatus = "active" | "expiring" | "expired";
export type WarrantyType = "standard" | "extended" | "dealer";
export type ClaimVerdict = "likely_covered" | "partially_covered" | "not_covered";

export type ToolCategory =
  | "drill"
  | "saw"
  | "grinder"
  | "driver"
  | "chainsaw"
  | "hand_tool"
  | "battery"
  | "other";

export interface Tool {
  id: string;
  brand: string;
  name: string;
  model: string;
  serialNumber: string;
  category: ToolCategory;
  purchaseDate: string;
  purchaseStore: string;
  purchasePrice: number;
  receiptImageUrl?: string;
  receiptImageBase64?: string;
  warrantyType: WarrantyType;
  warrantyCardNumber?: string;
  warrantyCardImageUrl?: string;
  warrantyCardImageBase64?: string;
  warrantyStartDate: string;
  warrantyEndDate: string;
  matchConfidence?: number;
  notes?: string;
  createdAt: string;
}

export interface Brand {
  id: string;
  name: string;
  color: string;
  serialPrefixes: string[];
  defaultWarrantyYears: number;
  policyText: string;
}

export interface Dealer {
  id: string;
  name: string;
  address: string;
  suburb: string;
  state: string;
  postcode: string;
  lat: number;
  lng: number;
  distance: number;
  phone: string;
  hours: string;
  authorizedBrands: string[];
}

export interface WarrantyClause {
  section: string;
  text: string;
}

export interface ExclusionCheck {
  label: string;
  passed: boolean;
  detail: string;
}

export interface WarrantyPolicy {
  brandId: string;
  title: string;
  durationYears: number;
  clauses: WarrantyClause[];
  exclusions: string[];
  commonIssues: string[];
  australianConsumerLawNote: string;
}

export interface WarrantyClaimAnalysis {
  verdict: ClaimVerdict;
  confidence: number;
  relevantClauses: WarrantyClause[];
  exclusionsCheck: ExclusionCheck[];
  recommendation: string;
}

export interface ReceiptOCRResult {
  storeName: string;
  purchaseDate: string;
  amount: string;
  itemDescription: string;
}

export interface NotificationPrefs {
  days90: boolean;
  days30: boolean;
  days7: boolean;
  onExpiry: boolean;
  tips: boolean;
}

export interface UserProfile {
  name: string;
  email: string;
  location: string;
  notifications: NotificationPrefs;
}
