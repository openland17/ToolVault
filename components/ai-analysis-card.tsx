"use client";

import { WarrantyClaimAnalysis } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Check, AlertTriangle, X, ShieldCheck } from "lucide-react";

interface AiAnalysisCardProps {
  analysis: WarrantyClaimAnalysis;
  brandName: string;
}

const verdictConfig = {
  likely_covered: {
    label: "LIKELY COVERED",
    icon: ShieldCheck,
    bgClass: "bg-status-active/10 border-status-active/30",
    textClass: "text-status-active",
    emoji: "\u2705",
  },
  partially_covered: {
    label: "PARTIALLY COVERED",
    icon: AlertTriangle,
    bgClass: "bg-status-expiring/10 border-status-expiring/30",
    textClass: "text-status-expiring",
    emoji: "\u26A0\uFE0F",
  },
  not_covered: {
    label: "NOT COVERED",
    icon: X,
    bgClass: "bg-status-expired/10 border-status-expired/30",
    textClass: "text-status-expired",
    emoji: "\u274C",
  },
};

export function AiAnalysisCard({ analysis, brandName }: AiAnalysisCardProps) {
  const verdict = verdictConfig[analysis.verdict];
  const VerdictIcon = verdict.icon;

  return (
    <div className="space-y-4 animate-slide-in-up">
      {/* Verdict badge */}
      <div
        className={cn(
          "flex items-center gap-3 p-4 rounded-xl border",
          verdict.bgClass
        )}
      >
        <VerdictIcon className={cn("h-8 w-8 shrink-0", verdict.textClass)} />
        <div>
          <p className={cn("text-lg font-bold", verdict.textClass)}>
            {verdict.emoji} {verdict.label}
          </p>
          <p className="text-sm text-zinc-400">
            {analysis.confidence}% confidence
          </p>
        </div>
      </div>

      {/* Relevant warranty clause */}
      {analysis.relevantClauses.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-zinc-300">
            Relevant Warranty Clause
          </h4>
          {analysis.relevantClauses.map((clause, i) => (
            <div key={i} className="bg-zinc-900 rounded-lg border border-zinc-800 p-3">
              <p className="text-[10px] text-amber-accent font-medium uppercase tracking-wide mb-1">
                {clause.section}
              </p>
              <blockquote className="text-sm text-zinc-300 italic border-l-2 border-amber-accent pl-3">
                &ldquo;{clause.text}&rdquo;
              </blockquote>
              <p className="text-[10px] text-zinc-500 mt-2">
                Source: {brandName} Australia Limited Warranty
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Exclusions check */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-zinc-300">
          Exclusions Check
        </h4>
        <div className="space-y-1.5">
          {analysis.exclusionsCheck.map((check, i) => (
            <div
              key={i}
              className="flex items-start gap-2 text-sm"
            >
              {check.passed ? (
                <Check className="h-4 w-4 text-status-active shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-status-expiring shrink-0 mt-0.5" />
              )}
              <div>
                <span className="text-zinc-300">{check.label}</span>
                <span className="text-zinc-500"> — {check.detail}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendation */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-zinc-300">Recommendation</h4>
        <p className="text-sm text-zinc-400 leading-relaxed">
          {analysis.recommendation}
        </p>
      </div>
    </div>
  );
}
