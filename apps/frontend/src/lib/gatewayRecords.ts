import { toCoinType } from "viem";
import { arcTestnet } from "./config";
import { VAULTS, type VaultEntry } from "./vaults";
import { buildEnsName } from "../utils/ens";

export type NameRecord = {
  addresses?: Record<string, string>;
  text?: Record<string, string>;
};

export type ZoneData = Record<string, NameRecord>;

const DEFAULT_DESCRIPTION = "Mandinga circle resolver (update in records.json).";
const DEFAULT_URL = "https://mandinga.example";

const BASE_RECORDS: ZoneData = {
  "mandinga.eth": {
    addresses: {
      "60": "0xE6ED689c966CFc1C0a8A3D793839Dd03Fc3B32C0",
      "2152525650": "0xE6ED689c966CFc1C0a8A3D793839Dd03Fc3B32C0",
    },
    text: {
      description: DEFAULT_DESCRIPTION,
      url: DEFAULT_URL,
    },
  },
};

type BuildGatewayRecordsArgs = {
  domain?: string;
  vaults?: VaultEntry[];
  description?: string;
  url?: string;
  baseRecords?: ZoneData;
};

export const buildGatewayRecords = ({
  domain = "mandinga.eth",
  vaults = VAULTS,
  description = DEFAULT_DESCRIPTION,
  url = DEFAULT_URL,
  baseRecords = BASE_RECORDS,
}: BuildGatewayRecordsArgs = {}): ZoneData => {
  const records: ZoneData = { ...baseRecords };
  const coinType = String(toCoinType(arcTestnet.id));

  for (const vault of vaults) {
    const ensName = buildEnsName(vault.name, domain);
    const recordDescription = vault.description ?? description;
    const recordUrl = vault.url ?? url;
    records[ensName] = {
      addresses: {
        "60": vault.vaultAddress,
        [coinType]: vault.vaultAddress,
      },
      text: {
        description: recordDescription,
        url: recordUrl,
      },
    };
  }

  return records;
};
