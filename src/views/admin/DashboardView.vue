<script setup>
import { reactive, ref, onMounted } from 'vue'
import { http, errorMessage } from '../../api/http'
import { money, statusLabel } from '../../utils/format'

const now = new Date()
const iso = (d) => d.toISOString().slice(0, 10)
const range = reactive({ from: iso(new Date(now.getFullYear(), now.getMonth(), 1)), to: iso(new Date(now.getFullYear(), now.getMonth() + 1, 1)) })
const data = ref(null)
const error = ref('')

async function load() {
  error.value = ''
  try { data.value = (await http.get('/admin/stats', { params: { from: range.from, to: range.to } })).data } catch (e) { error.value = errorMessage(e) }
}
onMounted(load)
</script>

<template>
  <div>
    <h2>Tableau de bord</h2>
    <form class="row" style="align-items:end;margin-bottom:1.25rem" @submit.prevent="load">
      <label>Du<input v-model="range.from" type="date" /></label>
      <label>Au (exclu)<input v-model="range.to" type="date" /></label>
      <button class="btn">Actualiser</button>
    </form>
    <p v-if="error" class="alert bad" role="alert">{{ error }}</p>
    <template v-if="data">
      <div class="kpis">
        <div class="kpi"><strong>{{ data.occupancyRate }} %</strong>Taux d'occupation</div>
        <div class="kpi"><strong>{{ money(data.revenue) }}</strong>Encaissements</div>
        <div class="kpi"><strong>{{ data.reservations }}</strong>Réservations</div>
        <div class="kpi"><strong>{{ data.hotels }}</strong>Hôtels</div>
        <div class="kpi"><strong>{{ data.rooms }}</strong>Chambres actives</div>
        <div class="kpi"><strong>{{ data.clients }}</strong>Comptes</div>
      </div>

      <h3>Taux d'occupation par hôtel</h3>
      <div class="card table-wrap" style="margin-bottom:1.5rem">
        <table>
          <thead><tr><th>Hôtel</th><th>Chambres</th><th>Nuits occupées</th><th>Nuits disponibles</th><th>Occupation</th></tr></thead>
          <tbody>
            <tr v-for="h in data.hotelsOccupancy" :key="h.hotelId">
              <td>{{ h.hotelName }}</td><td>{{ h.rooms }}</td><td>{{ h.occupiedNights }}</td><td>{{ h.availableNights }}</td>
              <td><div class="row" style="flex-wrap:nowrap"><div class="bar" style="flex:1"><span :style="{ width: Math.min(h.occupancyRate, 100) + '%' }"></span></div><strong>{{ h.occupancyRate }} %</strong></div></td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3>Réservations par statut</h3>
      <div class="row">
        <span v-for="(n, s) in data.reservationsByStatus" :key="s" class="chip">{{ statusLabel(s) }} : <strong>{{ n }}</strong></span>
      </div>
    </template>
  </div>
</template>
