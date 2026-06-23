import { createRouter, createWebHistory } from 'vue-router'

import LoginView from '../views/LoginView.vue'
import DashboardView from '../views/DashboardView.vue'
import DiscoveryView from '../views/DiscoveryView.vue'
import BookingView from '../views/BookingView.vue'
import CalendarView from '../views/CalendarView.vue'
import ChatView from '../views/ChatView.vue'
import WalletView from '../views/WalletView.vue'
import ProfileView from '../views/ProfileView.vue'
import AdminView from '../views/AdminView.vue'


const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },

  {
    path: '/login',
    name: 'login',
    component: LoginView
  },

  {
    path: '/dashboard',
    name: 'dashboard',
    component: DashboardView
  },

  {
    path: '/discover',
    name: 'discover',
    component: DiscoveryView
  },

  {
    path: '/bookings',
    name: 'bookings',
    component: BookingView
  },

  {
    path: '/calendar',
    name: 'calendar',
    component: CalendarView
  },

  {
    path: '/chat',
    name: 'chat',
    component: ChatView
  },

  {
    path: '/wallet',
    name: 'wallet',
    component: WalletView
  },

  {
    path: '/profile',
    name: 'profile',
    component: ProfileView
  },

  {
    path: '/admin',
    name: 'admin',
    component: AdminView
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router