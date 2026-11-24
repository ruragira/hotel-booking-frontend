<script setup>
import { reactive, ref, computed, onMounted } from 'vue'
import { http, errorMessage } from '../api/http'
import RoomCard from '../components/RoomCard.vue'
import Pagination from '../components/Pagination.vue'
import { todayISO, nightsBetween } from '../utils/format'

const f = reactive({ city: '', checkIn: '', checkOut: '', guests: 2, minPrice: '', maxPrice: '', sort: 'price_asc' })
const today = todayISO()
const rooms = ref([])
const meta = reactive({ page: 0, totalPages: 0, totalElements: 0 })
const loading = ref(false)
const error = ref('')
const applied = ref({ checkIn: '', checkOut: '', guests: 2 })
const nights = computed(() => nightsBetween(applied.value.checkIn, applied.value.checkOut))

async function search(page = 0) {
  error.value = ''
  if (!!f.checkIn !== !!f.checkOut) return (error.value = 'Renseignez les deux dates : arrivée et départ.')
  if (f.checkIn && f.checkOut <= f.checkIn) return (error.value = 'Le départ doit être après l\'arrivée.')
  loading.value = true
  try {
    const params = { page, size: 9, sort: f.sort }
    for (const k of ['city', 'checkIn', 'checkOut', 'guests', 'minPrice', 'maxPrice']) {
      if (f[k] !== '' && f[k] != null) params[k] = f[k]
    }
    const { data } = await http.get('/rooms', { params })
    rooms.value = data.content
    meta.page = data.page; meta.totalPages = data.totalPages; meta.totalElements = data.totalElements
    applied.value = { checkIn: f.checkIn, checkOut: f.checkOut, guests: f.guests }
  } catch (e) {
    error.value = errorMessage(e)
  } finally {
    loading.value = false
  }
}
onMounted(() => search())
</script>

<template>
  <section class="hero">
    <div class="container">
      <h1>Trouvez la chambre qu'il vous faut.</h1>
      <p>Comparez les hôtels de la région des Grands Lacs, vérifiez la disponibilité pour vos dates et réservez en quelques minutes.</p>
    </div>
  </section>

  <div class="container">
    <form class="search" @submit.prevent="search(0)">
      <label>Ville<input v-model="f.city" placeholder="Bujumbura, Kigali…" /></label>
      <label>Arrivée<input v-model="f.checkIn" type="date" :min="today" /></label>
      <label>Départ<input v-model="f.checkOut" type="date" :min="f.checkIn || today" /></label>
      <label>Personnes<input v-model.number="f.guests" type="number" min="1" max="20" /></label>
      <label>Prix min.<input v-model="f.minPrice" type="number" min="0" step="1" /></label>
      <label>Prix max.<input v-model="f.maxPrice" type="number" min="0" step="1" /></label>
      <label>Trier par
        <select v-model="f.sort"><option value="price_asc">Prix croissant</option><option value="price_desc">Prix décroissant</option></select>
      </label>
      <button class="btn accent" :disabled="loading">{{ loading ? 'Recherche…' : 'Rechercher' }}</button>
    </form>

    <section class="page">
      <p v-if="error" class="alert bad" role="alert">{{ error }}</p>
      <p v-else-if="!loading" class="muted">
        {{ meta.totalElements }} chambre(s) <template v-if="nights">disponible(s) pour {{ nights }} nuit(s)</template>
      </p>
      <div class="grid">
        <RoomCard v-for="r in rooms" :key="r.id" :room="r" :check-in="applied.checkIn" :check-out="applied.checkOut" :guests="applied.guests" />
      </div>
      <p v-if="!loading && !rooms.length && !error" class="empty">Aucune chambre ne correspond. Élargissez vos dates, votre budget ou la ville.</p>
      <Pagination :page="meta.page" :total-pages="meta.totalPages" @change="search" />
    </section>
  </div>
</template>
