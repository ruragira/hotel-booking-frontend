import { defineStore } from 'pinia'

let seq = 0
export const useToast = defineStore('toast', {
  state: () => ({ items: [] }),
  actions: {
    push(message, type = 'ok') {
      const id = ++seq
      this.items.push({ id, message, type })
      setTimeout(() => this.dismiss(id), 4500)
    },
    ok(message) { this.push(message, 'ok') },
    error(message) { this.push(message, 'bad') },
    dismiss(id) { this.items = this.items.filter((t) => t.id !== id) }
  }
})
