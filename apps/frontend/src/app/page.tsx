import { Header } from "./components/Header";
import { List } from "../components/List";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header amountLabel="" title="Mandinga Circles" />
      <main className="flex-1 flex flex-col mx-auto max-w-[1280px] w-full px-6 md:px-10 pb-12 pt-4 box-border">
        <List />
      </main>
    </div>
  );
}
