<script setup>
import { computed } from 'vue'
import { money } from '../utils/format'

const props = defineProps({
  room: { type: Object, required: true },
  showHotel: { type: Boolean, default: true },
  checkIn: { type: String, default: '' },
  checkOut: { type: String, default: '' },
  guests: { type: [Number, String], default: '' }
})

const query = computed(() => {
  const q = {}
  if (props.checkIn && props.checkOut) { q.checkIn = props.checkIn; q.checkOut = props.checkOut }
  if (props.guests) q.guests = props.guests
  return q
})
</script>

<template>
  <article class="card card-body">
    <h3 style="margin:0">{{ room.roomType.name }} · chambre {{ room.number }}</h3>
    <router-link v-if="showHotel" :to="`/hotels/${room.hotel.id}`">{{ room.hotel.name }} — {{ room.hotel.city }}</router-link>
    <span class="muted">{{ room.capacity }} personne(s) max.</span>
    <p v-if="room.description" class="muted" style="margin:0">{{ room.description }}</p>
    <div class="row between" style="margin-top:.5rem">
      <div>
        <span class="price">{{ money(room.pricePerNight) }}</span> <small class="muted">/ nuit</small>
        <div v-if="room.totalPrice" class="muted">{{ money(room.totalPrice) }} pour {{ room.nights }} nuit(s)</div>
      </div>
      <router-link class="btn accent" :to="{ name: 'book', params: { roomId: room.id }, query }">Réserver</router-link>
    </div>
  </article>
</template>
