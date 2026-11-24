<script setup>
import { reactive, ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { http, errorMessage } from '../api/http'
import { useAuth } from '../stores/auth'
import { useToast } from '../stores/toast'
import RoomCard from '../components/RoomCard.vue'
import Stars from '../components/Stars.vue'
import Pagination from '../components/Pagination.vue'
import { fdate, todayISO, pct } from '../utils/format'

const route = useRoute()
const auth = useAuth()
const toast = useToast()
const id = route.params.id

const hotel = ref(null)
const seasons = ref([])
const rooms = ref([])
const reviews = ref([])
const rMeta = reactive({ page: 0, totalPages: 0, totalElements: 0 })
const error = ref('')
const roomError = ref('')
const f = reactive({ checkIn: '', checkOut: '', guests: 2 })
const applied = ref({ checkIn: '', checkOut: '', guests: '' })
const review = reactive({ rating: 5, comment: '' })
const reviewError = ref('')
const myReview = computed(() => reviews.value.find((r) => r.clientId === auth.user?.clientId))
const today = todayISO()

async function loadHotel() {
  try { hotel.value = (await http.get(`/hotels/${id}`)).data } catch (e) { error.value = errorMessage(e) }
}
async function loadSeasons() {
  try { seasons.value = (await http.get(`/hotels/${id}/seasonal-rates`)).data } catch (e) { /* information facultative */ }
}
async function loadRooms() {
  roomError.value = ''
  if (!!f.checkIn !== !!f.checkOut) return (roomError.value = 'Renseignez les deux dates.')
  if (f.checkIn && f.checkOut <= f.checkIn) return (roomError.value = 'Le départ doit être après l\'arrivée.')
  try {
    const params = {}
    if (f.checkIn) { params.checkIn = f.checkIn; params.checkOut = f.checkOut }
    if (f.guests) params.guests = f.guests
    rooms.value = (await http.get(`/hotels/${id}/rooms`, { params })).data.content
    applied.value = { checkIn: f.checkIn, checkOut: f.checkOut, guests: f.guests }
  } catch (e) { roomError.value = errorMessage(e) }
}
async function loadReviews(page = 0) {
  try {
    const { data } = await http.get(`/hotels/${id}/reviews`, { params: { page, size: 5 } })
    reviews.value = data.content
    rMeta.page = data.page; rMeta.totalPages = data.totalPages; rMeta.totalElements = data.totalElements
    if (myReview.value) { review.rating = myReview.value.rating; review.comment = myReview.value.comment || '' }
  } catch (e) { /* l'avis n'est pas critique */ }
}
async function submitReview() {
  reviewError.value = ''
  try {
    if (myReview.value) await http.put(`/reviews/${myReview.value.id}`, { ...review })
    else await http.post(`/hotels/${id}/reviews`, { ...review })
    toast.ok('Merci pour votre avis !')
    await Promise.all([loadReviews(rMeta.page), loadHotel()])
  } catch (e) { reviewError.value = errorMessage(e) }
}
async function deleteReview(r) {
  if (!confirm('Supprimer cet avis ?')) return
  try {
    await http.delete(`/reviews/${r.id}`)
    review.rating = 5; review.comment = ''
    toast.ok('Avis supprimé.')
    await Promise.all([loadReviews(0), loadHotel()])
  } catch (e) { toast.error(errorMessage(e)) }
}
const canDelete = (r) => auth.isAdmin || r.clientId === auth.user?.clientId

onMounted(() => { loadHotel(); loadSeasons(); loadRooms(); loadReviews() })
</script>

<template>
  <div class="container page">
    <p v-if="error" class="alert bad" role="alert">{{ error }}</p>
    <template v-if="hotel">
      <div class="row between" style="align-items:flex-start">
        <div>
          <h1 style="font-size:2.4rem">{{ hotel.name }}</h1>
          <Stars :n="hotel.stars" /> <span class="muted">· {{ hotel.address }}, {{ hotel.city }}, {{ hotel.country }}</span>
        </div>
        <span v-if="hotel.averageRating" class="badge info" style="font-size:1rem">{{ hotel.averageRating }}/5 · {{ hotel.reviewCount }} avis</span>
      </div>
      <img v-if="hotel.imageUrl" :src="hotel.imageUrl" :alt="`Photo de ${hotel.name}`" style="width:100%;max-height:380px;object-fit:cover;border-radius:12px;margin:1rem 0" />
      <p style="max-width:70ch">{{ hotel.description }}</p>
      <div class="chips"><span v-for="a in hotel.amenities" :key="a.id" class="chip">{{ a.name }}</span></div>

      <div v-if="seasons.length" class="card pad" style="margin-top:1.5rem;max-width:620px">
        <h3 style="margin-top:0">Tarifs saisonniers</h3>
        <p class="muted" style="margin-top:0">Le prix de chaque nuit tient compte de la saison. Hors période, le tarif de base s'applique.</p>
        <div v-for="s in seasons" :key="s.id" class="row between" style="padding:.3rem 0;border-top:1px solid var(--line)">
          <span><strong>{{ s.name }}</strong> <span class="muted">· {{ fdate(s.startDate) }} → {{ fdate(s.endDate) }}</span></span>
          <span class="badge" :class="s.multiplier > 1 ? 'warn' : 'ok'">{{ pct(s.multiplier) }}</span>
        </div>
      </div>

      <h2 style="margin-top:2.5rem">Chambres</h2>
      <form class="card pad form-grid" style="align-items:end;margin-bottom:1.25rem" @submit.prevent="loadRooms">
        <label>Arrivée<input v-model="f.checkIn" type="date" :min="today" /></label>
        <label>Départ<input v-model="f.checkOut" type="date" :min="f.checkIn || today" /></label>
        <label>Personnes<input v-model.number="f.guests" type="number" min="1" /></label>
        <button class="btn">Vérifier la disponibilité</button>
      </form>
      <p v-if="roomError" class="alert bad" role="alert">{{ roomError }}</p>
      <div class="grid">
        <RoomCard v-for="r in rooms" :key="r.id" :room="r" :show-hotel="false" :check-in="applied.checkIn" :check-out="applied.checkOut" :guests="applied.guests" />
      </div>
      <p v-if="!rooms.length && !roomError" class="empty">Aucune chambre disponible pour ces critères.</p>

      <h2 style="margin-top:2.5rem">Avis des clients</h2>
      <div v-for="r in reviews" :key="r.id" class="card pad" style="margin-bottom:.75rem">
        <div class="row between">
          <strong>{{ r.clientName }}</strong>
          <span><Stars :n="r.rating" /> <span class="muted">{{ fdate(r.createdAt) }}</span></span>
        </div>
        <p style="margin:.4rem 0 0">{{ r.comment }}</p>
        <button v-if="canDelete(r)" class="btn danger small" style="margin-top:.5rem" @click="deleteReview(r)">Supprimer</button>
      </div>
      <p v-if="!reviews.length" class="muted">Aucun avis pour le moment.</p>
      <Pagination :page="rMeta.page" :total-pages="rMeta.totalPages" @change="loadReviews" />

      <form v-if="auth.isLoggedIn" class="card pad" style="margin-top:1rem;display:grid;gap:1rem;max-width:560px" @submit.prevent="submitReview">
        <h3 style="margin:0">{{ myReview ? 'Modifier mon avis' : 'Laisser un avis' }}</h3>
        <p class="muted" style="margin:0">Les avis sont réservés aux clients qui ont séjourné dans l'hôtel.</p>
        <label>Note
          <select v-model.number="review.rating"><option v-for="n in [5, 4, 3, 2, 1]" :key="n" :value="n">{{ n }} / 5</option></select>
        </label>
        <label>Commentaire<textarea v-model="review.comment" maxlength="1000"></textarea></label>
        <p v-if="reviewError" class="alert bad" role="alert" style="margin:0">{{ reviewError }}</p>
        <button class="btn">{{ myReview ? 'Mettre à jour' : 'Publier mon avis' }}</button>
      </form>
      <p v-else class="muted" style="margin-top:1rem"><router-link to="/login">Connectez-vous</router-link> pour laisser un avis.</p>
    </template>
  </div>
</template>
