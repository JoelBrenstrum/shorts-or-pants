# Shorts or Pants

Should you wear shorts or pants today? Live at [shortsorpants.brenstrum.com](https://shortsorpants.brenstrum.com).

- Weather: [Open-Meteo](https://open-meteo.com) (no key)
- Location: browser geolocation, falling back to Cloudflare's IP geolocation via `functions/api/location.ts`, plus city search
- Verdict logic: `src/verdict.ts` (feels-like temp vs an 18° threshold, adjusted for humidity, wind, rain, UV and a personal bias)

## Develop

```sh
pnpm install
pnpm dev       # Vite only, /api/location falls back to Auckland
pnpm preview   # build + wrangler pages dev, includes the location function
pnpm test
```

## Deploy

```sh
pnpm deploy
```

Then in Cloudflare → Workers & Pages → shorts-or-pants → Custom domains, add `shortsorpants.brenstrum.com`.
