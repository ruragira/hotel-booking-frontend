import axios from 'axios'

// Client HTTP unique : ajoute le jeton JWT et gère les erreurs de l'API.
export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1',
  timeout: 15000
})

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

http.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || ''
    // Jeton expiré ou invalide : on vide la session et on renvoie vers la connexion
    if (error.response?.status === 401 && !url.includes('/auth/login') && localStorage.getItem('token')) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      if (window.location.pathname !== '/login') window.location.assign('/login?expired=1')
    }
    return Promise.reject(error)
  }
)

/** Message lisible à partir d'une erreur Axios (format ApiError du backend). */
export function errorMessage(error) {
  if (!error.response) return 'Impossible de joindre le serveur. Vérifiez que l\'API est démarrée.'
  const data = error.response.data
  if (data?.fieldErrors && Object.keys(data.fieldErrors).length) {
    return Object.values(data.fieldErrors).join(' · ')
  }
  return data?.message || `Erreur ${error.response.status}`
}

/** Erreurs par champ (422) pour afficher les messages sous chaque champ. */
export function fieldErrors(error) {
  return error.response?.data?.fieldErrors || {}
}
