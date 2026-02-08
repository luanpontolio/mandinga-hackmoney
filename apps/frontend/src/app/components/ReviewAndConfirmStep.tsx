"use client";

import { Check, Loader2 } from "lucide-react";
import { format as formatDateFn } from "date-fns";

type Props = {
  monthlyAmount: string;
  totalMonths: number;
  totalCommitment: string;
  protocolFee: string;
  totalWithFees: string;
  feeLabel: string;
  onConfirm: () => void;
  isSubmitting: boolean;
  stepError: string | null;
  getEntryLabel?: () => string;
  agreementSignedAt?: Date | null;
};

export default function ReviewAndConfirmStep({
  monthlyAmount,
  totalMonths,
  totalCommitment,
  protocolFee,
  totalWithFees,
  feeLabel,
  onConfirm,
  isSubmitting,
  stepError,
  getEntryLabel,
  agreementSignedAt,
}: Props) {
  const formattedDate = agreementSignedAt
    ? formatDateFn(agreementSignedAt, "MMM d, yyyy h:mm aa")
    : "Just now";

  const txSteps = [
    { step: 0, label: "Agreement signed" },
    { step: 1, label: "Pay installment" },
    { step: 2, label: "Mint position & claim tokens" },
  ];

  return (
    <div className="rounded-xl border border-[#E5E5E5] bg-white">
      <div className="px-5 lg:px-6 pt-5 lg:pt-6">
        <h2 className="text-lg font-semibold text-[#1A1A1A]">Review</h2>
        <p className="text-sm text-[#666666] mt-1">Review your commitment and confirm the transaction to complete.</p>
      </div>

      <div className="px-5 lg:px-6 py-5">
        <div>
          <h3 className="text-xs font-semibold text-[#999999] uppercase tracking-wide mb-2">Your Commitment</h3>
          <div className="text-sm">
            <div className="flex justify-between py-1.5 border-b border-[#F0F0F0]">
              <span className="text-[#666666]">Monthly installment</span>
              <span className="font-medium text-[#1A1A1A]">{monthlyAmount}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#F0F0F0]">
              <span className="text-[#666666]">Duration</span>
              <span className="font-medium text-[#1A1A1A]">{totalMonths} months</span>
            </div>
            {getEntryLabel && (
              <div className="flex justify-between py-1.5 border-b border-[#F0F0F0]">
                <span className="text-[#666666]">Position</span>
                <span className="font-medium text-[#1A1A1A]">{getEntryLabel()}</span>
              </div>
            )}
            <div className="flex justify-between py-1.5 border-b border-[#F0F0F0]">
              <span className="text-[#666666]">Subtotal</span>
              <span className="font-medium text-[#1A1A1A]">{totalCommitment}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#F0F0F0]">
              <span className="text-[#666666]">Vault fee ({feeLabel}%)</span>
              <span className="font-medium text-[#1A1A1A]">{protocolFee}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="font-medium text-[#1A1A1A]">Total</span>
              <span className="font-semibold text-[#1A1A1A]">{totalWithFees}</span>
            </div>
          </div>
        </div>

        <div className="mt-5">
          <h3 className="text-xs font-semibold text-[#999999] uppercase tracking-wide mb-2">Network & Fees</h3>
          <div className="text-sm">
            <div className="flex justify-between py-1.5 border-b border-[#F0F0F0]">
              <span className="text-[#666666]">Chain</span>
              <span className="font-medium text-[#1A1A1A]">Arc</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#F0F0F0]">
              <span className="text-[#666666]">Currency</span>
              <span className="font-medium text-[#1A1A1A]">USDC (native)</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-[#666666]">Estimated gas</span>
              <span className="font-medium text-[#1A1A1A]">~$0.12</span>
            </div>
          </div>
        </div>

        <div className="mt-5">
          <h3 className="text-xs font-semibold text-[#999999] uppercase tracking-wide mb-3">Transaction Execution</h3>
          <div className="space-y-3 text-sm">
            {txSteps.map((item) => {
              const isComplete = item.step === 0 || (isSubmitting && item.step < 2);
              const isActive = isSubmitting && item.step === 1;

              return (
                <div key={item.step} className="flex items-center gap-2.5">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs transition-all ${isComplete ? "bg-[#1A1A1A] text-white" : isActive ? "border-2 border-[#1A1A1A] text-[#1A1A1A]" : "border border-[#E0E0E0] text-[#999999]"}`}>
                    {isComplete ? <Check className="w-3 h-3" strokeWidth={2.5} /> : isActive ? <Loader2 className="w-3 h-3 animate-spin" /> : item.step}
                  </div>
                  <span className={isComplete ? "text-[#1A1A1A]" : "text-[#666666]"}>{item.label}</span>
                </div>
              );
            })}
          </div>
          <p className="text-xs font-bold text-[#999999] mt-3">Each step requires wallet approval.</p>
        </div>
      </div>

      <div className="px-5 lg:px-6 pb-5 lg:pb-6 pt-4 border-t border-[#F0F0F0]">
        <button
          type="button"
          onClick={onConfirm}
          disabled={isSubmitting}
          className={`w-full rounded-full px-6 py-4 text-sm font-semibold ${isSubmitting ? "bg-[#E5E5E5] text-[#999999] cursor-not-allowed" : "bg-[#1A1A1A] text-white hover:bg-[#333333]"}`}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing...
            </span>
          ) : (
            "Confirm"
          )}
        </button>
      </div>

      {stepError && (
        <div className="px-5 lg:px-6 pb-6 pt-2">
          <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{stepError}</div>
        </div>
      )}
    </div>
  );
}
