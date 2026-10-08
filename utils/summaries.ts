import { db, endTotal, type Session } from '~/utils/db'

export interface SessionSummary {
  s: Session
  total: number
  arrows: number
}

/** Sessioni chiuse, dalla più recente, con totale e numero di frecce. */
export async function loadClosedSummaries(limit = 50): Promise<SessionSummary[]> {
  const sessions = await db.sessions.orderBy('date').reverse().toArray()
  const closed = sessions.filter((s) => s.closed).slice(0, limit)
  return Promise.all(
    closed.map(async (s) => {
      const ends = await db.ends.where('sessionId').equals(s.id!).toArray()
      return {
        s,
        total: ends.reduce((t, e) => t + endTotal(e.arrows), 0),
        arrows: ends.reduce((n, e) => n + e.arrows.length, 0),
      }
    }),
  )
}

// Quando arriverà l'i18n, la lingua verrà passata da fuori al posto di 'it-IT'.
export const fmtDate = (t: number) =>
  new Date(t).toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'short' })
