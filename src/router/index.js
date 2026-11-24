import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '../stores/auth'
import { useToast } from '../stores/toast'

const routes = [
  { path: '/', name: 'home', component: () => import('../views/HomeView.vue') },
  { path: '/hotels', name: 'hotels', component: () => import('../views/HotelsView.vue') },
  { path: '/hotels/:id', name: 'hotel', component: () => import('../views/HotelDetailView.vue') },
  { path: '/login', name: 'login', component: () => import('../views/LoginView.vue') },
  { path: '/register', name: 'register', component: () => import('../views/RegisterView.vue') },
  { path: '/book/:roomId', name: 'book', component: () => import('../views/BookingView.vue'), meta: { auth: true } },
  { path: '/my-reservations', name: 'my-reservations', component: () => import('../views/MyReservationsView.vue'), meta: { auth: true } },
  { path: '/profile', name: 'profile', component: () => import('../views/ProfileView.vue'), meta: { auth: true } },
  {
    path: '/admin',
    component: () => import('../views/admin/AdminLayout.vue'),
    meta: { auth: true, admin: true },
    children: [
      { path: '', name: 'admin', component: () => import('../views/admin/DashboardView.vue') },
      { path: 'hotels', component: () => import('../views/admin/ResourceView.vue'), meta: { resource: 'hotels' } },
      { path: 'seasonal-rates', component: () => import('../views/admin/ResourceView.vue'), meta: { resource: 'seasonalRates' } },
      { path: 'rooms', component: () => import('../views/admin/ResourceView.vue'), meta: { resource: 'rooms' } },
      { path: 'room-types', component: () => import('../views/admin/ResourceView.vue'), meta: { resource: 'roomTypes' } },
      { path: 'amenities', component: () => import('../views/admin/ResourceView.vue'), meta: { resource: 'amenities' } },
      { path: 'reservations', component: () => import('../views/admin/ResourceView.vue'), meta: { resource: 'reservations' } },
      { path: 'payments', component: () => import('../views/admin/ResourceView.vue'), meta: { resource: 'payments' } },
      { path: 'clients', component: () => import('../views/admin/ResourceView.vue'), meta: { resource: 'clients' } }
    ]
  },
  { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('../views/NotFoundView.vue') }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 })
})

// Garde de navigation : pages protégées (connexion) et pages administrateur
router.beforeEach((to) => {
  const auth = useAuth()
  if (to.matched.some((r) => r.meta.auth) && !auth.isLoggedIn) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  if (to.matched.some((r) => r.meta.admin) && !auth.isAdmin) {
    useToast().error('Cette section est réservée aux administrateurs.')
    return { name: 'home' }
  }
})

export default router
