import { handleGatewayRequest } from "../src/gateway";

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  try {
    const { sender, data } = parseRequest(req);
    const responseData = await handleGatewayRequest({ sender, data });
    res.status(200).json({ data: responseData });
  } catch (error) {
    res.status(400).json({ error: String(error) });
  }
}

function parseRequest(req: any) {
  if (req.method === "GET") {
    return {
      sender: typeof req.query?.sender === "string" ? req.query.sender : "",
      data: typeof req.query?.data === "string" ? req.query.data : "",
    };
  }

  if (req.method === "POST") {
    const body = req.body ?? {};
    return {
      sender: typeof body.sender === "string" ? body.sender : "",
      data: typeof body.data === "string" ? body.data : "",
    };
  }

  throw new Error("Unsupported method");
}
