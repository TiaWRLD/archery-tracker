import { points, type Score } from './db'

/**
 * Facce supportate. Misure da regolamento World Archery (Book 3):
 * le 10 zone hanno larghezza uguale (6,1 cm sulla 122, 4 cm sulla 80, 2 cm sulla 40)
 * e il diametro dell'X (10 interno) è uguale alla larghezza di una zona.
 *
 * ringCm  = larghezza di una zona in cm
 * lowest  = anello più esterno stampato sulla faccia (1 = faccia intera)
 */
export type FaceId = '122' | '80' | '80-6' | '40' | '40-6'

export interface Face { label: string; ringCm: number; lowest: number }

export const FACES: Record<FaceId, Face> = {
  '122':  { label: '122 cm',             ringCm: 6.1, lowest: 1 },
  '80':   { label: '80 cm',              ringCm: 4,   lowest: 1 },
  '80-6': { label: '80 cm, anelli 5-10', ringCm: 4,   lowest: 5 },
  '40':   { label: '40 cm',              ringCm: 2,   lowest: 1 },
  '40-6': { label: '40 cm triplo, 6-10', ringCm: 2,   lowest: 6 },
}

/** Solo una preselezione comoda: la faccia resta sempre modificabile. */
export const defaultFace = (distance: number): FaceId =>
  distance <= 25 ? '40' : distance >= 50 ? '122' : '80'

/**
 * Raggio approssimato dell'asta in cm. Una freccia che sfiora la linea
 * prende il punteggio più alto, quindi si valuta il bordo interno dell'asta.
 * Passa 0 a scoreAt per usare solo il centro del punto toccato.
 */
export const ARROW_CM = 0.25

/** Numero di zone stampate: 10 sulla faccia intera, 5 sulla 40 triplo, 6 sulla 80 a 6 anelli. */
export const faceSpan = (id: FaceId) => 11 - FACES[id].lowest

/** Raggio della zona più esterna stampata, in cm (serve per convertire x, y in centimetri). */
export const faceOuterCm = (id: FaceId) => faceSpan(id) * FACES[id].ringCm

/**
 * x, y: coordinate normalizzate dove 1 = bordo esterno della zona più esterna della faccia.
 * Il segno non conta per il punteggio, conta solo la distanza dal centro.
 */
export function scoreAt(id: FaceId, x: number, y: number, arrowCm = ARROW_CM): Score {
  const f = FACES[id]
  // distanza dal centro in "larghezze di zona", meno il raggio dell'asta
  const r = Math.hypot(x, y) * faceSpan(id) - arrowCm / f.ringCm
  if (r <= 0.5) return 'X'
  const n = 11 - Math.ceil(r)
  return n < f.lowest ? 'M' : (String(n) as Score)
}

export const ringFill = (n: number) =>
  n >= 9 ? 'var(--gold, #f2c230)'
  : n >= 7 ? 'var(--red, #d9412f)'
  : n >= 5 ? 'var(--blue, #2f7fc1)'
  : n >= 3 ? 'var(--black, #15171a)'
  : 'var(--white, #f5f5f0)'

/** Cerchi da disegnare, dal più esterno al più interno (raggi normalizzati). */
export function ringGeometry(id: FaceId) {
  const span = faceSpan(id)
  const rings: { n: number; r: number; fill: string; line: string }[] = []
  for (let n = FACES[id].lowest; n <= 10; n++) {
    rings.push({
      n,
      r: (11 - n) / span,
      fill: ringFill(n),
      // la linea tra 3 e 4 sta dentro il nero, quindi è bianca
      line: n === 4 ? '#f5f5f0' : '#15171a',
    })
  }
  return { span, rings, xr: 0.5 / span, xFill: ringFill(10) }
}

/** Colori della pastiglia con il punteggio, coerenti con le classi .s-* della pagina. */
export function scoreStyle(s: Score) {
  if (s === 'M') return { background: 'var(--miss, #55645b)', color: '#fff' }
  const n = points(s)
  return { background: ringFill(n), color: n >= 9 || n <= 2 ? '#15171a' : '#fff' }
}
