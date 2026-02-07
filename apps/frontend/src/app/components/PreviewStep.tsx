"use client";

type PreviewStepProps = {
  monthlyAmount: string;
  totalMonths: number;
  totalCommitment: string;
  protocolFee: string;
  totalWithFees: string;
  feeLabel: string;
  onContinue: () => void;
};

export function PreviewStep({
  monthlyAmount,
  totalMonths,
  totalCommitment,
  protocolFee,
  totalWithFees,
  feeLabel,
  onContinue,
}: PreviewStepProps) {
  return (
    <div className="rounded-xl border border-[#E5E5E5] bg-white">
      <div className="px-5 lg:px-6 pt-5 lg:pt-6">
        <h2 className="text-lg font-semibold text-[#1A1A1A]">Review</h2>
        <p className="text-sm text-[#666666] mt-1">
          Verify your commitment before proceeding.
        </p>
      </div>

      <div className="px-5 lg:px-6 py-5">
        <div>
          <h3 className="text-xs font-semibold text-[#999999] uppercase tracking-wide mb-2">
            Your Commitment
          </h3>
          <div className="text-sm">
            <div className="flex justify-between py-1.5 border-b border-[#F0F0F0]">
              <span className="text-[#666666]">Monthly payment</span>
              <span className="font-medium text-[#1A1A1A]">
                {monthlyAmount}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#F0F0F0]">
              <span className="text-[#666666]">Duration</span>
              <span className="font-medium text-[#1A1A1A]">
                {totalMonths} months
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#F0F0F0]">
              <span className="text-[#666666]">Subtotal</span>
              <span className="font-medium text-[#1A1A1A]">
                {totalCommitment}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#F0F0F0]">
              <span className="text-[#666666]">
                Platform fee ({feeLabel}%)
              </span>
              <span className="font-medium text-[#1A1A1A]">
                {protocolFee}
              </span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="font-medium text-[#1A1A1A]">Total</span>
              <span className="font-semibold text-[#1A1A1A]">
                {totalWithFees}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-5">
          <h3 className="text-xs font-semibold text-[#999999] uppercase tracking-wide mb-2">
            Network & Fees
          </h3>
          <div className="text-sm">
            <div className="flex justify-between py-1.5 border-b border-[#F0F0F0]">
              <span className="text-[#666666]">Chain</span>
              <span className="font-medium text-[#1A1A1A]">Arc</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-[#666666]">Currency</span>
              <span className="font-medium text-[#1A1A1A]">USDC (native)</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 lg:px-6 pb-5 lg:pb-6 pt-4 border-t border-[#F0F0F0]">
        <button
          type="button"
          onClick={onContinue}
          className="w-full rounded-full bg-[#1A1A1A] px-6 py-4 text-sm font-semibold text-white hover:bg-[#333333]"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
