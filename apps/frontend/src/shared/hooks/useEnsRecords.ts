import { useEffect, useMemo, useState } from "react";
import { getAddress } from "viem";
import { env } from "../../lib/env";

type NameRecord = {
  addresses?: Record<string, string>;
  text?: Record<string, string>;
};

export type ZoneData = Record<string, NameRecord>;

type EnsRecordsState = {
  records: ZoneData;
  isLoading: boolean;
  error: string | null;
};

export const useEnsRecords = () => {
  const [state, setState] = useState<EnsRecordsState>({
    records: {},
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const response = await fetch("http://0.0.0.0:4000/records");
        console.log("response", await response.json());
        if (!response.ok) {
          throw new Error("Failed to load ENS records.");
        }
        const data = (await response.json()) as ZoneData;
        if (!cancelled) {
          setState({ records: data, isLoading: false, error: null });
        }
      } catch (err) {
        if (!cancelled) {
          setState({
            records: {},
            isLoading: false,
            error: err instanceof Error ? err.message : "Failed to load ENS records.",
          });
        }
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const recordsByAddress = useMemo(() => {
    const map = new Map<string, string>();
    for (const [ensName, record] of Object.entries(state.records)) {
      const addr = record.addresses?.["60"];
      if (addr) {
        try {
          map.set(getAddress(addr).toLowerCase(), ensName);
        } catch {
          // ignore invalid addresses in data
        }
      }
    }
    return map;
  }, [state.records]);

  const getEnsNameForVault = (vaultAddress?: string | null) => {
    if (!vaultAddress) return null;
    const key = vaultAddress.toLowerCase();
    return recordsByAddress.get(key) ?? null;
  };

  return {
    records: state.records,
    isLoading: state.isLoading,
    error: state.error,
    getEnsNameForVault,
  };
};
