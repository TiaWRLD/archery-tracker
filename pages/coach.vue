<template>
  <main class="page">
    <NuxtLink to="/" class="back">‹ Home</NuxtLink>
    <h1>Coach AI</h1>

    <!-- 1. Scelta della sessione -->
    <section v-if="!selected">
      <p class="muted intro">Scegli la sessione da analizzare.</p>
      <ul v-if="items.length" class="list">
        <li v-for="h in items" :key="h.s.id">
          <button class="item" @click="pick(h)">
            <div>
              <strong>{{ fmtDate(h.s.date) }}</strong>
              <span class="muted">{{ h.s.distance }} m, {{ h.arrows }} frecce</span>
            </div>
            <div class="avg">{{ h.arrows ? (h.total / h.arrows).toFixed(2) : '–' }}</div>
          </button>
        </li>
      </ul>
      <p v-else-if="loaded" class="muted">Nessuna sessione conclusa da analizzare.</p>
    </section>

    <!-- 2. Analisi (segnaposto: qui andranno riassunto JSON, chiamata a Gemma, errore) -->
    <section v-else class="panel">
      <p>
        <strong>{{ fmtDate(selected.s.date) }}</strong>
        <span class="muted"> · {{ selected.s.distance }} m, {{ selected.arrows }} frecce</span>
      </p>
      <pre v-if="payload" class="debug">{{ JSON.stringify(payload, null, 2) }}</pre>
      <button class="other" @click="selected = undefined">Scegli un'altra sessione</button>
    </section>
  </main>
</template>

<script setup lang="ts">
import type {SessionSummary} from '~/utils/summaries'
import {buildCoachSummary, type CoachSummary} from '~/utils/coachSummary'

const route = useRoute()
const items = ref<SessionSummary[]>([])
const selected = ref<SessionSummary>()
const loaded = ref(false)


const payload = ref<CoachSummary>()

async function pick(h: SessionSummary) {
  selected.value = h
  payload.value = undefined
  payload.value = await buildCoachSummary(h)
  // TODO: inviare payload.value al backend locale
}

onMounted(async () => {
  items.value = await loadClosedSummaries()
  loaded.value = true
  // Ingresso diretto dal pulsante "Coach" in /history/[id]: /coach?session=ID
  const wanted = Number(route.query.session)
  const found = wanted ? items.value.find((h) => h.s.id === wanted) : undefined
  if (found) pick(found)
})
</script>

<style scoped>
h1 {
  font-size: 2rem;
  margin: 8px 0 12px;
}

.back {
  display: inline-block;
  color: var(--muted);
  text-decoration: none;
  padding: 8px 0;
}

.intro {
  margin-bottom: 12px;
}

.list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 8px;
}

.list li {
  background: var(--panel);
  border-radius: 12px;
}

.item {
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: center;
  padding: 12px 14px;
  color: inherit;
  text-align: left;
  background: none;
}

.list strong {
  display: block;
}

.avg {
  font-size: 1.6rem;
  font-weight: 800;
}

.muted {
  color: var(--muted);
  font-size: .9rem;
}

.panel {
  background: var(--panel);
  border-radius: 18px;
  padding: 16px;
  display: grid;
  gap: 12px;
}

.other {
  background: var(--bg);
  color: var(--text);
  height: 52px;
  border-radius: 12px;
  font-weight: 700;
}

.debug {
  background: var(--bg);
  border-radius: 12px;
  padding: 12px;
  font-size: .75rem;
  overflow-x: auto;
  white-space: pre-wrap;
}
</style>
