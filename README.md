# Cardify Mini App Quickstart

A Coinbase Base Mini App that lets trainers forge anime-inspired trading cards on Base Sepolia. This project builds on the official Mini App quickstart (Next.js + OnchainKit) and swaps the waitlist flow for the Cardify experience: wallet contextualization, image generation through OpenAI, and a downloadable card preview.

## Features

- Coinbase Mini App ready UI rendered via Next.js App Router.
- Wallet detection for `coinbaseWalletMiniApp` (with EVM fallback) and Base Sepolia network checks.
- Fixed Pokémon-style frame/art direction with dynamic stats, levels, and forge hash.
- Serverless `/api/generate` route that proxies the OpenAI Images API (`gpt-image-1`) using `OPENAI_API_KEY`.
- Download button to save the generated card PNG.
- `.well-known/baseMiniAppManifest.json` served from the App Router for Base Mini App preview tooling.

## Prerequisites

- Node.js 18+
- Coinbase Base app (or Coinbase Wallet) to preview the Mini App
- OpenAI API key with Images API access
- (Optional) Vercel CLI for one-click deploys

## Getting Started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment variables**

   Create a `.env.local` file in the project root:

   ```bash
   OPENAI_API_KEY=sk-your-openai-key
   NEXT_PUBLIC_URL=http://localhost:3000
   ```

   Set `NEXT_PUBLIC_URL` to your deployed HTTPS domain when you publish.

3. **Run locally**

   ```bash
   npm run dev
   ```

   Tunnel the dev server (default `http://localhost:3000`) through an HTTPS service such as ngrok when testing inside the Coinbase app.

4. **Forge a card**

   - Press **Connect Wallet** inside the mini app to link a Base Sepolia wallet.
   - Provide a creature name, choose an element type, and describe a signature move.
   - Click **Forge Creature**. Once the image is generated you can download the PNG.

## Manifest & Branding

- The Base Mini App manifest is served from `app/.well-known/baseMiniAppManifest.json/route.ts`. Update the hard-coded URLs to match your deployed domain and assets.
- Farcaster metadata lives in `minikit.config.ts`; adjust the name, subtitle, splash images, and screenshot references there. Upload new assets under `public/`.

## Deployment (Vercel)

1. Push the repository to a Git provider connected to Vercel.
2. Set the environment variables in Vercel (`OPENAI_API_KEY`, `NEXT_PUBLIC_URL`).
3. Deploy with `vercel --prod`.
4. Update `NEXT_PUBLIC_URL` locally (and in Vercel) to the production domain so the manifest and metadata resolve correctly.

## File Map

```
app/
├── .well-known/baseMiniAppManifest.json/route.ts  # Base Mini App manifest
├── api/generate/route.ts                         # Serverless OpenAI proxy
├── globals.css                                   # Global styles
├── layout.tsx                                    # App layout
├── page.module.css                               # Cardify UI styles
└── page.tsx                                      # Main Cardify component

minikit.config.ts                                 # Farcaster/Base metadata
public/                                           # Shared imagery & icons
```

## Customization Notes

- Swap `icon.png` or add type-specific artwork in `public/`.
- Adjust prompt scaffolding or type themes in `app/page.tsx`.
- Extend the `handleForge` logic to persist creations or kick off onchain actions.
- Fill the `accountAssociation` block in `minikit.config.ts` after signing your manifest with the Farcaster developer tool.
- Replace the placeholder URLs in the manifest route before submitting to the Base Mini App directory.


## X402 Integration (Demo)

This fork adds an X402-style flow to the `/api/generate` paid endpoint.

- First call returns **HTTP 402** with JSON payment requirements (USDC on Base or Base Sepolia).
- Client sends an ERC-20 `transfer` to the recipient.
- Client calls `/api/x402/verify` with the `txHash` to obtain a signed receipt token.
- Client retries `/api/generate` with `X-PAYMENT: <token>` header.
- Server verifies the token and generates the image.

### Env

```
X402_CHAIN=base-sepolia
X402_AMOUNT=1000000
X402_APP_SECRET=dev-secret
NEXT_PUBLIC_USDC_ADDRESS_BASE=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
NEXT_PUBLIC_USDC_ADDRESS_BASE_SEPOLIA=<YOUR TEST USDC ADDRESS>
RECEIVING_WALLET_ADDRESS=<YOUR RECEIVING WALLET>
NEXT_PUBLIC_URL=http://localhost:3000
```

> NOTE: The `/api/x402/verify` endpoint is a **minimal demo facilitator** that checks the USDC Transfer log and signs a receipt with an HMAC. Replace with a production facilitator as you grow.
