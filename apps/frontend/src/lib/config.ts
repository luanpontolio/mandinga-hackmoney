import { defineChain } from "viem";

// Re-export env for app usage
export { env } from "./env";

// Arc Testnet (defined locally to avoid viem/chains subpath resolution issues)
export const arcTestnet = defineChain({
  id: 5042002,
  name: "Arc Testnet",
  nativeCurrency: {
    name: "USDC",
    symbol: "USDC",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [
        "https://rpc.testnet.arc.network",
        "https://rpc.quicknode.testnet.arc.network",
        "https://rpc.blockdaemon.testnet.arc.network",
      ],
      webSocket: [
        "wss://rpc.testnet.arc.network",
        "wss://rpc.quicknode.testnet.arc.network",
      ],
    },
  },
  blockExplorers: {
    default: {
      name: "ArcScan",
      url: "https://testnet.arcscan.app",
      apiUrl: "https://testnet.arcscan.app/api",
    },
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 0,
    },
  },
  testnet: true,
});

// Para Wallet config (server-side only). In the browser, API key is passed
// from layout via <Providers paraApiKey={...} /> so env is available.
export const paraConfig = {
  apiKey: process.env.NEXT_PUBLIC_PARA_API_KEY ?? "",
  appName: process.env.NEXT_PUBLIC_APP_NAME ?? "Mandinga Saving Circles",
};