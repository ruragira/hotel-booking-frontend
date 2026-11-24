<script setup>
import { useRouter } from 'vue-router'
import { useAuth } from '../stores/auth'
import { useToast } from '../stores/toast'

const auth = useAuth()
const router = useRouter()
const toast = useToast()

async function logout() {
  await auth.logout()
  toast.ok('Vous êtes déconnecté.')
  router.push('/')
}
</script>

<template>
  <header class="nav">
    <nav class="container" aria-label="Navigation principale">
      <router-link to="/" class="brand">Riva<b>ge</b></router-link>
      <router-link to="/" class="link">Chambres</router-link>
      <router-link to="/hotels" class="link">Hôtels</router-link>
      <template v-if="auth.isLoggedIn">
        <router-link to="/my-reservations" class="link">Mes réservations</router-link>
        <router-link v-if="auth.isAdmin" to="/admin" class="link">Administration</router-link>
        <router-link to="/profile" class="link">{{ auth.user?.fullName }}</router-link>
        <button class="link" @click="logout">Se déconnecter</button>
      </template>
      <template v-else>
        <router-link to="/login" class="link">Se connecter</router-link>
        <router-link to="/register" class="btn accent small">Créer un compte</router-link>
      </template>
    </nav>
  </header>
</template>
