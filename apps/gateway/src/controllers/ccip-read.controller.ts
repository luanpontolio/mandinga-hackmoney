import { handleGatewayRequest } from "../services/gateway.service.js";

export type CcipReadRequest = {
  sender?: string;
  data?: string;
};

function getString(value: unknown) {
  return typeof value === "string" ? value : "";
}

export async function handleCcipReadRequest(payload: CcipReadRequest) {
  const sender = getString(payload.sender);
  const data = getString(payload.data);
  const responseData = await handleGatewayRequest({ sender, data });
  return { data: responseData };
}
