import { createRouter, createWebHashHistory } from 'vue-router'
import LoginView     from '../views/LoginView.vue'
import DashboardView from '../views/DashboardView.vue'
import DiscoveryView from '../views/DiscoveryView.vue'
import BookingView   from '../views/BookingView.vue'
import CalendarView  from '../views/CalendarView.vue'
import ChatView      from '../views/ChatView.vue'
import WalletView    from '../views/WalletView.vue'
import ProfileView   from '../views/ProfileView.vue'
import AdminView     from '../views/AdminView.vue'

const routes = [
  { path: '/',          redirect: '/login' },
  { path: '/login',     name: 'login',     component: LoginView },
  { path: '/dashboard', name: 'dashboard', component: DashboardView, meta: { requiresAuth: true } },
  { path: '/discover',  name: 'discover',  component: DiscoveryView, meta: { requiresAuth: true } },
  { path: '/bookings',  name: 'bookings',  component: BookingView,   meta: { requiresAuth: true } },
  { path: '/calendar',  name: 'calendar',  component: CalendarView,  meta: { requiresAuth: true } },
  { path: '/chat',      name: 'chat',      component: ChatView,      meta: { requiresAuth: true } },
  { path: '/wallet',    name: 'wallet',    component: WalletView,    meta: { requiresAuth: true } },
  {
    path: '/profile', name: 'profile', component: ProfileView,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin', name: 'admin', component: AdminView,
    meta: { requiresAuth: true, requiresAdmin: true }
  }
]

const router = createRouter({ history: createWebHashHistory(), routes })

function safeGetUser() {
  try {
    const raw = localStorage.getItem('user')
    if (!raw || raw === 'undefined' || raw === 'null') return null
    return JSON.parse(raw)
  } catch {
    localStorage.removeItem('user')
    return null
  }
}

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const user  = safeGetUser()

  // Must be logged in for protected routes
  if (to.meta.requiresAuth && !token) return next('/login')

  // Admin-only routes
  if (to.meta.requiresAdmin && user?.role !== 'admin') return next('/dashboard')

  // Already logged in — skip login page
  if (to.path === '/login' && token) {
    return next(user?.role === 'admin' ? '/admin' : '/dashboard')
  }

  // New tutor who hasn't completed setup → redirect to profile (mandatory wall)
  if (to.meta.requiresAuth && user?.needsTutorSetup && to.path !== '/profile' && to.path !== '/login') {
    return next('/profile')
  }

  next()
})

export default router
