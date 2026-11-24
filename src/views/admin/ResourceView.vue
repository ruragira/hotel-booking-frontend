<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AdminResource from '../../components/AdminResource.vue'
import { resources } from '../../admin/resources'

const route = useRoute()
const config = computed(() => resources[route.meta.resource])
</script>

<template>
  <!-- la clé force le rechargement complet quand on change de ressource -->
  <AdminResource :key="route.meta.resource" :config="config" />
</template>
