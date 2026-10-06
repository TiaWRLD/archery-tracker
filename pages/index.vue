<template>
  <main class="page">
    <h1>Allenamento</h1>

    <NuxtLink v-if="open" :to="`/session/${open.id}`" class="resume">
      Riprendi la sessione a {{ open.distance }} m
    </NuxtLink>

    <section class="setup">
      <div class="row">
        <label for="dist">Distanza (m)</label>
        <div class="stepper">
          <button @click="distance = Math.max(5, distance - 5)" aria-label="Meno 5 metri">−</button>
          <input id="dist" v-model.number="distance" type="number" inputmode="numeric" />
          <button @click="distance += 5" aria-label="Più 5 metri">+</button>
        </div>
      </div>
      <div class="row">
        <span>Frecce per volée</span>
        <div class="seg">
          <button :class="{ on: perEnd === 3 }" @click="perEnd = 3">3</button>
          <button :class="{ on: perEnd === 6 }" @click="perEnd = 6">6</button>
        </div>
      </div>
      <button class="start" @click="start">Inizia</button>
    </section>

    <section v-if="history.length">
      <h2>Ultime sessioni</h2>
      <ul class="list">
        <li v-for="h in history" :key="h.s.id">
          <NuxtLink :to="`/history/${h.s.id}`" class="item">
            <div>
              <strong>{{ fmtDate(h.s.date) }}</strong>
              <span class="muted">{{ h.s.distance }} m, {{ h.arrows }} frecce</span>
            </div>
            <div class="avg">{{ h.arrows ? (h.total / h.arrows).toFixed(2) : '–' }}</div>
          </NuxtLink>
        </li>
      </ul>
    </section>
    <p v-else class="muted">Nessuna sessione ancora. Premi Inizia per registrare la prima.</p>
  </main>
</template>

<script setup lang="ts">
import { db, endTotal, type Session } from '~/utils/db'

const distance = ref(18)
const perEnd = ref<3 | 6>(6)
const open = ref<Session>()
const history = ref<{ s: Session; total: number; arrows: number }[]>([])

onMounted(async () => {
  const sessions = await db.sessions.orderBy('date').reverse().limit(20).toArray()
  if (sessions[0]) {
    distance.value = sessions[0].distance // precompilato dall'ultima volta
    perEnd.value = sessions[0].arrowsPerEnd
  }
  open.value = sessions.find((s) => !s.closed)
  history.value = await Promise.all(
    sessions.filter((s) => s.closed).map(async (s) => {
      const ends = await db.ends.where('sessionId').equals(s.id!).toArray()
      return {
        s,
        total: ends.reduce((t, e) => t + endTotal(e.arrows), 0),
        arrows: ends.reduce((n, e) => n + e.arrows.length, 0),
      }
    }),
  )
})

async function start() {
  const id = await db.sessions.add({ date: Date.now(), distance: distance.value, arrowsPerEnd: perEnd.value })
  navigateTo(`/session/${id}`)
}

const fmtDate = (t: number) => new Date(t).toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'short' })
</script>

<style scoped>
h1 { font-size: 2rem; margin-bottom: 16px; }
h2 { font-size: 1.1rem; margin: 28px 0 8px; }
.resume { display: block; background: var(--gold); color: var(--black); font-weight: 700; padding: 16px; border-radius: 14px; text-align: center; text-decoration: none; margin-bottom: 16px; }
.setup { background: var(--panel); border-radius: 18px; padding: 16px; display: grid; gap: 16px; }
.row { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
.stepper { display: flex; align-items: center; gap: 6px; }
.stepper button, .seg button { background: var(--bg); width: 52px; height: 52px; border-radius: 12px; font-size: 1.4rem; }
.stepper input { width: 64px; height: 52px; text-align: center; font-size: 1.3rem; background: transparent; color: var(--text); border: 2px solid var(--bg); border-radius: 12px; }
.seg { display: flex; gap: 6px; }
.seg .on { background: var(--text); color: var(--bg); font-weight: 700; }
.start { background: var(--gold); color: var(--black); font-weight: 800; font-size: 1.4rem; height: 72px; border-radius: 16px; }
.list { list-style: none; padding: 0; margin: 0; display: grid; gap: 8px; }
.list li { background: var(--panel); border-radius: 12px; }
.item { display: flex; justify-content: space-between; align-items: center; padding: 12px 14px; color: inherit; text-decoration: none; }
.list strong { display: block; }
.avg { font-size: 1.6rem; font-weight: 800; }
.muted { color: var(--muted); font-size: .9rem; }
</style>
