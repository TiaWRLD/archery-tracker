<template>
  <NuxtPwaManifest />
  <NuxtPage />
  <PwaUpdate />
</template>

<script setup lang="ts">
onMounted(() => {
  // chiede al browser di non cancellare i dati in caso di poco spazio
  navigator.storage?.persist?.()
})
</script>

<style>
:root {
  --bg: #1e2a24;
  --panel: #2a3830;
  --text: #f2f0e8;
  --muted: #9fb0a5;
  --gold: #f2c230;
  --red: #d9412f;
  --blue: #2f7fc1;
  --black: #15171a;
  --white: #f5f5f0;
  --miss: #55645b;
}
* { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
html, body { margin: 0; height: 100%; background: var(--bg); color: var(--text);
  font-family: ui-rounded, system-ui, -apple-system, 'Segoe UI', sans-serif; }
body { padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left); }
button { font: inherit; color: inherit; border: 0; cursor: pointer; touch-action: manipulation; }
button:focus-visible, input:focus-visible, textarea:focus-visible { outline: 3px solid var(--gold); outline-offset: 2px; }
h1, h2 { margin: 0; }
.page { max-width: 480px; margin: 0 auto; padding: 20px 16px 32px; }
</style>
