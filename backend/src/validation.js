import { ethers } from "ethers";

export function requireAddress(value, field = "address") {
  if (!value || !ethers.isAddress(value)) {
    const error = new Error(`${field} must be a valid EVM address`);
    error.status = 400;
    throw error;
  }
  return ethers.getAddress(value);
}

export function parseTokenAmount(value, decimals = 18) {
  if (typeof value !== "string" && typeof value !== "number") {
    const error = new Error("amount must be a decimal string");
    error.status = 400;
    throw error;
  }
  const normalized = String(value).trim();
  if (!/^(0|[1-9]\d*)(\.\d+)?$/.test(normalized) || Number(normalized) <= 0) {
    const error = new Error("amount must be greater than zero and use decimal notation");
    error.status = 400;
    throw error;
  }
  try {
    return ethers.parseUnits(normalized, decimals);
  } catch {
    const error = new Error(`amount has more than ${decimals} decimal places`);
    error.status = 400;
    throw error;
  }
}
