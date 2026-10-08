<template>
  <div v-if="$pwa && ($pwa.needRefresh || $pwa.offlineReady)" class="pwa-toast" role="status">
    <template v-if="$pwa.needRefresh">
      <span>{{ t('pwa.new') }}</span>
      <button class="go" @click="$pwa.updateServiceWorker()">{{ t('pwa.update') }}</button>
      <button @click="$pwa.cancelPrompt()">{{ t('pwa.later') }}</button>
    </template>
    <template v-else>
      <span>{{ t('pwa.offline') }}</span>
      <button @click="$pwa.cancelPrompt()">{{ t('pwa.ok') }}</button>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useT } from '~/utils/i18n'
const { $pwa } = useNuxtApp()
const { t } = useT()
</script>

<style scoped>
.pwa-toast {
  position: fixed; z-index: 100;
  left: 12px; right: 12px;
  top: calc(env(safe-area-inset-top) + 8px);
  max-width: 456px; margin: 0 auto;
  display: flex; align-items: center; gap: 8px;
  padding: 10px 12px;
  background: var(--panel); color: var(--text);
  border: 1px solid var(--gold); border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
}
.pwa-toast span { flex: 1; }
.pwa-toast button {
  min-height: 44px; padding: 0 14px; border-radius: 10px;
  background: var(--bg); color: var(--text);
}
.pwa-toast .go { background: var(--gold); color: var(--black); font-weight: 700; }
</style>