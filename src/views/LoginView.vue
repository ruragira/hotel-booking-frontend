<script setup>
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '../stores/auth'
import { errorMessage, fieldErrors } from '../api/http'

const auth = useAuth()
const route = useRoute()
const router = useRouter()
const form = reactive({ email: '', password: '' })
const error = ref('')
const errors = ref({})
const loading = ref(false)

async function submit() {
  error.value = ''
  errors.value = {}
  loading.value = true
  try {
    await auth.login(form.email, form.password)
    const r = route.query.redirect
    // on n'accepte que les chemins internes (évite une redirection ouverte)
    router.push(typeof r === 'string' && r.startsWith('/') && !r.startsWith('//') ? r : auth.isAdmin ? '/admin' : '/')
  } catch (e) {
    error.value = errorMessage(e)
    errors.value = fieldErrors(e)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="container page" style="max-width:460px">
    <h1 style="font-size:2rem">Se connecter</h1>
    <p v-if="route.query.expired" class="alert bad">Votre session a expiré. Connectez-vous à nouveau.</p>
    <form class="card pad" style="display:grid;gap:1rem" @submit.prevent="submit">
      <label>Email<input v-model="form.email" type="email" autocomplete="username" required /><span class="field-error">{{ errors.email }}</span></label>
      <label>Mot de passe<input v-model="form.password" type="password" autocomplete="current-password" required /><span class="field-error">{{ errors.password }}</span></label>
      <p v-if="error" class="alert bad" role="alert" style="margin:0">{{ error }}</p>
      <button class="btn" :disabled="loading">{{ loading ? 'Connexion…' : 'Se connecter' }}</button>
      <p class="muted" style="margin:0">Pas encore de compte ? <router-link to="/register">Créer un compte</router-link></p>
    </form>
    <p class="muted" style="margin-top:1rem;font-size:.85rem">Comptes de test : admin@hotel.com / Admin@123 · jean@example.com / User@1234</p>
  </div>
</template>
