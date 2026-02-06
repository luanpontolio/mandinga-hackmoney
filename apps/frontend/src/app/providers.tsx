"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ParaProvider } from "@getpara/react-sdk";
import "@getpara/react-sdk/styles.css";
import { UserProvider } from "../contexts/UserContext";
import { arcTestnet } from "../lib/config";

const queryClient = new QueryClient();

type ProvidersProps = {
  children: React.ReactNode;
  /** Passed from server layout so env is available in browser */
  paraApiKey: string;
  paraAppName: string;
  /** Optional WalletConnect project ID (https://cloud.reown.com) */
  walletConnectProjectId?: string;
};

export function Providers({
  children,
  paraApiKey,
  paraAppName,
  walletConnectProjectId = "",
}: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ParaProvider
        paraClientConfig={{ apiKey: paraApiKey }}
        config={{ appName: paraAppName }}
        externalWalletConfig={{
          wallets: ["METAMASK","WALLETCONNECT","COINBASE"],
          evmConnector: {
            config: {
              chains: [arcTestnet],
              ssr: true,
            },
          },
          walletConnect: {
            projectId: walletConnectProjectId,
          },
        }}
        paraModalConfig={{
          authLayout: ["AUTH:FULL", "EXTERNAL:FULL"],
        }}
      >
        <UserProvider>{children}</UserProvider>
      </ParaProvider>
    </QueryClientProvider>
  );
}
