<script setup>
import { reactive, ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { http, errorMessage } from '../api/http'
import { useToast } from '../stores/toast'
import { money, nightsBetween, todayISO, fdate, METHOD_LABELS } from '../utils/format'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const room = ref(null)
const form = reactive({ checkIn: route.query.checkIn || '', checkOut: route.query.checkOut || '', guests: Number(route.query.guests) || 1 })
const step = ref(1) // 1 = séjour, 2 = paiement
const reservation = ref(null)
const method = ref('CARD')
const error = ref('')
const saving = ref(false)
const today = todayISO()

const nights = computed(() => nightsBetween(form.checkIn, form.checkOut))
const quote = ref(null)

// Devis détaillé fourni par l'API (tarif de base + saisons) dès que les dates sont valides
async function loadQuote() {
  quote.value = null
  if (!room.value || !form.checkIn || !form.checkOut || form.checkOut <= form.checkIn) return
  try {
    quote.value = (await http.get(`/rooms/${room.value.id}/quote`, { params: { checkIn: form.checkIn, checkOut: form.checkOut } })).data
  } catch (e) { /* le détail est facultatif : l'erreur éventuelle sera donnée à la réservation */ }
}
watch(() => [form.checkIn, form.checkOut], loadQuote)

onMounted(async () => {
  try {
    room.value = (await http.get(`/rooms/${route.params.roomId}`)).data
    await loadQuote()
  } catch (e) { error.value = errorMessage(e) }
})

async function reserve() {
  error.value = ''
  saving.value = true
  try {
    const { data } = await http.post('/reservations', { roomId: room.value.id, ...form })
    reservation.value = data
    step.value = 2
  } catch (e) {
    error.value = errorMessage(e)
  } finally {
    saving.value = false
  }
}

async function pay() {
  error.value = ''
  saving.value = true
  try {
    await http.post(`/reservations/${reservation.value.id}/payments`, { method: method.value })
    toast.ok('Paiement reçu : votre réservation est confirmée.')
    router.push('/my-reservations')
  } catch (e) {
    error.value = errorMessage(e)
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="container page" style="max-width:720px">
    <p v-if="error && !room" class="alert bad" role="alert">{{ error }}</p>
    <template v-if="room">
      <h1 style="font-size:2rem">Réserver : {{ room.roomType.name }} {{ room.number }}</h1>
      <p><router-link :to="`/hotels/${room.hotel.id}`">{{ room.hotel.name }}</router-link> — {{ room.hotel.city }} · {{ money(room.pricePerNight) }} / nuit · {{ room.capacity }} pers. max.</p>

      <form v-if="step === 1" class="card pad" style="display:grid;gap:1rem" @submit.prevent="reserve">
        <div class="form-grid">
          <label>Arrivée<input v-model="form.checkIn" type="date" :min="today" required /></label>
          <label>Départ<input v-model="form.checkOut" type="date" :min="form.checkIn || today" required /></label>
          <label>Personnes<input v-model.number="form.guests" type="number" min="1" :max="room.capacity" required /></label>
        </div>
        <div v-if="quote" class="card pad" style="background:var(--mist)">
          <table style="background:transparent">
            <tbody>
              <tr v-for="l in quote.lines" :key="l.label">
                <td>{{ l.label }}</td><td>{{ l.nights }} nuit(s) × {{ money(l.unitPrice) }}</td><td style="text-align:right">{{ money(l.subtotal) }}</td>
              </tr>
              <tr><td colspan="2"><strong>Total ({{ quote.nights }} nuit(s))</strong></td><td style="text-align:right"><span class="price">{{ money(quote.totalPrice) }}</span></td></tr>
            </tbody>
          </table>
          <p class="muted" style="margin:.4rem 0 0">Moyenne : {{ money(quote.averagePricePerNight) }} / nuit</p>
        </div>
        <p v-else-if="nights" class="muted" style="margin:0">{{ nights }} nuit(s)</p>
        <p v-if="error" class="alert bad" role="alert" style="margin:0">{{ error }}</p>
        <button class="btn accent" :disabled="saving || !nights">{{ saving ? 'Vérification…' : 'Réserver cette chambre' }}</button>
      </form>

      <div v-else class="card pad" style="display:grid;gap:1rem">
        <p class="alert ok" style="margin:0">Réservation <strong>{{ reservation.reference }}</strong> enregistrée : du {{ fdate(reservation.checkIn) }} au {{ fdate(reservation.checkOut) }}. Elle sera confirmée après paiement.</p>
        <p style="margin:0">Montant à régler : <span class="price">{{ money(reservation.totalPrice) }}</span></p>
        <label>Mode de paiement
          <select v-model="method"><option v-for="(label, key) in METHOD_LABELS" :key="key" :value="key">{{ label }}</option></select>
        </label>
        <p v-if="error" class="alert bad" role="alert" style="margin:0">{{ error }}</p>
        <div class="row">
          <button class="btn accent" :disabled="saving" @click="pay">{{ saving ? 'Paiement…' : 'Payer maintenant' }}</button>
          <router-link class="btn ghost" to="/my-reservations">Payer plus tard</router-link>
        </div>
        <p class="muted" style="margin:0;font-size:.85rem">Paiement simulé : aucune somme réelle n'est prélevée.</p>
      </div>
    </template>
  </div>
</template>
