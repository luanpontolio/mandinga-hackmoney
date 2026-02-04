"use client";

import { useUser } from "../contexts/UserContext";

export function ConnectButton() {
  const { isConnected, address, connect, disconnect, balanceFormatted } =
    useUser();

  if (isConnected) {
    return (
      <div className="flex items-center gap-3">
        {balanceFormatted && (
          <span className="text-muted-foreground text-sm">
            {balanceFormatted}
          </span>
        )}
        <span className="font-mono text-sm">{address}</span>
        <button
          type="button"
          onClick={() => void disconnect()}
          className="rounded-md border border-border bg-secondary px-3 py-1.5 text-sm text-secondary-foreground hover:bg-accent"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={connect}
      className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:opacity-90"
    >
      Connect Wallet
    </button>
  );
}
