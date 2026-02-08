import { ConnectButton } from "../components/ConnectButton";
import { List } from "../components/List";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="mx-auto w-full max-w-[1280px] px-6 md:px-10 pt-6 pb-6">
        <div className="grid items-center" style={{ gridTemplateColumns: "1fr auto" }}>
          <div>
            <h1 className="text-lg font-semibold text-foreground">Mandinga</h1>
            <p className="text-sm text-muted-foreground">Browse available circles</p>
          </div>
          <div className="justify-self-end">
            <ConnectButton />
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col mx-auto max-w-[1280px] w-full px-6 md:px-10 pb-12 pt-4 box-border">
        <List />
      </main>
    </div>
  );
}
