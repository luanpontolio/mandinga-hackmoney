import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handleGatewayRequest } from "../src/gateway";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  try {
    const { sender, data } = parseRequest(req);
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
