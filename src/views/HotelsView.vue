<script setup>
import { reactive, ref, onMounted } from 'vue'
import { http, errorMessage } from '../api/http'
import HotelCard from '../components/HotelCard.vue'
import Pagination from '../components/Pagination.vue'

const f = reactive({ q: '', city: '', stars: '' })
const hotels = ref([])
const meta = reactive({ page: 0, totalPages: 0, totalElements: 0 })
const loading = ref(false)
const error = ref('')

async function load(page = 0) {
  loading.value = true
  error.value = ''
  try {
    const params = { page, size: 9 }
    for (const k of ['q', 'city', 'stars']) if (f[k] !== '') params[k] = f[k]
    const { data } = await http.get('/hotels', { params })
    hotels.value = data.content
    meta.page = data.page; meta.totalPages = data.totalPages; meta.totalElements = data.totalElements
  } catch (e) {
    error.value = errorMessage(e)
  } finally {
    loading.value = false
  }
}
onMounted(() => load())
</script>

<template>
  <div class="container page">
    <h1 style="font-size:2.2rem">Nos hôtels</h1>
    <form class="card pad form-grid" style="margin-bottom:1.5rem;align-items:end" @submit.prevent="load(0)">
      <label>Recherche<input v-model="f.q" placeholder="Nom, ville ou pays" /></label>
      <label>Ville<input v-model="f.city" /></label>
      <label>Étoiles
        <select v-model="f.stars"><option value="">Toutes</option><option v-for="n in 5" :key="n" :value="n">{{ n }} ★</option></select>
      </label>
      <button class="btn">Filtrer</button>
    </form>
    <p v-if="error" class="alert bad" role="alert">{{ error }}</p>
    <div class="grid"><HotelCard v-for="h in hotels" :key="h.id" :hotel="h" /></div>
    <p v-if="!loading && !hotels.length && !error" class="empty">Aucun hôtel trouvé.</p>
    <Pagination :page="meta.page" :total-pages="meta.totalPages" :total="meta.totalElements" @change="load" />
  </div>
</template>
