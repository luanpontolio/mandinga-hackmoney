import { readFileSync } from "node:fs";
import path from "node:path";
import { encodeAbiParameters, Hex, hexToBytes, keccak256 } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { JsonRecords, ZoneData } from "../domain/records.js";
import { decodeCallData, resolveRecord } from "../domain/resolver.js";

type GatewayConfig = {
  signer: ReturnType<typeof privateKeyToAccount>;
  ttlSeconds: number;
  records: JsonRecords;
};

let cachedConfig: GatewayConfig | null = null;

export async function handleGatewayRequest({
  data,
}: {
  sender: string;
  data: string;
}) {
  if (!data || !data.startsWith("0x")) {
    throw new Error("Missing or invalid data");
  }

  const config = getConfig();
  const { name, resolverCallData } = decodeCallData(data as Hex);
  const result = resolveRecord(config.records, name, resolverCallData);
  const expires = Math.floor(Date.now() / 1000) + config.ttlSeconds;

  const digest = keccak256(
    encodeAbiParameters(
      [{ type: "bytes" }, { type: "uint64" }, { type: "bytes" }],
      [result, BigInt(expires), data as Hex]
    )
  );

  const signature = await config.signer.signMessage({
    message: { raw: hexToBytes(digest) },
  });

  const response = encodeAbiParameters(
    [{ type: "bytes" }, { type: "uint64" }, { type: "bytes" }],
    [result, BigInt(expires), signature as Hex]
  );

  return response;
}

function getConfig(): GatewayConfig {
  if (cachedConfig) return cachedConfig;

  const privateKey = process.env.GATEWAY_SIGNER_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("GATEWAY_SIGNER_PRIVATE_KEY not set");
  }

  const ttlSeconds = Number(process.env.GATEWAY_TTL_SECONDS ?? 300);
  if (!Number.isFinite(ttlSeconds) || ttlSeconds <= 0) {
    throw new Error("GATEWAY_TTL_SECONDS must be a positive number");
  }

  const recordsPath =
    process.env.GATEWAY_RECORDS_PATH ?? "./records.json";
  const resolvedPath = path.resolve(process.cwd(), recordsPath);
  const recordsData = JSON.parse(
    readFileSync(resolvedPath, { encoding: "utf8" })
  ) as ZoneData;

  cachedConfig = {
    signer: privateKeyToAccount(privateKey as Hex),
    ttlSeconds,
    records: new JsonRecords(recordsData),
  };

  return cachedConfig;
}
