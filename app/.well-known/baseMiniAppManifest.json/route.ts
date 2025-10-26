import { NextResponse } from "next/server";

const manifest = {
  schemaVersion: "1.0",
  id: "cardify-mini-app",
  name: "Cardify Mini App",
  description: "Forge anime-inspired trading cards on Base Sepolia with a smart-wallet native experience.",
  iconUrl: "https://your-domain.example/icon.png",
  startUrl: "https://your-domain.example/",
  allowedOrigins: ["https://your-domain.example"],
  webhooks: [],
  permissions: {
    wallet: {},
  },
  baseBuilder: {
    ownerAddress: "0xA76ff0ad851dc9357A1BAf5FE65b12E821EC5bE7",
  },
};

export function GET() {
  return NextResponse.json(manifest);
}
