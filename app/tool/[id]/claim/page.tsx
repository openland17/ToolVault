"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Camera,
  Check,
  Download,
  Loader2,
  MapPin,
  Share2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StepIndicator } from "@/components/step-indicator";
import { AiAnalysisCard } from "@/components/ai-analysis-card";
import { ClaimDocument } from "@/components/claim-document";
import { BrandLogo } from "@/components/brand-logo";
import { useTools } from "@/lib/hooks/use-tools";
import { useToast } from "@/hooks/use-toast";
import {
  cn,
  generateClaimReference,
  getBrand,
  getWarrantyStatus,
  simulateDelay,
} from "@/lib/utils";
import { warrantyPolicies } from "@/lib/warranty-rules";
import {
  ClaimVerdict,
  ExclusionCheck,
  WarrantyClaimAnalysis,
  WarrantyClause,
} from "@/lib/types";

const STEPS = ["Describe", "Analysis", "Claim"];

const WEAR_KEYWORDS = [
  "wear",
  "worn",
  "old",
  "faded",
  "dull",
  "used",
  "rough",
  "scratched",
];

export default function ClaimPage() {
  const params = useParams();
  const router = useRouter();
  const { getToolById, loaded } = useTools();
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [issueDescription, setIssueDescription] = useState("");
  const [photoUploaded, setPhotoUploaded] = useState(false);
  const [selectedChips, setSelectedChips] = useState<string[]>([]);
  const [analysisSteps, setAnalysisSteps] = useState<number[]>([]);
  const [analysis, setAnalysis] = useState<WarrantyClaimAnalysis | null>(null);
  const [claimRef] = useState(generateClaimReference());

  const tool = getToolById(params.id as string);

  if (!loaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-amber-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!tool) {
    return (
      <div className="max-w-lg mx-auto px-4 pt-4">
        <Link href="/" className="inline-flex items-center gap-2 text-zinc-400 mb-8">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <p className="text-center text-zinc-500">Tool not found.</p>
      </div>
    );
  }

  const brand = getBrand(tool.brand);
  const policy = warrantyPolicies[tool.brand];
  const status = getWarrantyStatus(tool.warrantyEndDate);

  const commonIssues = policy?.commonIssues ?? [
    "Won't start",
    "Overheating",
    "Unusual noise",
    "Loss of power",
  ];

  const toggleChip = (chip: string) => {
    setSelectedChips((prev) =>
      prev.includes(chip) ? prev.filter((c) => c !== chip) : [...prev, chip]
    );
    if (!issueDescription.includes(chip)) {
      setIssueDescription((prev) =>
        prev ? `${prev}. ${chip}.` : `${chip}.`
      );
    }
  };

  const getVerdict = (): ClaimVerdict => {
    if (status === "expired") return "not_covered";
    const desc = issueDescription.toLowerCase();
    const hasWearKeyword = WEAR_KEYWORDS.some((w) => desc.includes(w));
    if (hasWearKeyword) return "partially_covered";
    return "likely_covered";
  };

  const buildAnalysis = (): WarrantyClaimAnalysis => {
    const verdict = getVerdict();
    const clauses: WarrantyClause[] = policy?.clauses.slice(0, 2) ?? [];

    const exclusionsCheck: ExclusionCheck[] = [
      {
        label: "Normal wear and tear",
        passed: verdict !== "partially_covered",
        detail:
          verdict === "partially_covered"
            ? "Possible wear-related issue detected"
            : "Not applicable (defect within expected lifespan)",
      },
      {
        label: "Misuse or modification",
        passed: true,
        detail: "Not detected based on description",
      },
      {
        label: "Commercial vs domestic use",
        passed: true,
        detail: "Within warranty scope",
      },
      {
        label: "Warranty period validity",
        passed: status !== "expired",
        detail:
          status === "expired"
            ? "Warranty has expired"
            : "Within active warranty period",
      },
    ];

    const confidence =
      verdict === "likely_covered"
        ? 87
        : verdict === "partially_covered"
          ? 62
          : 94;

    const recommendationMap: Record<ClaimVerdict, string> = {
      likely_covered: `Based on your description, this appears to be a manufacturing defect covered under ${brand?.name ?? "the manufacturer"}'s warranty. We recommend taking the tool to an authorised service centre with the claim document below. Under Australian Consumer Law, you are entitled to a repair, replacement, or refund for products with major failures.`,
      partially_covered: `Your description suggests possible wear-related damage, which may be partially covered. We recommend visiting an authorised ${brand?.name ?? ""} service centre for inspection. The technician can determine if this falls under warranty or normal wear. Australian Consumer Law may provide additional protections.`,
      not_covered: `Unfortunately, this tool's warranty has expired. However, under Australian Consumer Law, you may still have rights if the product has not lasted a reasonable time. We recommend contacting ${brand?.name ?? "the manufacturer"} or an authorised service centre to discuss your options.`,
    };

    return {
      verdict,
      confidence,
      relevantClauses: clauses,
      exclusionsCheck,
      recommendation: recommendationMap[verdict],
    };
  };

  const handleAnalyse = async () => {
    setStep(2);
    setAnalysisSteps([]);
    setAnalysis(null);

    const delays = [1000, 1200, 1000, 800, 1000];
    for (let i = 0; i < 5; i++) {
      await simulateDelay(delays[i]);
      setAnalysisSteps((prev) => [...prev, i]);
    }

    await simulateDelay(500);
    setAnalysis(buildAnalysis());
  };

  const handleGenerateClaim = () => {
    setStep(3);
    toast({
      title: "Claim document generated",
      description: `Reference: ${claimRef}`,
    });
  };

  return (
    <div className="max-w-lg mx-auto px-4 pt-4 pb-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href={`/tool/${tool.id}`}
          className="p-2 -ml-2 rounded-lg hover:bg-zinc-800"
        >
          <ArrowLeft className="h-5 w-5 text-zinc-400" />
        </Link>
        <h1 className="text-lg font-bold">Warranty Claim</h1>
      </div>

      {/* Steps */}
      <div className="mb-8">
        <StepIndicator steps={STEPS} currentStep={step} />
      </div>

      {/* Tool context */}
      <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-xl p-3 mb-6">
        <BrandLogo brand={tool.brand} size="md" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-zinc-200 truncate">
            {tool.name}
          </p>
          <p className="text-xs text-zinc-500 font-mono">{tool.serialNumber}</p>
        </div>
      </div>

      {/* Step 1: Describe issue */}
      {step === 1 && (
        <div className="animate-fade-in space-y-5">
          <div>
            <label className="text-sm font-medium text-zinc-300 mb-2 block">
              Describe what&apos;s wrong with your tool
            </label>
            <Textarea
              value={issueDescription}
              onChange={(e) => setIssueDescription(e.target.value)}
              placeholder="e.g., Chuck wobbles and doesn't hold bits securely. Makes grinding noise during use."
              className="bg-zinc-900 border-zinc-700 text-zinc-200 min-h-[120px] placeholder:text-zinc-600"
            />
          </div>

          {/* Quick chips */}
          <div>
            <p className="text-xs text-zinc-500 mb-2">Common issues:</p>
            <div className="flex flex-wrap gap-2">
              {commonIssues.map((issue) => (
                <button
                  key={issue}
                  onClick={() => toggleChip(issue)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                    selectedChips.includes(issue)
                      ? "bg-amber-accent text-zinc-900"
                      : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                  )}
                >
                  {issue}
                </button>
              ))}
            </div>
          </div>

          {/* Photo upload */}
          <div
            className={cn(
              "border-2 border-dashed rounded-xl p-4 text-center transition-colors cursor-pointer",
              photoUploaded
                ? "border-amber-accent/30 bg-amber-accent/5"
                : "border-zinc-700"
            )}
            onClick={() => setPhotoUploaded(true)}
          >
            {photoUploaded ? (
              <div className="flex items-center gap-3 justify-center">
                <Check className="h-5 w-5 text-amber-accent" />
                <span className="text-sm text-amber-accent">Photo attached</span>
              </div>
            ) : (
              <>
                <Camera className="h-6 w-6 text-zinc-500 mx-auto mb-2" />
                <p className="text-xs text-zinc-500">
                  Upload photos of the issue (optional)
                </p>
              </>
            )}
          </div>

          <Button
            className="w-full h-12 bg-amber-accent text-zinc-900 font-semibold hover:bg-amber-accent/90"
            disabled={issueDescription.length < 10}
            onClick={handleAnalyse}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Analyse Warranty
          </Button>
        </div>
      )}

      {/* Step 2: AI Analysis */}
      {step === 2 && (
        <div className="space-y-6">
          {/* Analysis progress */}
          <AnalysisProgress steps={analysisSteps} />

          {/* Shimmer skeleton while analysing */}
          {!analysis && analysisSteps.length > 0 && analysisSteps.length < 5 && (
            <div className="space-y-3 animate-fade-in">
              <div className="h-20 rounded-xl bg-zinc-900 border border-zinc-800 shimmer" />
              <div className="h-12 rounded-lg bg-zinc-900 border border-zinc-800 shimmer" style={{ animationDelay: "200ms" }} />
              <div className="h-12 rounded-lg bg-zinc-900 border border-zinc-800 shimmer" style={{ animationDelay: "400ms" }} />
            </div>
          )}

          {/* Result */}
          {analysis && (
            <div className="animate-slide-in-up space-y-4">
              <AiAnalysisCard
                analysis={analysis}
                brandName={brand?.name ?? "Unknown"}
              />
              <Button
                className="w-full h-12 bg-amber-accent text-zinc-900 font-semibold hover:bg-amber-accent/90"
                onClick={handleGenerateClaim}
              >
                Generate Claim Document
              </Button>
              <Button
                variant="outline"
                className="w-full h-11 border-zinc-700 text-zinc-300"
                onClick={() => setStep(1)}
              >
                Edit Description
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Step 3: Claim document */}
      {step === 3 && analysis && (
        <div className="animate-fade-in space-y-4">
          <ClaimDocument
            tool={tool}
            analysis={analysis}
            issueDescription={issueDescription}
            claimReference={claimRef}
            userName="Matt"
            userEmail="matt@toolvault.app"
          />

          <div className="space-y-3">
            <Button
              className="w-full h-12 bg-amber-accent text-zinc-900 font-semibold hover:bg-amber-accent/90"
              onClick={() =>
                toast({
                  title: "Document saved",
                  description: "Warranty claim PDF has been downloaded.",
                })
              }
            >
              <Download className="h-4 w-4 mr-2" />
              Download as PDF
            </Button>
            <Button
              variant="outline"
              className="w-full h-11 border-zinc-700 text-zinc-300"
              onClick={() =>
                toast({
                  title: "Share options",
                  description: "Share functionality coming soon.",
                })
              }
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Link href={`/dealers?brand=${tool.brand}`} className="block">
              <Button
                variant="outline"
                className="w-full h-11 border-zinc-700 text-zinc-300"
              >
                <MapPin className="h-4 w-4 mr-2" />
                Find Nearest {brand?.name} Service Centre
              </Button>
            </Link>
            <Button
              variant="ghost"
              className="w-full text-zinc-400"
              onClick={() => router.push(`/tool/${tool.id}`)}
            >
              Done
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

const analysisLabels = [
  "Reading warranty terms for",
  "Analysing your issue description...",
  "Checking coverage clauses...",
  "Reviewing exclusions...",
  "Generating recommendation...",
];

function AnalysisProgress({ steps }: { steps: number[] }) {
  return (
    <div className="space-y-3">
      {analysisLabels.map((label, i) => {
        const isDone = steps.includes(i);
        const isActive = !isDone && steps.length === i;

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
  );
}
