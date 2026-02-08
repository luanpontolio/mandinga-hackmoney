import { Elysia } from "elysia";
import { CcipReadRequest, handleCcipReadRequest } from "../controllers/ccip-read.controller.js";

const app = new Elysia();

app.get("/", () => ({ status: "ok" }));
app.get("/health", () => ({ status: "ok" }));
app.get("/ccip-read", async ({ query, set }) => {
  try {
    set.status = 200;
    return await handleCcipReadRequest(query as CcipReadRequest);
  } catch (error) {
    set.status = 400;
    return { error: String(error) };
  }
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port);

console.log(`🦊 Elysia server running on port ${port}`);

export default app;