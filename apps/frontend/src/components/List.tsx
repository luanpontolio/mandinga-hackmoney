"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { createPublicClient, http, type Address } from "viem";
import { arcTestnet } from "../lib/config";
import { env } from "../lib/env";
import { Card } from "./Card";
import { Select } from "./ui/Select";
import {
  Factory,
  Vault,
  type VaultSummary,
  getContractAddresses,
} from "../lib/contracts";

const FALLBACK_FACTORY_FROM_BLOCK = 25454829n;

type StatusLabel = "Active" | "Upcoming" | "Ended";
type StatusFilter = "all" | "active" | "upcoming" | "ended";

const getStatusLabel = (startTime: string, closeWindowLate: string): StatusLabel => {
  const startDate = new Date(startTime);
  const endDate = new Date(closeWindowLate);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return "Active";
  }
  const now = Date.now();
  if (now < startDate.getTime()) return "Upcoming";
  if (now > endDate.getTime()) return "Ended";
  return "Active";
};

export function List() {
  const [loading, setLoading] = useState(true);
  const [circles, setCircles] = useState<VaultSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const client = useMemo(
    () =>
      createPublicClient({
        chain: arcTestnet,
        transport: http(env.rpcUrl),
      }),
    []
  );

  const factoryFromBlock = useMemo(() => {
    if (!env.factoryFromBlock) return FALLBACK_FACTORY_FROM_BLOCK;
    try {
      return BigInt(env.factoryFromBlock);
    } catch {
      return FALLBACK_FACTORY_FROM_BLOCK;
    }
  }, []);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const { factoryAddress } = getContractAddresses();
        console.log("factoryAddress", factoryAddress);
        if (!factoryAddress) {
          throw new Error("Factory address is not configured.");
        }
        const factory = new Factory(client, factoryAddress as Address);
        const vaultAddresses = await factory.listCircles(factoryFromBlock);

        const summaries = await Promise.all(
          vaultAddresses.map(async (vaultAddress) => {
            const vault = new Vault(client, vaultAddress);
            return vault.getSummary();
          })
        );

        if (!cancelled) {
          // Sort summaries with the latest first.
          setCircles(
            summaries.sort(
              (a, b) =>
                new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
            )
          );
        }

        unsubscribe = factory.watchCircleCreated(async ({ vault }) => {
          const vaultClient = new Vault(client, vault);
          const summary = await vaultClient.getSummary();

          setCircles((prev) => {
            const alreadyExists = prev.some(
              (item) => item.vaultAddress === vault
            );
            if (alreadyExists) {
              return [...prev].sort(
                (a, b) =>
                  new Date(b.startTime).getTime() -
                  new Date(a.startTime).getTime()
              );
            }
            return [...prev, summary].sort(
              (a, b) =>
                new Date(b.startTime).getTime() -
                new Date(a.startTime).getTime()
            );
          });
        });
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load circles."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
      if (unsubscribe) unsubscribe();
    };
  }, [client, factoryFromBlock]);

  const derivedCircles = useMemo(
    () =>
      circles.map((circle) => {
        const slots = {
          early: Math.max(0, Number(circle.quotaCapEarly)),
          middle: Math.max(0, Number(circle.quotaCapMiddle)),
          late: Math.max(0, Number(circle.quotaCapLate)),
        };
        const slotsLeft = Math.max(
          Number(circle.numUsers) - Number(circle.activeParticipantCount),
          0
        );
        const statusLabel = getStatusLabel(
          circle.startTime,
          circle.closeWindowLate
        );
        return { circle, slots, slotsLeft, statusLabel };
      }),
    [circles]
  );

  const filteredCircles = useMemo(() => {
    if (statusFilter === "all") return derivedCircles;
    return derivedCircles.filter(
      (item) => item.statusLabel.toLowerCase() === statusFilter
    );
  }, [derivedCircles, statusFilter]);

  let content: ReactNode;

  if (loading) {
    content = (
      <div className="flex items-center justify-center py-10 text-muted-foreground">
        Loading circles...
      </div>
    );
  } else if (error) {
    content = (
      <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
        {error}
      </div>
    );
  } else if (!filteredCircles.length) {
    content = (
      <div className="text-center py-20">
        <p className="text-sm text-muted-foreground">No circles match your filters.</p>
      </div>
    );
  } else {
    content = (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCircles.map(({ circle, slots, slotsLeft, statusLabel }) => (
          <div key={circle.vaultAddress} className="mx-auto w-full max-w-[360px]">
            <Card
              circle={circle}
              slots={slots}
              slotsLeft={slotsLeft}
              statusLabel={statusLabel}
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-2">
          <label className="text-xs font-bold text-muted-foreground">Status:</label>
          <Select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}>
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="upcoming">Upcoming</option>
            <option value="ended">Ended</option>
          </Select>
        </div>
      </div>

      {content}
    </div>
  );
}
