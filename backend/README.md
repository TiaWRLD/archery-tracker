# Archery Coach Backend

Small FastAPI service that turns a training-session summary (JSON, computed client-side by the PWA) into a short coaching comment and 2-3 suggested exercises, using a local LLM served by [Ollama](https://ollama.com).

Nothing leaves your machine: the model runs locally and the PWA talks to this service only when you are online and ask the coach for feedback. The PWA itself works fully offline.

## Requirements

- Python 3.10+
- Ollama running locally, with the model pulled:

```bash
ollama pull gemma4:e4b
```

Developed and tested on a MacBook Air M5.

## Setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Run

```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

## Configuration

| Variable       | Default | Description                                              |
| -------------- | ------- | -------------------------------------------------------- |
| `CORS_ORIGINS` | `*`     | Allowed origin(s) of the PWA. Set it to the exact PWA origin outside local development. |

Example:

```bash
CORS_ORIGINS=https://my-host.my-tailnet.ts.net uvicorn main:app --host 0.0.0.0 --port 8000
```

## Warm up the model

The first request after a cold start is slow because the model has to be loaded. Warm it up and keep it in memory for 30 minutes:

```bash
curl http://localhost:11434/api/generate \
  -d '{"model": "gemma4:e4b", "prompt": "hi", "stream": false, "keep_alive": "30m"}'
```

## Error responses

The PWA distinguishes these cases and shows a specific message for each:

| Status | Meaning                                  |
| ------ | ---------------------------------------- |
| 422    | Invalid or malformed summary payload     |
| 502    | Ollama answered with an error or bad output |
| 503    | Ollama is unreachable / model unavailable |

## Exposing it over HTTPS (Tailscale Funnel)

Browsers require HTTPS for installing the PWA and registering its service worker, and the PWA needs an HTTPS backend. Tailscale Funnel gives the Mac a stable public HTTPS address without deploying anything:

```bash
tailscale funnel --bg --https=8443 8000   # backend
tailscale funnel reset                    # stop exposing everything
```

Then build the PWA with `NUXT_PUBLIC_COACH_BACKEND_URL=https://<host>.<tailnet>.ts.net:8443` in `frontend/.env`. The value is fixed at build time; it can be overridden at runtime from the coach settings in the app.

## Notes

- The summary is sent as JSON; free-text notes are truncated client-side to 300 characters.
- The coach replies in the language selected in the app (Italian or English).
