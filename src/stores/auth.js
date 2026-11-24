import { defineStore } from 'pinia'
import { http } from '../api/http'

function read(key) {
  try { return JSON.parse(localStorage.getItem(key)) } catch { return null }
}

export const useAuth = defineStore('auth', {
  state: () => ({ token: localStorage.getItem('token'), user: read('user') }),
  getters: {
    isLoggedIn: (s) => !!s.token,
    isAdmin: (s) => s.user?.role === 'ADMIN'
  },
  actions: {
    _set(data) {
      this.token = data.token
      this.user = data.user
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
    },
    async login(email, password) {
      const { data } = await http.post('/auth/login', { email, password })
      this._set(data)
    },
    async register(payload) {
      const { data } = await http.post('/auth/register', payload)
      this._set(data)
    },
    async logout() {
      try { if (this.token) await http.post('/auth/logout') } catch { /* jeton déjà invalide */ }
      this.clear()
    },
    clear() {
      this.token = null
      this.user = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  }
})
