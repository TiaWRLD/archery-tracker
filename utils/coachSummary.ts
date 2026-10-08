import { db, endTotal, points, SCORES, type Arrow, type End } from '~/utils/db'
import { faceOuterCm } from '~/utils/targets'
import { groupOf, hasXY } from '~/utils/stats'
import type { SessionSummary } from '~/utils/summaries'
import { lang } from "~/utils/i18n";


export const MIN_GROUPING_ARROWS = 6
const TREND_TOL = 0.25

const r = (v: number, d = 2) => Number(v.toFixed(d))

function avgOf(ends: End[]): number | null {
    const n = ends.reduce((t, e) => t + e.arrows.length, 0)
    if (!n) return null
    return ends.reduce((t, e) => t + endTotal(e.arrows), 0) / n
}

function delta(later: number | null, earlier: number | null) {
    if (later == null || earlier == null) return null
    const d = later - earlier
    return {
        from: r(earlier),
        to: r(later),
        diff: r(d),
        label: Math.abs(d) < TREND_TOL ? 'stable' : d > 0 ? 'improving' : 'declining',
    }
}

const dir = (v: number, tol: number, neg: string, pos: string) =>
    Math.abs(v) < tol ? 'centered' : v < 0 ? neg : pos

export async function buildCoachSummary(h: SessionSummary, l: 'it' | 'en' = lang.value) {    const s = h.s
    const ends = (await db.ends.where('sessionId').equals(s.id!).toArray()).sort(
        (a, b) => a.index - b.index,
    )
    const all: Arrow[] = ends.flatMap((e) => e.arrows)

    // Distribuzione dei punteggi (solo quelli presenti)
    const distribution: Record<string, number> = {}
    for (const sc of SCORES) {
        const c = all.filter((a) => a.s === sc).length
        if (c) distribution[sc] = c
    }

    // Trend: prima metà contro seconda metà (servono almeno 4 volée)
    const half = Math.floor(ends.length / 2)
    const trend = ends.length >= 4 ? delta(avgOf(ends.slice(half)), avgOf(ends.slice(0, half))) : null

    // Calo di fine sessione: ultime 2 volée contro il resto (servono almeno 5 volée)
    const fatigue =
        ends.length >= 5 ? delta(avgOf(ends.slice(-2)), avgOf(ends.slice(0, -2))) : null

    // Gruppo: solo frecce con coordinate, in cm
    let grouping: Record<string, unknown> | null = null
    const withXY = all.filter(hasXY)
    const g = withXY.length >= MIN_GROUPING_ARROWS && s.face ? groupOf(all) : null
    if (g && s.face) {
        const cm = faceOuterCm(s.face)
        const spread = g.spread * cm
        const dx = g.cx * cm
        const dy = g.cy * cm
        const tol = spread * 0.5
        grouping = {
            arrowsUsed: g.n,
            arrowsTotal: all.length,
            spreadCm: r(spread, 1),
            radiusCm: r(g.radius * cm, 1),
            driftXCm: r(dx, 1),
            driftYCm: r(dy, 1),
            driftX: dir(dx, tol, 'left', 'right'),
            driftY: dir(dy, tol, 'low', 'high'),
        }
    }

    return {
        lang,
        session: {
            date: new Date(s.date).toISOString().slice(0, 10),
            distanceM: s.distance,
            arrowsPerEnd: s.arrowsPerEnd,
            face: s.face ?? null,
            bow: s.bow ?? null,
            feeling: s.feeling ?? null, // scala come salvata nell'app
            note: s.note?.trim().slice(0,300) || null, //300 caratteri se no appesantisce troppo l'ai (potevo comprare un macbook più potente)
        },
        totals: {
            points: h.total,
            arrows: h.arrows,
            avgPerArrow: h.arrows ? r(h.total / h.arrows) : null,
            misses: all.filter((a) => points(a.s) === 0).length,
            distribution,
        },
        ends: ends.map((e) => ({
            points: endTotal(e.arrows),
            avg: e.arrows.length ? r(endTotal(e.arrows) / e.arrows.length) : null,
        })),
        trend,
        fatigue,
        grouping,
    }
}

export type CoachSummary = Awaited<ReturnType<typeof buildCoachSummary>>