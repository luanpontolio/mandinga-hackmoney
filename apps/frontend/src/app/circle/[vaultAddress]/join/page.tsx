"use client";

import { ArrowLeft, Check } from "lucide-react";
import Link from "next/link";
import { CheckoutStep } from "../../../components/CheckoutStep";
import { PreviewStep } from "../../../components/PreviewStep";
import { TermStep } from "../../../components/TermStep";
import { SuccessStep } from "../../../components/SuccessStep";
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
    stepStatus,
    stepError,
    isSubmitting,
    actionLabel,
    flowMode,
    handleSignSiwe,
    handleCheckout,
  } = useVault();
  const { currentStep, setCurrentStep } = useJoinFlow(signature, stepStatus);
  const joinSummary = useJoinSummary(summary);

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
  const circleLabel = joinSummary.circleLabel;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="w-full border-b border-[#F0F0F0]">
        <div className="mx-auto max-w-[1280px] w-full px-6 md:px-10 py-6 flex items-center justify-between">
          <Link
            href={`/circle/${vaultAddress}`}
            className="inline-flex items-center gap-2 text-[#1A1A1A] font-medium transition-opacity hover:opacity-70"
          >
            <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
            <span className="text-sm md:text-base whitespace-nowrap">Back</span>
          </Link>
          <div className="hidden md:flex items-center gap-2 text-sm text-[#666666]">
            <span>Step</span>
            <span className="font-semibold text-[#1A1A1A]">
              {currentStep}/4
            </span>
          </div>
          <div className="hidden md:flex items-center gap-2 text-[#1A1A1A]">
            <span className="text-sm font-medium">Join circle</span>
            <Check className="h-4 w-4" />
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col justify-center mx-auto max-w-[720px] w-full px-6 md:px-10 pb-12 pt-6 box-border gap-6">
        {currentStep === 1 && <TermStep onSign={handleSignSiwe} />}
        {currentStep === 2 && (
          <PreviewStep
            monthlyAmount={formatUsd(summary.installmentAmount)}
            totalMonths={Number(summary.totalInstallments)}
            totalCommitment={formatUsd(totalCommitment)}
            protocolFee={formatUsd(protocolFee)}
            totalWithFees={formatUsd(totalWithFees)}
            feeLabel={feeLabel}
            onContinue={() => setCurrentStep(3)}
          />
        )}
        {currentStep === 3 && (
          <CheckoutStep
            circleLabel={circleLabel}
            monthlyAmount={formatUsd(summary.installmentAmount)}
            totalMonths={Number(summary.totalInstallments)}
            totalWithFees={formatUsd(totalWithFees)}
            actionLabel={actionLabel}
            isSubmitting={isSubmitting}
            stepError={stepError}
            onConfirm={handleCheckout}
          />
        )}
        {currentStep === 4 && (
          <SuccessStep circleAddress={vaultAddress} flowMode={flowMode} />
        )}
      </main>
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
