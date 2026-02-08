import { useEffect, useMemo, useState } from "react";
import {
  createPublicClient,
  decodeFunctionResult,
  encodeFunctionData,
  getAddress,
  http,
  namehash,
  toCoinType,
  toHex,
  type Address,
  type Hex,
} from "viem";
import { packetToBytes } from "viem/ens";
import { arcTestnet } from "../../lib/config";
import { env } from "../../lib/env";
import { buildEnsName } from "../../utils/ens";

const MANDINGA_RESOLVER = "0x1C7148F84A53549540f15eF5AE808c754dcC5Fa7" as const;

const resolverAbi = [
  {
    type: "function",
    name: "resolve",
    stateMutability: "view",
    inputs: [{ type: "bytes" }, { type: "bytes" }],
    outputs: [{ type: "bytes" }],
  },
] as const;

const addrResolverAbi = [
  {
    type: "function",
    name: "addr",
    stateMutability: "view",
    inputs: [{ type: "bytes32" }, { type: "uint256" }],
    outputs: [{ type: "bytes" }],
  },
] as const;

type UseMandingaEnsNameProps = {
  vaultAddress: Address | null;
  circleName: string | null;
};

type UseMandingaEnsNameResult = {
  ensName: string;
  ensUrl: string | null;
  isResolving: boolean;
  isVerified: boolean;
};

const getGatewayUrl = (urls?: readonly string[]) => {
  if (env.ensResolverUrl) return env.ensResolverUrl;
  if (urls && urls.length > 0) return urls[0];
  return "";
};

export function useMandingaEnsName({
  vaultAddress,
  circleName,
}: UseMandingaEnsNameProps): UseMandingaEnsNameResult {
  const [isResolving, setIsResolving] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [resolvedName, setResolvedName] = useState<string | null>(null);

  const ensDomain = env.ensDomain || "mandinga.eth";
  const candidateName = useMemo(() => {
    if (!circleName) return null;
    return buildEnsName(circleName, ensDomain);
  }, [circleName, ensDomain]);

  const publicClient = useMemo(
    () =>
      createPublicClient({
        chain: arcTestnet,
        transport: http(env.rpcUrl),
        ccipRead: {
          request: async ({ data, sender, urls }) => {
            const gatewayUrl = getGatewayUrl(urls);
            if (!gatewayUrl) {
              throw new Error("ENS resolver gateway URL not configured.");
            }
            const response = await fetch(gatewayUrl, {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ sender, data }),
            });
            const payload = (await response.json()) as { data?: Hex; error?: string };
            if (!response.ok) {
              throw new Error(payload.error || "ENS resolver request failed.");
            }
            if (!payload.data) {
              throw new Error("ENS resolver returned an empty response.");
            }
            return payload.data;
          },
        },
      }),
    []
  );

  useEffect(() => {
    let cancelled = false;

    const resolveEns = async () => {
      if (!vaultAddress || !candidateName) {
        setResolvedName(null);
        setIsVerified(false);
        return;
      }
      setIsResolving(true);
      try {
        const encodedName = toHex(packetToBytes(candidateName));
        const resolverCallData = encodeFunctionData({
          abi: addrResolverAbi,
          functionName: "addr",
          args: [namehash(candidateName), toCoinType(arcTestnet.id)],
        });
        const result = (await publicClient.readContract({
          address: MANDINGA_RESOLVER,
          abi: resolverAbi,
          functionName: "resolve",
          args: [encodedName, resolverCallData],
        })) as Hex;
        const addrBytes = decodeFunctionResult({
          abi: addrResolverAbi,
          functionName: "addr",
          data: result,
        }) as Hex;
        const resolved =
          addrBytes && addrBytes.length === 42
            ? getAddress(addrBytes as Address)
            : null;
        if (!cancelled) {
          const matches =
            Boolean(resolved) &&
            resolved?.toLowerCase() === vaultAddress.toLowerCase();
          setResolvedName(matches ? candidateName : null);
          setIsVerified(matches);
        }
      } catch {
        if (!cancelled) {
          setResolvedName(null);
          setIsVerified(false);
        }
      } finally {
        if (!cancelled) {
          setIsResolving(false);
        }
      }
    };

    void resolveEns();
    return () => {
      cancelled = true;
    };
  }, [publicClient, vaultAddress, candidateName]);

  const ensName = resolvedName ?? candidateName ?? "--";
  const ensUrl = ensName !== "--" ? `https://app.ens.domains/name/${ensName}` : null;

  return { ensName, ensUrl, isResolving, isVerified };
}
