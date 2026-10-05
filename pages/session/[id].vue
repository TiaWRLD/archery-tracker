<template>
  <main v-if="session" class="wrap">
    <header>
      <button class="ghost" @click="finishing = true">Fine</button>
      <div class="totals">
        <strong>{{ total }}</strong>
        <span>{{ arrowCount }} frecce, media {{ arrowCount ? (total / arrowCount).toFixed(2) : '–' }}</span>
      </div>
    </header>

    <!-- modalità di inserimento -->
    <div class="mode">
      <div class="seg">
        <button :class="{ on: mode === 'fast' }" @click="setMode('fast')">Rapida</button>
        <button :class="{ on: mode === 'precise' }" @click="setMode('precise')">Precisa</button>
      </div>
      <select
        v-if="mode === 'precise'"
        v-model="face"
        :disabled="faceLocked"
        aria-label="Faccia del bersaglio"
        @change="saveFace"
      >
        <option v-for="f in faceIds" :key="f" :value="f">{{ FACES[f].label }}</option>
      </select>
    </div>

    <!-- volée in corso -->
    <section class="current" aria-live="polite">
      <div v-for="i in session.arrowsPerEnd" :key="i" class="slot" :class="cls(currentArrows[i - 1]?.s)">
        {{ currentArrows[i - 1]?.s ?? '' }}
      </div>
      <div class="sum">{{ endTotal(currentArrows) }}</div>
    </section>

    <!-- volée precedenti -->
    <section class="past">
      <div v-for="e in pastEnds" :key="e.index" class="pastEnd">
        <span class="n">{{ e.index + 1 }}</span>
        <span class="arrows">
          <i v-for="(a, k) in sorted(e.arrows)" :key="k" class="dot" :class="cls(a.s)">{{ a.s }}</i>
        </span>
        <b>{{ endTotal(e.arrows) }}</b>
      </div>
    </section>

    <!-- tastiera -->
    <section v-if="mode === 'fast'" class="pad">
      <button v-for="s in SCORES" :key="s" class="key" :class="cls(s)" @click="tap(s)">{{ s }}</button>
    </section>

    <!-- bersaglio -->
    <TargetFace v-else :face="face" :marks="currentArrows" :ghosts="ghosts" @shot="onShot" />

    <button class="undo" @click="undo" :disabled="!ends.length">Annulla ultima freccia</button>

    <!-- chiusura -->
    <div v-if="finishing" class="overlay">
      <div class="sheet">
        <h2>{{ arrowCount ? 'Com’è andata?' : 'Nessuna freccia registrata' }}</h2>
        <template v-if="arrowCount">
          <div class="faces">
            <button v-for="n in 5" :key="n" :class="{ on: feeling === n }" @click="feeling = n">{{ n }}</button>
          </div>
          <textarea v-model="note" rows="2" placeholder="Nota veloce (facoltativa)" />
          <button class="save" @click="close">Salva sessione</button>
        </template>
        <button v-else class="save" @click="discard">Elimina sessione</button>
        <button class="ghost" @click="finishing = false">Continua a tirare</button>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { db, points, endTotal, SCORES, type Arrow, type End, type Score, type Session } from '~/utils/db'
import { FACES, defaultFace, type FaceId } from '~/utils/targets'

const id = Number(useRoute().params.id)
const session = ref<Session>()
const ends = ref<End[]>([])
const finishing = ref(false)
const feeling = ref(0)
const note = ref('')
const mode = ref<'fast' | 'precise'>('fast')
const face = ref<FaceId>('122')
const faceIds = Object.keys(FACES) as FaceId[]
let lock: WakeLockSentinel | undefined

const perEnd = computed(() => session.value?.arrowsPerEnd ?? 6)
const last = computed(() => ends.value.at(-1))
const currentIsOpen = computed(() => !!last.value && last.value.arrows.length < perEnd.value)
const currentArrows = computed<Arrow[]>(() => (currentIsOpen.value ? last.value!.arrows : []))
const doneEnds = computed(() => (currentIsOpen.value ? ends.value.slice(0, -1) : ends.value))
const pastEnds = computed(() => [...doneEnds.value].reverse())
const ghosts = computed(() => doneEnds.value.flatMap((e) => e.arrows))
const total = computed(() => ends.value.reduce((t, e) => t + endTotal(e.arrows), 0))
const arrowCount = computed(() => ends.value.reduce((n, e) => n + e.arrows.length, 0))
// dopo la prima freccia con coordinate la faccia non si cambia più: x, y sono normalizzati su di essa
const faceLocked = computed(() => ends.value.some((e) => e.arrows.some((a) => a.x != null)))

onMounted(async () => {
  session.value = await db.sessions.get(id)
  if (!session.value) return navigateTo('/')
  face.value = session.value.face ?? defaultFace(session.value.distance)
  mode.value = session.value.face ? 'precise' : 'fast'
  ends.value = await db.ends.where('sessionId').equals(id).sortBy('index')
  try { lock = await navigator.wakeLock?.request('screen') } catch { /* non supportato */ }
})
onBeforeUnmount(() => lock?.release())

async function saveFace() {
  await db.sessions.update(id, { face: face.value })
  if (session.value) session.value.face = face.value
}
async function setMode(m: 'fast' | 'precise') {
  mode.value = m
  if (m === 'precise' && !session.value?.face) await saveFace()
}

// salva subito ogni modifica: se l'app si chiude non si perde nulla
const save = (e: End) =>
  db.ends.put({ sessionId: e.sessionId, index: e.index, arrows: e.arrows.map((a) => ({ ...a })) })

function tap(s: Score, x?: number, y?: number) {
  navigator.vibrate?.(10)
  let e = last.value
  if (!e || e.arrows.length >= perEnd.value) {
    ends.value.push({ sessionId: id, index: ends.value.length, arrows: [] })
    e = ends.value[ends.value.length - 1] // versione reattiva
  }
  e.arrows.push(x == null || y == null ? { s } : { s, x, y })
  save(e)
}
const onShot = (h: { s: Score; x: number; y: number }) => tap(h.s, h.x, h.y)

function undo() {
  const e = last.value
  if (!e) return
  navigator.vibrate?.(30)
  e.arrows.pop()
  if (e.arrows.length) save(e)
  else {
    ends.value.pop()
    db.ends.delete([e.sessionId, e.index])
  }
}

async function close() {
  await db.sessions.update(id, { feeling: feeling.value || undefined, note: note.value || undefined, closed: true })
  navigateTo('/')
}
async function discard() {
  await db.sessions.delete(id)
  navigateTo('/')
}

const sorted = (a: Arrow[]) => [...a].sort((x, y) => points(y.s) - points(x.s) || (x.s === 'X' ? -1 : 1))
const cls = (s?: Score) => (s ? `s-${s}` : 'empty')
</script>

<style scoped>
.wrap { max-width: 480px; margin: 0 auto; height: 100dvh; display: flex; flex-direction: column; padding: 10px 12px 12px; gap: 10px; }
header { display: flex; justify-content: space-between; align-items: center; }
.totals { text-align: right; line-height: 1.1; }
.totals strong { font-size: 2.4rem; display: block; }
.totals span { color: var(--muted); font-size: .85rem; }
.ghost { background: transparent; color: var(--muted); padding: 12px 8px; font-size: 1rem; }

.mode { display: flex; gap: 8px; align-items: center; }
.seg { display: flex; background: var(--panel); border-radius: 12px; padding: 3px; }
.seg button { padding: 10px 14px; border-radius: 10px; background: transparent; color: var(--muted); font-weight: 700; }
.seg button.on { background: var(--text); color: var(--bg); }
.mode select { flex: 1; min-width: 0; background: var(--panel); color: var(--text); border: 0; border-radius: 12px; padding: 12px; font: inherit; }
.mode select:disabled { opacity: .5; }

.current { display: flex; gap: 6px; align-items: center; }
.slot { flex: 1; aspect-ratio: 1; max-height: 64px; border-radius: 50%; display: grid; place-items: center; font-weight: 800; font-size: 1.3rem; }
.slot.empty { border: 2px dashed var(--miss); }
.sum { min-width: 48px; text-align: right; font-size: 1.6rem; font-weight: 800; }

.past { flex: 1; min-height: 0; overflow-y: auto; display: grid; align-content: start; gap: 6px; }
.pastEnd { display: flex; align-items: center; gap: 10px; background: var(--panel); padding: 6px 10px; border-radius: 10px; }
.n { color: var(--muted); width: 1.5em; }
.arrows { flex: 1; display: flex; gap: 4px; }
.dot { font-style: normal; width: 28px; height: 28px; border-radius: 50%; display: grid; place-items: center; font-size: .8rem; font-weight: 700; }
.pastEnd b { font-size: 1.2rem; }

.pad { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
.key { height: 76px; border-radius: 16px; font-size: 1.7rem; font-weight: 800; }
.key:active { transform: scale(.94); }
.undo { background: var(--panel); height: 52px; border-radius: 14px; color: var(--muted); }
.undo:disabled { opacity: .4; }

/* colori della faccia del bersaglio */
.s-X, .s-10, .s-9 { background: var(--gold); color: var(--black); }
.s-8, .s-7 { background: var(--red); color: #fff; }
.s-6, .s-5 { background: var(--blue); color: #fff; }
.s-4, .s-3 { background: var(--black); color: #fff; }
.s-2, .s-1 { background: var(--white); color: var(--black); }
.s-M { background: var(--miss); color: #fff; }

.overlay { position: fixed; inset: 0; background: rgba(0,0,0,.6); display: grid; align-items: end; }
.sheet { background: var(--panel); border-radius: 22px 22px 0 0; padding: 20px 16px calc(20px + env(safe-area-inset-bottom)); display: grid; gap: 14px; max-width: 480px; width: 100%; margin: 0 auto; }
.faces { display: flex; gap: 8px; }
.faces button { flex: 1; height: 56px; border-radius: 12px; background: var(--bg); font-size: 1.3rem; font-weight: 700; }
.faces .on { background: var(--text); color: var(--bg); }
textarea { width: 100%; background: var(--bg); color: var(--text); border: 0; border-radius: 12px; padding: 12px; font: inherit; resize: none; }
.save { background: var(--gold); color: var(--black); font-weight: 800; font-size: 1.2rem; height: 60px; border-radius: 14px; }
</style>
