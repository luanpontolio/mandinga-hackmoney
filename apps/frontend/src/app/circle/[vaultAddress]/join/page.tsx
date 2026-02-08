"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TermStep } from "../../../components/TermStep";
import ReviewAndConfirmStep from "../../../components/ReviewAndConfirmStep";
import JoinSuccessScreen from "../../../components/JoinSuccessScreen";
import { useVault, VaultProvider } from "../../../../contexts/VaultContext";
import { formatUsd } from "../../../../utils";
import { useJoinFlow } from "../../../../shared/hooks/useJoinFlow";
import { useJoinSummary } from "../../../../shared/hooks/useJoinSummary";

function JoinContent({ vaultAddress }: { vaultAddress: string }) {
  const {
    loading,
    error,
    summary,
    signature,
    step,
    stepStatus,
    stepError,
    isSubmitting,
    handleSignSiwe,
    handleCheckout,
  } = useVault();
  const { currentStep, setCurrentStep } = useJoinFlow(signature);
  const joinSummary = useJoinSummary(summary);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const router = useRouter();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10 text-muted-foreground">
        Loading circle details...
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
        {error ?? "Circle vault not found."}
      </div>
    );
  }
  if (!joinSummary) {
    return (
      <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
        Unable to load circle details.
      </div>
    );
  }

  const totalCommitment = joinSummary.totalCommitment;
  const feeLabel = joinSummary.feeLabel;
  const protocolFee = joinSummary.protocolFee;
  const totalWithFees = joinSummary.totalWithFees;
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="w-full border-b border-[#F0F0F0] surfaceTopbar">
        <div className="mx-auto max-w-[1280px] w-full px-6 md:px-10 py-6">
          {/* Mobile: stacked */}
          <div className="flex flex-col lg:hidden gap-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-[#666666]">{currentStep}/2</div>
              <button
                onClick={() => setShowCancelModal(true)}
                className="text-sm text-[#1A1A1A] border border-[#E0E0E0] rounded px-3 py-1"
              >
                Cancel
              </button>
            </div>
            <h1 className="text-xl font-semibold text-[#1A1A1A] text-center">Join Circle</h1>
          </div>

          {/* Desktop: title left, stepper center, cancel right */}
          <div className="hidden lg:flex items-center justify-between relative">
            <div className="text-lg font-semibold text-[#1A1A1A]">Join Circle</div>
            <div className="absolute left-1/2 -translate-x-1/2">
              <div className="flex items-center gap-3">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold ${currentStep >= 1 ? "bg-[#1A1A1A] text-white" : "border border-[#E0E0E0] text-[#BDBDBD] bg-white"}`}>1</div>
                <div className={`w-24 h-px ${currentStep > 1 ? "bg-[#1A1A1A]" : "bg-[#E0E0E0]"}`} />
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold ${currentStep === 2 ? "bg-[#1A1A1A] text-white" : "border border-[#E0E0E0] text-[#BDBDBD] bg-white"}`}>2</div>
              </div>
            </div>
            <div>
              <button
                onClick={() => setShowCancelModal(true)}
                className="text-sm text-[#1A1A1A] border border-[#E0E0E0] rounded px-3 py-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center mx-auto max-w-[1280px] w-full px-6 md:px-10 pb-12 pt-6 box-border gap-6">
        {/* If transaction finished successfully show success screen */}
        {step === "result" && stepStatus === "success" ? (
          <JoinSuccessScreen circleSlug={summary.vaultAddress} />
        ) : (
          <>
            {currentStep === 1 && (
              <TermStep
                monthlyAmount={formatUsd(summary.installmentAmount)}
                totalMonths={Number(summary.totalInstallments)}
                totalRounds={Number(summary.numberOfRounds)}
                startDate={summary.startTime}
                endDate={summary.closeWindowLate}
                onSign={async () => {
                  const ok = await handleSignSiwe();
                  if (ok) setCurrentStep(2);
                }}
              />
            )}
            {currentStep === 2 && (
              <ReviewAndConfirmStep
                monthlyAmount={formatUsd(summary.installmentAmount)}
                totalMonths={Number(summary.totalInstallments)}
                totalCommitment={formatUsd(totalCommitment)}
                protocolFee={formatUsd(protocolFee)}
                totalWithFees={formatUsd(totalWithFees)}
                feeLabel={feeLabel}
                onConfirm={handleCheckout}
                isSubmitting={isSubmitting}
                stepError={stepError}
                agreementSignedAt={signature ? new Date() : null}
              />
            )}
          </>
        )}
      </main>

      {/* Cancel confirmation modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-[#1A1A1A] mb-2">Cancel joining?</h2>
            <p className="text-sm text-[#666666] mb-6">Your progress will be lost and you'll need to start over if you want to join this circle later.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowCancelModal(false)} className="flex-1 border border-[#E0E0E0] rounded px-4 py-2">Continue Joining</button>
              <button onClick={() => router.push(`/circle/${vaultAddress}`)} className="flex-1 bg-[#1A1A1A] text-white rounded px-4 py-2">Yes, Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function JoinCirclePage({
  params,
}: {
  params: { vaultAddress: string };
}) {
  return (
    <VaultProvider vaultAddress={params.vaultAddress}>
      <JoinContent vaultAddress={params.vaultAddress} />
    </VaultProvider>
  );
}
