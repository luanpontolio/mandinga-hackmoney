import type { Address, Hash, PublicClient } from "viem";
import { env } from "./env";

export type ContractAddresses = {
  factoryAddress: string;
};

export const getContractAddresses = (): ContractAddresses => ({
  factoryAddress: env.factoryAddress,
});

export const factoryAbi = [
  {
    type: "event",
    name: "CircleCreated",
    inputs: [
      { name: "vault", type: "address", indexed: true },
      { name: "creator", type: "address", indexed: true },
      { name: "circleId", type: "bytes32", indexed: true },
      { name: "name", type: "string", indexed: false },
    ],
  },
  {
    type: "function",
    name: "getCirclesCount",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
] as const;

export const vaultAbi = [
  {
    type: "function",
    name: "circleName",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "string" }],
  },
  {
    type: "function",
    name: "targetValue",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "shareToken",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "address" }],
  },
  {
    type: "function",
    name: "numberOfRounds",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "numUsers",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "totalInstallments",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "installmentAmount",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "startTime",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "closeWindowEarly",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "closeWindowMiddle",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "timePerRound",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "closeWindowLate",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "getCloseWindowTimestamp",
    stateMutability: "view",
    inputs: [{ type: "uint256" }],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "windowSnapshotted",
    stateMutability: "view",
    inputs: [{ type: "uint256" }],
    outputs: [{ type: "bool" }],
  },
  {
    type: "function",
    name: "windowSettled",
    stateMutability: "view",
    inputs: [{ type: "uint256" }],
    outputs: [{ type: "bool" }],
  },
  {
    type: "function",
    name: "drawCompleted",
    stateMutability: "view",
    inputs: [{ type: "uint256" }],
    outputs: [{ type: "bool" }],
  },
  {
    type: "function",
    name: "windowSnapshotBalance",
    stateMutability: "view",
    inputs: [{ type: "uint256" }, { type: "address" }],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "getDrawOrder",
    stateMutability: "view",
    inputs: [{ type: "uint256" }],
    outputs: [{ type: "address[]" }],
  },
  {
    type: "function",
    name: "getWindowPotShare",
    stateMutability: "view",
    inputs: [{ type: "uint256" }],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "activeParticipantCount",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "quotaCapEarly",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "quotaCapMiddle",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "quotaCapLate",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  // add snapshotBalance
  {
    type: "function",
    name: "snapshotBalance",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "exitFeeBps",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint16" }],
  },
  {
    type: "function",
    name: "positionNft",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "address" }],
  },
  {
    type: "function",
    name: "participantToTokenId",
    stateMutability: "view",
    inputs: [{ type: "address" }],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "isEnrolled",
    stateMutability: "view",
    inputs: [{ type: "address" }],
    outputs: [{ type: "bool" }],
  },
  {
    type: "function",
    name: "participants",
    stateMutability: "view",
    inputs: [{ type: "uint256" }],
    outputs: [{ type: "address" }],
  },
  {
    type: "function",
    name: "deposit",
    stateMutability: "payable",
    inputs: [{ type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "payInstallment",
    stateMutability: "payable",
    inputs: [],
    outputs: [],
  },
  {
    type: "function",
    name: "redeem",
    stateMutability: "nonpayable",
    inputs: [{ type: "uint256" }],
    outputs: [],
  },
] as const;

export const positionNftAbi = [
  {
    type: "function",
    name: "getPosition",
    stateMutability: "view",
    inputs: [{ type: "uint256" }],
    outputs: [
      {
        type: "tuple",
        components: [
          { name: "quotaId", type: "uint256" },
          { name: "targetValue", type: "uint256" },
          { name: "totalInstallments", type: "uint256" },
          { name: "paidInstallments", type: "uint256" },
          { name: "totalPaid", type: "uint256" },
          { name: "status", type: "uint8" },
        ],
      },
    ],
  },
] as const;

export type VaultSummary = {
  vaultAddress: Address;
  circleName: string;
  targetValue: bigint;
  numberOfRounds: bigint;
  numUsers: bigint;
  totalInstallments: bigint;
  installmentAmount: bigint;
  exitFeeBps: number;
  startTime: string;
  closeWindowEarly: string;
  closeWindowMiddle: string;
  timePerRound: bigint;
  closeWindowLate: string;
  activeParticipantCount: bigint;
  quotaCapEarly: bigint;
  quotaCapMiddle: bigint;
  quotaCapLate: bigint;
  snapshotBalance: bigint;
};

type CircleCreatedPayload = {
  vault: Address;
  circleId: Hash;
  name: string;
};

type ArcscanLogResponse = {
  items?: Array<{
    block_number?: number;
    index?: number;
    decoded?: {
      method_call?: string;
      method_id?: string;
      parameters?: Array<{
        indexed?: boolean;
        name?: string;
        type?: string;
        value?: string;
      }>;
    };
  }>;
  next_page_params?: unknown;
};

const ARCSCAN_API_BASE = "https://testnet.arcscan.app/api/v2";

export class Vault {
  constructor(
    private readonly client: PublicClient,
    private readonly address: Address
  ) {}

  async getSummary(): Promise<VaultSummary> {
    const [
      circleName,
      targetValue,
      numberOfRounds,
      numUsers,
      totalInstallments,
      installmentAmount,
      startTime,
      closeWindowEarly,
      closeWindowMiddle,
      exitFeeBps,
      timePerRound,
      closeWindowLate,
      activeParticipantCount,
      quotaCapEarly,
      quotaCapMiddle,
      quotaCapLate,
      snapshotBalance,
    ] =
      await this.client.multicall({
        contracts: [
          {
            address: this.address,
            abi: vaultAbi,
            functionName: "circleName",
          },
          {
            address: this.address,
            abi: vaultAbi,
            functionName: "targetValue",
          },
          {
            address: this.address,
            abi: vaultAbi,
            functionName: "numberOfRounds",
          },
          {
            address: this.address,
            abi: vaultAbi,
            functionName: "numUsers",
          },
          {
            address: this.address,
            abi: vaultAbi,
            functionName: "totalInstallments",
          },
          {
            address: this.address,
            abi: vaultAbi,
            functionName: "installmentAmount",
          },
          {
            address: this.address,
            abi: vaultAbi,
            functionName: "startTime",
          },
          {
            address: this.address,
            abi: vaultAbi,
            functionName: "closeWindowEarly",
          },
          {
            address: this.address,
            abi: vaultAbi,
            functionName: "closeWindowMiddle",
          },
          { address: this.address, abi: vaultAbi, functionName: "exitFeeBps" },
          { address: this.address, abi: vaultAbi, functionName: "timePerRound" },
          {
            address: this.address,
            abi: vaultAbi,
            functionName: "closeWindowLate",
          },
          { address: this.address, abi: vaultAbi, functionName: "activeParticipantCount" },
          { address: this.address, abi: vaultAbi, functionName: "quotaCapEarly" },
          { address: this.address, abi: vaultAbi, functionName: "quotaCapMiddle" },
          { address: this.address, abi: vaultAbi, functionName: "quotaCapLate" },
          { address: this.address, abi: vaultAbi, functionName: "snapshotBalance" },
        ],
        allowFailure: false,
      });

    return {
      vaultAddress: this.address,
      circleName,
      targetValue,
      numberOfRounds,
      numUsers,
      totalInstallments,
      installmentAmount,
      exitFeeBps: Number(exitFeeBps),
      startTime: new Date(Number(startTime) * 1000).toISOString(),
      closeWindowEarly: new Date(Number(closeWindowEarly) * 1000).toISOString(),
      closeWindowMiddle: new Date(Number(closeWindowMiddle) * 1000).toISOString(),
      timePerRound,
      closeWindowLate: new Date(Number(closeWindowLate) * 1000).toISOString(),
      activeParticipantCount,
      quotaCapEarly,
      quotaCapMiddle,
      quotaCapLate,
      snapshotBalance,
    };
  }
}

export class Factory {
  constructor(
    private readonly client: PublicClient,
    private readonly address: Address
  ) {}

  async listCircles(fromBlock: bigint): Promise<Address[]> {
    const response = await fetch(
      `${ARCSCAN_API_BASE}/addresses/${this.address}/logs`,
      { headers: { accept: "application/json" } }
    );
    if (!response.ok) {
      throw new Error("Failed to load circle logs from Arcscan.");
    }
    const data = (await response.json()) as ArcscanLogResponse;
    const items = Array.isArray(data.items) ? data.items : [];
    const fromBlockNumber = Number(fromBlock);

    const circleLogs = items.filter((item) => {
      const method = item.decoded?.method_call ?? "";
      const methodId = item.decoded?.method_id ?? "";
      const blockNumber = item.block_number ?? 0;
      return (
        blockNumber >= fromBlockNumber &&
        (method.startsWith("CircleCreated(") || methodId === "1d0f8797")
      );
    });

    circleLogs.sort((a, b) => {
      const blockDiff = (a.block_number ?? 0) - (b.block_number ?? 0);
      if (blockDiff !== 0) return blockDiff;
      return (a.index ?? 0) - (b.index ?? 0);
    });

    const seen = new Set<string>();
    const vaults: Address[] = [];
    for (const log of circleLogs) {
      const vaultParam = log.decoded?.parameters?.find(
        (param) => param.name === "vault"
      );
      const vault = vaultParam?.value as Address | undefined;
      if (vault && !seen.has(vault)) {
        seen.add(vault);
        vaults.push(vault);
      }
    }
    return vaults;
  }

  watchCircleCreated(onCircle: (payload: CircleCreatedPayload) => void) {
    return this.client.watchContractEvent({
      address: this.address,
      abi: factoryAbi,
      eventName: "CircleCreated",
      onLogs: (logs) => {
        for (const log of logs) {
          const vault = log.args?.vault as Address | undefined;
          const circleId = log.args?.circleId as Hash | undefined;
          const name = log.args?.name as string | undefined;
          if (!vault || !circleId || !name) continue;
          onCircle({ vault, circleId, name });
        }
      },
    });
  }
}
