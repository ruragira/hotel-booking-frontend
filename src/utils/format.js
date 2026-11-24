const currency = import.meta.env.VITE_CURRENCY || 'USD'

export const money = (v) =>
  v == null ? '—' : new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(Number(v))

export const fdate = (d) =>
  d ? new Date(d.length === 10 ? d + 'T00:00:00' : d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

export const fdatetime = (d) =>
  d ? new Date(d).toLocaleString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'

export function nightsBetween(a, b) {
  if (!a || !b) return 0
  const n = Math.round((new Date(b) - new Date(a)) / 86400000)
  return n > 0 ? n : 0
}

/** 1.25 -> « +25 % », 0.85 -> « −15 % » */
export function pct(multiplier) {
  const p = Math.round((Number(multiplier) - 1) * 100)
  return (p >= 0 ? '+' : '−') + Math.abs(p) + ' %'
}

export const todayISO = () => new Date().toISOString().slice(0, 10)

export const STATUS_LABELS = {
  PENDING: 'En attente', CONFIRMED: 'Confirmée', CANCELLED: 'Annulée', COMPLETED: 'Terminée',
  PAID: 'Payé', REFUNDED: 'Remboursé'
}
export const METHOD_LABELS = {
  CARD: 'Carte bancaire', MOBILE_MONEY: 'Mobile money', BANK_TRANSFER: 'Virement', CASH: 'Espèces'
}
export const statusLabel = (s) => STATUS_LABELS[s] || s
export const methodLabel = (m) => METHOD_LABELS[m] || m
export const badgeClass = (s) =>
  ({ PENDING: 'warn', CONFIRMED: 'ok', COMPLETED: 'info', CANCELLED: 'bad', PAID: 'ok', REFUNDED: 'bad' }[s] || 'info')
