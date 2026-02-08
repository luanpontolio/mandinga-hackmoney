import { handleGatewayRequest } from "../services/gateway.service.js";

export type CcipReadRequest = {
  sender?: string;
  data?: string;
};

function getString(value: unknown) {
  return typeof value === "string" ? value : "";
}

export async function handleCcipReadRequest(payload: CcipReadRequest) {
  console.debug("[ccip-read] request", { payload });
  const sender = getString(payload.sender);
  const data = getString(payload.data);
  console.debug("[ccip-read] request", {
    hasSender: Boolean(sender),
    dataLen: data.length,
    dataPrefix: data.slice(0, 10),
  });
  const responseData = await handleGatewayRequest({ sender, data });
  console.debug("[ccip-read] response", { dataLen: responseData.length });
  return { data: responseData };
}
