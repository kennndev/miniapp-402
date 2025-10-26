
import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, http } from "viem";
import { base, baseSepolia } from "viem/chains";
import { signReceiptHmac, X402Receipt } from "@/lib/x402";

const USDC_TRANSFER_TOPIC = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

const USDC_ADDRESS_BASE = process.env.NEXT_PUBLIC_USDC_ADDRESS_BASE as `0x${string}`;
const USDC_ADDRESS_SEPOLIA = process.env.NEXT_PUBLIC_USDC_ADDRESS_BASE_SEPOLIA as `0x${string}`;
const RECEIVING_WALLET = process.env.RECEIVING_WALLET_ADDRESS as `0x${string}`;
const APP_SECRET = process.env.X402_APP_SECRET || "dev-secret";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });

  const { txHash, chain } = body as { txHash: `0x${string}`; chain: "base" | "base-sepolia" };
  if (!txHash || !chain) return NextResponse.json({ ok: false, error: "Missing txHash/chain" }, { status: 400 });

  const client = createPublicClient({
    chain: chain === "base" ? base : baseSepolia,
    transport: http()
  });

  // Fetch transaction receipt
  const receipt = await client.getTransactionReceipt({ hash: txHash }).catch(() => null);
  if (!receipt || receipt.status !== "success") {
    return NextResponse.json({ ok: false, error: "TX not confirmed" }, { status: 400 });
  }

  // Simple USDC transfer verification
  const usdcAddr = chain === "base" ? USDC_ADDRESS_BASE : USDC_ADDRESS_SEPOLIA;

  const transferLog = receipt.logs.find(
    (log) => log.address.toLowerCase() === usdcAddr?.toLowerCase() && log.topics?.[0]?.toLowerCase() === USDC_TRANSFER_TOPIC
  );

  if (!transferLog) {
    return NextResponse.json({ ok: false, error: "No USDC Transfer found" }, { status: 400 });
  }

  // topics[1] = from, topics[2] = to (indexed). data = amount (32-byte)
  const to = `0x${transferLog.topics[2]?.slice(26) || ""}` as `0x${string}`;
  const amount = BigInt(transferLog.data);

  if (to.toLowerCase() !== RECEIVING_WALLET.toLowerCase()) {
    return NextResponse.json({ ok: false, error: "Recipient mismatch" }, { status: 400 });
  }

  const minAmount = BigInt(process.env.X402_AMOUNT || "1000000"); // default 1 USDC with 6 decimals
  if (amount < minAmount) {
    return NextResponse.json({ ok: false, error: "Amount below minimum" }, { status: 400 });
  }

  // Build and sign a receipt (to be used as X-PAYMENT header)
  const payer = `0x${transferLog.topics[1]?.slice(26) || ""}` as `0x${string}`;
  const receiptObj: X402Receipt = {
    nonce: txHash, // for demo, use txHash as nonce
    txHash,
    payer,
    amount: amount.toString(),
    recipient: RECEIVING_WALLET,
    assetAddress: usdcAddr,
    chain,
    issuedAt: Date.now()
  };

  const token = signReceiptHmac(receiptObj, APP_SECRET);

  return NextResponse.json({ ok: true, token, receipt: receiptObj });
}
