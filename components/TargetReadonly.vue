<template>
  <svg ref="svg" class="rosa" viewBox="-1.2 -1.2 2.4 2.4" role="img" aria-label="Rosata della sessione">
    <rect x="-1.2" y="-1.2" width="2.4" height="2.4" class="bg" />

    <!-- anelli: tratto sottile in unità SVG (u = unità per pixel), niente vector-effect -->
    <circle v-for="r in geo.rings" :key="r.n" :r="r.r" :fill="r.fill" :stroke="r.line" :stroke-width="u" />
    <circle :r="geo.xr" :fill="geo.xFill" stroke="#15171a" :stroke-width="u" />

    <!-- crocette: prima tutti i contorni scuri, poi i tratti colorati, così nessuna crocetta ne copre un'altra -->
    <path :d="outline" class="cross" stroke="#15171a" :stroke-width="5 * u" />
    <path v-for="c in crosses" :key="c.i" :d="c.d" class="cross" :stroke="c.color" :stroke-width="2.2 * u" />

    <!-- gruppo: cerchio che contiene tutte le frecce, con il suo centro -->
    <template v-if="showGroup && grp">
      <circle :cx="grp.cx" :cy="-grp.cy" :r="ringR" class="halo" stroke="#15171a" :stroke-width="4.5 * u" />
      <circle :cx="grp.cx" :cy="-grp.cy" :r="ringR" class="halo" stroke="#f2c230" :stroke-width="2 * u" :stroke-dasharray="`${7 * u} ${5 * u}`" />
      <circle :cx="grp.cx" :cy="-grp.cy" :r="4 * u" class="halo" stroke="#15171a" :stroke-width="4.5 * u" />
      <circle :cx="grp.cx" :cy="-grp.cy" :r="4 * u" class="halo" stroke="#f2c230" :stroke-width="2 * u" />
    </template>
  </svg>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
import type { Arrow } from '~/utils/db'
import { ringGeometry, type FaceId } from '~/utils/targets'
import { endColor, groupOf, hasXY } from '~/utils/stats'

const props = defineProps({
  face: { type: String as PropType<FaceId>, required: true },
  /** frecce raggruppate per volée, nell'ordine delle volée (anche quelle senza coordinate) */
  ends: { type: Array as PropType<Arrow[][]>, default: () => [] },
  /** un colore diverso per ogni volée; altrimenti tutte bianche */
  byEnd: { type: Boolean, default: false },
  /** cerchio attorno al gruppo e segno sul suo centro */
  showGroup: { type: Boolean, default: true },
})

const geo = computed(() => ringGeometry(props.face))

// unità SVG per pixel: tratti e crocette hanno dimensione fissa a schermo
const svg = ref<SVGSVGElement>()
const u = ref(2.4 / 336)
let ro: ResizeObserver | undefined
onMounted(() => {
  const el = svg.value
  if (!el) return
  const upd = () => {
    const w = el.clientWidth
    if (w) u.value = 2.4 / w
  }
  upd()
  ro = new ResizeObserver(upd)
  ro.observe(el)
})
onBeforeUnmount(() => ro?.disconnect())

const f = (v: number) => v.toFixed(4)

// crocetta a X: due diagonali di mezza lunghezza 4 px
function crossPath(list: Arrow[]) {
  const h = 4 * u.value
  return list
    .filter(hasXY)
    .map((a) => {
      const x = a.x!
      const y = -a.y!
      return `M${f(x - h)} ${f(y - h)}L${f(x + h)} ${f(y + h)}M${f(x - h)} ${f(y + h)}L${f(x + h)} ${f(y - h)}`
    })
    .join('')
}

const crosses = computed(() =>
  props.ends
    .map((list, i) => ({ i, d: crossPath(list), color: props.byEnd ? endColor(i, props.ends.length) : '#ffffff' }))
    .filter((c) => c.d),
)
const outline = computed(() => crosses.value.map((c) => c.d).join(''))

const grp = computed(() => groupOf(props.ends.flat()))
const ringR = computed(() => (grp.value ? grp.value.radius + 7 * u.value : 0))
</script>

<style scoped>
.rosa {
  display: block; width: 100%; height: auto; aspect-ratio: 1 / 1;
  user-select: none; -webkit-user-select: none; -webkit-touch-callout: none;
}
.bg { fill: var(--panel, #2a3830); }
.cross { fill: none; stroke-linecap: round; }
.halo { fill: none; }
</style>
