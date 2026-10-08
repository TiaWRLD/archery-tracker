<template>
  <div class="tf">
    <!-- lente: sopra il bersaglio, mai sotto il dito -->
    <div v-if="aim" class="loupe" aria-hidden="true">
      <svg :viewBox="loupeBox">
        <rect x="-3" y="-3" width="6" height="6" class="bg" />
        <use :href="`#${uid}-art`" />
      </svg>
      <i class="aim" />
      <b v-if="aimScore" class="badge" :style="scoreStyle(aimScore)">{{ aimScore }}</b>
    </div>

    <svg
      ref="svg"
      class="face"
      viewBox="-1.2 -1.2 2.4 2.4"
      role="img"
      :aria-label="t('tf.aria')"      @pointerdown.prevent="down"
      @pointermove="move"
      @pointerup="up"
      @pointercancel="cancel"
      @contextmenu.prevent
    >
      <rect x="-1.2" y="-1.2" width="2.4" height="2.4" class="bg" />
      <g :id="`${uid}-art`">
        <circle v-for="r in geo.rings" :key="r.n" :r="r.r" :fill="r.fill" :stroke="r.line" class="ring" />
        <circle :r="geo.xr" :fill="geo.xFill" stroke="#15171a" class="ring" />

        <!-- punti: cerchi di raggio minimo con tratto di larghezza fissa in pixel -->
        <g v-for="(p, i) in oldPts" :key="`g${i}`" class="pt ghost">
          <circle :cx="p.x" :cy="p.y" r="0.0005" class="o" />
          <circle :cx="p.x" :cy="p.y" r="0.0005" class="i" />
        </g>
        <g v-for="(p, i) in curPts" :key="`c${i}`" class="pt cur">
          <circle :cx="p.x" :cy="p.y" r="0.0005" class="o" />
          <circle :cx="p.x" :cy="p.y" r="0.0005" class="i" />
        </g>
      </g>
    </svg>

    <i v-if="aim" class="aim reticle" :style="reticleStyle" />
  </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
import type { Arrow, Score } from '~/utils/db'
import { ringGeometry, scoreAt, scoreStyle, type FaceId } from '~/utils/targets'
const { t } = useT()

const props = defineProps({
  face: { type: String as PropType<FaceId>, required: true },
  /** frecce della volée in corso */
  marks: { type: Array as PropType<Arrow[]>, default: () => [] },
  /** frecce delle volée già chiuse, mostrate più tenui */
  ghosts: { type: Array as PropType<Arrow[]>, default: () => [] },
})
const emit = defineEmits<{ shot: [hit: { s: Score; x: number; y: number }] }>()

const MARGIN = 1.2 // il viewBox va da -1.2 a 1.2: il bordo oltre l'ultimo anello è la zona "mancato"
const AIM_LIFT_PX = 64 // il mirino sta sopra il dito (solo touch e penna)
const LOUPE_PX = 114 // area interna della lente
const ZOOM = 3

const uid = 'tf' + Math.random().toString(36).slice(2, 8) // ssr: false, nessun problema di hydration
const geo = computed(() => ringGeometry(props.face))

const svg = ref<SVGSVGElement>()
const aim = ref<{ x: number; y: number } | null>(null) // coordinate SVG (y verso il basso)
let pid = -1
let lift = 0

const clamp = (v: number) => Math.max(-MARGIN, Math.min(MARGIN, v))
const round = (v: number) => Math.round(v * 1e4) / 1e4

function toSvg(e: PointerEvent) {
  const m = svg.value?.getScreenCTM() // tiene conto di viewBox, scala e posizione
  if (!m) return null
  const p = new DOMPoint(e.clientX, e.clientY - lift).matrixTransform(m.inverse())
  return { x: clamp(p.x), y: clamp(p.y) }
}

function down(e: PointerEvent) {
  if (pid !== -1 || !e.isPrimary) return // ignora un secondo dito
  pid = e.pointerId
  lift = e.pointerType === 'mouse' ? 0 : AIM_LIFT_PX
  svg.value?.setPointerCapture(pid)
  aim.value = toSvg(e)
}
function move(e: PointerEvent) {
  if (e.pointerId === pid) aim.value = toSvg(e)
}
function up(e: PointerEvent) {
  if (e.pointerId !== pid) return
  pid = -1
  const p = aim.value
  aim.value = null
  if (!p) return
  const x = round(p.x)
  const y = round(-p.y) // nei dati y positivo = alto
  emit('shot', { s: scoreAt(props.face, x, y), x, y })
}
function cancel(e: PointerEvent) {
  if (e.pointerId !== pid) return
  pid = -1
  aim.value = null
}

const aimScore = computed<Score | null>(() => (aim.value ? scoreAt(props.face, aim.value.x, aim.value.y) : null))

const pct = (v: number) => `${((v + MARGIN) / (2 * MARGIN)) * 100}%`
const reticleStyle = computed(() => (aim.value ? { left: pct(aim.value.x), top: pct(aim.value.y) } : {}))

// finestra della lente: mostra ZOOM volte ingrandita la zona attorno al mirino
const loupeBox = computed(() => {
  const a = aim.value!
  const w = svg.value?.clientWidth || 336
  const h = (MARGIN * LOUPE_PX) / w / ZOOM
  return `${a.x - h} ${a.y - h} ${2 * h} ${2 * h}`
})

const toPts = (list: Arrow[]) =>
  list.filter((a) => a.x != null && a.y != null).map((a) => ({ x: a.x!, y: -a.y! }))
const curPts = computed(() => toPts(props.marks))
const oldPts = computed(() => toPts(props.ghosts))
</script>

<style scoped>
.tf { position: relative; width: min(100%, 44dvh); margin: 0 auto; }
.face {
  display: block; width: 100%; height: auto; aspect-ratio: 1 / 1;
  touch-action: none; user-select: none; -webkit-user-select: none;
  -webkit-touch-callout: none; -webkit-tap-highlight-color: transparent;
}
.bg { fill: var(--panel, #2a3830); }
.ring { vector-effect: non-scaling-stroke; stroke-width: 1px; }

.pt circle { fill: none; vector-effect: non-scaling-stroke; stroke-linecap: round; }
.cur .o { stroke: #15171a; stroke-width: 13px; }
.cur .i { stroke: #fff; stroke-width: 9px; }
.ghost .o { stroke: rgba(21, 23, 26, .55); stroke-width: 9px; }
.ghost .i { stroke: rgba(255, 255, 255, .75); stroke-width: 5px; }

/* mirino: anello vuoto con puntino al centro, il punto esatto resta visibile */
.aim {
  position: absolute; width: 18px; height: 18px; margin: -9px 0 0 -9px;
  border: 2px solid #fff; border-radius: 50%; pointer-events: none;
  box-shadow: 0 0 0 1.5px #15171a, inset 0 0 0 1.5px #15171a;
}
.aim::after {
  content: ''; position: absolute; left: 50%; top: 50%; width: 2px; height: 2px; margin: -1px;
  background: #fff; box-shadow: 0 0 0 1px #15171a;
}
.reticle { z-index: 2; }

.loupe {
  position: absolute; left: 50%; bottom: calc(100% + 10px); width: 120px; height: 120px; margin-left: -60px;
  box-sizing: border-box; border: 3px solid var(--text, #f5f5f0); border-radius: 50%; overflow: hidden;
  background: var(--panel, #2a3830); box-shadow: 0 6px 20px rgba(0, 0, 0, .5);
  pointer-events: none; z-index: 5;
}
.loupe svg { display: block; width: 100%; height: 100%; }
.loupe .aim { left: 50%; top: 50%; }
.badge {
  position: absolute; left: 50%; bottom: 6px; transform: translateX(-50%);
  min-width: 30px; height: 30px; padding: 0 8px; border-radius: 15px;
  display: grid; place-items: center; font-size: 1.1rem; font-weight: 800;
  box-shadow: 0 0 0 2px rgba(21, 23, 26, .7);
}
</style>
