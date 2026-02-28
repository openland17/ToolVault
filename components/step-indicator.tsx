import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepIndicatorProps {
  steps: string[];
  currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-0 w-full px-2">
      {steps.map((step, index) => {
        const stepNum = index + 1;
        const isCompleted = stepNum < currentStep;
        const isCurrent = stepNum === currentStep;

        return (
          <div key={step} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all",
                  isCompleted && "bg-amber-accent text-zinc-900",
                  isCurrent && "bg-amber-accent text-zinc-900 ring-2 ring-amber-accent/30 ring-offset-2 ring-offset-[#0A0A0B]",
                  !isCompleted && !isCurrent && "bg-zinc-800 text-zinc-500 border border-zinc-700"
                )}
              >
                {isCompleted ? <Check className="h-4 w-4" /> : stepNum}
              </div>
              <span
                className={cn(
                  "text-[10px] font-medium text-center whitespace-nowrap",
                  isCurrent ? "text-amber-accent" : isCompleted ? "text-zinc-400" : "text-zinc-600"
                )}
              >
                {step}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "h-[2px] flex-1 mx-2 mt-[-18px]",
                  isCompleted ? "bg-amber-accent" : "bg-zinc-800"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
