"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import {
  useModal,
  useAccount,
  useWallet,
  useWalletBalance,
  useLogout,
} from "@getpara/react-sdk";
import { arcTestnet } from "../lib/config";
import { useToast } from "./ToastContext";

type UserContextValue = {
  /** Open the Para modal (auth + external wallets) */
  connect: () => void;
  /** Disconnect wallet */
  disconnect: () => void;
  /** Ask wallet to add Arc Testnet */
  addArcChain: () => Promise<void>;
  /** Whether user has an active wallet session */
  isConnected: boolean;
  /** Short address (0x1234...5678) */
  address: string | null;
  /** Full wallet address */
  fullAddress: string | null;
  /** Whether the user has balance on the wallet */
  hasBalance: boolean;
  /** Balance as string for display */
  balanceFormatted: string | null;
  /** Arc Testnet chain for adding to wallet */
  arcChain: typeof arcTestnet;
};

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const { openModal } = useModal();
  const { isConnected } = useAccount();
  const { data: wallet } = useWallet();
  const { data: balanceData } = useWalletBalance();
  const { logoutAsync } = useLogout();
  const { showToast } = useToast();
  const previousConnectedRef = useRef<boolean>(false);

  useEffect(() => {
    if (isConnected && !previousConnectedRef.current) {
      showToast("Wallet Connected");
    }
    previousConnectedRef.current = Boolean(isConnected);
  }, [isConnected, showToast]);

  const connect = useCallback(() => {
    openModal();
  }, [openModal]);

  const disconnect = useCallback(async () => {
    await logoutAsync();
  }, [logoutAsync]);

  const addArcChain = useCallback(async () => {
    const ethereum =
      typeof window !== "undefined"
        ? (window as unknown as {
            ethereum?: {
              request: (args: {
                method: string;
                params?: unknown[];
              }) => Promise<unknown>;
            };
          }).ethereum
        : undefined;
    if (!ethereum?.request) {
      throw new Error("No wallet found to add chain");
    }
    await ethereum.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId: `0x${arcTestnet.id.toString(16)}`,
          chainName: arcTestnet.name,
          nativeCurrency: arcTestnet.nativeCurrency,
          rpcUrls: arcTestnet.rpcUrls.default.http,
          blockExplorerUrls: arcTestnet.blockExplorers?.default?.url
            ? [arcTestnet.blockExplorers.default.url]
            : [],
        },
      ],
    });
  }, []);

  const balanceObj =
    typeof balanceData === "object" && balanceData !== null
      ? (balanceData as { balance?: string | number; symbol?: string })
      : null;

  const hasBalance = useMemo(() => {
    if (!balanceObj?.balance) return false;
    const value = balanceObj.balance;
    if (typeof value === "string") return parseFloat(value) > 0;
    if (typeof value === "number") return value > 0;
    return false;
  }, [balanceObj?.balance]);

  const balanceFormatted = useMemo(() => {
    if (!balanceObj?.balance) return null;
    const value = balanceObj.balance;
    const num = typeof value === "string" ? parseFloat(value) : Number(value);
    const symbol = balanceObj.symbol ?? "ETH";
    return `${num} ${symbol}`;
  }, [balanceObj?.balance, balanceObj?.symbol]);

  const fullAddress = wallet?.address ?? null;
  const address = fullAddress
    ? `${fullAddress.slice(0, 6)}...${fullAddress.slice(-4)}`
    : null;

  const value = useMemo<UserContextValue>(
    () => ({
      connect,
      disconnect,
      addArcChain,
      isConnected: isConnected ?? false,
      address,
      fullAddress,
      hasBalance,
      balanceFormatted,
      arcChain: arcTestnet,
    }),
    [
      connect,
      disconnect,
      addArcChain,
      isConnected,
      address,
      fullAddress,
      hasBalance,
      balanceFormatted,
    ]
  );

  return (
    <UserContext.Provider value={value}>{children}</UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error("useUser must be used within UserProvider");
  }
  return ctx;
}
