"use client";

type RedeemCardProps = {
  isWalletConnected: boolean;
  isWinner: boolean;
  drawCompleted: boolean;
  windowSettled: boolean;
  potLabel: string;
  isSubmitting: boolean;
  error: string | null;
  onRedeem: () => void;
};

export function RedeemCard({
  isWalletConnected,
  isWinner,
  drawCompleted,
  windowSettled,
  potLabel,
  isSubmitting,
  error,
  onRedeem,
}: RedeemCardProps) {
  const canRedeem =
    isWalletConnected && isWinner && drawCompleted && !windowSettled;

  console.log("isWinner", isWinner);
  console.log("drawCompleted", drawCompleted);
  console.log("windowSettled", windowSettled);
  let statusText = "Draw pending.";
  if (windowSettled) {
    statusText = "Round settled.";
  } else if (drawCompleted && isWinner) {
    statusText = "You are the winner.";
  } else if (drawCompleted) {
    statusText = "Not selected.";
  }

  return (
    <div className="rounded-xl border border-[#E5E5E5] bg-white px-5 py-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-[#1A1A1A]">Redeem</span>
        <span className="text-sm text-[#666666]">{potLabel}</span>
      </div>
      <p className="text-sm text-[#666666]">{statusText}</p>
      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}
      <button
        type="button"
        onClick={onRedeem}
        disabled={!canRedeem || isSubmitting}
        className={`w-full rounded-full px-6 py-3 text-sm font-semibold ${
          !canRedeem || isSubmitting
            ? "bg-[#E5E5E5] text-[#999999] cursor-not-allowed"
            : "bg-[#1A1A1A] text-white hover:bg-[#333333]"
        }`}
      >
        {isSubmitting ? "Processing..." : "Redeem"}
      </button>
    </div>
  );
}
