<script setup>
import { useToast } from '../stores/toast'
const toast = useToast()
</script>

<template>
  <div class="toasts" aria-live="polite">
    <div v-for="t in toast.items" :key="t.id" class="toast" :class="t.type" @click="toast.dismiss(t.id)">{{ t.message }}</div>
  </div>
</template>
