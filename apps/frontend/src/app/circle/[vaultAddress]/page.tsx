"use client";

import { useMemo } from "react";
import { useUser } from "../../../contexts/UserContext";
import { useVault, VaultProvider } from "../../../contexts/VaultContext";
import { formatAddress, formatUsd } from "../../../utils";
import { ArcCard } from "../../components/ArcCard";
import { EnsCard } from "../../components/EnsCard";
import { Header } from "../../components/Header";
import { InstallmentCard } from "../../components/InstallmentCard";
import { MembersCard } from "../../components/MembersCard";
import { PaymentVisualizationCard } from "../../components/PaymentVisualizationCard";
import { PayoutCard } from "../../components/PayoutCard";
import { SlotsCard } from "../../components/SlotsCard";
import { TimelineCard } from "../../components/TimelineCard";
import { GRID_GAP } from "../../components/designTokens";

const formatDate = (date: Date | null) => {
  if (!date || Number.isNaN(date.getTime())) return "--";
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

const getStatusLabel = (startDate: Date | null, endDate: Date | null) => {
  if (!startDate || !endDate) return "--";
  const now = Date.now();
  if (now < startDate.getTime()) return "Upcoming";
  if (now > endDate.getTime()) return "Ended";
  return "Active";
};

function CircleDetailContent() {
  const { isConnected } = useUser();
  const { loading, error, summary, participants, tokenId, paidInstallments } =
    useVault();

  const hasJoined = tokenId > 0n;

  const {
    amountLabel,
    title,
    startDateLabel,
    endDateLabel,
    statusLabel,
    slotsLeftLabel,
    arcscanUrl,
    installmentAmountLabel,
    totalRounds,
    totalInstallments,
  } = useMemo(() => {
    if (!summary) {
      return {
        amountLabel: "--",
        title: "--",
        startDateLabel: "--",
        endDateLabel: "--",
        statusLabel: "--",
        slotsLeftLabel: "--",
        arcscanUrl: null,
        installmentAmountLabel: "--",
        totalRounds: 0,
        totalInstallments: 0,
      };
    }

    const startDate = new Date(summary.startTime);
    const endDate = new Date(
      startDate.getTime() +
        Number(summary.timePerRound) * Number(summary.numberOfRounds) * 1000
    );
    const slotsLeft = Math.max(
      Number(summary.numUsers) - Number(summary.activeParticipantCount),
      0
    );

    return {
      amountLabel: formatUsd(summary.targetValue),
      title: summary.circleName || "--",
      startDateLabel: formatDate(startDate),
      endDateLabel: formatDate(endDate),
      statusLabel: getStatusLabel(startDate, endDate),
      slotsLeftLabel: `${slotsLeft} slots left`,
      arcscanUrl: summary.vaultAddress
        ? `https://testnet.arcscan.app/address/${summary.vaultAddress}`
        : null,
      installmentAmountLabel: formatUsd(summary.installmentAmount),
      totalRounds: Number(summary.numberOfRounds),
      totalInstallments: Number(summary.totalInstallments),
    };
  }, [summary]);

  const currentInstallment = hasJoined ? Number(paidInstallments) : 0;
  const members = participants.map((participant) => formatAddress(participant));

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

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header
        amountLabel={amountLabel}
        title={title}
      />

      <main className="flex-1 flex flex-col justify-center mx-auto max-w-[1280px] w-full px-6 md:px-10 pb-12 pt-4 box-border">
        <div className="flex flex-col gap-4 md:hidden">
          <SlotsCard statusLabel={statusLabel} slotsLeftLabel={slotsLeftLabel} />
          <PaymentVisualizationCard
            monthlyAmountLabel={installmentAmountLabel}
            totalMonths={totalInstallments}
            currentMonth={currentInstallment}
            earlyEntryLabel="--"
          />
          <TimelineCard startDate={startDateLabel} endDate={endDateLabel} />
          <PayoutCard
            isWalletConnected={isConnected}
            hasJoined={hasJoined}
            currentRound={currentInstallment}
            totalRounds={totalRounds}
            amountLabel={amountLabel}
            dueLabel="--"
          />
          <InstallmentCard
            isWalletConnected={isConnected}
            hasJoined={hasJoined}
            currentInstallment={currentInstallment}
            totalInstallments={totalInstallments}
            amountLabel={installmentAmountLabel}
            dueLabel="--"
          />
          <EnsCard ensName="--" ensUrl={null} />
          <MembersCard members={members} />
          <ArcCard arcscanUrl={arcscanUrl} />
        </div>

        <div
          className="hidden md:grid lg:hidden gap-4"
          style={{
            gridTemplateColumns: "1fr 1fr",
            gridTemplateRows: "auto auto auto auto auto",
            gridTemplateAreas: `
            "slots slots"
            "payment payment"
            "timeline ens"
            "payout installment"
            "members arc"
          `,
          }}
        >
          <div style={{ gridArea: "slots" }}>
            <SlotsCard
              statusLabel={statusLabel}
              slotsLeftLabel={slotsLeftLabel}
            />
          </div>
          <div style={{ gridArea: "payment" }}>
            <PaymentVisualizationCard
              monthlyAmountLabel={installmentAmountLabel}
              totalMonths={totalInstallments}
              currentMonth={currentInstallment}
              earlyEntryLabel="--"
            />
          </div>
          <div style={{ gridArea: "timeline" }}>
            <TimelineCard startDate={startDateLabel} endDate={endDateLabel} />
          </div>
          <div style={{ gridArea: "ens" }}>
            <EnsCard ensName="--" ensUrl={null} />
          </div>
          <div style={{ gridArea: "payout" }}>
            <PayoutCard
              isWalletConnected={isConnected}
              hasJoined={hasJoined}
              currentRound={currentInstallment}
              totalRounds={totalRounds}
              amountLabel={amountLabel}
              dueLabel="--"
            />
          </div>
          <div style={{ gridArea: "installment" }}>
            <InstallmentCard
              isWalletConnected={isConnected}
              hasJoined={hasJoined}
              currentInstallment={currentInstallment}
              totalInstallments={totalInstallments}
              amountLabel={installmentAmountLabel}
              dueLabel="--"
            />
          </div>
          <div style={{ gridArea: "members" }}>
            <MembersCard members={members} />
          </div>
          <div style={{ gridArea: "arc" }}>
            <ArcCard arcscanUrl={arcscanUrl} />
          </div>
        </div>

        <div
          className={`hidden lg:grid ${GRID_GAP} w-full`}
          style={{
            gridTemplateColumns: "1fr 1fr 1fr",
            gridTemplateRows: "auto",
            alignContent: "start",
            alignItems: "start",
          }}
        >
          <div className={`flex flex-col ${GRID_GAP}`}>
            <SlotsCard statusLabel={statusLabel} slotsLeftLabel={slotsLeftLabel} />
            <TimelineCard startDate={startDateLabel} endDate={endDateLabel} />
            <PayoutCard
              isWalletConnected={isConnected}
              hasJoined={hasJoined}
              currentRound={currentInstallment}
              totalRounds={totalRounds}
              amountLabel={amountLabel}
              dueLabel="--"
            />
            <InstallmentCard
              isWalletConnected={isConnected}
              hasJoined={hasJoined}
              currentInstallment={currentInstallment}
              totalInstallments={totalInstallments}
              amountLabel={installmentAmountLabel}
              dueLabel="--"
            />
          </div>

          <div className={`flex flex-col ${GRID_GAP}`}>
            <PaymentVisualizationCard
              monthlyAmountLabel={installmentAmountLabel}
              totalMonths={totalInstallments}
              currentMonth={currentInstallment}
              earlyEntryLabel="--"
            />
            <ArcCard arcscanUrl={arcscanUrl} />
          </div>

          <div className={`flex flex-col ${GRID_GAP}`}>
            <EnsCard ensName="--" ensUrl={null} />
            <MembersCard members={members} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default function CircleDetailPage({
  params,
}: {
  params: { vaultAddress: string };
}) {
  return (
    <VaultProvider vaultAddress={params.vaultAddress}>
      <CircleDetailContent />
    </VaultProvider>
  );
}
