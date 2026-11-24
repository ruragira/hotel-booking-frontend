import { http } from '../api/http'
import { money, fdate, fdatetime, statusLabel, methodLabel, pct } from '../utils/format'

// Configuration des écrans d'administration (consommée par AdminResource.vue)
const RES_STATUS = [
  { value: 'PENDING', label: 'En attente' }, { value: 'CONFIRMED', label: 'Confirmée' },
  { value: 'COMPLETED', label: 'Terminée' }, { value: 'CANCELLED', label: 'Annulée' }
]

export const resources = {
  hotels: {
    title: 'Hôtels', singular: 'hôtel', endpoint: '/hotels', params: { includeInactive: true },
    searchPlaceholder: 'Nom, ville, pays…',
    deleteConfirm: 'Supprimer cet hôtel, ses chambres et ses avis ?',
    columns: [
      { key: 'name', label: 'Nom' }, { key: 'city', label: 'Ville' }, { key: 'country', label: 'Pays' },
      { label: 'Étoiles', format: (r) => '★'.repeat(r.stars) }, { key: 'active', label: 'Actif' }
    ],
    fields: [
      { key: 'name', label: 'Nom' }, { key: 'city', label: 'Ville' }, { key: 'country', label: 'Pays' },
      { key: 'address', label: 'Adresse' },
      { key: 'stars', label: 'Étoiles (1 à 5)', type: 'number', min: 1, max: 5, default: 3 },
      { key: 'imageUrl', label: 'URL de l\'image' },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'active', label: 'Hôtel actif (visible des clients)', type: 'checkbox' },
      { key: 'amenityIds', label: 'Équipements', type: 'multiselect', optionsEndpoint: '/amenities' }
    ],
    toForm: (r) => ({ ...r, imageUrl: r.imageUrl || '', description: r.description || '', amenityIds: r.amenities.map((a) => a.id) })
  },

  rooms: {
    title: 'Chambres', singular: 'chambre', endpoint: '/rooms', params: { includeInactive: true },
    searchPlaceholder: 'Numéro ou nom d\'hôtel…',
    columns: [
      { label: 'Hôtel', format: (r) => r.hotel.name }, { key: 'number', label: 'N°' },
      { label: 'Type', format: (r) => r.roomType.name }, { label: 'Prix / nuit', format: (r) => money(r.pricePerNight) },
      { key: 'capacity', label: 'Capacité' }, { key: 'active', label: 'Active' }
    ],
    fields: [
      { key: 'hotelId', label: 'Hôtel', type: 'select', optionsEndpoint: '/hotels', optionsParams: { includeInactive: true } },
      { key: 'roomTypeId', label: 'Type de chambre', type: 'select', optionsEndpoint: '/room-types' },
      { key: 'number', label: 'Numéro' },
      { key: 'pricePerNight', label: 'Prix par nuit', type: 'number', min: 0.01, step: 0.01 },
      { key: 'capacity', label: 'Capacité (personnes)', type: 'number', min: 1, max: 20, default: 2 },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'active', label: 'Chambre active', type: 'checkbox' }
    ],
    toForm: (r) => ({ ...r, hotelId: r.hotel.id, roomTypeId: r.roomType.id, description: r.description || '' })
  },

  seasonalRates: {
    title: 'Tarifs saisonniers', singular: 'saison tarifaire', endpoint: '/seasonal-rates',
    searchPlaceholder: 'Nom de la saison ou de l\'hôtel…',
    columns: [
      { key: 'hotelName', label: 'Hôtel' }, { key: 'name', label: 'Saison' },
      { label: 'Période', format: (r) => `${fdate(r.startDate)} → ${fdate(r.endDate)}` },
      { label: 'Coefficient', format: (r) => `×${Number(r.multiplier).toFixed(2)} (${pct(r.multiplier)})` }
    ],
    fields: [
      { key: 'hotelId', label: 'Hôtel', type: 'select', optionsEndpoint: '/hotels', optionsParams: { includeInactive: true } },
      { key: 'name', label: 'Nom de la saison (ex. Haute saison)' },
      { key: 'startDate', label: 'Du (inclus)', type: 'date' },
      { key: 'endDate', label: 'Au (inclus)', type: 'date' },
      { key: 'multiplier', label: 'Coefficient (1.30 = +30 %, 0.85 = −15 %)', type: 'number', min: 0.1, max: 5, step: 0.01, default: 1.2 }
    ]
  },

  roomTypes: {
    title: 'Types de chambre', singular: 'type de chambre', endpoint: '/room-types',
    columns: [{ key: 'name', label: 'Nom' }, { key: 'description', label: 'Description' }],
    fields: [{ key: 'name', label: 'Nom' }, { key: 'description', label: 'Description', type: 'textarea' }],
    toForm: (r) => ({ ...r, description: r.description || '' })
  },

  amenities: {
    title: 'Équipements', singular: 'équipement', endpoint: '/amenities',
    columns: [{ key: 'name', label: 'Nom' }, { key: 'icon', label: 'Icône' }],
    fields: [{ key: 'name', label: 'Nom' }, { key: 'icon', label: 'Icône (facultatif)' }],
    toForm: (r) => ({ ...r, icon: r.icon || '' })
  },

  clients: {
    title: 'Clients', singular: 'client', endpoint: '/clients', searchPlaceholder: 'Nom, email, téléphone…',
    deleteConfirm: 'Supprimer ce compte, ses réservations et ses avis ?',
    columns: [
      { key: 'fullName', label: 'Nom' }, { key: 'email', label: 'Email' }, { key: 'phone', label: 'Téléphone' },
      { key: 'role', label: 'Rôle' }, { key: 'active', label: 'Actif' }
    ],
    fields: [
      { key: 'fullName', label: 'Nom complet' }, { key: 'email', label: 'Email', type: 'email' },
      { key: 'password', label: 'Mot de passe (laisser vide pour ne pas changer)', type: 'password' },
      { key: 'phone', label: 'Téléphone' }, { key: 'address', label: 'Adresse' },
      { key: 'role', label: 'Rôle', type: 'select', options: [{ value: 'USER', label: 'Utilisateur' }, { value: 'ADMIN', label: 'Administrateur' }], default: 'USER' },
      { key: 'active', label: 'Compte actif', type: 'checkbox' }
    ],
    toForm: (r) => ({ ...r, password: '', phone: r.phone || '', address: r.address || '' }),
    toPayload: (p) => { if (!p.password) delete p.password; return p }
  },

  reservations: {
    title: 'Réservations', singular: 'réservation', endpoint: '/reservations', canCreate: false, canEdit: false,
    searchPlaceholder: 'Référence, client, hôtel…',
    filters: [{ key: 'status', label: 'Statut', options: RES_STATUS }],
    deleteConfirm: 'Supprimer définitivement cette réservation ?',
    columns: [
      { key: 'reference', label: 'Référence' }, { key: 'clientName', label: 'Client' },
      { label: 'Hôtel / chambre', format: (r) => `${r.hotelName} · ${r.roomNumber}` },
      { label: 'Séjour', format: (r) => `${fdate(r.checkIn)} → ${fdate(r.checkOut)}` },
      { label: 'Total', format: (r) => money(r.totalPrice) },
      { key: 'status', label: 'Statut', badge: true, format: (r) => statusLabel(r.status) }
    ],
    actions: [
      { label: 'Confirmer', show: (r) => r.status === 'PENDING', success: 'Réservation confirmée.', run: (r) => http.patch(`/reservations/${r.id}/status`, { status: 'CONFIRMED' }) },
      { label: 'Terminer', show: (r) => r.status === 'CONFIRMED', success: 'Séjour terminé.', run: (r) => http.patch(`/reservations/${r.id}/status`, { status: 'COMPLETED' }) },
      { label: 'Annuler', show: (r) => ['PENDING', 'CONFIRMED'].includes(r.status), success: 'Réservation annulée.', run: (r) => http.patch(`/reservations/${r.id}/cancel`) }
    ]
  },

  payments: {
    title: 'Paiements', singular: 'paiement', endpoint: '/payments', canCreate: false, searchable: false,
    filters: [{ key: 'status', label: 'Statut', options: [{ value: 'PAID', label: 'Payé' }, { value: 'REFUNDED', label: 'Remboursé' }] }],
    deleteConfirm: 'Supprimer ce paiement ? La réservation repassera en attente.',
    columns: [
      { key: 'reservationReference', label: 'Réservation' }, { label: 'Montant', format: (r) => money(r.amount) },
      { label: 'Mode', format: (r) => methodLabel(r.method) },
      { key: 'status', label: 'Statut', badge: true, format: (r) => statusLabel(r.status) },
      { key: 'transactionRef', label: 'Transaction' }, { label: 'Date', format: (r) => fdatetime(r.paidAt) }
    ],
    fields: [
      { key: 'method', label: 'Mode de paiement', type: 'select', options: [
        { value: 'CARD', label: 'Carte bancaire' }, { value: 'MOBILE_MONEY', label: 'Mobile money' },
        { value: 'BANK_TRANSFER', label: 'Virement' }, { value: 'CASH', label: 'Espèces' }] },
      { key: 'status', label: 'Statut', type: 'select', options: [{ value: 'PAID', label: 'Payé' }, { value: 'REFUNDED', label: 'Remboursé' }] }
    ],
    toForm: (r) => ({ method: r.method, status: r.status })
  }
}
