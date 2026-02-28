"use client";

import { useState } from "react";
import { Camera, Upload, Loader2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, simulateDelay } from "@/lib/utils";

interface ReceiptScannerProps {
  onScanComplete: () => void;
  label?: string;
  description?: string;
}

export function ReceiptScanner({
  onScanComplete,
  label = "Upload Receipt",
  description = "Take a photo or upload an image of your receipt",
}: ReceiptScannerProps) {
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);

  const handleScan = async () => {
    setScanning(true);
    await simulateDelay(1500);
    setScanning(false);
    setScanned(true);
    onScanComplete();
  };

  if (scanned) {
    return (
      <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-xl p-4">
        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-amber-accent/10">
          <FileText className="h-6 w-6 text-amber-accent" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-zinc-200">Document captured</p>
          <p className="text-xs text-zinc-500">Tap to replace</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-zinc-400"
          onClick={() => setScanned(false)}
        >
          Replace
        </Button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative border-2 border-dashed rounded-xl p-6 text-center transition-colors",
        scanning
          ? "border-amber-accent/50 bg-amber-accent/5"
          : "border-zinc-700 bg-zinc-900/50"
      )}
    >
      {scanning && (
        <div className="absolute inset-0 overflow-hidden rounded-xl">
          <div className="absolute left-0 right-0 h-0.5 bg-amber-accent/60 animate-scan-line" />
        </div>
      )}

      <div className="relative z-10">
        {scanning ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 text-amber-accent animate-spin" />
            <p className="text-sm text-amber-accent font-medium">Scanning...</p>
          </div>
        ) : (
          <>
            <Camera className="h-8 w-8 text-zinc-500 mx-auto mb-3" />
            <p className="text-sm font-medium text-zinc-300 mb-1">{label}</p>
            <p className="text-xs text-zinc-500 mb-4">{description}</p>
            <div className="flex gap-2 justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={handleScan}
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              >
                <Camera className="h-4 w-4 mr-1.5" />
                Take Photo
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleScan}
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              >
                <Upload className="h-4 w-4 mr-1.5" />
                Upload File
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
