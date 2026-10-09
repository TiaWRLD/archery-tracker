import json
import time

import httpx

OLLAMA_URL = "http://localhost:11434/api/chat"
MODEL = "gemma4:e4b"  # sostituisci col nome esatto di `ollama list`

# Riepilogo di esempio, nella forma che manda la PWA
summary = {
    "lang": "it",
    "session": {"date": "2026-10-07", "distanceM": 18, "arrowsPerEnd": 3,
                "face": "40", "bow": "recurve", "feeling": 3, "note": None},
    "totals": {"points": 168, "arrows": 30, "avgPerArrow": 5.6, "misses": 1,
               "distribution": {"10": 2, "9": 4, "8": 6, "7": 7, "6": 5, "5": 3, "4": 2, "0": 1}},
    "ends": [
        {"points": 20, "avg": 6.7}, {"points": 19, "avg": 6.3},
        {"points": 18, "avg": 6.0}, {"points": 18, "avg": 6.0},
        {"points": 17, "avg": 5.7}, {"points": 16, "avg": 5.3},
        {"points": 16, "avg": 5.3}, {"points": 15, "avg": 5.0},
        {"points": 15, "avg": 5.0}, {"points": 14, "avg": 4.7},
    ],
    "trend": {"from": 6.2, "to": 5.0, "diff": -1.2, "label": "declining"},
    "fatigue": {"from": 5.4, "to": 4.8, "diff": -0.6, "label": "declining"},
    "grouping": {"arrowsUsed": 24, "arrowsTotal": 30, "spreadCm": 9.0, "radiusCm": 6.5,
                 "driftXCm": -3.0, "driftYCm": 1.0, "driftX": "left", "driftY": "centered"},
}

# Schema di output: per ora un commento libero, gli esercizi arrivano dopo
schema = {
    "type": "object",
    "properties": {"comment": {"type": "string"}},
    "required": ["comment"],
}

payload = {
    "model": MODEL,
    "stream": False,
    "think": False,
    "format": schema,
    "options": {"temperature": 0.3},
    "messages": [
        {"role": "system", "content": (
            """Sei un allenatore di tiro con l'arco. Rispondi in italiano.
Scrivi un commento di 3-4 frasi sulla sessione, rivolto direttamente al tiratore.

Regole:
- Usa solo i dati forniti. Non inventare nulla.
- Non giudicare i punteggi in assoluto (niente "buono", "solido", "scarso"):
  descrivi solo cosa è cambiato nella sessione (trend, fatica, raggruppamento).
- Cita al massimo 2 o 3 dati, i più significativi. Se un campo è null, ignoralo.
- Termini: usa "volée" (mai "end"), "deriva" (mai "drift"), "raggruppamento".
- Deriva: "left"=a sinistra, "right"=a destra, "high"=in alto, "low"=in basso,
  "centered"=centrato.
- Nessun consiglio tecnico generico: gli esercizi li propone un'altra parte del sistema.
- Non citare "X", "Y" né segni negativi: scrivi "3 cm a sinistra del centro".
- Non terminare con consigli o inviti generici: termina descrivendo l'ultimo dato citato.
-La scala del feeling è da 1 a 5.
- trend: media della prima metà della sessione (from) contro la seconda metà (to).
- fatigue: media delle ultime due volée (to) contro quella delle volée precedenti (from).
- Se trend e fatigue vanno nella stessa direzione, presentali come un'unica osservazione.
- Usa frasi brevi e parole semplici.
- feeling: { value, max } sarà introdotto dopo; per ora ignoralo.
"""
        )},
        {"role": "user", "content": json.dumps(summary, ensure_ascii=False)},
    ],
}

t0 = time.time()
r = httpx.post(OLLAMA_URL, json=payload, timeout=180)
r.raise_for_status()
data = r.json()
dt = time.time() - t0

print(f"Tempo totale: {dt:.1f}s")
print(f"Token generati: {data.get('eval_count')}")
print(json.dumps(json.loads(data["message"]["content"]), indent=2, ensure_ascii=False))
print(data["message"].keys())
print(data["message"].get("thinking", "")[:300])