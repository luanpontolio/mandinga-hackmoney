"use client";

import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useVault } from "../../contexts/VaultContext";
import { formatUsd } from "../../utils";

type Props = { circleSlug?: string | null };

export default function JoinSuccessScreen({ circleSlug }: Props) {
  const router = useRouter();
  const { claimTokenBalance, totalPaid } = useVault();
  const claimTokenLabel = formatUsd(claimTokenBalance);
  const totalPaidLabel = formatUsd(totalPaid);

  return (
    <div className="rounded-xl border border-[#E5E5E5] bg-white">
      <div className="px-5 lg:px-6 py-8 lg:py-12 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full bg-[#1A1A1A] flex items-center justify-center mb-6">
          <Check className="w-8 h-8 text-white" strokeWidth={2.5} />
        </div>

        <h2 className="text-2xl font-semibold text-[#1A1A1A] mb-2 leading-tight">Successfully Joined!</h2>
        <p className="text-sm text-[#666666] max-w-md leading-relaxed">You're now part of this circle. Your first payment has been processed.</p>

        <div className="mt-8 w-full max-w-sm">
          <div className="bg-[#FAFAFA] rounded-lg border border-[#E5E5E5] p-4 text-sm">
            <div className="flex justify-between py-1.5">
              <span className="text-[#666666]">Claim tokens</span>
              <span className="font-semibold text-[#1A1A1A]">{claimTokenLabel}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-[#666666]">Total paid</span>
              <span className="font-medium text-[#1A1A1A]">{totalPaidLabel}</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => router.push(circleSlug ? `/${circleSlug}` : "/")}
          className="w-full max-w-sm rounded-full bg-[#1A1A1A] px-6 py-4 text-sm font-semibold text-white hover:bg-[#333333] mt-8"
        >
          Go back to circle
        </button>
      </div>
    </div>
  );
}
