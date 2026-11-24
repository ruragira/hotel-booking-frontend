<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../stores/auth'
import { useToast } from '../stores/toast'
import { errorMessage, fieldErrors } from '../api/http'

const auth = useAuth()
const router = useRouter()
const toast = useToast()
const form = reactive({ fullName: '', email: '', password: '', phone: '', address: '' })
const error = ref('')
const errors = ref({})
const loading = ref(false)

async function submit() {
  error.value = ''
  errors.value = {}
  loading.value = true
  try {
    await auth.register({ ...form })
    toast.ok('Compte créé. Bienvenue !')
    router.push('/')
  } catch (e) {
    error.value = errorMessage(e)
    errors.value = fieldErrors(e)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="container page" style="max-width:520px">
    <h1 style="font-size:2rem">Créer un compte</h1>
    <form class="card pad" style="display:grid;gap:1rem" @submit.prevent="submit">
      <label>Nom complet<input v-model="form.fullName" required /><span class="field-error">{{ errors.fullName }}</span></label>
      <label>Email<input v-model="form.email" type="email" autocomplete="username" required /><span class="field-error">{{ errors.email }}</span></label>
      <label>Mot de passe (8 caractères minimum)<input v-model="form.password" type="password" autocomplete="new-password" minlength="8" required /><span class="field-error">{{ errors.password }}</span></label>
      <label>Téléphone<input v-model="form.phone" /><span class="field-error">{{ errors.phone }}</span></label>
      <label>Adresse<input v-model="form.address" /><span class="field-error">{{ errors.address }}</span></label>
      <p v-if="error" class="alert bad" role="alert" style="margin:0">{{ error }}</p>
      <button class="btn accent" :disabled="loading">{{ loading ? 'Création…' : 'Créer mon compte' }}</button>
      <p class="muted" style="margin:0">Déjà inscrit ? <router-link to="/login">Se connecter</router-link></p>
    </form>
  </div>
</template>
