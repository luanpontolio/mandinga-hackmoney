import {
  decodeAbiParameters,
  encodeAbiParameters,
  getAddress,
  Hex,
  hexToBytes,
} from "viem";
import { JsonRecords } from "./records.js";

const ADDR_SELECTOR = "0x3b3b57de";
const ADDR_COINTYPE_SELECTOR = "0xf1cb7e06";
const TEXT_SELECTOR = "0x59d1d43c";

export function decodeCallData(callData: Hex) {
  const [encodedName, resolverCallData] = decodeAbiParameters(
    [{ type: "bytes" }, { type: "bytes" }],
    callData
  );

  const name = decodeDnsName(hexToBytes(encodedName as Hex)).toLowerCase();
  return { name, resolverCallData: resolverCallData as Hex };
}

export function resolveRecord(records: JsonRecords, name: string, data: Hex) {
  const selector = data.slice(0, 10).toLowerCase();
  const argsData = ("0x" + data.slice(10)) as Hex;

  if (selector === ADDR_SELECTOR) {
    const [node] = decodeAbiParameters([{ type: "bytes32" }], argsData);
    void node;
    const addr = records.addr(name, 60);
    return encodeAbiParameters([{ type: "address" }], [getAddress(addr)]);
  }

  if (selector === ADDR_COINTYPE_SELECTOR) {
    const [node, coinType] = decodeAbiParameters(
      [{ type: "bytes32" }, { type: "uint256" }],
      argsData
    );
    void node;
    const addrBytes = records.addrBytes(name, Number(coinType));
    if (Number(coinType) === 60) {
      return encodeAbiParameters([{ type: "bytes" }], [getAddress(addrBytes)]);
    }
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
