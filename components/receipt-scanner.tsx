"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Camera, Upload, Loader2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ReceiptScannerProps {
  onImageCaptured: (base64: string) => void;
  loading?: boolean;
  label?: string;
  description?: string;
}

export function ReceiptScanner({
  onImageCaptured,
  loading = false,
  label = "Upload Receipt",
  description = "Take a photo or upload an image of your receipt",
}: ReceiptScannerProps) {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPreview(result);
      onImageCaptured(result);
    };
    reader.readAsDataURL(file);
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  };

  const handleReset = () => {
    setPreview(null);
  };

  if (preview && !loading) {
    return (
      <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-xl p-3">
        <Image
          src={preview}
          alt="Captured document"
          width={56}
          height={56}
          className="w-14 h-14 rounded-lg object-cover shrink-0"
          unoptimized
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-zinc-200">Document captured</p>
          <p className="text-xs text-zinc-500">Tap Replace to re-take</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-zinc-400"
          onClick={handleReset}
        >
          <RotateCcw className="h-3.5 w-3.5 mr-1" />
          Replace
        </Button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative border-2 border-dashed rounded-xl p-6 text-center transition-colors",
        loading
          ? "border-amber-accent/50 bg-amber-accent/5"
          : "border-zinc-700 bg-zinc-900/50"
      )}
    >
      {loading && (
        <div className="absolute inset-0 overflow-hidden rounded-xl">
          <div className="absolute left-0 right-0 h-0.5 bg-amber-accent/60 animate-scan-line" />
        </div>
      )}

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={onInputChange}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onInputChange}
      />

      <div className="relative z-10">
        {loading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 text-amber-accent animate-spin" />
            <p className="text-sm text-amber-accent font-medium">
              Reading your receipt...
            </p>
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
                onClick={() => cameraInputRef.current?.click()}
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              >
                <Camera className="h-4 w-4 mr-1.5" />
                Take Photo
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
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
