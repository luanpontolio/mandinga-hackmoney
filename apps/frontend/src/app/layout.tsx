import "../styles/globals.css";
import { Providers } from "./providers";
import { ConnectButton } from "../components/ConnectButton";

export const metadata = {
  title: "Mandinga Saving Circles",
  description: "Collective circles with NFT + ERC20 positions.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const paraApiKey = process.env.NEXT_PUBLIC_PARA_API_KEY ?? "";
  const paraAppName =
    process.env.NEXT_PUBLIC_APP_NAME ?? "Mandinga Saving Circles";
  const walletConnectProjectId =
    process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "";

  return (
    <html lang="en">
      <body>
        <Providers
          paraApiKey={paraApiKey}
          paraAppName={paraAppName}
          walletConnectProjectId={walletConnectProjectId}
        >
          <header className="flex justify-between items-center px-6 py-4 border-b border-border">
            <h1 className="m-0 text-xl font-semibold">Mandinga</h1>
            <ConnectButton />
          </header>
          <main className="p-6">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
