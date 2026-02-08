"use client";

import { useMemo } from "react";
import { useUser } from "../../../contexts/UserContext";
import { useVault, VaultProvider } from "../../../contexts/VaultContext";
import { formatAddress, formatUsd } from "../../../utils";
import { ArcCard } from "../../components/ArcCard";
import { EnsCard } from "../../components/EnsCard";
import { EntryStatusCard } from "../../components/EntryStatusCard";
import { Header } from "../../components/Header";
import { MembersCard } from "../../components/MembersCard";
import { PaymentVisualizationCard } from "../../components/PaymentVisualizationCard";
import { PayoutCard } from "../../components/PayoutCard";
import { RedeemCard } from "../../components/RedeemCard";
import { SlotsCard } from "../../components/SlotsCard";
import { TimelineCard } from "../../components/TimelineCard";
import { GRID_GAP } from "../../components/designTokens";
import { useCircleEntrySelection } from "../../../shared/hooks/useCircleEntrySelection";
import { useCurrentQuotaId } from "../../../shared/hooks/useCurrentQuotaId";
import { useRedeemFlow } from "../../../shared/hooks/useRedeemFlow";
import { useEnsRecords } from "../../../shared/hooks/useEnsRecords";
import { getAddress } from "viem";

const formatDate = (date: Date | null) => {
  if (!date || Number.isNaN(date.getTime())) return "--";
  return date.toLocaleDateString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

const formatWindowRange = (start: Date | null, end: Date | null) => {
  if (!start || !end) return "--";
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return "--";
  const startLabel = start.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const endLabel = end.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${startLabel} - ${endLabel}`;
};

const getStatusLabel = (startDate: Date | null, endDate: Date | null) => {
  if (!startDate || !endDate) return "--";
  const now = Date.now();
  if (now < startDate.getTime()) return "Upcoming";
  if (now > endDate.getTime()) return "Ended";
  return "Active";
};


function CircleDetailContent() {
  const { isConnected, fullAddress } = useUser();
  console.log("fullAddress", fullAddress);
  const {
    loading,
    error,
    summary,
    participants,
    tokenId,
    positionQuotaId,
    paidInstallments,
  } = useVault();
  const hasJoined = tokenId > 0n;
  const {
    selectedEntry,
    setSelectedEntry,
    hoveredEntry,
    setHoveredEntry,
    lockedEntryId,
  } = useCircleEntrySelection({
    isConnected,
    hasJoined,
    positionQuotaId,
  });

  const {
    amountLabel,
    title,
    startDateLabel,
    endDateLabel,
    statusLabel: baseStatusLabel,
    slotsLeftLabel,
    arcscanUrl,
    installmentAmountLabel,
    totalRounds,
    totalInstallments,
    entryCounts,
    entryDescriptions,
    windowDates,
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
        entryCounts: { early: 0, middle: 0, late: 0 },
        entryDescriptions: { early: "--", middle: "--", late: "--" },
        windowDates: null,
      };
    }

    const startDate = new Date(summary.startTime);
    const closeWindowEarly = new Date(summary.closeWindowEarly);
    const closeWindowMiddle = new Date(summary.closeWindowMiddle);
    const endDate = new Date(summary.closeWindowLate);
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
      entryCounts: {
        early: Math.max(0, Number(summary.quotaCapEarly)),
        middle: Math.max(0, Number(summary.quotaCapMiddle)),
        late: Math.max(0, Number(summary.quotaCapLate)),
      },
      entryDescriptions: {
        early: formatWindowRange(startDate, closeWindowEarly),
        middle: formatWindowRange(closeWindowEarly, closeWindowMiddle),
        late: formatWindowRange(closeWindowMiddle, endDate),
      },
      windowDates: {
        startDate,
        closeWindowEarly,
        closeWindowMiddle,
        closeWindowLate: endDate,
      },
    };
  }, [summary]);

  const fallbackQuotaId = useCurrentQuotaId(windowDates);
  const currentQuotaId =
    hasJoined && positionQuotaId !== null ? positionQuotaId : fallbackQuotaId;

  const normalizedBaseStatus = baseStatusLabel.toUpperCase();
  const canShowJoined =
    normalizedBaseStatus !== "ENDED" &&
    normalizedBaseStatus !== "CLOSED" &&
    normalizedBaseStatus !== "FROZEN";
  const {
    drawCompleted,
    windowSettled,
    potShare,
    redeemError,
    isRedeeming,
    handleRedeem,
    isWinner,
  } = useRedeemFlow({
    vaultAddress: summary?.vaultAddress ?? null,
    currentQuotaId,
    walletAddress: fullAddress ?? null,
  });
  const { getEnsNameForVault } = useEnsRecords();
  const ensName = summary?.vaultAddress
    ? getEnsNameForVault(summary.vaultAddress) ?? "--"
    : "--";
  const ensUrl =
    ensName !== "--" ? `https://app.ens.domains/name/${ensName}` : null;
  const currentInstallment = hasJoined ? Number(paidInstallments) : 0;
  const hasRemainingInstallments =
    hasJoined &&
    totalInstallments > 0 &&
    currentInstallment < totalInstallments;
  const statusLabel =
    isWinner && !hasRemainingInstallments
      ? "Winner"
      : hasJoined && canShowJoined
        ? "Joined"
        : baseStatusLabel;
  const members = participants.map((participant) => formatAddress(participant));
  const potLabel = potShare !== null ? formatUsd(potShare) : "--";

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

  const joinHref = `/circle/${summary.vaultAddress}/join`;

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
            isWalletConnected={isConnected}
            selectedEntry={selectedEntry}
            joinHref={joinHref}
            statusLabel={statusLabel}
            hasJoined={hasJoined}
            paidInstallments={currentInstallment}
          />
          <EntryStatusCard
            isWalletConnected={isConnected}
            selectedEntry={selectedEntry}
            hoveredEntry={hoveredEntry}
            onSelectEntry={setSelectedEntry}
            onHoverEntry={setHoveredEntry}
            lockedEntryId={lockedEntryId}
            entryCounts={entryCounts}
            entryDescriptions={entryDescriptions}
          />
          <TimelineCard startDate={startDateLabel} endDate={endDateLabel} />
          <PayoutCard
            isWalletConnected={isConnected}
            hasJoined={false}
            currentRound={0}
            totalRounds={0}
            windowDates={windowDates}
            selectedEntry={selectedEntry}
            hoveredEntry={hoveredEntry}
            onSelectEntry={setSelectedEntry}
            onHoverEntry={setHoveredEntry}
            entryCounts={entryCounts}
          />
          {isWinner && (
            <RedeemCard
              isWalletConnected={isConnected}
              isWinner={isWinner}
              drawCompleted={drawCompleted}
              windowSettled={windowSettled}
              potLabel={potLabel}
              isSubmitting={isRedeeming}
              error={redeemError}
              onRedeem={handleRedeem}
            />
          )}
          <EnsCard ensName={ensName} ensUrl={ensUrl} />
          <MembersCard members={members} />
        </div>

        <div
          className="hidden md:grid lg:hidden gap-4"
          style={{
            gridTemplateColumns: "1fr 1fr",
            gridTemplateRows: "auto auto auto auto auto auto",
            gridTemplateAreas: `
            "slots slots"
            "payment payment"
            "entry entry"
            "timeline ens"
            "payout members"
            "arc arc"
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
              isWalletConnected={isConnected}
              selectedEntry={selectedEntry}
              joinHref={joinHref}
              statusLabel={statusLabel}
            hasJoined={hasJoined}
            paidInstallments={currentInstallment}
            />
          </div>
          <div style={{ gridArea: "entry" }}>
            <EntryStatusCard
              isWalletConnected={isConnected}
              selectedEntry={selectedEntry}
              hoveredEntry={hoveredEntry}
              onSelectEntry={setSelectedEntry}
              onHoverEntry={setHoveredEntry}
              lockedEntryId={lockedEntryId}
              entryCounts={entryCounts}
              entryDescriptions={entryDescriptions}
            />
          </div>
          <div style={{ gridArea: "timeline" }}>
            <TimelineCard startDate={startDateLabel} endDate={endDateLabel} />
          </div>
          <div style={{ gridArea: "ens" }}>
            <EnsCard ensName={ensName} ensUrl={ensUrl} />
          </div>
          <div style={{ gridArea: "payout" }} className="flex flex-col gap-4">
            <PayoutCard
              isWalletConnected={isConnected}
              hasJoined={false}
              currentRound={0}
              totalRounds={0}
              windowDates={windowDates}
              selectedEntry={selectedEntry}
              hoveredEntry={hoveredEntry}
              onSelectEntry={setSelectedEntry}
              onHoverEntry={setHoveredEntry}
              entryCounts={entryCounts}
            />
            {isWinner && (
              <RedeemCard
                isWalletConnected={isConnected}
                isWinner={isWinner}
                drawCompleted={drawCompleted}
                windowSettled={windowSettled}
                potLabel={potLabel}
                isSubmitting={isRedeeming}
                error={redeemError}
                onRedeem={handleRedeem}
              />
            )}
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
            gridTemplateColumns: "1fr 1.5fr 1fr",
            gridTemplateRows: "auto",
            alignContent: "start",
            alignItems: "start",
          }}
        >
          <div className={`flex flex-col ${GRID_GAP}`}>
            <TimelineCard startDate={startDateLabel} endDate={endDateLabel} />
            <PayoutCard
              isWalletConnected={isConnected}
              hasJoined={false}
              currentRound={0}
              totalRounds={0}
              windowDates={windowDates}
              selectedEntry={selectedEntry}
              hoveredEntry={hoveredEntry}
              onSelectEntry={setSelectedEntry}
              onHoverEntry={setHoveredEntry}
              entryCounts={entryCounts}
            />
            {isWinner && (
              <RedeemCard
                isWalletConnected={isConnected}
                isWinner={isWinner}
                drawCompleted={drawCompleted}
                windowSettled={windowSettled}
                potLabel={potLabel}
                isSubmitting={isRedeeming}
                error={redeemError}
                onRedeem={handleRedeem}
              />
            )}
          </div>

          <div className={`flex flex-col ${GRID_GAP}`}>
            <PaymentVisualizationCard
              monthlyAmountLabel={installmentAmountLabel}
              totalMonths={totalInstallments}
              currentMonth={currentInstallment}
              isWalletConnected={isConnected}
              selectedEntry={selectedEntry}
              joinHref={joinHref}
              statusLabel={statusLabel}
            hasJoined={hasJoined}
            paidInstallments={currentInstallment}
            />
            <EntryStatusCard
              isWalletConnected={isConnected}
              selectedEntry={selectedEntry}
              hoveredEntry={hoveredEntry}
              onSelectEntry={setSelectedEntry}
              onHoverEntry={setHoveredEntry}
              lockedEntryId={lockedEntryId}
              entryCounts={entryCounts}
              entryDescriptions={entryDescriptions}
            />
          </div>

          <div className={`flex flex-col ${GRID_GAP}`}>
            <SlotsCard statusLabel={statusLabel} slotsLeftLabel={slotsLeftLabel} />
            <MembersCard members={members} />
            <EnsCard ensName={ensName} ensUrl={ensUrl} />
            <ArcCard arcscanUrl={arcscanUrl} />
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
