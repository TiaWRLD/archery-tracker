import Dexie, { type Table } from 'dexie'

export const SCORES = ['X', '10', '9', '8', '7', '6', '5', '4', '3', '2', '1', 'M'] as const
export type Score = (typeof SCORES)[number]

// x e y (opzionali, -1..1 dal centro) serviranno per il bersaglio toccabile
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
