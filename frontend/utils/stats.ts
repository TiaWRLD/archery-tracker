import type { Arrow } from './db'

export const hasXY = (a: Arrow) => a.x != null && a.y != null

export interface Group {
  n: number
  /** centro del gruppo, unità normalizzate (x positivo = destra, y positivo = alto) */
  cx: number
  cy: number
  /** distanza media delle frecce dal centro del gruppo */
  spread: number
  /** distanza della freccia più lontana dal centro: raggio del cerchio che le contiene tutte */
  radius: number
}

/** Centro e dispersione del gruppo. null se nessuna freccia ha coordinate. */
export function groupOf(arrows: Arrow[]): Group | null {
  const pts = arrows.filter(hasXY)
  const n = pts.length
  if (!n) return null
  const cx = pts.reduce((t, a) => t + a.x!, 0) / n
  const cy = pts.reduce((t, a) => t + a.y!, 0) / n
  const d = pts.map((a) => Math.hypot(a.x! - cx, a.y! - cy))
  return { n, cx, cy, spread: d.reduce((t, v) => t + v, 0) / n, radius: Math.max(...d) }
}

/** Colore della volée i-esima su n: rampa di tonalità, chiara per leggere sopra qualsiasi zona. */
export function endColor(i: number, n: number): string {
  if (n < 2) return '#ffffff'
  return `hsl(${Math.round((300 * i) / (n - 1))} 90% 62%)`
}
