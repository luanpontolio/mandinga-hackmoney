// import { Elysia } from "elysia";
// import {
//   CcipReadRequest,
//   handleCcipReadRequest
// } from "../controllers/ccip-read.controller.js";

// const app = new Elysia();

// app.get("/", () => ({ status: "ok" }));
// app.get("/health", () => ({ status: "ok" }));

// app.get("/ccip-read", async ({ query, set }) => {
//   try {
//     set.status = 200;
//     return await handleCcipReadRequest(query as CcipReadRequest);
//   } catch (error) {
//     set.status = 400;
//     return { error: String(error) };
//   }
// });

// app.post("/ccip-read", async ({ body, set }) => {
//   try {
//     set.status = 200;
//     return await handleCcipReadRequest((body ?? {}) as CcipReadRequest);
//   } catch (error) {
//     set.status = 400;
//     return { error: String(error) };
//   }
// });

// app.all("*", ({ set }) => {
//   set.status = 404;
//   return { error: "Not found" };
// });

// /**
//  * ✅ THIS IS THE ONLY EXPORT VERCEL NEEDS
//  */
// export default app.fetch;
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

export default app.fetch;
