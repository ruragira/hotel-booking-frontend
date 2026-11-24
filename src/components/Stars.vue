<script setup>
defineProps({ n: { type: Number, default: 0 } })
</script>

<template>
  <span class="stars" :aria-label="n + ' étoiles'">{{ '★'.repeat(n) }}<span style="opacity:.25">{{ '★'.repeat(Math.max(0, 5 - n)) }}</span></span>
</template>
