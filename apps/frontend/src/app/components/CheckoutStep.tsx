"use client";

type CheckoutStepProps = {
  circleLabel: string;
  monthlyAmount: string;
  totalMonths: number;
  totalWithFees: string;
  actionLabel: string;
  isSubmitting: boolean;
  stepError: string | null;
  onConfirm: () => void;
};

export function CheckoutStep({
  circleLabel,
  monthlyAmount,
  totalMonths,
  totalWithFees,
  actionLabel,
  isSubmitting,
  stepError,
  onConfirm,
}: CheckoutStepProps) {
  return (
    <div className="rounded-xl border border-[#E5E5E5] bg-white">
      <div className="px-5 lg:px-6 pt-5 lg:pt-6">
        <h2 className="text-lg font-semibold text-[#1A1A1A]">Confirm</h2>
        <p className="text-sm text-[#666666] mt-1">
          Execute your membership transaction.
        </p>
      </div>

      <div className="px-5 lg:px-6 py-5">
        <div className="text-sm">
          <div className="flex justify-between py-1.5 border-b border-[#F0F0F0]">
            <span className="text-[#666666]">Circle</span>
            <span className="font-medium text-[#1A1A1A]">{circleLabel}</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-[#F0F0F0]">
            <span className="text-[#666666]">First payment</span>
            <span className="font-medium text-[#1A1A1A]">{monthlyAmount}</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-[#F0F0F0]">
            <span className="text-[#666666]">Duration</span>
            <span className="font-medium text-[#1A1A1A]">
              {totalMonths} months
            </span>
          </div>
          <div className="flex justify-between py-1.5">
            <span className="text-[#666666]">Total commitment</span>
            <span className="font-semibold text-[#1A1A1A]">
              {totalWithFees}
            </span>
          </div>
        </div>

        {stepError && (
          <div className="mt-4 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            {stepError}
          </div>
        )}
      </div>

      <div className="px-5 lg:px-6 pb-5 lg:pb-6 pt-4 border-t border-[#F0F0F0]">
        <button
          type="button"
          onClick={onConfirm}
          disabled={isSubmitting}
          className={`w-full rounded-full px-6 py-4 text-sm font-semibold ${
            isSubmitting
              ? "bg-[#E5E5E5] text-[#999999] cursor-not-allowed"
              : "bg-[#1A1A1A] text-white hover:bg-[#333333]"
          }`}
        >
          {isSubmitting ? "Processing..." : actionLabel}
        </button>
      </div>
    </div>
  );
}
