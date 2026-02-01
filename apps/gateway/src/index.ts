import http from "node:http";
import { URL } from "node:url";

const port = Number(process.env.PORT ?? 8080);

const server = http.createServer((req, res) => {
  if (!req.url) {
    res.writeHead(400);
    res.end("Missing URL");
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  if (url.pathname !== "/" || req.method !== "GET") {
    res.writeHead(404);
    res.end("Not found");
    return;
  }

  const name = url.searchParams.get("name");
  if (!name) {
    res.writeHead(400);
    res.end("Missing name");
    return;
  }

  const payload = {
    name,
    vaultAddress: process.env.VAULT_ADDRESS ?? "0x0000000000000000000000000000000000000000",
    status: "ACTIVE",
    target: "1000",
    signature: "0x",
  };

  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(payload));
});

server.listen(port, () => {
  console.log(`Gateway listening on :${port}`);
});
