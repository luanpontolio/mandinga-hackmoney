"use client";

import { Check } from "lucide-react";
import { useRouter } from "next/navigation";

type SuccessStepProps = {
  circleAddress: string;
  flowMode: "deposit" | "pay";
};

export function SuccessStep({ circleAddress, flowMode }: SuccessStepProps) {
  const router = useRouter();
  const message =
    flowMode === "deposit"
      ? `You're now part of ${circleAddress}. Your first payment has been processed.`
      : `Paid installment to ${circleAddress}.`;

  return (
    <div className="rounded-xl border border-[#E5E5E5] bg-white surfaceCard">
      <div className="px-5 lg:px-6 py-8 lg:py-12 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full bg-[#1A1A1A] flex items-center justify-center mb-6">
          <Check className="w-8 h-8 text-white" strokeWidth={2.5} />
        </div>

        <h2 className="text-2xl font-semibold text-[#1A1A1A] mb-2 leading-tight">
          Successfully Joined!
        </h2>
        <p className="text-sm text-[#666666] text-muted max-w-md leading-relaxed">
          {message}
        </p>

        <button
          type="button"
          onClick={() =>
            router.push(`/circle/${circleAddress}?joined=true`)
          }
          className="w-full max-w-sm rounded-full bg-[#1A1A1A] px-6 py-4 text-sm font-semibold text-white hover:bg-[#333333] mt-8"
        >
          Go back to circle
        </button>
      </div>
    </div>
  );
}
