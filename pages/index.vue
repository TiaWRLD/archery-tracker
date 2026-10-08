<template>
  <main class="page home">
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

    <nav class="big" aria-label="Sezioni">
      <NuxtLink to="/sessions" class="tile">Sessioni</NuxtLink>
      <NuxtLink to="/coach" class="tile">Coach AI</NuxtLink>
    </nav>
  </main>
</template>

<script setup lang="ts">
import { db, type Session } from '~/utils/db'

const distance = ref(18)
const perEnd = ref<3 | 6>(6)
const open = ref<Session>()

onMounted(async () => {
  const last = await db.sessions.orderBy('date').reverse().limit(20).toArray()
  if (last[0]) {
    distance.value = last[0].distance // precompilato dall'ultima volta
    perEnd.value = last[0].arrowsPerEnd
  }
  open.value = last.find((s) => !s.closed)
})

async function start() {
  const id = await db.sessions.add({ date: Date.now(), distance: distance.value, arrowsPerEnd: perEnd.value })
  navigateTo(`/session/${id}`)
}
</script>

<style scoped>
/* Colonna a tutta altezza: setup in alto, i due tasti si prendono lo spazio rimasto */
.home { display: flex; flex-direction: column; min-height: 100dvh; box-sizing: border-box; }
h1 { font-size: 2rem; margin-bottom: 16px; }
.resume { display: block; background: var(--gold); color: var(--black); font-weight: 700; padding: 16px; border-radius: 14px; text-align: center; text-decoration: none; margin-bottom: 16px; }
.setup { background: var(--panel); border-radius: 18px; padding: 16px; display: grid; gap: 16px; }
.row { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
.stepper { display: flex; align-items: center; gap: 6px; }
.stepper button, .seg button { background: var(--bg); width: 52px; height: 52px; border-radius: 12px; font-size: 1.4rem; }
.stepper input { width: 64px; height: 52px; text-align: center; font-size: 1.3rem; background: transparent; color: var(--text); border: 2px solid var(--bg); border-radius: 12px; }
.seg { display: flex; gap: 6px; }
.seg .on { background: var(--text); color: var(--bg); font-weight: 700; }
.start { background: var(--gold); color: var(--black); font-weight: 800; font-size: 1.4rem; height: 72px; border-radius: 16px; }

.big { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: auto; padding-top: 16px; }
.tile { display: flex; align-items: center; justify-content: center; text-align: center; height: 80px; background: var(--gold); color: var(--black); font-size: 1.3rem; font-weight: 800; border-radius: 16px; text-decoration: none; padding: 0 12px; }
.tile:active { filter: brightness(.85); }
.tile:focus-visible { outline: 3px solid var(--gold); }
</style>