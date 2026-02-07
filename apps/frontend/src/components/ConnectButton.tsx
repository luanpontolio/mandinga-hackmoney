"use client";

import { useUser } from "../contexts/UserContext";

export function ConnectButton() {
  const { isConnected, address, connect, disconnect } = useUser();

  if (isConnected) {
    return (
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => void disconnect()}
          className="rounded-full border border-[#E5E5E5] px-3 py-1.5 text-xs font-medium text-[#1A1A1A] hover:bg-[#F5F5F5] md:px-4 md:py-2 md:text-sm"
        >
          {address}
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={connect}
      className="rounded-full border border-[#E5E5E5] px-4 py-1.5 text-sm font-medium text-[#1A1A1A] hover:bg-[#F5F5F5] bg-transparent md:px-6 md:py-2"
    >
      Connect wallet
    </button>
  );
}
