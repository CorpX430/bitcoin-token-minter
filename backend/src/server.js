import "dotenv/config";
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getBalance, getTokenInfo, mintTokens } from "./blockchain.js";
import { parseTokenAmount, requireAddress } from "./validation.js";

const app = express();
const port = Number(process.env.PORT || 10000);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(cors({ origin: process.env.FRONTEND_ORIGIN || true }));
app.use(express.json({ limit: "16kb" }));
app.use(rateLimit({ windowMs: 60_000, limit: 60, standardHeaders: true, legacyHeaders: false }));

app.get("/health", (_req, res) => res.json({ ok: true, service: "bitcoin-token-minter" }));
app.get("/api/token-info", async (_req, res, next) => {
  try { res.json(await getTokenInfo()); } catch (error) { next(error); }
});
app.get("/api/balance/:address", async (req, res, next) => {
  try { res.json(await getBalance(requireAddress(req.params.address))); } catch (error) { next(error); }
});
app.post("/api/mint", async (req, res, next) => {
  try {
    if (process.env.MINT_API_KEY && (req.get("x-api-key") || req.body.apiKey) !== process.env.MINT_API_KEY) {
      return res.status(401).json({ error: "Invalid mint API key" });
    }
    const address = requireAddress(req.body.address);
    const info = await getTokenInfo();
    const amount = parseTokenAmount(req.body.amount, info.decimals);
    const result = await mintTokens(address, amount);
    const balance = await getBalance(address);
    res.status(201).json({ status: "confirmed", address, amount: req.body.amount, ...result, balance });
  } catch (error) { next(error); }
});

const frontendDist = path.resolve(__dirname, "../../frontend/dist");
app.use(express.static(frontendDist));
app.use((req, res, next) => {
  if (req.path.startsWith("/api/")) return next();
  res.sendFile(path.join(frontendDist, "index.html"), (error) => error && next(error));
});
app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(error.status || 500).json({ error: error.message || "Internal server error" });
});
app.listen(port, "0.0.0.0", () => console.log(`Bitcoin Token Minter API listening on ${port}`));
