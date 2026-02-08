import type { VercelRequest, VercelResponse } from "@vercel/node";
import { readFileSync } from "node:fs";
import path from "node:path";
import {
  decodeAbiParameters,
  encodeAbiParameters,
  getAddress,
  Hex,
  hexToBytes,
  keccak256,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";

export const config = {
  runtime: "nodejs20.x",
};

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const EMPTY_BYTES = "0x";

const ADDR_SELECTOR = "0x3b3b57de";
const ADDR_COINTYPE_SELECTOR = "0xf1cb7e06";
const TEXT_SELECTOR = "0x59d1d43c";

type NameRecord = {
  addresses?: Record<string, string>;
  text?: Record<string, string>;
};

type ZoneData = Record<string, NameRecord>;

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
    process.env.GATEWAY_RECORDS_PATH ?? "apps/gateway/records.json";
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

function decodeCallData(callData: Hex) {
  const [encodedName, resolverCallData] = decodeAbiParameters(
    [{ type: "bytes" }, { type: "bytes" }],
    callData
  );

  const name = decodeDnsName(hexToBytes(encodedName as Hex)).toLowerCase();
  return { name, resolverCallData: resolverCallData as Hex };
}

function resolveRecord(records: JsonRecords, name: string, data: Hex) {
  const selector = data.slice(0, 10).toLowerCase();
  const argsData = ("0x" + data.slice(10)) as Hex;

  if (selector === ADDR_SELECTOR) {
    const [node] = decodeAbiParameters([{ type: "bytes32" }], argsData);
    void node;
    const addr = records.addr(name, 60);
    return encodeAbiParameters([{ type: "address" }], [addr]);
  }

  if (selector === ADDR_COINTYPE_SELECTOR) {
    const [node, coinType] = decodeAbiParameters(
      [{ type: "bytes32" }, { type: "uint256" }],
      argsData
    );
    void node;
    const addrBytes = records.addrBytes(name, Number(coinType));
    return encodeAbiParameters([{ type: "bytes" }], [addrBytes as Hex]);
  }

  if (selector === TEXT_SELECTOR) {
    const [node, key] = decodeAbiParameters(
      [{ type: "bytes32" }, { type: "string" }],
      argsData
    );
    void node;
    const value = records.text(name, key as string);
    return encodeAbiParameters([{ type: "string" }], [value]);
  }

  throw new Error(`Unsupported resolver call: ${selector}`);
}

function decodeDnsName(encoded: Uint8Array) {
  const labels: string[] = [];
  let index = 0;
  while (index < encoded.length) {
    const len = encoded[index];
    if (len === 0) break;
    labels.push(
      Buffer.from(encoded.slice(index + 1, index + 1 + len)).toString("utf8")
    );
    index += len + 1;
  }
  return labels.join(".");
}

class JsonRecords {
  private data: ZoneData;

  constructor(data: ZoneData) {
    this.data = { ...data };
    for (const key of Object.keys(this.data)) {
      if (!key.startsWith("*.") && !this.data[`*.${key}`]) {
        this.data[`*.${key}`] = {};
      }
    }
  }

  addr(name: string, coinType: number) {
    const record = this.findName(name);
    const value = record?.addresses?.[String(coinType)];
    if (!value) return ZERO_ADDRESS;
    return getAddress(value);
  }

  addrBytes(name: string, coinType: number) {
    const record = this.findName(name);
    const value = record?.addresses?.[String(coinType)];
    if (!value) return EMPTY_BYTES;
    if (coinType === 60) {
      return getAddress(value);
    }
    return value;
  }

  text(name: string, key: string) {
    const record = this.findName(name);
    const value = record?.text?.[key];
    return value ?? "";
  }

  private findName(name: string) {
    if (this.data[name]) {
      return this.data[name];
    }

    const labels = name.split(".");
    for (let i = 1; i < labels.length + 1; i += 1) {
      const wildcard = ["*", ...labels.slice(i)].join(".");
      if (this.data[wildcard]) {
        return this.data[wildcard];
      }
    }
    return null;
  }
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  try {
    console.log("req", req);
    console.log("res", res);
    const { sender, data } = parseRequest(req);
    console.log("sender", sender);
    console.log("data", data);
    const responseData = await handleGatewayRequest({ sender, data });
    res.status(200).json({ data: responseData });
  } catch (error) {
    res.status(400).json({ error: String(error) });
  }
}

function parseRequest(req: VercelRequest) {
  if (req.method === "GET") {
    return {
      sender: typeof req.query.sender === "string" ? req.query.sender : "",
      data: typeof req.query.data === "string" ? req.query.data : "",
    };
  }

  if (req.method === "POST") {
    return {
      sender: typeof req.body?.sender === "string" ? req.body.sender : "",
      data: typeof req.body?.data === "string" ? req.body.data : "",
    };
  }

  throw new Error("Unsupported method");
}
