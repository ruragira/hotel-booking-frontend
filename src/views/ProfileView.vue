<script setup>
import { reactive, ref, onMounted } from 'vue'
import { http, errorMessage, fieldErrors } from '../api/http'
import { useToast } from '../stores/toast'
import { useAuth } from '../stores/auth'

const toast = useToast()
const auth = useAuth()
const form = reactive({ fullName: '', phone: '', address: '' })
const email = ref('')
const error = ref('')
const errors = ref({})

onMounted(async () => {
  try {
    const { data } = await http.get('/clients/me')
    Object.assign(form, { fullName: data.fullName, phone: data.phone || '', address: data.address || '' })
    email.value = data.email
  } catch (e) { error.value = errorMessage(e) }
})

async function save() {
  error.value = ''
  errors.value = {}
  try {
    const { data } = await http.put('/clients/me', { ...form })
    auth.user = { ...auth.user, fullName: data.fullName }
    localStorage.setItem('user', JSON.stringify(auth.user))
    toast.ok('Profil mis à jour.')
  } catch (e) {
    error.value = errorMessage(e)
    errors.value = fieldErrors(e)
  }
}
</script>

<template>
  <div class="container page" style="max-width:520px">
    <h1 style="font-size:2rem">Mon profil</h1>
    <form class="card pad" style="display:grid;gap:1rem" @submit.prevent="save">
      <label>Email<input :value="email" disabled /></label>
      <label>Nom complet<input v-model="form.fullName" required /><span class="field-error">{{ errors.fullName }}</span></label>
      <label>Téléphone<input v-model="form.phone" /><span class="field-error">{{ errors.phone }}</span></label>
      <label>Adresse<input v-model="form.address" /><span class="field-error">{{ errors.address }}</span></label>
      <p v-if="error" class="alert bad" role="alert" style="margin:0">{{ error }}</p>
      <button class="btn">Enregistrer</button>
    </form>
  </div>
</template>
