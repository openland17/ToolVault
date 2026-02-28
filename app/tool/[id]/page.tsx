"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Copy,
  MapPin,
  AlertTriangle,
  ShieldCheck,
  Search,
  Trash2,
  ImageIcon,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { WarrantyBadge } from "@/components/warranty-badge";
import { BrandLogo } from "@/components/brand-logo";
import { useTools } from "@/lib/hooks/use-tools";
import { useToast } from "@/hooks/use-toast";
import {
  formatCurrency,
  formatDate,
  getBrand,
  getWarrantyRemaining,
  getWarrantyStatus,
  getDaysRemaining,
  cn,
} from "@/lib/utils";
import { useState } from "react";

export default function ToolDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { getToolById, deleteTool, loaded } = useTools();
  const { toast } = useToast();
  const [deleteOpen, setDeleteOpen] = useState(false);

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
  const status = getWarrantyStatus(tool.warrantyEndDate);
  const daysLeft = getDaysRemaining(tool.warrantyEndDate);

  const handleDelete = () => {
    deleteTool(tool.id);
    toast({ title: "Tool deleted", description: `${tool.name} has been removed.` });
    router.push("/");
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied", description: `${label} copied to clipboard.` });
  };

  return (
    <div className="max-w-lg mx-auto px-4 pt-4 pb-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Link href="/" className="p-2 -ml-2 rounded-lg hover:bg-zinc-800">
          <ArrowLeft className="h-5 w-5 text-zinc-400" />
        </Link>
        <h1 className="text-lg font-bold truncate flex-1">{tool.name}</h1>
      </div>

      {/* Expiring banner */}
      {status === "expiring" && (
        <div className="flex items-center gap-2 bg-status-expiring/10 border border-status-expiring/20 rounded-lg p-3 mb-4 animate-fade-in">
          <AlertTriangle className="h-4 w-4 text-status-expiring shrink-0" />
          <p className="text-sm text-status-expiring">
            Warranty expires in {daysLeft} days — consider servicing soon
          </p>
        </div>
      )}

      {/* Hero */}
      <div
        className="relative rounded-xl overflow-hidden mb-5 h-44"
        style={{
          background: `linear-gradient(135deg, ${brand?.color ?? "#444"}22 0%, #0A0A0B 100%)`,
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: `${brand?.color ?? "#444"}20` }}
          >
            <ShieldCheck className="h-10 w-10" style={{ color: brand?.color ?? "#888" }} />
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-end justify-between">
            <div>
              <BrandLogo brand={tool.brand} size="sm" />
              <h2 className="text-base font-bold text-zinc-100 mt-1">{tool.name}</h2>
              <p className="text-xs text-zinc-400">{tool.model}</p>
            </div>
            <WarrantyBadge endDate={tool.warrantyEndDate} size="md" />
          </div>
        </div>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <InfoCard
          label="Serial Number"
          value={tool.serialNumber}
          mono
          action={
            <button onClick={() => handleCopy(tool.serialNumber, "Serial number")}>
              <Copy className="h-3.5 w-3.5 text-zinc-500 hover:text-zinc-300" />
            </button>
          }
        />
        <InfoCard
          label="Purchase Date"
          value={formatDate(tool.purchaseDate)}
          sub={tool.purchaseStore}
        />
        <InfoCard
          label="Price Paid"
          value={formatCurrency(tool.purchasePrice)}
        />
        <InfoCard
          label="Warranty Period"
          value={`${formatDate(tool.warrantyStartDate)} — ${formatDate(tool.warrantyEndDate)}`}
          sub={tool.warrantyType === "standard" ? "Standard Manufacturer" : tool.warrantyType === "extended" ? "Extended" : "Dealer"}
        />
        <InfoCard
          label="Warranty Expiry"
          value={formatDate(tool.warrantyEndDate)}
          sub={getWarrantyRemaining(tool.warrantyEndDate)}
          highlight={status !== "active"}
        />
        {tool.warrantyCardNumber && (
          <InfoCard
            label="Warranty Card #"
            value={tool.warrantyCardNumber}
            mono
            action={
              <button onClick={() => handleCopy(tool.warrantyCardNumber!, "Warranty card number")}>
                <Copy className="h-3.5 w-3.5 text-zinc-500 hover:text-zinc-300" />
              </button>
            }
          />
        )}
      </div>

      {/* Documents */}
      <div className="mb-5">
        <h3 className="text-sm font-semibold text-zinc-300 mb-3">Documents</h3>
        <div className="flex gap-3">
          <DocThumb label="Receipt" imageSrc={tool.receiptImageBase64} />
          <DocThumb label="Warranty Card" imageSrc={tool.warrantyCardImageBase64} />
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3 mb-5">
        <Link href={`/tool/${tool.id}/claim`} className="block">
          <Button className="w-full h-12 bg-amber-accent text-zinc-900 font-semibold hover:bg-amber-accent/90">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Report Issue / Make Claim
          </Button>
        </Link>
        <Link href={`/tool/${tool.id}/claim`} className="block">
          <Button
            variant="outline"
            className="w-full h-12 border-zinc-700 text-zinc-300 hover:bg-zinc-800"
          >
            <Search className="h-4 w-4 mr-2" />
            Check Warranty Coverage
          </Button>
        </Link>
        <Link href={`/dealers?brand=${tool.brand}`} className="block">
          <Button
            variant="outline"
            className="w-full h-12 border-zinc-700 text-zinc-300 hover:bg-zinc-800"
          >
            <MapPin className="h-4 w-4 mr-2" />
            Find Nearest Service Centre
          </Button>
        </Link>
      </div>

      {/* Delete */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            className="w-full text-status-expired hover:text-status-expired hover:bg-status-expired/10"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Tool
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle>Delete {tool.name}?</DialogTitle>
            <DialogDescription className="text-zinc-400">
              This will permanently remove this tool and all associated warranty data.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              className="border-zinc-700"
              onClick={() => setDeleteOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-status-expired text-white hover:bg-status-expired/90"
              onClick={handleDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function InfoCard({
  label,
  value,
  sub,
  mono,
  highlight,
  action,
}: {
  label: string;
  value: string;
  sub?: string;
  mono?: boolean;
  highlight?: boolean;
  action?: React.ReactNode;
}) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3">
      <div className="flex items-start justify-between">
        <p className="text-[10px] text-zinc-500 uppercase tracking-wide mb-1">
          {label}
        </p>
        {action}
      </div>
      <p
        className={cn(
          "text-sm font-medium break-all",
          mono && "font-mono text-xs",
          highlight ? "text-status-expiring" : "text-zinc-200"
        )}
      >
        {value}
      </p>
      {sub && <p className="text-[11px] text-zinc-500 mt-0.5">{sub}</p>}
    </div>
  );
}

function DocThumb({ label, imageSrc }: { label: string; imageSrc?: string }) {
  if (imageSrc) {
    return (
      <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <Image
          src={imageSrc}
          alt={label}
          width={200}
          height={96}
          className="w-full h-24 object-cover"
          unoptimized
        />
        <p className="text-xs text-zinc-500 text-center py-2">{label}</p>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col items-center justify-center gap-2">
      <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center">
        <ImageIcon className="h-5 w-5 text-zinc-600" />
      </div>
      <p className="text-xs text-zinc-500">{label}</p>
    </div>
  );
}
