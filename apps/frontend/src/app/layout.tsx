import "../styles/globals.css";
import { Patrick_Hand, Share_Tech_Mono } from "next/font/google";
import { Providers } from "./providers";
import { ConnectButton } from "../components/ConnectButton";

export const metadata = {
  title: "Mandinga Circles",
  description: "Collective circles with NFT + ERC20 positions.",
};

const patrickHand = Patrick_Hand({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-patrick-hand",
});
const shareTechMono = Share_Tech_Mono({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-share-tech-mono",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const paraApiKey = process.env.NEXT_PUBLIC_PARA_API_KEY ?? "";
  const paraAppName =
    process.env.NEXT_PUBLIC_APP_NAME ?? "Mandinga Circles";
  const walletConnectProjectId =
    process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "";

  return (
    <html
      lang="en"
      className={`${patrickHand.variable} ${shareTechMono.variable} bg-background`}
    >
      <body className="font-sans antialiased">
        <Providers
          paraApiKey={paraApiKey}
          paraAppName={paraAppName}
          walletConnectProjectId={walletConnectProjectId}
        >
          <main className="p-6">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
