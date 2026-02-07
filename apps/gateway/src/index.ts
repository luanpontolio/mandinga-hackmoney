import express from "express";
import type { Request, Response } from "express";
import { handleGatewayRequest } from "./gateway";

const port = Number(process.env.PORT ?? 8080);

const app = express();

app.use(express.json({ limit: "1mb" }));
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }
  next();
});

const handler = async (req: Request, res: Response) => {
  try {
    const { sender, data } = parseRequest(req);
    const responseData = await handleGatewayRequest({ sender, data });
    res.status(200).json({ data: responseData });
  } catch (error) {
    res.status(400).json({ error: String(error) });
  }
};

app.get("/", handler);
app.get("/ccip-read", handler);
app.post("/", handler);
app.post("/ccip-read", handler);

app.use((_req, res) => {
  res.status(404).send("Not found");
});

app.listen(port, () => {
  console.log(`Gateway listening on :${port}`);
});

function parseRequest(req: Request) {
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
