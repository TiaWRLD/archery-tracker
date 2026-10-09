# Archery Tracker (PWA)

Offline-first Progressive Web App for tracking archery training sessions. Mobile first, dark green theme, no external UI libraries.

Scores and sessions are stored on the device (IndexedDB via Dexie), so the app works fully offline at the range. An optional AI coach gives feedback on a session when you are back online and the backend is reachable.

## Stack

- Nuxt 3 + Vue, client-side only (`ssr: false`)
- `@vite-pwa/nuxt` for the manifest and service worker
- Dexie / IndexedDB for local storage
- English and Italian (`utils/i18n.ts`)

## Setup

```bash
cd frontend
npm install
npx nuxi prepare
```

## Development

```bash
npm run dev
```

Note: installation and the service worker require HTTPS (or `localhost`). They do not work on `http://<local-ip>`.

## Configuration

Copy `.env.example` to `.env` (or create it) with:

```
NUXT_PUBLIC_COACH_BACKEND_URL=https://<host>.<tailnet>.ts.net:8443
NUXT_PUBLIC_COACH_TIMEOUT_MS=120000
```

| Variable                        | Description                                  |
| ------------------------------- | -------------------------------------------- |
| `NUXT_PUBLIC_COACH_BACKEND_URL` | Base URL of the coach backend (include `https://`) |
| `NUXT_PUBLIC_COACH_TIMEOUT_MS`  | Request timeout for the coach, in milliseconds |

These values are baked in at build time: set them **before** building. In the app, the coach settings page can override the backend URL at runtime (stored in `localStorage`); leaving the field empty restores the build-time default.

## Build and serve

```bash
npx nuxi generate
npx serve -s .output/public -l 3000
```

`-s` enables the single-page-app fallback, so reloading a deep link such as `/history/<id>` does not return a 404.

To reach it from a phone over HTTPS without deploying anywhere, expose it with Tailscale Funnel:

```bash
tailscale funnel --bg --https=443 3000
tailscale funnel reset   # stop exposing when done
```

The backend must allow this origin, e.g. `CORS_ORIGINS=https://<host>.<tailnet>.ts.net` (origin only: scheme and host, no port, no trailing slash). See the backend README.

## Installing on Android

1. Open the HTTPS address in Chrome.
2. Menu, then "Install app" (or "Add to Home screen").
3. Use it offline: sessions are saved locally.
4. Back online, open a session, tap "Coach", and use "Test connection" to verify the backend.

After rebuilding, clear the site data (or reinstall the app) on the phone, otherwise the service worker may keep serving the previous build.

## How the coach works

The client computes a compact JSON summary of the session (notes are truncated to 300 characters in `coachSummary.ts`) and sends it to the backend. The backend asks a local LLM for a short comment and 2-3 exercises, in the language currently selected in the app. Distinct messages are shown for backend unavailable, bad response, invalid data, timeout and network errors.

## Language

The initial language comes from the device; the user's choice is saved. Switch it with the language toggle on the home page.

## Known limitations

- The manifest `lang` is static (`it`).
- Target face rendering in `TargetArt.vue` has not been verified on Safari/iPad.