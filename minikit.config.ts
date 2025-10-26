const ROOT_URL =
  process.env.NEXT_PUBLIC_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'http://localhost:3000');

/**
 * MiniApp configuration object. Must follow the Farcaster MiniApp specification.
 *
 * @see {@link https://miniapps.farcaster.xyz/docs/guides/publishing}
 */
export const minikitConfig = {
  accountAssociation: {
    "header": "eyJmaWQiOjQ1MzQ1NiwidHlwZSI6ImN1c3RvZHkiLCJrZXkiOiIweGZlNEU4MzRjMzk5MDhiYzc0YzQ1NmYzOTZlRDViZDg2Y0FCYUU0QjUifQ",
    "payload": "eyJkb21haW4iOiJuZXctbWluaS1hcHAtcXVpY2tzdGFydC1iZWlnZS10YXUudmVyY2VsLmFwcCJ9",
    "signature": "MHg5Nzg4OTE0NGEyZWYwYjVlYTYxNWU5N2Y2MzYyOWQzNGQ0ZmUzZjVjMmQ4ZDgyNmE4MmQ0ZjA0MTRkZjE3YTViMzNlNTcwZTA3ZWMxODg3NTMzMTliZDJjNWQ5YzY4YjE0ZjJlNjUxMTJlZjQ5M2M2YmIzYzQwY2JmNmRmMGE1NTFi"
  },
  miniapp: {
    version: "1",
    name: "Cardify", 
    subtitle: "Create anime cards on Base", 
    description: "Craft collectible trading cards with a Coinbase Smart Wallet friendly flow.",
    screenshotUrls: [`${ROOT_URL}/screenshot-portrait.jpg`],
    iconUrl: `${ROOT_URL}/blue-icon.png`,
    splashImageUrl: `${ROOT_URL}/blue-hero.png`,
    splashBackgroundColor: "#000000",
    homeUrl: ROOT_URL,
    webhookUrl: `${ROOT_URL}/api/webhook`,
    primaryCategory: "social",
    tags: ["cardify", "tcg", "miniapp", "creative"],
    heroImageUrl: `${ROOT_URL}/blue-hero.png`, 
    tagline: "",
    ogTitle: "",
    ogDescription: "",
    ogImageUrl: `${ROOT_URL}/blue-hero.png`,
  },
    baseBuilder: {
      ownerAddress: "0xA76ff0ad851dc9357A1BAf5FE65b12E821EC5bE7",
    },
} as const;

