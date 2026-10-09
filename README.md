# Archery Tracker

An offline-first PWA for tracking archery training sessions, with an optional AI coach powered by a local LLM.

Log your arrows at the range with no signal and no AI involved. Back home, the app summarizes the session and a local model (Gemma, served by Ollama) comments on it and suggests 2-3 exercises. Everything runs on your own machine: no cloud services, no accounts, no data sent to third parties.

## How it works

1. **At the range (offline).** The installed PWA records sessions in the browser's IndexedDB. No network is needed.
2. **At home (online).** The app computes a compact JSON summary of a session on the client and sends it to the backend.
3. **The coach.** The backend prompts a local model through Ollama and returns a short comment plus a few suggested exercises, in the language selected in the app (English or Italian).

```
 Phone (PWA, offline-first)  --JSON summary-->  FastAPI backend  -->  Ollama (gemma4:e4b)
        IndexedDB                                  (your Mac)             local model
```

## Repository layout

| Folder      | What it is                                   | Docs                                   |
| ----------- | -------------------------------------------- | -------------------------------------- |
| `frontend/` | Nuxt 3 + Vue PWA (Dexie, `@vite-pwa/nuxt`)   | [frontend/README.md](frontend/README.md) |
| `backend/`  | FastAPI service that talks to Ollama         | [backend/README.md](backend/README.md)   |

## Quick start

Prerequisites: Node.js, Python 3.10+, and [Ollama](https://ollama.com) with the model pulled:

```bash
ollama pull gemma4:e4b
```

Start the backend:

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

Start the frontend:

```bash
cd frontend
npm install
npm run dev
```

## Using it from a phone

Installing the PWA and registering its service worker require HTTPS. To avoid deploying anything, expose both services from your own machine with Tailscale Funnel:

```bash
tailscale funnel --bg --https=443 3000    # PWA (built and served locally)
tailscale funnel --bg --https=8443 8000   # backend
tailscale funnel reset                    # stop exposing everything
```

Then set `NUXT_PUBLIC_COACH_BACKEND_URL` in `frontend/.env` **before** building the PWA, and set `CORS_ORIGINS` on the backend to the PWA origin. Step-by-step details are in the two sub-READMEs.

## Tech stack

- **Frontend:** Nuxt 3, Vue, `ssr: false`, `@vite-pwa/nuxt`, Dexie (IndexedDB), no external UI libraries
- **Backend:** FastAPI, Uvicorn, Ollama
- **Model:** `gemma4:e4b`, tested on a MacBook Air M5

## Features

- Works fully offline once installed
- Dark green, mobile-first interface
- English and Italian UI, with coach replies in the selected language
- Local-only AI: nothing leaves your machine
- Distinct, readable errors when the coach is unreachable, slow or returns bad data

## Roadmap

- Delete sessions with confirmation
- More target faces (field, hunter, Las Vegas) and indoor compound
- Choose the target face from the home page
- Install prompt (`beforeinstallprompt`) and dedicated maskable icons
- Safari/iPad rendering fix for the target art