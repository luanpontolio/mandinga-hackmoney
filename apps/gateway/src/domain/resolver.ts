import {
  decodeAbiParameters,
  encodeAbiParameters,
  getAddress,
  Hex,
  hexToBytes,
} from "viem";
import { JsonRecords } from "./records.js";

const ADDR_SELECTOR = "0xbc1c58d1";
const ADDR_COINTYPE_SELECTOR = "0xf1cb7e06";
const TEXT_SELECTOR = "0x59d1d43c";
const RESOLVE_SELECTOR = "0x9061b923";

export function decodeCallData(callData: Hex) {
  console.debug("[resolver] decodeCallData", {
    callDataLen: callData.length,
    callDataPrefix: callData.slice(0, 10),
  });
  const maybeSelector = callData.slice(0, 10).toLowerCase();
  const encodedData =
    maybeSelector === RESOLVE_SELECTOR
      ? (("0x" + callData.slice(10)) as Hex)
      : callData;
  const [encodedName, resolverCallData] = decodeAbiParameters(
    [{ type: "bytes" }, { type: "bytes" }],
    encodedData
  );
  console.debug("[resolver] decodeCallData", {
    encodedName,
    resolverCallData,
    usedSelector: maybeSelector === RESOLVE_SELECTOR ? maybeSelector : null,
  });

  const name = decodeDnsName(hexToBytes(encodedName as Hex)).toLowerCase();
  console.debug("[resolver] decodeCallData", {
    name,
    resolverDataLen: (resolverCallData as Hex).length,
  });
  return { name, resolverCallData: resolverCallData as Hex };
}

export function resolveRecord(records: JsonRecords, name: string, data: Hex) {
  const selector = data.slice(0, 10).toLowerCase();
  const argsData = ("0x" + data.slice(10)) as Hex;
  console.debug("[resolver] resolveRecord", {
    name,
    selector,
    argsLen: argsData.length,
  });

  if (selector === ADDR_SELECTOR) {
    const [node] = decodeAbiParameters([{ type: "bytes32" }], argsData);
    void node;
    const addr = records.addr(name, 60);
    console.debug("[resolver] addr record", { name, addr });
    return encodeAbiParameters([{ type: "address" }], [getAddress(addr)]);
  }

  if (selector === ADDR_COINTYPE_SELECTOR) {
    const [node, coinType] = decodeAbiParameters(
      [{ type: "bytes32" }, { type: "uint256" }],
      argsData
    );
    void node;
    console.debug("[resolver] addr coinType record", {
      name,
      coinType: (coinType as bigint).toString(),
    });
    const coinTypeNumber = Number(coinType);
    console.debug("[resolver] addr coinType number", {
      coinTypeNumber,
    });
    const addrBytes = records.addrBytes(name, coinTypeNumber);
    if (coinTypeNumber === 60) {
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
    console.debug("[resolver] text record", { name, key });
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
