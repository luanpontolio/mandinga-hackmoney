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

  console.debug("[gateway] handleGatewayRequest start", {
    dataLen: data.length,
    dataPrefix: data.slice(0, 10),
  });

  const config = getConfig();
  console.debug("[gateway] config loaded", {
    ttlSeconds: config.ttlSeconds,
  });

  const { name, resolverCallData } = decodeCallData(data as Hex);
  console.debug("[gateway] decoded call data", {
    name,
    resolverSelector: resolverCallData.slice(0, 10),
    resolverDataLen: resolverCallData.length,
  });

  const result = resolveRecord(config.records, name, resolverCallData);
  console.debug("[gateway] resolveRecord result", {
    resultLen: result.length,
  });

  const expires = Math.floor(Date.now() / 1000) + config.ttlSeconds;
  console.debug("[gateway] expires set", { expires });

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
