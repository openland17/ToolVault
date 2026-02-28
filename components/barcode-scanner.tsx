"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, X, AlertCircle, KeyboardIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BarcodeScannerProps {
  onScan: (result: string) => void;
  onClose: () => void;
}

export function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<{ stop: () => void } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function start() {
      try {
        const { BrowserMultiFormatReader } = await import("@zxing/browser");
        const reader = new BrowserMultiFormatReader();

        if (cancelled || !videoRef.current) return;

        const controls = await reader.decodeFromVideoDevice(
          undefined,
          videoRef.current,
          (result, err) => {
            if (cancelled) return;

            if (result) {
              const text = result.getText();
              if (text && text.length >= 3) {
                controls.stop();
                onScan(text);
              }
            }

            if (err && !result) {
              // NotFoundException is normal when no barcode is in frame
            }
          }
        );

        if (cancelled) {
          controls.stop();
          return;
        }

        controlsRef.current = controls;
        setReady(true);
      } catch (err) {
        if (cancelled) return;
        if (err instanceof DOMException && err.name === "NotAllowedError") {
          setError(
            "Camera permission denied. Please allow camera access or enter the serial number manually."
          );
        } else {
          setError(
            "Could not access camera. Please enter the serial number manually."
          );
        }
      }
    }

    start();

    return () => {
      cancelled = true;
      controlsRef.current?.stop();
    };
  }, [onScan]);

  if (error) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center space-y-4">
        <AlertCircle className="h-8 w-8 text-status-expiring mx-auto" />
        <p className="text-sm text-zinc-400">{error}</p>
        <Button
          variant="outline"
          className="border-zinc-700 text-zinc-300"
          onClick={onClose}
        >
          <KeyboardIcon className="h-4 w-4 mr-2" />
          Enter Manually
        </Button>
      </div>
    );
  }

  return (
    <div className="relative bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      <div className="relative aspect-[4/3] bg-black">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          playsInline
          muted
        />

        {ready && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-3/4 h-1/3 border-2 border-amber-accent/60 rounded-lg relative overflow-hidden">
              <div className="absolute left-0 right-0 h-0.5 bg-amber-accent/50 animate-scan-line" />
            </div>
          </div>
        )}

        {!ready && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Camera className="h-8 w-8 text-zinc-500 animate-pulse" />
          </div>
        )}
      </div>

      <div className="flex items-center justify-between p-3">
        <p className="text-xs text-zinc-500">
          {ready ? "Point at barcode or serial number" : "Starting camera..."}
        </p>
        <Button
          size="sm"
          variant="ghost"
          className="text-zinc-400 h-8 px-2"
          onClick={() => {
            controlsRef.current?.stop();
            onClose();
          }}
        >
          <X className="h-4 w-4 mr-1" />
          Cancel
        </Button>
      </div>
    </div>
  );
}
