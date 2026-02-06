"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ConnectButton } from "../../components/ConnectButton";

type HeaderProps = {
  amountLabel: string;
  title: string;
};

export function Header({ amountLabel, title }: HeaderProps) {
  return (
    <header
      className="mx-auto w-full max-w-[1280px] px-6 md:px-10"
      style={{
        paddingTop: "clamp(32px, 6vh, 64px)",
        paddingBottom: "clamp(24px, 4vh, 48px)",
      }}
    >
      <div
        className="grid items-center lg:hidden"
        style={{ gridTemplateColumns: "1fr auto 1fr" }}
      >
        <div className="justify-self-start">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[#1A1A1A] font-medium transition-opacity hover:opacity-70"
          >
            <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
            <span className="text-sm md:text-base whitespace-nowrap">Back</span>
          </Link>
        </div>

        <div className="justify-self-center text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-[#1A1A1A]">
            {amountLabel}
          </h1>
          <p className="text-sm md:text-base text-[#1A1A1A]">{title}</p>
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

        <div className="justify-self-center text-center flex flex-col items-center gap-1 whitespace-nowrap">
          <h1 className="text-5xl font-bold text-[#1A1A1A]">{amountLabel}</h1>
          <p className="text-lg text-[#1A1A1A]">{title}</p>
        </div>

        <div className="justify-self-end">
          <ConnectButton />
        </div>
      </div>
    </header>
  );
}
