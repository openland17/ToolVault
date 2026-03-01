"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  Loader2,
  ScanBarcode,
  ChevronRight,
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
import { BrandLogo } from "@/components/brand-logo";
import { useTools } from "@/lib/hooks/use-tools";
import { useToast } from "@/hooks/use-toast";
import { brands, mockSerials } from "@/lib/mock-data";
import {
  cn,
  detectBrandFromSerial,
  formatDate,
  generateToolId,
  getMockOCRResult,
  simulateDelay,
  getBrand,
} from "@/lib/utils";
import { Brand, ToolCategory, WarrantyType } from "@/lib/types";
import { addYears, format } from "date-fns";

const STEPS = ["Serial", "Receipt", "Warranty", "Confirm"];

interface FormData {
  serialNumber: string;
  detectedBrand: Brand | null;
  manualBrand: string;
  storeName: string;
  purchaseDate: string;
  purchaseAmount: string;
  itemDescription: string;
  receiptUploaded: boolean;
  warrantyCardNumber: string;
  warrantyType: WarrantyType;
  warrantyCardUploaded: boolean;
  category: ToolCategory;
}

const initialFormData: FormData = {
  serialNumber: "",
  detectedBrand: null,
  manualBrand: "",
  storeName: "",
  purchaseDate: "",
  purchaseAmount: "",
  itemDescription: "",
  receiptUploaded: false,
  warrantyCardNumber: "",
  warrantyType: "standard",
  warrantyCardUploaded: false,
  category: "drill",
};

export default function AddToolPage() {
  const router = useRouter();
  const { addTool } = useTools();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(initialFormData);
  const [scanning, setScanning] = useState(false);
  const [matchingSteps, setMatchingSteps] = useState<number[]>([]);
  const [matchComplete, setMatchComplete] = useState(false);

  const effectiveBrand = form.detectedBrand ?? getBrand(form.manualBrand) ?? null;

  const updateForm = useCallback(
    (updates: Partial<FormData>) => setForm((prev) => ({ ...prev, ...updates })),
    []
  );

  const handleScanBarcode = async () => {
    setScanning(true);
    await simulateDelay(2000);
    const serial = mockSerials[Math.floor(Math.random() * mockSerials.length)];
    const brand = detectBrandFromSerial(serial);
    updateForm({ serialNumber: serial, detectedBrand: brand });
    setScanning(false);
  };

  const handleSerialChange = (value: string) => {
    const upper = value.toUpperCase();
    const brand = detectBrandFromSerial(upper);
    updateForm({ serialNumber: upper, detectedBrand: brand });
  };

  const handleReceiptScanned = () => {
    const brandId = effectiveBrand?.id ?? "milwaukee";
    const ocr = getMockOCRResult(brandId);
    updateForm({
      receiptUploaded: true,
      storeName: ocr.storeName,
      purchaseDate: ocr.purchaseDate,
      purchaseAmount: ocr.amount,
      itemDescription: ocr.itemDescription,
    });
  };

  const handleStartMatching = async () => {
    setMatchingSteps([]);
    setMatchComplete(false);

    const steps = [0, 1, 2, 3];
    for (const s of steps) {
      await simulateDelay(800);
      setMatchingSteps((prev) => [...prev, s]);
    }
    await simulateDelay(500);
    setMatchComplete(true);
  };

  const handleConfirmSave = () => {
    const brandData = effectiveBrand;
    const warrantyYears = brandData?.defaultWarrantyYears ?? 3;
    const purchaseDateISO = form.purchaseDate
      ? (() => {
          const parts = form.purchaseDate.split("/");
          if (parts.length === 3) {
            return `${parts[2]}-${parts[1]}-${parts[0]}`;
          }
          return new Date().toISOString().split("T")[0];
        })()
      : new Date().toISOString().split("T")[0];

    const priceNum = parseFloat(form.purchaseAmount.replace(/[$,]/g, "")) || 0;

    addTool({
      id: generateToolId(),
      brand: brandData?.id ?? "other",
      name: form.itemDescription || `${brandData?.name ?? "Unknown"} Power Tool`,
      model: form.serialNumber,
      serialNumber: form.serialNumber,
      category: form.category,
      purchaseDate: purchaseDateISO,
      purchaseStore: form.storeName || "Unknown Store",
      purchasePrice: Math.round(priceNum * 100),
      warrantyType: form.warrantyType,
      warrantyCardNumber: form.warrantyCardNumber || undefined,
      warrantyStartDate: purchaseDateISO,
      warrantyEndDate: format(
        addYears(new Date(purchaseDateISO), warrantyYears),
        "yyyy-MM-dd"
      ),
      matchConfidence: 98,
      createdAt: new Date().toISOString(),
    });

    toast({
      title: "Tool saved successfully",
      description: `${form.itemDescription || "Your tool"} has been added to ToolVault.`,
    });

    router.push("/");
  };

  return (
    <div className="max-w-lg mx-auto px-4 pt-4 pb-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/" className="p-2 -ml-2 rounded-lg hover:bg-zinc-800">
          <ArrowLeft className="h-5 w-5 text-zinc-400" />
        </Link>
        <h1 className="text-lg font-bold">Add New Tool</h1>
      </div>

      {/* Step indicator */}
      <div className="mb-8">
        <StepIndicator steps={STEPS} currentStep={step} />
      </div>

      {/* Step content */}
      <div className="relative overflow-hidden">
        {step === 1 && (
          <Step1Serial
            form={form}
            scanning={scanning}
            effectiveBrand={effectiveBrand}
            onSerialChange={handleSerialChange}
            onScanBarcode={handleScanBarcode}
            onManualBrandChange={(b) => updateForm({ manualBrand: b })}
            onNext={() => setStep(2)}
          />
        )}
        {step === 2 && (
          <Step2Receipt
            form={form}
            updateForm={updateForm}
            onReceiptScanned={handleReceiptScanned}
            onNext={() => setStep(3)}
            onBack={() => setStep(1)}
          />
        )}
        {step === 3 && (
          <Step3Warranty
            form={form}
            updateForm={updateForm}
            effectiveBrand={effectiveBrand}
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
  scanning,
  effectiveBrand,
  onSerialChange,
  onScanBarcode,
  onManualBrandChange,
  onNext,
}: {
  form: FormData;
  scanning: boolean;
  effectiveBrand: Brand | null;
  onSerialChange: (v: string) => void;
  onScanBarcode: () => void;
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

      <Button
        variant="outline"
        className={cn(
          "w-full h-12 border-zinc-700 text-zinc-300",
          scanning && "border-amber-accent/50"
        )}
        onClick={onScanBarcode}
        disabled={scanning}
      >
        {scanning ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin text-amber-accent" />
            <span className="text-amber-accent">Scanning...</span>
          </>
        ) : (
          <>
            <ScanBarcode className="h-4 w-4 mr-2" />
            Scan Barcode
          </>
        )}
      </Button>

      {form.serialNumber.length > 2 && (
        <div className="animate-fade-in">
          {effectiveBrand ? (
            <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-xl p-3">
              <BrandLogo brand={effectiveBrand.id} size="md" />
              <div className="flex-1">
                <p className="text-sm text-zinc-300">
                  Detected: <span className="font-semibold">{effectiveBrand.name}</span>
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
  updateForm,
  onReceiptScanned,
  onNext,
  onBack,
}: {
  form: FormData;
  updateForm: (u: Partial<FormData>) => void;
  onReceiptScanned: () => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <div className="animate-fade-in space-y-5">
      <ReceiptScanner
        onScanComplete={onReceiptScanned}
        label="Upload Receipt"
        description="Take a photo or upload an image of your purchase receipt"
      />

      {form.receiptUploaded && (
        <div className="animate-fade-in space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-4 w-4 text-amber-accent" />
            <p className="text-sm font-medium text-amber-accent">
              AI Receipt Data Extracted
            </p>
          </div>

          <div className="space-y-3">
            <Field
              label="Store Name"
              value={form.storeName}
              onChange={(v) => updateForm({ storeName: v })}
            />
            <Field
              label="Purchase Date"
              value={form.purchaseDate}
              onChange={(v) => updateForm({ purchaseDate: v })}
            />
            <Field
              label="Amount Paid"
              value={form.purchaseAmount}
              onChange={(v) => updateForm({ purchaseAmount: v })}
            />
            <Field
              label="Item Description"
              value={form.itemDescription}
              onChange={(v) => updateForm({ itemDescription: v })}
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
  onNext,
  onBack,
}: {
  form: FormData;
  updateForm: (u: Partial<FormData>) => void;
  effectiveBrand: Brand | null;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <div className="animate-fade-in space-y-5">
      <ReceiptScanner
        onScanComplete={() => {
          updateForm({
            warrantyCardUploaded: true,
            warrantyCardNumber: `${effectiveBrand?.name?.substring(0, 2).toUpperCase() ?? "TV"}-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`,
          });
        }}
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
            onValueChange={(v) => updateForm({ warrantyType: v as WarrantyType })}
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
      </div>

      {effectiveBrand && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3">
          <p className="text-xs text-zinc-400">
            <span className="font-medium" style={{ color: effectiveBrand.color }}>
              {effectiveBrand.name}
            </span>{" "}
            power tools come with a{" "}
            <span className="text-zinc-200 font-medium">
              {effectiveBrand.defaultWarrantyYears}-year limited warranty
            </span>
          </p>
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
  onConfirm,
  onBack,
}: {
  form: FormData;
  effectiveBrand: Brand | null;
  matchingSteps: number[];
  matchComplete: boolean;
  onConfirm: () => void;
  onBack: () => void;
}) {
  const brandName = effectiveBrand?.name ?? "Unknown Brand";
  const warrantyYears = effectiveBrand?.defaultWarrantyYears ?? 3;

  const purchaseDateDisplay = form.purchaseDate || formatDate(new Date().toISOString());
  const expiryDate = (() => {
    try {
      const parts = form.purchaseDate.split("/");
      if (parts.length === 3) {
        const d = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
        return formatDate(addYears(d, warrantyYears).toISOString());
      }
    } catch {
      // fallback
    }
    return formatDate(addYears(new Date(), warrantyYears).toISOString());
  })();

  return (
    <div className="animate-fade-in space-y-5">
      {/* Matching steps */}
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
                  isDone ? "text-zinc-300" : isActive ? "text-amber-accent" : "text-zinc-600"
                )}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Shimmer skeleton while matching */}
      {!matchComplete && matchingSteps.length > 0 && (
        <div className="space-y-3 animate-fade-in">
          <div className="h-28 rounded-xl bg-zinc-900 border border-zinc-800 shimmer" />
          <div className="h-10 rounded-lg bg-zinc-900 border border-zinc-800 shimmer" style={{ animationDelay: "200ms" }} />
        </div>
      )}

      {/* Result card */}
      {matchComplete && (
        <div className="animate-slide-in-up bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BrandLogo brand={effectiveBrand?.id ?? ""} size="md" />
              <h3 className="font-semibold text-zinc-100">
                {form.itemDescription || `${brandName} Power Tool`}
              </h3>
            </div>
            {/* Confidence */}
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
                  ? `${form.storeName} — ${form.purchaseAmount} — ${purchaseDateDisplay}`
                  : "No receipt"
              }
            />
            <InfoRow
              label="Warranty"
              value={`${brandName} ${warrantyYears}-Year Limited — Expires ${expiryDate}`}
            />
            {form.warrantyCardNumber && (
              <InfoRow label="Card #" value={form.warrantyCardNumber} mono />
            )}
          </div>

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

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-zinc-500 text-xs shrink-0">{label}</span>
      <span className={cn("text-zinc-300 text-xs text-right", mono && "font-mono")}>
        {value}
      </span>
    </div>
  );
}
