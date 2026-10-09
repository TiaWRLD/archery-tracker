import json
import os

import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from exercises import EXERCISES, title_and_how
from prompt import build_system, build_user
from schemas import CoachRequest, CoachResponse, ExerciseOut

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434/api/chat")
MODEL = os.getenv("OLLAMA_MODEL", "gemma4:e4b")
ORIGINS = os.getenv("CORS_ORIGINS", "*").split(",")  # in produzione: l'origine della PWA
MIN_EX, MAX_EX = 2, 3
COMMENT_MAX = 700

app = FastAPI(title="Archery Coach")
app.add_middleware(
    CORSMiddleware,
    allow_origins=ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok", "model": MODEL}


def wanted_tags(req: CoachRequest) -> list[str]:
    tags: list[str] = []
    g = req.grouping
    if g:
        if g.driftX != "centered":
            tags.append(f"drift_{g.driftX}")
        if g.driftY != "centered":
            tags.append(f"drift_{g.driftY}")
    if req.fatigue and req.fatigue.label == "declining":
        tags.append("fatigue")
    if req.trend and req.trend.label == "declining":
        tags.append("decline")
    if req.totals.misses > 0:
        tags.append("misses")
    if g is None:
        tags.append("form")
    tags += ["consistency", "general"]
    return tags


def fallback_ids(req: CoachRequest, exclude: list[str], n: int) -> list[str]:
    wanted = wanted_tags(req)
    scored = []
    for ex in EXERCISES.values():
        if ex.id in exclude:
            continue
        score = sum(len(wanted) - i for i, t in enumerate(wanted) if t in ex.tags)
        scored.append((score, ex.id))
    scored.sort(key=lambda s: -s[0])
    return [i for _, i in scored[:n]]


def clean_ids(raw) -> list[str]:
    out: list[str] = []
    if isinstance(raw, list):
        for i in raw:
            if isinstance(i, str) and i in EXERCISES and i not in out:
                out.append(i)
    return out[:MAX_EX]


async def call_ollama(system: str, user: str) -> dict:
    schema = {
        "type": "object",
        "properties": {
            "comment": {"type": "string"},
            "exercise_ids": {
                "type": "array",
                "items": {"type": "string", "enum": list(EXERCISES)},
                "minItems": MIN_EX,
                "maxItems": MAX_EX,
            },
        },
        "required": ["comment", "exercise_ids"],
    }
    payload = {
        "model": MODEL,
        "stream": False,
        "think": False,
        "format": schema,
        "keep_alive": "30m",
        "options": {"temperature": 0.3},
        "messages": [
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
    }
    try:
        async with httpx.AsyncClient(timeout=120) as client:
            r = await client.post(OLLAMA_URL, json=payload)
            r.raise_for_status()
    except httpx.ConnectError:
        raise HTTPException(503, "Ollama non raggiungibile")
    except httpx.HTTPError as e:
        raise HTTPException(502, f"Errore da Ollama: {e}")
    return json.loads(r.json()["message"]["content"])


@app.post("/coach", response_model=CoachResponse)
async def coach(req: CoachRequest):
    system = build_system(req.lang)
    user = build_user(req)

    data = None
    for _ in range(2):  # un solo nuovo tentativo se il JSON è rotto per mantenere contenuti i costi in termine di calcoli
        try:
            result = await call_ollama(system, user)
        except (ValueError, KeyError):
            continue
        if isinstance(result, dict) and str(result.get("comment", "")).strip():
            data = result
            break
    if data is None:
        raise HTTPException(502, "Risposta del modello non valida")

    comment = str(data["comment"]).strip()[:COMMENT_MAX]
    ids = clean_ids(data.get("exercise_ids"))
    if len(ids) < MIN_EX:
        ids += fallback_ids(req, ids, MIN_EX - len(ids))

    exercises = []
    for i in ids:
        title, how = title_and_how(EXERCISES[i], req.lang)
        exercises.append(ExerciseOut(id=i, title=title, how=how))
    return CoachResponse(comment=comment, exercises=exercises)