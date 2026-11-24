<script setup>
import { ref } from 'vue'
import Stars from './Stars.vue'
import { money } from '../utils/format'

defineProps({ hotel: { type: Object, required: true } })
const failed = ref(false)
</script>

<template>
  <article class="card">
    <router-link :to="`/hotels/${hotel.id}`" style="text-decoration:none;color:inherit">
      <div class="thumb">
        <img v-if="hotel.imageUrl && !failed" :src="hotel.imageUrl" :alt="`Photo de ${hotel.name}`" loading="lazy" @error="failed = true" />
        <span v-else aria-hidden="true">{{ hotel.name.slice(0, 2) }}</span>
      </div>
      <div class="card-body">
        <h3 style="margin:0">{{ hotel.name }}</h3>
        <span class="muted">{{ hotel.city }}, {{ hotel.country }}</span>
        <Stars :n="hotel.stars" />
        <span v-if="hotel.averageRating" class="badge info">{{ hotel.averageRating }}/5 · {{ hotel.reviewCount }} avis</span>
        <span v-else class="muted">Pas encore noté</span>
        <span v-if="hotel.minPrice" class="price">dès {{ money(hotel.minPrice) }} <small class="muted" style="font:400 .85rem var(--font-body)">/ nuit</small></span>
        <span v-if="!hotel.active" class="badge bad">Inactif</span>
      </div>
    </router-link>
  </article>
</template>
