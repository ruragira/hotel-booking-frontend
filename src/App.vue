<script setup>
import NavBar from './components/NavBar.vue'
import ToastHost from './components/ToastHost.vue'
</script>

<template>
  <NavBar />
  <main><router-view /></main>
  <footer class="footer">Rivage · Projet Programmation côté serveur — Groupe 10</footer>
  <ToastHost />
</template>
