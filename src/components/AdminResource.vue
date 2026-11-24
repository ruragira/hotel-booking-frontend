<script setup>
import { ref, reactive, onMounted } from 'vue'
import { http, errorMessage, fieldErrors } from '../api/http'
import { useToast } from '../stores/toast'
import Pagination from './Pagination.vue'
import { badgeClass } from '../utils/format'

/**
 * Tableau CRUD générique piloté par une configuration (voir src/admin/resources.js) :
 * liste paginée + recherche + filtres, création/modification (modale), suppression, actions de ligne.
 */
const props = defineProps({ config: { type: Object, required: true } })
const toast = useToast()

const rows = ref([])
const meta = reactive({ page: 0, totalPages: 0, totalElements: 0 })
const q = ref('')
const filters = reactive({})
const loading = ref(false)
const error = ref('')
const options = reactive({})

const modal = ref(false)
const editingId = ref(null)
const form = reactive({})
const errors = ref({})
const formError = ref('')
const saving = ref(false)

async function load(page = 0) {
  loading.value = true
  error.value = ''
  try {
    const params = { page, size: 10, ...(props.config.params || {}) }
    if (q.value) params.q = q.value
    for (const [k, v] of Object.entries(filters)) if (v) params[k] = v
    const { data } = await http.get(props.config.endpoint, { params })
    rows.value = data.content
    meta.page = data.page; meta.totalPages = data.totalPages; meta.totalElements = data.totalElements
  } catch (e) {
    error.value = errorMessage(e)
  } finally {
    loading.value = false
  }
}

async function loadOptions() {
  for (const f of props.config.fields || []) {
    if (!f.optionsEndpoint) continue
    try {
      const { data } = await http.get(f.optionsEndpoint, { params: { size: 200, ...(f.optionsParams || {}) } })
      options[f.key] = data.content.map((o) => ({ value: o.id, label: f.optionLabel ? f.optionLabel(o) : o.name }))
    } catch (e) { options[f.key] = [] }
  }
}
const optionsOf = (f) => f.options || options[f.key] || []

function resetForm(values) {
  Object.keys(form).forEach((k) => delete form[k])
  for (const f of props.config.fields || []) {
    form[f.key] = f.type === 'multiselect' ? [] : f.type === 'checkbox' ? true : f.default ?? ''
  }
  Object.assign(form, values || {})
}
function openCreate() {
  resetForm()
  editingId.value = null
  errors.value = {}; formError.value = ''
  modal.value = true
}
function openEdit(row) {
  resetForm(props.config.toForm ? props.config.toForm(row) : row)
  editingId.value = row.id
  errors.value = {}; formError.value = ''
  modal.value = true
}

async function save() {
  saving.value = true
  errors.value = {}; formError.value = ''
  try {
    let payload = { ...form }
    for (const f of props.config.fields || []) if (f.type === 'number' && payload[f.key] === '') payload[f.key] = null
    if (props.config.toPayload) payload = props.config.toPayload(payload, !!editingId.value)
    if (editingId.value) await http.put(`${props.config.endpoint}/${editingId.value}`, payload)
    else await http.post(props.config.endpoint, payload)
    toast.ok(editingId.value ? 'Modifications enregistrées.' : 'Élément créé.')
    modal.value = false
    await load(meta.page)
    loadOptions()
  } catch (e) {
    errors.value = fieldErrors(e)
    formError.value = errorMessage(e)
  } finally {
    saving.value = false
  }
}

async function remove(row) {
  if (!confirm(props.config.deleteConfirm || 'Supprimer définitivement cet élément ?')) return
  try {
    await http.delete(`${props.config.endpoint}/${row.id}`)
    toast.ok('Élément supprimé.')
    await load(rows.value.length === 1 && meta.page > 0 ? meta.page - 1 : meta.page)
  } catch (e) { toast.error(errorMessage(e)) }
}

async function runAction(a, row) {
  try {
    await a.run(row)
    toast.ok(a.success || 'Action effectuée.')
    await load(meta.page)
  } catch (e) { toast.error(errorMessage(e)) }
}

function cell(col, row) {
  const v = col.format ? col.format(row) : row[col.key]
  if (typeof v === 'boolean') return v ? 'Oui' : 'Non'
  return v ?? '—'
}

onMounted(() => { load(); loadOptions() })
</script>

<template>
  <div>
    <div class="row between" style="margin-bottom:1rem">
      <h2 style="margin:0">{{ config.title }}</h2>
      <button v-if="config.canCreate !== false" class="btn accent" @click="openCreate">Ajouter</button>
    </div>

    <form class="row" style="margin-bottom:1rem;align-items:end" @submit.prevent="load(0)">
      <label v-if="config.searchable !== false" style="min-width:240px">Recherche<input v-model="q" :placeholder="config.searchPlaceholder || 'Rechercher…'" /></label>
      <label v-for="fl in config.filters || []" :key="fl.key">{{ fl.label }}
        <select v-model="filters[fl.key]" @change="load(0)"><option value="">Tous</option><option v-for="o in fl.options" :key="o.value" :value="o.value">{{ o.label }}</option></select>
      </label>
      <button class="btn ghost">Filtrer</button>
    </form>

    <p v-if="error" class="alert bad" role="alert">{{ error }}</p>

    <div class="card table-wrap">
      <table>
        <thead>
          <tr><th v-for="c in config.columns" :key="c.label">{{ c.label }}</th><th>Actions</th></tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row.id">
            <td v-for="c in config.columns" :key="c.label">
              <span v-if="c.badge" class="badge" :class="badgeClass(row[c.key])">{{ cell(c, row) }}</span>
              <template v-else>{{ cell(c, row) }}</template>
            </td>
            <td>
              <div class="actions">
                <template v-for="a in config.actions || []" :key="a.label">
                  <button v-if="!a.show || a.show(row)" class="btn ghost small" @click="runAction(a, row)">{{ a.label }}</button>
                </template>
                <button v-if="config.canEdit !== false" class="btn ghost small" @click="openEdit(row)">Modifier</button>
                <button v-if="config.canDelete !== false" class="btn danger small" @click="remove(row)">Supprimer</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-if="!loading && !rows.length" class="empty">Aucun élément.</p>
    </div>
    <Pagination :page="meta.page" :total-pages="meta.totalPages" :total="meta.totalElements" @change="load" />

    <div v-if="modal" class="overlay" @keydown.esc="modal = false" @click.self="modal = false">
      <form class="modal" role="dialog" aria-modal="true" style="display:grid;gap:1rem" @submit.prevent="save">
        <h2 style="margin:0">{{ editingId ? 'Modifier' : 'Ajouter' }} — {{ config.singular }}</h2>
        <div class="form-grid">
          <template v-for="f in config.fields" :key="f.key">
            <label v-if="f.type === 'checkbox'" class="check"><input v-model="form[f.key]" type="checkbox" />{{ f.label }}</label>
            <fieldset v-else-if="f.type === 'multiselect'" style="grid-column:1/-1;border:1px solid var(--line);border-radius:8px">
              <legend style="font-weight:600;font-size:.9rem">{{ f.label }}</legend>
              <div class="chips"><label v-for="o in optionsOf(f)" :key="o.value" class="check"><input v-model="form[f.key]" type="checkbox" :value="o.value" />{{ o.label }}</label></div>
            </fieldset>
            <label v-else :style="f.type === 'textarea' ? 'grid-column:1/-1' : ''">{{ f.label }}
              <textarea v-if="f.type === 'textarea'" v-model="form[f.key]"></textarea>
              <select v-else-if="f.type === 'select'" v-model="form[f.key]">
                <option value="" disabled>Choisir…</option>
                <option v-for="o in optionsOf(f)" :key="o.value" :value="o.value">{{ o.label }}</option>
              </select>
              <input v-else-if="f.type === 'number'" v-model.number="form[f.key]" type="number" :min="f.min" :max="f.max" :step="f.step || 1" />
              <input v-else v-model="form[f.key]" :type="f.type || 'text'" :autocomplete="f.type === 'password' ? 'new-password' : 'off'" />
              <span class="field-error">{{ errors[f.key] }}</span>
            </label>
          </template>
        </div>
        <p v-if="formError" class="alert bad" role="alert" style="margin:0">{{ formError }}</p>
        <div class="row" style="justify-content:flex-end">
          <button type="button" class="btn ghost" @click="modal = false">Annuler</button>
          <button class="btn accent" :disabled="saving">{{ saving ? 'Enregistrement…' : 'Enregistrer' }}</button>
        </div>
      </form>
    </div>
  </div>
</template>
