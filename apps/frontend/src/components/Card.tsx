"use client";

import Link from "next/link";
import type { VaultSummary } from "../lib/contracts";
import { formatExitFee, formatUsd } from "../utils";

type CardProps = {
  circle: VaultSummary;
};

export function Card({ circle }: CardProps) {
  return (
    <div className="w-full max-w-sm rounded-lg border border-border bg-card p-6 shadow-sm">
      <h3 className="mb-3 text-xl font-semibold text-foreground">
        {circle.circleName}
      </h3>

      <div className="flex items-baseline text-foreground">
        <span className="text-4xl font-extrabold tracking-tight">
          {formatUsd(circle.targetValue)}
        </span>
      </div>

      <ul className="my-6 space-y-3 text-sm text-muted-foreground">
        <li className="flex items-center">
          <span className="font-medium text-foreground">Number of Rounds:</span>
          <span className="ml-2">{circle.numberOfRounds.toString()}</span>
        </li>
        <li className="flex items-center">
          <span className="font-medium text-foreground">Number of Users:</span>
          <span className="ml-2">{circle.numUsers.toString()}</span>
        </li>
        <li className="flex items-center">
          <span className="font-medium text-foreground">Exit Fee Bps:</span>
          <span className="ml-2">{formatExitFee(circle.exitFeeBps)}%</span>
        </li>
      </ul>

      <Link
        href={`/circle/${circle.vaultAddress}`}
        className="inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
      >
        View circle
      </Link>
    </div>
  );
}
