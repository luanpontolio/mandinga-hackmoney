import http from "node:http";
import { URL } from "node:url";
import { handleGatewayRequest } from "./gateway";

const port = Number(process.env.PORT ?? 8080);

const server = http.createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  if (!req.url) {
    res.writeHead(400);
    res.end("Missing URL");
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  if (url.pathname !== "/" && url.pathname !== "/ccip-read") {
    res.writeHead(404);
    res.end("Not found");
    return;
  }

  try {
    const { sender, data } = await parseRequest(req, url);
    const responseData = await handleGatewayRequest({ sender, data });
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ data: responseData }));
  } catch (error) {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: String(error) }));
  }
});

server.listen(port, () => {
  console.log(`Gateway listening on :${port}`);
});

async function parseRequest(req: http.IncomingMessage, url: URL) {
  if (req.method === "GET") {
    return {
      sender: url.searchParams.get("sender") ?? "",
      data: url.searchParams.get("data") ?? "",
    };
  }

  if (req.method === "POST") {
    const body = await readJsonBody(req);
    return {
      sender: typeof body?.sender === "string" ? body.sender : "",
      data: typeof body?.data === "string" ? body.data : "",
    };
  }

  throw new Error("Unsupported method");
}

function readJsonBody(req: http.IncomingMessage) {
  return new Promise<Record<string, unknown>>((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
    });
    req.on("end", () => {
      if (!raw) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch (error) {
        reject(error);
      }
    });
  });
}
