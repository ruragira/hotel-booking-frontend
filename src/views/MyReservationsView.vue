<script setup>
import { reactive, ref, onMounted } from 'vue'
import { http, errorMessage } from '../api/http'
import { useToast } from '../stores/toast'
import Pagination from '../components/Pagination.vue'
import { money, fdate, statusLabel, badgeClass, methodLabel, METHOD_LABELS, todayISO } from '../utils/format'

const toast = useToast()
const items = ref([])
const meta = reactive({ page: 0, totalPages: 0, totalElements: 0 })
const status = ref('')
const error = ref('')
const loading = ref(false)
const payFor = ref(null)
const method = ref('CARD')
const editing = ref(null)
const edit = reactive({ checkIn: '', checkOut: '', guests: 1 })
const today = todayISO()

async function load(page = 0) {
  loading.value = true
  error.value = ''
  try {
    const { data } = await http.get('/reservations/my', { params: { page, size: 6, status: status.value || undefined } })
    items.value = data.content
    meta.page = data.page; meta.totalPages = data.totalPages; meta.totalElements = data.totalElements
  } catch (e) { error.value = errorMessage(e) } finally { loading.value = false }
}

async function run(fn, okMsg) {
  try { await fn(); toast.ok(okMsg); await load(meta.page) } catch (e) { toast.error(errorMessage(e)) }
}
const pay = (r) => run(async () => { await http.post(`/reservations/${r.id}/payments`, { method: method.value }); payFor.value = null }, 'Paiement reçu, réservation confirmée.')
const cancel = (r) => { if (confirm(`Annuler la réservation ${r.reference} ?`)) run(() => http.patch(`/reservations/${r.id}/cancel`), 'Réservation annulée.') }
const canCancel = (r) => ['PENDING', 'CONFIRMED'].includes(r.status) && r.checkIn > today

function startEdit(r) {
  editing.value = r.id
  Object.assign(edit, { checkIn: r.checkIn, checkOut: r.checkOut, guests: r.guests })
}
const saveEdit = (r) => run(async () => { await http.put(`/reservations/${r.id}`, { ...edit }); editing.value = null }, 'Réservation modifiée.')

onMounted(() => load())
</script>

<template>
  <div class="container page">
    <div class="row between">
      <h1 style="font-size:2.2rem">Mes réservations</h1>
      <label style="min-width:200px">Statut
        <select v-model="status" @change="load(0)">
          <option value="">Tous</option><option value="PENDING">En attente</option><option value="CONFIRMED">Confirmée</option>
          <option value="COMPLETED">Terminée</option><option value="CANCELLED">Annulée</option>
        </select>
      </label>
    </div>
    <p v-if="error" class="alert bad" role="alert">{{ error }}</p>
    <p v-if="!loading && !items.length && !error" class="empty">Aucune réservation. <router-link to="/">Rechercher une chambre</router-link></p>

    <article v-for="r in items" :key="r.id" class="card pad" style="margin-bottom:1rem">
      <div class="row between">
        <div>
          <h3 style="margin:0">{{ r.hotelName }} — {{ r.roomType }} {{ r.roomNumber }}</h3>
          <span class="muted">{{ r.hotelCity }} · réf. {{ r.reference }}</span>
        </div>
        <span class="badge" :class="badgeClass(r.status)">{{ statusLabel(r.status) }}</span>
      </div>
      <p style="margin:.6rem 0">Du <strong>{{ fdate(r.checkIn) }}</strong> au <strong>{{ fdate(r.checkOut) }}</strong> ({{ r.nights }} nuit(s)) · {{ r.guests }} pers. · <strong>{{ money(r.totalPrice) }}</strong></p>
      <p v-if="r.payment" class="muted" style="margin:0 0 .6rem">Payé par {{ methodLabel(r.payment.method) }} — {{ statusLabel(r.payment.status) }} · {{ r.payment.transactionRef }}</p>

      <form v-if="editing === r.id" class="form-grid" style="align-items:end;margin-bottom:.8rem" @submit.prevent="saveEdit(r)">
        <label>Arrivée<input v-model="edit.checkIn" type="date" :min="today" required /></label>
        <label>Départ<input v-model="edit.checkOut" type="date" :min="edit.checkIn" required /></label>
        <label>Personnes<input v-model.number="edit.guests" type="number" min="1" required /></label>
        <div class="actions"><button class="btn small">Enregistrer</button><button type="button" class="btn ghost small" @click="editing = null">Fermer</button></div>
      </form>

      <div v-if="payFor === r.id" class="row" style="margin-bottom:.8rem">
        <select v-model="method" style="max-width:220px"><option v-for="(l, k) in METHOD_LABELS" :key="k" :value="k">{{ l }}</option></select>
        <button class="btn accent small" @click="pay(r)">Confirmer le paiement</button>
        <button class="btn ghost small" @click="payFor = null">Fermer</button>
      </div>

      <div class="actions">
        <button v-if="r.status === 'PENDING' && payFor !== r.id" class="btn accent small" @click="payFor = r.id">Payer</button>
        <button v-if="r.status === 'PENDING' && editing !== r.id" class="btn ghost small" @click="startEdit(r)">Modifier les dates</button>
        <button v-if="canCancel(r)" class="btn danger small" @click="cancel(r)">Annuler</button>
      </div>
    </article>
    <Pagination :page="meta.page" :total-pages="meta.totalPages" :total="meta.totalElements" @change="load" />
  </div>
</template>
