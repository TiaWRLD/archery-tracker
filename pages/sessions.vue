<template>
  <main class="page">
    <NuxtLink to="/" class="back">‹ Home</NuxtLink>
    <h1>Sessioni</h1>

    <ul v-if="items.length" class="list">
      <li v-for="h in items" :key="h.s.id">
        <NuxtLink :to="`/history/${h.s.id}`" class="item">
          <div>
            <strong>{{ fmtDate(h.s.date) }}</strong>
            <span class="muted">{{ h.s.distance }} m, {{ h.arrows }} frecce</span>
          </div>
          <div class="avg">{{ h.arrows ? (h.total / h.arrows).toFixed(2) : '–' }}</div>
        </NuxtLink>
      </li>
    </ul>
    <p v-else-if="loaded" class="muted">Nessuna sessione ancora. Torna alla home e premi Inizia.</p>
  </main>
</template>

<script setup lang="ts">
import type { SessionSummary } from '~/utils/summaries'

const items = ref<SessionSummary[]>([])
const loaded = ref(false)

onMounted(async () => {
  items.value = await loadClosedSummaries()
  loaded.value = true
})
</script>

<style scoped>
h1 { font-size: 2rem; margin: 8px 0 16px; }
.back { display: inline-block; color: var(--muted); text-decoration: none; padding: 8px 0; }
.list { list-style: none; padding: 0; margin: 0; display: grid; gap: 8px; }
.list li { background: var(--panel); border-radius: 12px; }
.item { display: flex; justify-content: space-between; align-items: center; padding: 12px 14px; color: inherit; text-decoration: none; }
.list strong { display: block; }
.avg { font-size: 1.6rem; font-weight: 800; }
.muted { color: var(--muted); font-size: .9rem; }
</style>
