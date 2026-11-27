<script setup>
import NavBar from './components/NavBar.vue'
import ToastHost from './components/ToastHost.vue'
</script>

<template>
  <NavBar />
  <main><router-view /></main>
  <footer class="footer">Rivage · Projet Programmation côté serveur — Groupe 10 <span style="font-weight: bold; margin-left: 12px;">VERSION 2</span></footer>
  <ToastHost />
</template>
