import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { getAddress, toCoinType } from "viem";
import type { ZoneData } from "../domain/records.js";

type VaultRecordInput = {
  circleName: string;
  vaultAddress: string;
  description?: string;
  url?: string;
};

const DEFAULT_DESCRIPTION = "Mandinga circle resolver (update in records.json).";
const DEFAULT_URL = "https://mandinga.example";
const DEFAULT_DOMAIN = "mandinga.eth";
const DEFAULT_CHAIN_ID = 5042002;

const normalizeLabel = (value: string) => {
  const trimmed = value.trim().toLowerCase();
  const withoutDiacritics = trimmed
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  const cleaned = withoutDiacritics.replace(/[^a-z0-9\s-]/g, "");
  const withDashes = cleaned.replace(/\s+/g, "-").replace(/-+/g, "-");
  return withDashes.replace(/^-|-$/g, "");
};

const buildEnsName = (label: string, domain: string) => {
  const slug = normalizeLabel(label);
  if (!slug) return domain;
  return `${slug}.${domain}`;
};

const getRecordsPath = () => {
  const recordsPath = process.env.GATEWAY_RECORDS_PATH ?? "../../db/data.json";
  return path.resolve(process.cwd(), recordsPath);
};

const ensureRecordsFile = (recordsPath: string) => {
  const dir = path.dirname(recordsPath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  if (!existsSync(recordsPath)) {
    writeFileSync(recordsPath, JSON.stringify({}, null, 2));
  }
};

export const loadRecords = (): ZoneData => {
  const recordsPath = getRecordsPath();
  ensureRecordsFile(recordsPath);
  return JSON.parse(readFileSync(recordsPath, { encoding: "utf8" })) as ZoneData;
};

export const saveRecords = (records: ZoneData) => {
  const recordsPath = getRecordsPath();
  ensureRecordsFile(recordsPath);
  writeFileSync(recordsPath, JSON.stringify(records, null, 2));
};

export const upsertVaultRecord = (input: VaultRecordInput) => {
  const domain = process.env.GATEWAY_ENS_DOMAIN ?? DEFAULT_DOMAIN;
  const chainId = Number(process.env.GATEWAY_CHAIN_ID ?? DEFAULT_CHAIN_ID);
  const coinType = String(toCoinType(Number.isFinite(chainId) ? chainId : DEFAULT_CHAIN_ID));
  const ensName = buildEnsName(input.circleName, domain);
  const address = getAddress(input.vaultAddress);
  const description = input.description ?? DEFAULT_DESCRIPTION;
  const url = input.url ?? DEFAULT_URL;
  const records = loadRecords();

  records[ensName] = {
    addresses: {
      "60": address,
      [coinType]: address,
    },
    text: {
      description,
      url,
    },
  };

  saveRecords(records);
  return { ensName, recordsPath: getRecordsPath() };
};
