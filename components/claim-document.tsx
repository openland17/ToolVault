"use client";

import { Tool, WarrantyClaimAnalysis } from "@/lib/types";
import { formatCurrency, formatDate, getBrand } from "@/lib/utils";
import { BrandLogo } from "./brand-logo";

interface ClaimDocumentProps {
  tool: Tool;
  analysis: WarrantyClaimAnalysis;
  issueDescription: string;
  claimReference: string;
  userName: string;
  userEmail: string;
}

export function ClaimDocument({
  tool,
  analysis,
  issueDescription,
  claimReference,
  userName,
  userEmail,
}: ClaimDocumentProps) {
  const brand = getBrand(tool.brand);
  const verdictLabels = {
    likely_covered: "LIKELY COVERED",
    partially_covered: "PARTIALLY COVERED",
    not_covered: "NOT COVERED",
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="bg-zinc-800 p-4 border-b border-zinc-700">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-base font-bold text-amber-accent">
            WARRANTY CLAIM
          </h2>
          <BrandLogo brand={tool.brand} size="sm" />
        </div>
        <p className="text-xs text-zinc-400 font-mono">
          TOOLVAULT REFERENCE #{claimReference}
        </p>
        <p className="text-xs text-zinc-500 mt-1">
          Generated: {formatDate(new Date().toISOString())}
        </p>
      </div>

      <div className="p-4 space-y-4 text-sm">
        {/* Claimant */}
        <Section title="Claimant Details">
          <Row label="Name" value={userName} />
          <Row label="Email" value={userEmail} />
        </Section>

        {/* Tool */}
        <Section title="Tool Information">
          <Row label="Brand" value={brand?.name ?? tool.brand} />
          <Row label="Tool" value={tool.name} />
          <Row label="Model" value={tool.model} />
          <Row label="Serial Number" value={tool.serialNumber} />
        </Section>

        {/* Purchase */}
        <Section title="Purchase Information">
          <Row label="Date" value={formatDate(tool.purchaseDate)} />
          <Row label="Store" value={tool.purchaseStore} />
          <Row label="Amount" value={formatCurrency(tool.purchasePrice)} />
        </Section>

        {/* Warranty */}
        <Section title="Warranty Information">
          <Row label="Type" value={tool.warrantyType === "standard" ? "Standard Manufacturer" : tool.warrantyType === "extended" ? "Extended" : "Dealer"} />
          {tool.warrantyCardNumber && (
            <Row label="Card #" value={tool.warrantyCardNumber} />
          )}
          <Row label="Period" value={`${formatDate(tool.warrantyStartDate)} — ${formatDate(tool.warrantyEndDate)}`} />
        </Section>

        {/* Issue */}
        <Section title="Issue Description">
          <p className="text-zinc-300">{issueDescription}</p>
        </Section>

        {/* Analysis */}
        <Section title="Warranty Analysis">
          <Row label="Verdict" value={verdictLabels[analysis.verdict]} />
          <Row label="Confidence" value={`${analysis.confidence}%`} />
          {analysis.relevantClauses[0] && (
            <div className="mt-2">
              <p className="text-[10px] text-zinc-500 uppercase">
                Relevant Clause
              </p>
              <p className="text-xs text-zinc-400 italic mt-1">
                &ldquo;{analysis.relevantClauses[0].text}&rdquo;
              </p>
            </div>
          )}
        </Section>

        {/* Recommended action */}
        <Section title="Recommended Action">
          <p className="text-zinc-300">{analysis.recommendation}</p>
        </Section>

        {/* ACL Note */}
        <div className="border-t border-zinc-800 pt-3">
          <p className="text-[10px] text-zinc-500 leading-relaxed">
            Note: This document is generated for informational purposes. Your rights under
            the Australian Consumer Law are not affected by manufacturer warranties. Goods come
            with guarantees that cannot be excluded under the Australian Consumer Law.
          </p>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-amber-accent uppercase tracking-wide mb-2">
        {title}
      </h3>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-baseline gap-4">
      <span className="text-zinc-500 text-xs shrink-0">{label}</span>
      <span className="text-zinc-300 text-xs text-right">{value}</span>
    </div>
  );
}
