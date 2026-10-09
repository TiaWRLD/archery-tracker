from dataclasses import dataclass


@dataclass(frozen=True)
class Exercise:
    id: str
    tags: tuple[str, ...]
    it: tuple[str, str]  # (titolo, istruzioni)
    en: tuple[str, str]


def _e(id, tags, it, en):
    return Exercise(id, tuple(tags), it, en)


_LIST = [
    _e("blank_bale", ["form", "wide_grouping", "misses"],
       ("Tiro a bersaglio vuoto",
        "Tira 6 frecce a 3-4 metri su un paglione senza bersaglio, a occhi chiusi o guardando solo la sequenza. "
        "Nessun punteggio: conta solo ripetere lo stesso gesto."),
       ("Blank bale shooting",
        "Shoot 6 arrows from 3-4 metres at a blank bale, eyes closed or focused only on your sequence. "
        "No scoring: the goal is to repeat the same movement.")),
    _e("sequence_check", ["form", "consistency", "drift_left", "drift_right", "drift_high", "drift_low"],
       ("Controllo della sequenza di tiro",
        "Prima di ogni freccia ripassa mentalmente i passi: posizione, impugnatura, trazione, ancoraggio, rilascio. "
        "Per 3 volée annota quale passo hai saltato o fatto in fretta."),
       ("Shot sequence check",
        "Before each arrow, mentally run through the steps: stance, grip, draw, anchor, release. "
        "For 3 ends, note which step you skipped or rushed.")),
    _e("slow_draw_hold", ["fatigue", "form", "wide_grouping"],
       ("Trazione lenta con tenuta",
        "Tira 6 frecce con trazione lenta e 5 secondi di tenuta a pieno allungo prima del rilascio. "
        "Se la tenuta cede, ferma la serie e riposa."),
       ("Slow draw with hold",
        "Shoot 6 arrows with a slow draw and a 5-second hold at full draw before release. "
        "If the hold breaks down, stop the set and rest.")),
    _e("rest_between_ends", ["fatigue", "decline"],
       ("Pause programmate",
        "Dopo ogni volée posa l'arco e fai 30-60 secondi di pausa: scuoti le braccia, bevi, respira. "
        "Riparti solo quando sei rilassato."),
       ("Planned rests",
        "After every end, put the bow down and rest for 30-60 seconds: shake out your arms, drink, breathe. "
        "Start again only when you feel relaxed.")),
    _e("short_blocks", ["fatigue", "decline"],
       ("Sessione a blocchi",
        "Dividi l'allenamento in blocchi di 4-5 volée con 5 minuti di pausa tra uno e l'altro. "
        "Meglio meno frecce fatte bene che tante a qualità in calo."),
       ("Block training",
        "Split your session into blocks of 4-5 ends with 5 minutes of rest between them. "
        "Fewer good arrows beat many arrows with falling quality.")),
    _e("anchor_mirror", ["drift_left", "drift_right", "wide_grouping", "form"],
       ("Ancoraggio allo specchio",
        "Davanti a uno specchio porta l'arco a pieno allungo e controlla che mano, mento e corda "
        "tocchino sempre gli stessi punti. Ripeti 10 volte."),
       ("Anchor in the mirror",
        "Draw in front of a mirror and check that hand, chin and string touch the same points every time. "
        "Repeat 10 times.")),
    _e("sight_steps", ["drift_left", "drift_right", "drift_high", "drift_low"],
       ("Correzione del mirino a piccoli passi",
        "Se il gruppo è costantemente decentrato, sposta il mirino verso il gruppo di pochissimo, "
        "poi tira una volée e controlla. Cambia una cosa alla volta."),
       ("Sight adjustment in small steps",
        "If your group is consistently off-centre, move the sight a tiny amount toward the group, "
        "then shoot an end and check. Change one thing at a time.")),
    _e("group_not_score", ["wide_grouping", "drift_left", "drift_right", "drift_high", "drift_low"],
       ("Tiro per raggruppamento",
        "Per 3 volée ignora il punteggio: l'obiettivo è che le frecce finiscano vicine tra loro, "
        "anche se fuori dal centro."),
       ("Shoot for grouping",
        "For 3 ends, ignore the score: the goal is to land arrows close together, "
        "even if they are off-centre.")),
    _e("pre_shot_routine", ["consistency", "decline", "focus"],
       ("Routine identica per ogni freccia",
        "Scegli una routine fissa (respiro, controllo, trazione, mira, rilascio) e ripetila uguale "
        "per ogni freccia della sessione, senza accorciarla quando sei stanco."),
       ("Same routine every arrow",
        "Pick a fixed routine (breath, check, draw, aim, release) and repeat it identically "
        "for every arrow, without shortening it when tired.")),
    _e("follow_through", ["drift_high", "drift_low", "form", "wide_grouping"],
       ("Mantenere la posizione dopo il rilascio",
        "Dopo ogni freccia resta fermo per 3 secondi, con il braccio dell'arco puntato sul bersaglio. "
        "Muoversi subito spesso sposta la freccia."),
       ("Hold after release",
        "After each arrow, stay still for 3 seconds with your bow arm pointing at the target. "
        "Moving immediately often pulls the arrow off line.")),
    _e("back_tension_band", ["fatigue", "form"],
       ("Elastico per la schiena",
        "Con un elastico fai 3 serie da 8 trazioni lente, concentrandoti sulla schiena e non sul braccio. "
        "Utile a fine giornata o nei giorni senza tiro."),
       ("Back tension band",
        "With a resistance band, do 3 sets of 8 slow draws, focusing on your back rather than your arm. "
        "Good at the end of the day or on non-shooting days.")),
    _e("breathing_reset", ["focus", "decline", "misses"],
       ("Respiro e azzeramento",
        "Prima di ogni freccia fai un respiro lento. Se senti che il tiro non è giusto, "
        "abbassa l'arco e ricomincia invece di forzare."),
       ("Breathing and reset",
        "Take one slow breath before each arrow. If the shot doesn't feel right, "
        "let down and start again instead of forcing it.")),
    _e("move_closer", ["misses", "wide_grouping", "form"],
       ("Avvicinarsi al bersaglio",
        "Riduci la distanza fino a vedere frecce vicine tra loro, tira 3 volée curando la forma, "
        "poi torna alla distanza normale."),
       ("Move closer",
        "Shorten the distance until your arrows group well, shoot 3 ends focusing on form, "
        "then go back to your normal distance.")),
    _e("small_aiming_spot", ["focus", "wide_grouping", "misses"],
       ("Puntino da mirare",
        "Metti un adesivo piccolo al centro e mira solo quello. Un punto preciso aiuta più di una zona generica."),
       ("Small aiming spot",
        "Place a small sticker at the centre and aim only at that. A precise point helps more than a general area.")),
    _e("grip_check", ["drift_left", "drift_right", "drift_high", "drift_low", "form"],
       ("Controllo dell'impugnatura",
        "Controlla che la mano d'arco sia sempre nella stessa posizione e rilassata, senza strizzare il riser. "
        "Fai 3 volée concentrandoti solo su questo."),
       ("Grip check",
        "Make sure your bow hand sits in the same place each time and stays relaxed, without squeezing the riser. "
        "Shoot 3 ends focusing only on that.")),
    _e("miss_recovery", ["misses", "focus"],
       ("Dopo una freccia mancata",
        "Dopo un errore non cambiare nulla: ripeti la routine identica. "
        "Annota il motivo (forma, vento, fretta) e vai avanti."),
       ("After a miss",
        "After a bad arrow, change nothing: repeat the same routine. "
        "Note the cause (form, wind, rushing) and move on.")),
    _e("warmup_set", ["consistency", "decline", "general"],
       ("Riscaldamento strutturato",
        "Inizia con 6-9 frecce a bassa intensità e trazione completa, senza contare i punti, "
        "prima di iniziare a segnare."),
       ("Structured warm-up",
        "Start with 6-9 low-intensity arrows at full draw, without counting points, "
        "before you start scoring.")),
    _e("session_notes", ["general", "consistency"],
       ("Diario della sessione",
        "A fine allenamento scrivi in una riga cosa ha funzionato e una cosa da migliorare. "
        "Rileggila prima della sessione successiva."),
       ("Session log",
        "At the end of practice, write one line on what worked and one thing to improve. "
        "Read it before your next session.")),
]

EXERCISES: dict[str, Exercise] = {e.id: e for e in _LIST}


def title_and_how(ex: Exercise, lang: str) -> tuple[str, str]:
    return ex.en if lang == "en" else ex.it


def catalog_text(lang: str) -> str:
    """Elenco compatto per il prompt: id - titolo."""
    lines = []
    for ex in EXERCISES.values():
        title, _ = title_and_how(ex, lang)
        lines.append(f"- {ex.id}: {title}")
    return "\n".join(lines)