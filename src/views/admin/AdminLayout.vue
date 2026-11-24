<template>
  <div class="container page">
    <div class="admin">
      <aside class="side" aria-label="Menu d'administration">
        <router-link to="/admin">Tableau de bord</router-link>
        <router-link to="/admin/hotels">Hôtels</router-link>
        <router-link to="/admin/rooms">Chambres</router-link>
        <router-link to="/admin/seasonal-rates">Tarifs saisonniers</router-link>
        <router-link to="/admin/room-types">Types de chambre</router-link>
        <router-link to="/admin/amenities">Équipements</router-link>
        <router-link to="/admin/reservations">Réservations</router-link>
        <router-link to="/admin/payments">Paiements</router-link>
        <router-link to="/admin/clients">Clients</router-link>
      </aside>
      <section><router-view /></section>
    </div>
  </div>
</template>
