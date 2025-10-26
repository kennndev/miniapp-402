
import crypto from "crypto";

export type X402Asset = {
  type: "erc20" | "native";
  symbol?: string;
  decimals?: number;
  address?: `0x${string}`;
};

export type PaymentRequirements = {
  version: "1";
  chain: "base" | "base-sepolia";
  asset: X402Asset;
  amount: string; // base units
  recipient: `0x${string}`;
  facilitator: string; // URL to verify endpoint
  expiresAt: number;
  nonce: string;
  sku?: string;
};

export type X402Receipt = {
  nonce: string;
  txHash: `0x${string}`;
  payer: `0x${string}`;
  amount: string;
  recipient: `0x${string}`;
  assetAddress?: `0x${string}`;
  chain: "base" | "base-sepolia";
  issuedAt: number;
};

const ALG = "sha256";

export function signReceiptHmac(receipt: X402Receipt, secret: string) {
  const payload = JSON.stringify(receipt);
  const sig = crypto.createHmac(ALG, secret).update(payload).digest("hex");
  return Buffer.from(JSON.stringify({ r: receipt, s: sig, alg: ALG })).toString("base64url");
}

export function verifyReceiptHmac(encoded: string, secret: string): { ok: boolean; receipt?: X402Receipt } {
  try {
    const decoded = JSON.parse(Buffer.from(encoded, "base64url").toString());
    const { r, s, alg } = decoded;
    if (alg !== ALG) return { ok: false };
    const check = crypto.createHmac(ALG, secret).update(JSON.stringify(r)).digest("hex");
    if (check !== s) return { ok: false };
    return { ok: true, receipt: r as X402Receipt };
  } catch {
    return { ok: false };
  }
}
