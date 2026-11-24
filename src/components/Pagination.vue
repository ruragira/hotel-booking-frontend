<script setup>
defineProps({ page: { type: Number, default: 0 }, totalPages: { type: Number, default: 0 }, total: { type: Number, default: null } })
const emit = defineEmits(['change'])
</script>

<template>
  <nav v-if="totalPages > 1" class="pager" aria-label="Pagination">
    <button class="btn ghost small" :disabled="page <= 0" @click="emit('change', page - 1)">Précédent</button>
    <span>Page {{ page + 1 }} sur {{ totalPages }}<template v-if="total != null"> ({{ total }} résultats)</template></span>
    <button class="btn ghost small" :disabled="page >= totalPages - 1" @click="emit('change', page + 1)">Suivant</button>
  </nav>
</template>
