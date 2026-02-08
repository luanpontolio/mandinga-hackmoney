import { Elysia } from "elysia";
import { CcipReadRequest, handleCcipReadRequest } from "../controllers/ccip-read.controller.js";
import { invalidateGatewayConfig } from "../services/gateway.service.js";
import { loadRecords, upsertVaultRecord } from "../services/records-store.js";

const app = new Elysia();

const allowedOrigins = (process.env.GATEWAY_ALLOWED_ORIGINS ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.onRequest(({ set, request }) => {
  const origin = request.headers.get("origin") ?? "";
  const allowOrigin =
    allowedOrigins.length === 0 || allowedOrigins.includes(origin)
      ? origin || "*"
      : "";

  if (allowOrigin) {
    set.headers["access-control-allow-origin"] = allowOrigin;
    set.headers["access-control-allow-credentials"] = "true";
    set.headers["vary"] = "origin";
  }
  set.headers["access-control-allow-methods"] = "GET,POST,OPTIONS";
  set.headers["access-control-allow-headers"] =
    "content-type,authorization,x-api-key";
});

app.options("/*", ({ set }) => {
  set.status = 204;
  return "";
});

app.get("/", () => ({ status: "ok" }));
app.get("/health", () => ({ status: "ok" }));
app.get("/records", () => loadRecords());
app.get("/ccip-read", async ({ query, set }) => {
  try {
    set.status = 200;
    return await handleCcipReadRequest(query as CcipReadRequest);
  } catch (error) {
    set.status = 400;
    return { error: String(error) };
  }
});
app.post("/ccip-read", async ({ body, set }) => {
  try {
    const parsedBody =
      typeof body === "string" ? (JSON.parse(body) as CcipReadRequest) : (body as CcipReadRequest);

    console.debug("[ccip-read] request", { parsedBody: parsedBody });
    set.status = 200;
    return await handleCcipReadRequest(parsedBody);
  } catch (error) {
    set.status = 400;
    return { error: String(error) };
  }
});

app.post("/records/vault", async ({ body, set }) => {
  try {
    const parsedBody =
      typeof body === "string"
        ? (JSON.parse(body) as {
            circleName?: string;
            vaultAddress?: string;
            description?: string;
            url?: string;
          })
        : (body as {
            circleName?: string;
            vaultAddress?: string;
            description?: string;
            url?: string;
          });

    const circleName = parsedBody.circleName ?? "";
    const vaultAddress = parsedBody.vaultAddress ?? "";
    if (!circleName || !vaultAddress) {
      set.status = 400;
      return { error: "circleName and vaultAddress are required." };
    }

    const result = upsertVaultRecord({
      circleName,
      vaultAddress,
      description: parsedBody.description,
      url: parsedBody.url,
    });
    invalidateGatewayConfig();
    set.status = 200;
    return { status: "ok", ensName: result.ensName };
  } catch (error) {
    set.status = 400;
    return { error: String(error) };
  }
});

// Start the server
const port = 4000;
app.listen(port);
console.log(`🦊 Elysia server running on port ${port}`);
export default app;
