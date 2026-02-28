"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  AlertTriangle,
  Check,
  ChevronRight,
  Loader2,
  ScanBarcode,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StepIndicator } from "@/components/step-indicator";
import { ReceiptScanner } from "@/components/receipt-scanner";
import { BarcodeScanner } from "@/components/barcode-scanner";
import { BrandLogo } from "@/components/brand-logo";
import { WarrantyBadge } from "@/components/warranty-badge";
import { useTools } from "@/lib/hooks/use-tools";
import { useToast } from "@/hooks/use-toast";
import { brands } from "@/lib/mock-data";
import {
  cn,
  detectBrandFromSerial,
  formatDate,
  generateToolId,
  simulateDelay,
  getBrand,
} from "@/lib/utils";
import { Brand, ToolCategory, WarrantyType } from "@/lib/types";
import { ParsedReceipt } from "@/lib/receiptParser";
import {
  calculateWarrantyExpiry,
  WarrantyCalculation,
} from "@/lib/warranty-rules";

const STEPS = ["Serial", "Receipt", "Warranty", "Confirm"];

interface FormData {
  serialNumber: string;
  detectedBrand: Brand | null;
  manualBrand: string;
  storeName: string;
  purchaseDate: string;
  purchaseAmount: string;
  itemDescription: string;
  receiptImageBase64: string;
  receiptUploaded: boolean;
  warrantyCardNumber: string;
  warrantyType: WarrantyType;
  warrantyCardImageBase64: string;
  warrantyCardUploaded: boolean;
  category: ToolCategory;
  isRegistered: boolean;
}

interface OcrConfidence {
  store: number;
  date: number;
  item: number;
  price: number;
}

const initialFormData: FormData = {
  serialNumber: "",
  detectedBrand: null,
  manualBrand: "",
  storeName: "",
  purchaseDate: "",
  purchaseAmount: "",
  itemDescription: "",
  receiptImageBase64: "",
  receiptUploaded: false,
  warrantyCardNumber: "",
  warrantyType: "standard",
  warrantyCardImageBase64: "",
  warrantyCardUploaded: false,
  category: "drill",
  isRegistered: false,
};

export default function AddToolPage() {
  const router = useRouter();
  const { addTool } = useTools();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(initialFormData);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrConfidence, setOcrConfidence] = useState<OcrConfidence | null>(null);
  const [matchingSteps, setMatchingSteps] = useState<number[]>([]);
  const [matchComplete, setMatchComplete] = useState(false);
  const [warrantyCalc, setWarrantyCalc] = useState<WarrantyCalculation | null>(null);

  const effectiveBrand = form.detectedBrand ?? getBrand(form.manualBrand) ?? null;

  const updateForm = useCallback(
    (updates: Partial<FormData>) => setForm((prev) => ({ ...prev, ...updates })),
    []
  );

  const handleBarcodeScan = (result: string) => {
    setShowBarcodeScanner(false);
    const upper = result.toUpperCase();
    const brand = detectBrandFromSerial(upper);
    updateForm({ serialNumber: upper, detectedBrand: brand });
  };

  const handleSerialChange = (value: string) => {
    const upper = value.toUpperCase();
    const brand = detectBrandFromSerial(upper);
    updateForm({ serialNumber: upper, detectedBrand: brand });
  };

  const handleReceiptImage = async (base64: string) => {
    updateForm({ receiptImageBase64: base64 });
    setOcrLoading(true);
    setOcrConfidence(null);

    try {
      const res = await fetch("/api/ocr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64 }),
      });

      const data = await res.json();

      if (data.success && data.parsed) {
        const parsed: ParsedReceipt = data.parsed;
        updateForm({
          receiptUploaded: true,
          storeName: parsed.storeName ?? "",
          purchaseDate: parsed.purchaseDate ?? "",
          purchaseAmount: parsed.price ?? "",
          itemDescription: parsed.itemDescription ?? "",
        });
        setOcrConfidence(parsed.confidence);
      } else {
        updateForm({ receiptUploaded: true });
        toast({
          title: "OCR partially failed",
          description: "Could not read receipt. Please fill in the fields manually.",
        });
      }
    } catch {
      updateForm({ receiptUploaded: true });
      toast({
        title: "OCR error",
        description: "Could not process receipt. Please fill in the fields manually.",
      });
    } finally {
      setOcrLoading(false);
    }
  };

  const handleWarrantyCardImage = (base64: string) => {
    updateForm({
      warrantyCardImageBase64: base64,
      warrantyCardUploaded: true,
      warrantyCardNumber: `${effectiveBrand?.name?.substring(0, 2).toUpperCase() ?? "TV"}-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`,
    });
  };

  const computeWarranty = useCallback(() => {
    if (!effectiveBrand) return null;
    const purchaseDateISO = parsePurchaseDateToISO(form.purchaseDate);
    return calculateWarrantyExpiry({
      brandId: effectiveBrand.id,
      category: form.category,
      purchaseDate: purchaseDateISO,
      isRegistered: form.isRegistered,
    });
  }, [effectiveBrand, form.purchaseDate, form.category, form.isRegistered]);

  const handleStartMatching = async () => {
    setMatchingSteps([]);
    setMatchComplete(false);
    setWarrantyCalc(null);

    const steps = [0, 1, 2, 3];
    for (const s of steps) {
      await simulateDelay(800);
      setMatchingSteps((prev) => [...prev, s]);
    }
    await simulateDelay(500);
    setWarrantyCalc(computeWarranty());
    setMatchComplete(true);
  };

  const handleConfirmSave = () => {
    const brandData = effectiveBrand;
    const purchaseDateISO = parsePurchaseDateToISO(form.purchaseDate);
    const priceNum = parseFloat(form.purchaseAmount.replace(/[$,]/g, "")) || 0;

    const wc = warrantyCalc ?? computeWarranty();
    const warrantyEndDate = wc?.warrantyEndDate ?? purchaseDateISO;

    const toolId = generateToolId();

    addTool({
      id: toolId,
      brand: brandData?.id ?? "other",
      name: form.itemDescription || `${brandData?.name ?? "Unknown"} Power Tool`,
      model: form.serialNumber,
      serialNumber: form.serialNumber,
      category: form.category,
      purchaseDate: purchaseDateISO,
      purchaseStore: form.storeName || "Unknown Store",
      purchasePrice: Math.round(priceNum * 100),
      receiptImageBase64: form.receiptImageBase64 || undefined,
      warrantyType: form.warrantyType,
      warrantyCardNumber: form.warrantyCardNumber || undefined,
      warrantyCardImageBase64: form.warrantyCardImageBase64 || undefined,
      warrantyStartDate: purchaseDateISO,
      warrantyEndDate,
      matchConfidence: 98,
      createdAt: new Date().toISOString(),
    });

    toast({
      title: "Tool saved successfully",
      description: `${form.itemDescription || "Your tool"} has been added to ToolVault.`,
    });

    router.push(`/tool/${toolId}`);
  };

  return (
    <div className="max-w-lg mx-auto px-4 pt-4 pb-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/" className="p-2 -ml-2 rounded-lg hover:bg-zinc-800">
          <ArrowLeft className="h-5 w-5 text-zinc-400" />
        </Link>
        <h1 className="text-lg font-bold">Add New Tool</h1>
      </div>

      <div className="mb-8">
        <StepIndicator steps={STEPS} currentStep={step} />
      </div>

      <div className="relative overflow-hidden">
        {step === 1 && (
          <Step1Serial
            form={form}
            effectiveBrand={effectiveBrand}
            showBarcodeScanner={showBarcodeScanner}
            onSerialChange={handleSerialChange}
            onOpenScanner={() => setShowBarcodeScanner(true)}
            onCloseScanner={() => setShowBarcodeScanner(false)}
            onBarcodeScan={handleBarcodeScan}
            onManualBrandChange={(b) => updateForm({ manualBrand: b })}
            onNext={() => setStep(2)}
          />
        )}
        {step === 2 && (
          <Step2Receipt
            form={form}
            ocrLoading={ocrLoading}
            ocrConfidence={ocrConfidence}
            updateForm={updateForm}
            onReceiptImage={handleReceiptImage}
            onNext={() => setStep(3)}
            onBack={() => setStep(1)}
          />
        )}
        {step === 3 && (
          <Step3Warranty
            form={form}
            updateForm={updateForm}
            effectiveBrand={effectiveBrand}
            computeWarranty={computeWarranty}
            onWarrantyCardImage={handleWarrantyCardImage}
            onNext={() => {
              setStep(4);
              handleStartMatching();
            }}
            onBack={() => setStep(2)}
          />
        )}
        {step === 4 && (
          <Step4Confirm
            form={form}
            effectiveBrand={effectiveBrand}
            matchingSteps={matchingSteps}
            matchComplete={matchComplete}
            warrantyCalc={warrantyCalc}
            onConfirm={handleConfirmSave}
            onBack={() => setStep(1)}
          />
        )}
      </div>
    </div>
  );
}

/* ---------- STEP 1 ---------- */
function Step1Serial({
  form,
  effectiveBrand,
  showBarcodeScanner,
  onSerialChange,
  onOpenScanner,
  onCloseScanner,
  onBarcodeScan,
  onManualBrandChange,
  onNext,
}: {
  form: FormData;
  effectiveBrand: Brand | null;
  showBarcodeScanner: boolean;
  onSerialChange: (v: string) => void;
  onOpenScanner: () => void;
  onCloseScanner: () => void;
  onBarcodeScan: (result: string) => void;
  onManualBrandChange: (v: string) => void;
  onNext: () => void;
}) {
  return (
    <div className="animate-fade-in space-y-5">
      <div>
        <label className="text-sm font-medium text-zinc-300 mb-2 block">
          Serial Number
        </label>
        <Input
          value={form.serialNumber}
          onChange={(e) => onSerialChange(e.target.value)}
          placeholder="e.g., M18FPD3-502C"
          className="font-mono text-lg uppercase bg-zinc-900 border-zinc-700 h-12 text-zinc-100 placeholder:text-zinc-600"
        />
      </div>

      {showBarcodeScanner ? (
        <BarcodeScanner onScan={onBarcodeScan} onClose={onCloseScanner} />
      ) : (
        <Button
          variant="outline"
          className="w-full h-12 border-zinc-700 text-zinc-300"
          onClick={onOpenScanner}
        >
          <ScanBarcode className="h-4 w-4 mr-2" />
          Scan Barcode
        </Button>
      )}

      {form.serialNumber.length > 2 && (
        <div className="animate-fade-in">
          {effectiveBrand ? (
            <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-xl p-3">
              <BrandLogo brand={effectiveBrand.id} size="md" />
              <div className="flex-1">
                <p className="text-sm text-zinc-300">
                  Detected:{" "}
                  <span className="font-semibold">{effectiveBrand.name}</span>
                </p>
                <p className="text-xs text-zinc-500">
                  {effectiveBrand.defaultWarrantyYears}-year warranty
                </p>
              </div>
              <Check className="h-4 w-4 text-status-active" />
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-zinc-500">
                Brand not auto-detected. Select manually:
              </p>
              <Select
                value={form.manualBrand}
                onValueChange={onManualBrandChange}
              >
                <SelectTrigger className="bg-zinc-900 border-zinc-700 text-zinc-200">
                  <SelectValue placeholder="Select brand" />
                </SelectTrigger>
                <SelectContent>
                  {brands.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      )}

      <Button
        className="w-full h-12 bg-amber-accent text-zinc-900 font-semibold hover:bg-amber-accent/90"
        disabled={form.serialNumber.length < 5}
        onClick={onNext}
      >
        Next
        <ChevronRight className="h-4 w-4 ml-1" />
      </Button>
    </div>
  );
}

/* ---------- STEP 2 ---------- */
function Step2Receipt({
  form,
  ocrLoading,
  ocrConfidence,
  updateForm,
  onReceiptImage,
  onNext,
  onBack,
}: {
  form: FormData;
  ocrLoading: boolean;
  ocrConfidence: OcrConfidence | null;
  updateForm: (u: Partial<FormData>) => void;
  onReceiptImage: (base64: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <div className="animate-fade-in space-y-5">
      <ReceiptScanner
        onImageCaptured={onReceiptImage}
        loading={ocrLoading}
        label="Upload Receipt"
        description="Take a photo or upload an image of your purchase receipt"
      />

      {form.receiptUploaded && !ocrLoading && (
        <div className="animate-fade-in space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-4 w-4 text-amber-accent" />
            <p className="text-sm font-medium text-amber-accent">
              AI Receipt Data Extracted
            </p>
          </div>

          <div className="space-y-3">
            <FieldWithConfidence
              label="Store Name"
              value={form.storeName}
              onChange={(v) => updateForm({ storeName: v })}
              confidence={ocrConfidence?.store}
            />
            <FieldWithConfidence
              label="Purchase Date"
              value={form.purchaseDate}
              onChange={(v) => updateForm({ purchaseDate: v })}
              confidence={ocrConfidence?.date}
              placeholder="DD/MM/YYYY"
            />
            <FieldWithConfidence
              label="Amount Paid"
              value={form.purchaseAmount}
              onChange={(v) => updateForm({ purchaseAmount: v })}
              confidence={ocrConfidence?.price}
              placeholder="$0.00"
            />
            <FieldWithConfidence
              label="Item Description"
              value={form.itemDescription}
              onChange={(v) => updateForm({ itemDescription: v })}
              confidence={ocrConfidence?.item}
            />
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <Button
          variant="outline"
          className="flex-1 h-12 border-zinc-700 text-zinc-300"
          onClick={onBack}
        >
          Back
        </Button>
        <Button
          className="flex-1 h-12 bg-amber-accent text-zinc-900 font-semibold hover:bg-amber-accent/90"
          onClick={onNext}
          disabled={ocrLoading}
        >
          {form.receiptUploaded ? "Next" : "Skip"}
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}

/* ---------- STEP 3 ---------- */
function Step3Warranty({
  form,
  updateForm,
  effectiveBrand,
  computeWarranty,
  onWarrantyCardImage,
  onNext,
  onBack,
}: {
  form: FormData;
  updateForm: (u: Partial<FormData>) => void;
  effectiveBrand: Brand | null;
  computeWarranty: () => WarrantyCalculation | null;
  onWarrantyCardImage: (base64: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const wc = computeWarranty();
  const isMilwaukee = effectiveBrand?.id === "milwaukee";

  return (
    <div className="animate-fade-in space-y-5">
      <ReceiptScanner
        onImageCaptured={onWarrantyCardImage}
        label="Upload Warranty Card"
        description="Take a photo of your warranty card (optional)"
      />

      <div className="space-y-3">
        <Field
          label="Warranty Card Number"
          value={form.warrantyCardNumber}
          onChange={(v) => updateForm({ warrantyCardNumber: v })}
          placeholder="e.g., MW-2024-889431"
        />

        <div>
          <label className="text-xs font-medium text-zinc-500 mb-1.5 block">
            Warranty Type
          </label>
          <Select
            value={form.warrantyType}
            onValueChange={(v) =>
              updateForm({ warrantyType: v as WarrantyType })
            }
          >
            <SelectTrigger className="bg-zinc-900 border-zinc-700 text-zinc-200 h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="standard">Standard Manufacturer</SelectItem>
              <SelectItem value="extended">Extended</SelectItem>
              <SelectItem value="dealer">Dealer Warranty</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isMilwaukee && (
          <div>
            <label className="text-xs font-medium text-zinc-500 mb-1.5 block">
              Tool Type
            </label>
            <Select
              value={form.category}
              onValueChange={(v) =>
                updateForm({ category: v as ToolCategory })
              }
            >
              <SelectTrigger className="bg-zinc-900 border-zinc-700 text-zinc-200 h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="drill">Power Tool (5yr)</SelectItem>
                <SelectItem value="hand_tool">Hand Tool (3yr)</SelectItem>
                <SelectItem value="battery">Battery (2yr)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {(effectiveBrand?.id === "makita" || effectiveBrand?.id === "husqvarna") && (
          <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-lg p-3">
            <span className="text-xs text-zinc-300">
              Product registered with manufacturer?
            </span>
            <button
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium transition-colors",
                form.isRegistered
                  ? "bg-amber-accent text-zinc-900"
                  : "bg-zinc-800 text-zinc-400"
              )}
              onClick={() => updateForm({ isRegistered: !form.isRegistered })}
            >
              {form.isRegistered ? "Yes" : "No"}
            </button>
          </div>
        )}
      </div>

      {/* Makita 30-day warning */}
      {wc && wc.warnings.length > 0 && (
        <div className="space-y-2">
          {wc.warnings.map((warning, i) => (
            <div
              key={i}
              className="flex items-start gap-2 bg-status-expiring/10 border border-status-expiring/20 rounded-lg p-3"
            >
              <AlertTriangle className="h-4 w-4 text-status-expiring shrink-0 mt-0.5" />
              <p className="text-xs text-status-expiring">{warning}</p>
            </div>
          ))}
        </div>
      )}

      {/* Calculated warranty summary */}
      {wc && effectiveBrand && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 space-y-2">
          <p className="text-xs text-zinc-400">
            <span
              className="font-medium"
              style={{ color: effectiveBrand.color }}
            >
              {effectiveBrand.name}
            </span>{" "}
            — {wc.durationYears}-year warranty
          </p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-500">
              Expires: {formatDate(wc.warrantyEndDate)}
            </span>
            <WarrantyBadge endDate={wc.warrantyEndDate} size="sm" />
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <Button
          variant="outline"
          className="flex-1 h-12 border-zinc-700 text-zinc-300"
          onClick={onBack}
        >
          Back
        </Button>
        <Button
          className="flex-1 h-12 bg-amber-accent text-zinc-900 font-semibold hover:bg-amber-accent/90"
          onClick={onNext}
        >
          {form.warrantyCardNumber ? "Next" : "Skip"}
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}

/* ---------- STEP 4 ---------- */
const matchLabels = [
  "Reading serial number...",
  "Extracting receipt data...",
  "Matching warranty information...",
  "Verifying match...",
];

function Step4Confirm({
  form,
  effectiveBrand,
  matchingSteps,
  matchComplete,
  warrantyCalc,
  onConfirm,
  onBack,
}: {
  form: FormData;
  effectiveBrand: Brand | null;
  matchingSteps: number[];
  matchComplete: boolean;
  warrantyCalc: WarrantyCalculation | null;
  onConfirm: () => void;
  onBack: () => void;
}) {
  const brandName = effectiveBrand?.name ?? "Unknown Brand";
  const durationYears = warrantyCalc?.durationYears ?? effectiveBrand?.defaultWarrantyYears ?? 3;
  const expiryDate = warrantyCalc?.warrantyEndDate
    ? formatDate(warrantyCalc.warrantyEndDate)
    : "—";

  const isMakita = effectiveBrand?.id === "makita";
  const makitaDaysRemaining = (() => {
    if (!isMakita || !form.purchaseDate) return null;
    const iso = parsePurchaseDateToISO(form.purchaseDate);
    const purchase = new Date(iso);
    const deadline = new Date(purchase.getTime() + 30 * 24 * 60 * 60 * 1000);
    const remaining = Math.ceil(
      (deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    return remaining > 0 && !form.isRegistered ? remaining : null;
  })();

  return (
    <div className="animate-fade-in space-y-5">
      <div className="space-y-3">
        {matchLabels.map((label, i) => {
          const isDone = matchingSteps.includes(i);
          const isActive = !isDone && matchingSteps.length === i;

          return (
            <div
              key={i}
              className={cn(
                "flex items-center gap-3 transition-all duration-300",
                isDone || isActive ? "opacity-100" : "opacity-30"
              )}
            >
              {isDone ? (
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-status-active/20 animate-check-in">
                  <Check className="h-3.5 w-3.5 text-status-active" />
                </div>
              ) : isActive ? (
                <Loader2 className="h-6 w-6 text-amber-accent animate-spin" />
              ) : (
                <div className="w-6 h-6 rounded-full border border-zinc-700" />
              )}
              <span
                className={cn(
                  "text-sm",
                  isDone
                    ? "text-zinc-300"
                    : isActive
                      ? "text-amber-accent"
                      : "text-zinc-600"
                )}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>

      {!matchComplete && matchingSteps.length > 0 && (
        <div className="space-y-3 animate-fade-in">
          <div className="h-28 rounded-xl bg-zinc-900 border border-zinc-800 shimmer" />
          <div className="h-10 rounded-lg bg-zinc-900 border border-zinc-800 shimmer" style={{ animationDelay: "200ms" }} />
        </div>
      )}

      {matchComplete && (
        <div className="animate-slide-in-up bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BrandLogo brand={effectiveBrand?.id ?? ""} size="md" />
              <h3 className="font-semibold text-zinc-100">
                {form.itemDescription || `${brandName} Power Tool`}
              </h3>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="relative w-10 h-10">
                <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                  <circle
                    cx="18" cy="18" r="14" fill="none"
                    stroke="currentColor" strokeWidth="3"
                    className="text-zinc-800"
                  />
                  <circle
                    cx="18" cy="18" r="14" fill="none"
                    stroke="currentColor" strokeWidth="3"
                    strokeDasharray={`${98 * 0.88} ${100 * 0.88}`}
                    strokeLinecap="round"
                    className="text-amber-accent"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-amber-accent">
                  98%
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <InfoRow label="Serial" value={form.serialNumber} mono />
            <InfoRow
              label="Receipt"
              value={
                form.storeName
                  ? `${form.storeName} — ${form.purchaseAmount} — ${form.purchaseDate || "—"}`
                  : "No receipt"
              }
            />
            <InfoRow
              label="Warranty"
              value={`${brandName} ${durationYears}-Year — Expires ${expiryDate}`}
            />
            {warrantyCalc && (
              <div className="flex justify-between items-center gap-4">
                <span className="text-zinc-500 text-xs shrink-0">Status</span>
                <WarrantyBadge endDate={warrantyCalc.warrantyEndDate} size="sm" />
              </div>
            )}
            {form.warrantyCardNumber && (
              <InfoRow label="Card #" value={form.warrantyCardNumber} mono />
            )}
          </div>

          {makitaDaysRemaining && (
            <div className="flex items-start gap-2 bg-status-expiring/10 border border-status-expiring/20 rounded-lg p-3">
              <AlertTriangle className="h-4 w-4 text-status-expiring shrink-0 mt-0.5" />
              <p className="text-xs text-status-expiring">
                {makitaDaysRemaining} day{makitaDaysRemaining !== 1 ? "s" : ""} left
                to register on MyMakita for 3-year warranty
              </p>
            </div>
          )}

          {warrantyCalc && warrantyCalc.warnings.length > 0 && !makitaDaysRemaining && (
            <div className="space-y-2">
              {warrantyCalc.warnings.map((w, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 bg-zinc-800/50 border border-zinc-700 rounded-lg p-2"
                >
                  <AlertTriangle className="h-3.5 w-3.5 text-zinc-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-zinc-400">{w}</p>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1 h-11 border-zinc-700 text-zinc-300"
              onClick={onBack}
            >
              Edit
            </Button>
            <Button
              className="flex-1 h-11 bg-amber-accent text-zinc-900 font-semibold hover:bg-amber-accent/90"
              onClick={onConfirm}
            >
              <Check className="h-4 w-4 mr-1.5" />
              Confirm & Save
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- SHARED ---------- */

function parsePurchaseDateToISO(dateStr: string): string {
  if (!dateStr) return new Date().toISOString().split("T")[0];
  const parts = dateStr.split("/");
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return new Date().toISOString().split("T")[0];
}

function ConfidenceDot({ confidence }: { confidence?: number }) {
  if (confidence === undefined) return null;
  const color =
    confidence >= 80
      ? "bg-status-active"
      : confidence >= 50
        ? "bg-status-expiring"
        : "bg-zinc-600";
  return (
    <span
      className={cn("inline-block w-1.5 h-1.5 rounded-full ml-1", color)}
      title={`OCR confidence: ${confidence}%`}
    />
  );
}

function FieldWithConfidence({
  label,
  value,
  onChange,
  confidence,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  confidence?: number;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-zinc-500 mb-1.5 flex items-center">
        {label}
        <ConfidenceDot confidence={confidence} />
      </label>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="bg-zinc-900 border-zinc-700 text-zinc-200 h-10 text-sm"
      />
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-zinc-500 mb-1.5 block">
        {label}
      </label>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="bg-zinc-900 border-zinc-700 text-zinc-200 h-10 text-sm"
      />
    </div>
  );
}

function InfoRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-zinc-500 text-xs shrink-0">{label}</span>
      <span
        className={cn("text-zinc-300 text-xs text-right", mono && "font-mono")}
      >
        {value}
      </span>
    </div>
  );
}
