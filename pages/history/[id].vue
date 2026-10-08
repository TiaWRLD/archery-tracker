<template>
  <main v-if="session" class="page">
    <NuxtLink to="/" class="back">{{ t('nav.back') }}</NuxtLink>

    <h1>{{ fmtDateLong(session.date) }}</h1>
    <p class="meta">
      {{ t('h.meta', { d: session.distance, n: session.arrowsPerEnd }) }}
      <template v-if="hasCoords"> · {{ faceLabel(face) }}</template>
      <template v-if="session.bow"> · {{ session.bow }}</template>
      <template v-if="session.feeling"> · {{ t('h.feeling', { n: session.feeling }) }}</template>
    </p>
    <p v-if="session.note" class="note">{{ session.note }}</p>

    <NuxtLink v-if="!session.closed" :to="`/session/${session.id}`" class="resume">
      {{ t('h.open') }}
    </NuxtLink>

    <section class="stats">
      <div><strong>{{ total }}</strong><span>{{ t('h.total') }}</span></div>
      <div><strong>{{ arrowCount }}</strong><span>{{ t('common.arrows') }}</span></div>
      <div><strong>{{ arrowCount ? fmtN(total / arrowCount, 2) : '–' }}</strong><span>{{ t('common.avg') }}</span></div>
    </section>

    <section v-if="ends.length">
      <h2>{{ t('h.ends') }}</h2>
      <div v-for="(e, i) in ends" :key="e.index" class="end">
        <span class="n" :style="byEnd ? { color: endColor(i, ends.length), fontWeight: 800 } : {}">{{ e.index + 1 }}</span>
        <span class="arrows">
          <i v-for="(a, k) in sorted(e.arrows)" :key="k" class="dot" :class="`s-${a.s}`">{{ a.s }}</i>
        </span>
        <b>{{ endTotal(e.arrows) }}</b>
        <small>{{ fmtN(endTotal(e.arrows) / e.arrows.length, 1) }}</small>
      </div>
    </section>
    <p v-else class="muted">{{ t('h.none') }}</p>

    <section>
      <h2>{{ t('h.plot') }}</h2>
      <p v-if="!xy.length" class="muted">{{ t('h.quick') }}</p>
      <template v-else>
        <p v-if="xy.length < arrowCount" class="muted">
          {{ t('h.partial', { a: xy.length, b: arrowCount }) }}
        </p>
        <div class="rosata">
          <TargetReadonly :face="face" :ends="endsXY" :by-end="byEnd" />
        </div>
        <div class="legend">
          <button class="chip" :class="{ on: byEnd }" @click="byEnd = !byEnd">{{ t('h.byEnd') }}</button>
          <span v-if="byEnd" class="ramp" aria-hidden="true"><i>1</i><i>{{ ends.length }}</i></span>
        </div>
        <div class="stats group">
          <div><strong>{{ fmtN(Math.abs(group.cx)) }} cm</strong><span>{{ group.cx >= 0 ? t('h.right') : t('h.left') }}</span></div>
          <div><strong>{{ fmtN(Math.abs(group.cy)) }} cm</strong><span>{{ group.cy >= 0 ? t('h.up') : t('h.down') }}</span></div>
          <div><strong>{{ fmtN(group.spread) }} cm</strong><span>{{ t('h.spread') }}</span></div>
        </div>
      </template>
    </section>

    <NuxtLink v-if="session.closed" :to="`/coach?session=${session.id}`" class="coach">
      {{ t('h.coach') }}
    </NuxtLink>

    <button class="danger" @click="confirming = true">{{ t('h.delete') }}</button>

    <div v-if="confirming" class="overlay">
      <div class="sheet">
        <h2>{{ t('h.delTitle') }}</h2>
        <p class="muted">{{ t(session.closed ? 'h.delBody' : 'h.delBodyOpen', { n: arrowCount }) }}</p>
        <button class="danger" :disabled="deleting" @click="remove">{{ t('h.delYes') }}</button>
        <button class="ghost" @click="confirming = false">{{ t('h.cancel') }}</button>
      </div>
    </div>
  </main>
</template>

<script>
import { useT } from '~/utils/i18n'
const { t, fmtN, fmtDateLong, faceLabel } = useT()
</script>

<style scoped>
.page { max-width: 480px; margin: 0 auto; padding: 12px 14px 40px; }
.back { display: inline-block; color: var(--muted); text-decoration: none; padding: 12px 0; }
h1 { font-size: 1.5rem; text-transform: capitalize; margin: 0 0 4px; }
h2 { font-size: 1.1rem; margin: 26px 0 8px; }
.meta, .muted { color: var(--muted); font-size: .9rem; margin: 4px 0; }
.note { background: var(--panel); border-radius: 12px; padding: 10px 12px; margin: 10px 0; }
.coach { display: block; border: 2px solid var(--gold); color: var(--gold); font-weight: 700; padding: 14px; border-radius: 14px; text-align: center; text-decoration: none; margin: 26px 0 0; }
.coach + .danger { margin-top: 12px; }
.resume { display: block; background: var(--gold); color: var(--black); font-weight: 700; padding: 14px; border-radius: 14px; text-align: center; text-decoration: none; margin: 14px 0; }

.stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 16px; }
.stats div { background: var(--panel); border-radius: 14px; padding: 12px 6px; text-align: center; }
.stats strong { display: block; font-size: 1.5rem; }
.stats span { color: var(--muted); font-size: .8rem; }
.group { margin-top: 12px; }

.end { display: flex; align-items: center; gap: 10px; background: var(--panel); padding: 6px 10px; border-radius: 10px; margin-bottom: 6px; }
.end .n { color: var(--muted); width: 1.5em; }
.end .arrows { flex: 1; display: flex; gap: 4px; flex-wrap: wrap; }
.end b { font-size: 1.2rem; }
.end small { color: var(--muted); width: 2.4em; text-align: right; }
.dot { font-style: normal; width: 28px; height: 28px; border-radius: 50%; display: grid; place-items: center; font-size: .8rem; font-weight: 700; }

/* sola lettura: niente mirino né lente */
.rosata { max-width: 480px; margin: 0 auto; }
.legend { display: flex; align-items: center; gap: 12px; margin-top: 10px; }
.chip { padding: 8px 14px; border-radius: 999px; border: 2px solid var(--miss); background: transparent; color: var(--muted); font-weight: 700; }
.chip.on { border-color: var(--gold); color: var(--gold); }
.ramp {
  flex: 1; height: 14px; border-radius: 7px; display: flex; justify-content: space-between; align-items: center; padding: 0 8px;
  background: linear-gradient(90deg, hsl(0 90% 62%), hsl(60 90% 62%), hsl(120 90% 62%), hsl(180 90% 62%), hsl(240 90% 62%), hsl(300 90% 62%));
}
.ramp i { font-style: normal; font-size: .65rem; font-weight: 800; color: var(--black); }
.s-X, .s-10, .s-9 { background: var(--gold); color: var(--black); }
.s-8, .s-7 { background: var(--red); color: #fff; }
.s-6, .s-5 { background: var(--blue); color: #fff; }
.s-4, .s-3 { background: var(--black); color: #fff; }
.s-2, .s-1 { background: var(--white); color: var(--black); }
.s-M { background: var(--miss); color: #fff; }

.danger { width: 100%; margin-top: 32px; height: 56px; border-radius: 14px; background: transparent; color: var(--red); border: 2px solid var(--red); font-weight: 800; font-size: 1.05rem; }
.overlay .danger { background: var(--red); color: #fff; margin-top: 0; }
.overlay { position: fixed; inset: 0; background: rgba(0,0,0,.6); display: grid; align-items: end; z-index: 10; }
.sheet { background: var(--panel); border-radius: 22px 22px 0 0; padding: 20px 16px calc(20px + env(safe-area-inset-bottom)); display: grid; gap: 14px; max-width: 480px; width: 100%; margin: 0 auto; }
.sheet h2 { margin: 0; }
.ghost { background: transparent; color: var(--muted); padding: 12px 8px; font-size: 1rem; }
</style>