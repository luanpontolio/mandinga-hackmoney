import "../styles/globals.css";

export const metadata = {
  title: "Mandinga Saving Circles",
  description: "Collective savings circles with NFT + ERC20 positions.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <header>
          <h1>Mandinga</h1>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
