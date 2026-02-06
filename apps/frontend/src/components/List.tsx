"use client";

import { useEffect, useMemo, useState } from "react";
import { createPublicClient, http, type Address } from "viem";
import { arcTestnet } from "../lib/config";
import { env } from "../lib/env";
import { Card } from "./Card";
import {
  Factory,
  Vault,
  type VaultSummary,
  getContractAddresses,
} from "../lib/contracts";

const FALLBACK_FACTORY_FROM_BLOCK = 25454829n;

export function List() {
  const [loading, setLoading] = useState(true);
  const [circles, setCircles] = useState<VaultSummary[]>([]);
  const [error, setError] = useState<string | null>(null);

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
          setCircles(summaries);
        }

        unsubscribe = factory.watchCircleCreated(async ({ vault }) => {
          const vaultClient = new Vault(client, vault);
          const summary = await vaultClient.getSummary();
          setCircles((prev) =>
            prev.some((item) => item.vaultAddress === vault)
              ? prev
              : [...prev, summary]
          );
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10 text-muted-foreground">
        Loading circles...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
        {error}
      </div>
    );
  }

  if (!circles.length) {
    return (
      <div className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
        No circles found yet.
      </div>
    );
  }

  const containerClass =
    circles.length === 1
      ? "flex w-full justify-center"
      : "grid gap-4 sm:grid-cols-2 lg:grid-cols-3";

  return (
    <div className={containerClass}>
      {circles.map((circle) => (
        <Card key={circle.vaultAddress} circle={circle} />
      ))}
    </div>
  );
}
