import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { PaymentRequirements, verifyReceiptHmac } from "@/lib/x402";

const RECEIVING_WALLET = process.env.RECEIVING_WALLET_ADDRESS || "0xD0D2e2206E44f818006ebC19F2fDB16a80a0d1fB";
const APP_SECRET = process.env.X402_APP_SECRET || "dev-secret";
const CHAIN = (process.env.X402_CHAIN || "base-sepolia") as "base" | "base-sepolia";
const FAC_URL = process.env.X402_FACILITATOR_URL || `${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}/api/x402/verify`;
const USDC_ADDR = CHAIN === "base" ? (process.env.NEXT_PUBLIC_USDC_ADDRESS_BASE as string) : (process.env.NEXT_PUBLIC_USDC_ADDRESS_BASE_SEPOLIA as string);

function buildRequirements(): PaymentRequirements {
  return {
    version: "1",
    chain: CHAIN,
    asset: { type: "erc20", symbol: "USDC", decimals: 6, address: USDC_ADDR as `0x${string}` },
    amount: (process.env.X402_AMOUNT || "1000000"),
    recipient: RECEIVING_WALLET as `0x${string}`,
    facilitator: FAC_URL,
    expiresAt: Date.now() + 5 * 60 * 1000,
    nonce: crypto.randomUUID(),
    sku: "cardify:image:forge-v1",
  };
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "OPENAI_API_KEY is not configured." }, { status: 500 });
  }

  // Read body (only prompt is required now)
  const body = await request.json().catch(() => null);
  if (!body || typeof body.prompt !== "string") {
    return NextResponse.json({ error: "Missing or invalid prompt." }, { status: 400 });
  }

  // Look for X-PAYMENT header
  const token = request.headers.get("x-payment");
  if (!token) {
    // Advertise how to pay using X402
    const requirements = buildRequirements();
    return NextResponse.json({ version: "1", requirements }, { status: 402 });
  }

  const v = verifyReceiptHmac(token, APP_SECRET);
  if (!v.ok || !v.receipt) {
    const requirements = buildRequirements();
    return NextResponse.json({ error: "Invalid payment receipt.", requirements }, { status: 402 });
  }

  // Validate receipt matches our requirements
  const reqs = buildRequirements();
  if (v.receipt.chain !== reqs.chain) {
    return NextResponse.json({ error: "Chain mismatch" }, { status: 402 });
  }
  if (v.receipt.recipient.toLowerCase() !== reqs.recipient.toLowerCase()) {
    return NextResponse.json({ error: "Recipient mismatch" }, { status: 402 });
  }
  if (v.receipt.assetAddress?.toLowerCase() !== (reqs.asset.address as string).toLowerCase()) {
    return NextResponse.json({ error: "Asset mismatch" }, { status: 402 });
  }
  if (BigInt(v.receipt.amount) < BigInt(reqs.amount)) {
    return NextResponse.json({ error: "Amount below required" }, { status: 402 });
  }

  // (Optional) Enforce same chain/recipient/asset/amount here if desired
  // Proceed with paid action: generate image
  try {
    const { prompt } = body as { prompt: string };
    // call OpenAI Images (kept identical to your original code)
    const imageRes = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-image-1",
        prompt,
        size: "1024x1024",
        n: 1,
      }),
    });

    if (!imageRes.ok) {
      const t = await imageRes.text();
      return NextResponse.json({ error: "Image generation failed", details: t }, { status: 500 });
    }
    const data = await imageRes.json();
    return NextResponse.json({ image: data.data?.[0]?.b64_json });
  } catch (error) {
    console.error("Image generation error:", error);
    return NextResponse.json({ error: "Unexpected server error occurred." }, { status: 500 });
  }
}