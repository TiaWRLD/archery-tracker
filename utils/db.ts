import Dexie, { type Table } from 'dexie'
import type { FaceId } from '../../../Downloads/targets'

export const SCORES = ['X', '10', '9', '8', '7', '6', '5', '4', '3', '2', '1', 'M'] as const
export type Score = (typeof SCORES)[number]

// x e y (opzionali) solo per le frecce inserite in modalità precisa.
// Posizione dell'impatto dal centro del bersaglio: 1 = bordo esterno della zona più esterna
// della faccia (vedi Session.face e utils/targets.ts). x positivo = destra, y positivo = alto.
// I mancati possono arrivare fino a ±1.2.
export interface Arrow { s: Score; x?: number; y?: number }

export interface Session {
  id?: number
  date: number
  distance: number
  arrowsPerEnd: 3 | 6
  bow?: string
  feeling?: number
  note?: string
  closed?: boolean
  face?: FaceId // non indicizzato: nessun bump di versione Dexie
}

export interface End { sessionId: number; index: number; arrows: Arrow[] }

class AppDb extends Dexie {
  sessions!: Table<Session, number>
  ends!: Table<End, [number, number]>
  constructor() {
    super('archery')
    this.version(1).stores({
      sessions: '++id, date',
      ends: '[sessionId+index], sessionId', // chiave composta: put() è idempotente
    })
  }
}

export const db = new AppDb()

export const points = (s: Score) => (s === 'X' ? 10 : s === 'M' ? 0 : Number(s))
export const endTotal = (arrows: Arrow[]) => arrows.reduce((t, a) => t + points(a.s), 0)
