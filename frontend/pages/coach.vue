<template>
  <main class="page">
    <NuxtLink to="/" class="back">{{ t('nav.home') }}</NuxtLink>
    <h1>{{ t('c.title') }}</h1>

    <section v-if="!selected">
      <p class="muted intro">{{ t('c.pick') }}</p>
      <ul v-if="items.length" class="list">
        <li v-for="h in items" :key="h.s.id">
          <button class="item" @click="pick(h)">
            <div>
              <strong>{{ fmtDate(h.s.date) }}</strong>
              <span class="muted">{{ h.s.distance }} m, {{ h.arrows }} {{ t('common.arrows') }}</span>
            </div>
            <div class="avg">{{ h.arrows ? fmtN(h.total / h.arrows, 2) : '–' }}</div>
          </button>
        </li>
      </ul>
      <p v-else-if="loaded" class="muted">{{ t('c.empty') }}</p>
    </section>

    <section v-else class="panel">
      <p>
        <strong>{{ fmtDate(selected.s.date) }}</strong>
        <span class="muted"> · {{ selected.s.distance }} m, {{ selected.arrows }} {{ t('common.arrows') }}</span>
      </p>

      <p v-if="status === 'loading'" class="loading" role="status">
        <span class="spinner" aria-hidden="true"></span>
        {{ t('c.loading') }}
      </p>

      <div v-else-if="status === 'error'" class="error" role="alert">
        <p>{{ errorMsg }}</p>
        <p class="muted">{{ t('c.stillUsable') }}</p>
        <div class="row">
          <button class="retry" @click="ask">{{ t('c.retry') }}</button>
          <button class="ghost" @click="showSettings = true">{{ t('c.settingsShort') }}</button>
        </div>
      </div>

      <template v-else-if="result">
        <p class="comment">{{ result.comment }}</p>
        <h2>{{ t('c.exercises') }}</h2>
        <article v-for="ex in result.exercises" :key="ex.id" class="exercise">
          <h3>{{ ex.title }}</h3>
          <p>{{ ex.how }}</p>
        </article>
      </template>

      <button class="other" @click="back">{{ t('c.other') }}</button>
    </section>

    <section class="settings">
      <button class="ghost" @click="showSettings = !showSettings">
        {{ showSettings ? t('c.settingsClose') : t('c.settingsOpen') }}
      </button>
      <div v-if="showSettings" class="panel">
        <label for="backend-url">{{ t('c.urlLabel') }}</label>
        <input
            id="backend-url"
            v-model="urlDraft"
            type="url"
            inputmode="url"
            autocapitalize="off"
            autocorrect="off"
            spellcheck="false"
            :placeholder="DEFAULT_URL || 'https://…'"
        />
        <p v-if="urlError" class="field-error">{{ urlError }}</p>
        <div class="row">
          <button class="retry" @click="saveUrl">{{ t('c.save') }}</button>
          <button class="other small" :disabled="testing" @click="testUrl">
            {{ testing ? t('c.testing') : t('c.test') }}
          </button>
        </div>
        <p v-if="testMsg" class="muted" role="status">{{ testMsg }}</p>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import type { SessionSummary } from '~/utils/summaries'
import { buildCoachSummary, type CoachSummary } from '~/utils/coachSummary'
import { useT } from '~/utils/i18n'

const { t, lang, fmtDate, fmtN } = useT()

const URL_KEY = 'coachBackendUrl'
const cfg = useRuntimeConfig().public
const DEFAULT_URL = String(cfg.coachBackendUrl ?? '').trim().replace(/\/+$/, '')
const TIMEOUT_MS = Number(cfg.coachTimeoutMs) || 60000

interface CoachExercise { id: string; title: string; how: string }
interface CoachResult { comment: string; exercises: CoachExercise[] }

const route = useRoute()
const items = ref<SessionSummary[]>([])
const selected = ref<SessionSummary>()
const loaded = ref(false)
const payload = ref<CoachSummary>()

const status = ref<'idle' | 'loading' | 'done' | 'error'>('idle')
const errorMsg = ref('')
const result = ref<CoachResult>()

const backendUrl = ref(DEFAULT_URL)
const urlDraft = ref(DEFAULT_URL)
const urlError = ref('')
const showSettings = ref(false)
const testing = ref(false)
const testMsg = ref('')

let ctrl: AbortController | undefined
let seq = 0 // scarta le risposte di richieste superate

function cleanUrl(raw: string) {
  return raw.trim().replace(/\/+$/, '')
}

function readStoredUrl() {
  try {
    const v = localStorage.getItem(URL_KEY)
    if (v) backendUrl.value = urlDraft.value = v
  } catch { /* storage non disponibile: resta il valore predefinito */ }
}

function saveUrl() {
  const v = cleanUrl(urlDraft.value)
  if (!v) {
    try { localStorage.removeItem(URL_KEY) } catch { /* ignora */ }
    backendUrl.value = urlDraft.value = DEFAULT_URL
    urlError.value = ''
    testMsg.value = t('c.urlReset')
    return
  }
  if (!/^https?:\/\/.+/i.test(v)) {
    urlError.value = t('c.urlBad')
    return
  }
  urlError.value = ''
  backendUrl.value = urlDraft.value = v
  try { localStorage.setItem(URL_KEY, v) } catch { /* ignora */ }
  testMsg.value = t('c.urlSaved')
}

async function testUrl() {
  const v = cleanUrl(urlDraft.value) || DEFAULT_URL
  if (!/^https?:\/\/.+/i.test(v)) {
    urlError.value = t('c.urlBad')
    return
  }
  urlError.value = ''
  testing.value = true
  testMsg.value = ''
  try {
    const res = await fetch(`${v}/health`, { signal: AbortSignal.timeout(5000) })
    if (!res.ok) throw new Error(String(res.status))
    const data = await res.json()
    testMsg.value = data?.model ? t('c.connectedModel', { m: data.model }) : t('c.connected')
  } catch {
    testMsg.value = t('c.unreachable')
  } finally {
    testing.value = false
  }
}

class HttpError extends Error {
  constructor(public code: number) { super(String(code)) }
}

function messageFor(e: unknown, timedOut: boolean) {
  if (timedOut) return t('c.timeout', { s: Math.round(TIMEOUT_MS / 1000) })
  if (e instanceof HttpError) {
    if (e.code === 503) return t('c.e503')
    if (e.code === 502) return t('c.e502')
    if (e.code === 422) return t('c.e422')
    return t('c.eOther', { c: e.code })
  }
  return t('c.eNet')
}

function isResult(d: any): d is CoachResult {
  return d && typeof d.comment === 'string' && Array.isArray(d.exercises)
}

async function ask() {
  if (!payload.value) return
  if (!backendUrl.value) {
    errorMsg.value = t('c.noUrl')
    status.value = 'error'
    return
  }
  ctrl?.abort()
  const mine = ++seq
  const c = (ctrl = new AbortController())
  let timedOut = false
  const timer = setTimeout(() => { timedOut = true; c.abort() }, TIMEOUT_MS)

  status.value = 'loading'
  result.value = undefined
  errorMsg.value = ''
  try {
    const res = await fetch(`${backendUrl.value}/coach`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload.value),
      signal: c.signal,
    })
    if (!res.ok) throw new HttpError(res.status)
    const data = await res.json()
    if (mine !== seq) return
    if (!isResult(data)) throw new HttpError(502)
    result.value = data
    status.value = 'done'
  } catch (e) {
    if (mine !== seq) return
    errorMsg.value = messageFor(e, timedOut)
    status.value = 'error'
  } finally {
    clearTimeout(timer)
  }
}

async function pick(h: SessionSummary) {
  selected.value = h
  payload.value = undefined
  result.value = undefined
  status.value = 'loading'
  const p = await buildCoachSummary(h, lang.value) // il coach risponde nella lingua scelta
  if (selected.value !== h) return
  payload.value = p
  await ask()
}

function back() {
  seq++
  ctrl?.abort()
  selected.value = undefined
  payload.value = undefined
  result.value = undefined
  status.value = 'idle'
}

onMounted(async () => {
  readStoredUrl()
  items.value = await loadClosedSummaries()
  loaded.value = true
  const wanted = Number(route.query.session)
  const found = wanted ? items.value.find((h) => h.s.id === wanted) : undefined
  if (found) pick(found)
})

onBeforeUnmount(() => {
  seq++
  ctrl?.abort()
})
</script>

<style scoped>
h1 { font-size: 2rem; margin: 8px 0 12px; }
h2 { font-size: 1.1rem; margin: 8px 0 0; }
h3 { font-size: 1rem; margin: 0 0 4px; }
.back { display: inline-block; color: var(--muted); text-decoration: none; padding: 8px 0; }
.intro { margin-bottom: 12px; }

.list { list-style: none; padding: 0; margin: 0; display: grid; gap: 8px; }
.list li { background: var(--panel); border-radius: 12px; }
.item { display: flex; width: 100%; justify-content: space-between; align-items: center; padding: 12px 14px; color: inherit; text-align: left; background: none; }
.list strong { display: block; }
.avg { font-size: 1.6rem; font-weight: 800; }
.muted { color: var(--muted); font-size: .9rem; }

.panel { background: var(--panel); border-radius: 18px; padding: 16px; display: grid; gap: 12px; }

.loading { display: flex; align-items: center; gap: 10px; color: var(--muted); margin: 0; }
.spinner { width: 18px; height: 18px; border-radius: 50%; border: 3px solid var(--muted); border-top-color: var(--gold); animation: spin .9s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) { .spinner { animation-duration: 3s; } }

.comment { margin: 0; line-height: 1.5; }
.exercise { background: var(--bg); border-radius: 12px; padding: 12px; }
.exercise p { margin: 0; line-height: 1.45; }

.error { background: var(--bg); border: 2px solid var(--red); border-radius: 12px; padding: 12px; display: grid; gap: 8px; }
.error p { margin: 0; }
.row { display: flex; gap: 8px; align-items: center; }

.other { background: var(--bg); color: var(--text); height: 52px; border-radius: 12px; font-weight: 700; }
.other.small { height: 44px; padding: 0 14px; }
.retry { background: var(--gold); color: var(--bg); height: 44px; padding: 0 18px; border-radius: 12px; font-weight: 800; }
.ghost { background: transparent; color: var(--muted); padding: 12px 8px; font-size: 1rem; }

.settings { margin-top: 20px; display: grid; gap: 8px; }
label { font-weight: 700; font-size: .9rem; }
input { height: 48px; border-radius: 12px; border: 2px solid var(--muted); background: var(--bg); color: var(--text); padding: 0 12px; font-size: 1rem; width: 100%; box-sizing: border-box; }
.field-error { color: var(--red); margin: 0; font-size: .9rem; }
</style>