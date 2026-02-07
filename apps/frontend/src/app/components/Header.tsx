"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ConnectButton } from "../../components/ConnectButton";
import { useEffect, useState } from "react";

type HeaderProps = {
  amountLabel: string;
  title: string;
};

export function Header({ amountLabel, title }: HeaderProps) {
  const [showBack, setShowBack] = useState(false);

  useEffect(() => {
    if (window.location.pathname !== "/") {
      setShowBack(true);
    }
  }, [window.location.pathname]);


  return (
    <header className="mx-auto w-full max-w-[1280px] px-6 md:px-10 pt-6 pb-6">
      <div
        className="grid items-center lg:hidden"
        style={{ gridTemplateColumns: "1fr auto 1fr" }}
      >
        <div className="justify-self-start">
          {showBack && (
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-[#1A1A1A] font-medium transition-opacity hover:opacity-70"
            >
              <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
              <span className="text-sm md:text-base whitespace-nowrap">Back</span>
            </Link>
          )}
        </div>

        <div className="justify-self-center text-center">
          <h1 className="text-lg font-semibold text-[#1A1A1A] whitespace-nowrap">
            {amountLabel} {title}
          </h1>
        </div>

        <div className="justify-self-end">
          <ConnectButton />
        </div>
      </div>

      <div
        className="hidden lg:grid items-center min-h-[72px]"
        style={{ gridTemplateColumns: "1fr auto 1fr" }}
      >
        <div className="justify-self-start">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[#1A1A1A] font-medium transition-opacity hover:opacity-70 whitespace-nowrap"
          >
            <ArrowLeft className="h-5 w-5 shrink-0" />
            <span>Back</span>
          </Link>
        </div>

        <div className="justify-self-center text-center whitespace-nowrap">
          <h1 className="text-lg font-semibold text-[#1A1A1A]">
            {amountLabel} {title}
          </h1>
        </div>

        <div className="justify-self-end">
          <ConnectButton />
        </div>
      </div>
    </header>
  );
}
