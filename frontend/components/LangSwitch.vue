<template>
  <div class="seg" role="group" :aria-label="t('lang.label')">
    <button :class="{ on: lang === 'it' }" @click="setLang('it')">IT</button>
    <button :class="{ on: lang === 'en' }" @click="setLang('en')">EN</button>
  </div>
</template>

<script setup lang="ts">
import { useT } from '~/utils/i18n'
const { t, lang, setLang } = useT()
</script>

<style scoped>
.seg { display: flex; background: var(--panel); border-radius: 12px; padding: 3px; }
.seg button { min-width: 48px; min-height: 44px; border-radius: 10px; background: transparent; color: var(--muted); font-weight: 700; }
.seg button.on { background: var(--text); color: var(--bg); }
</style>