import { defineStore } from 'pinia'
import api from '../api.js'

function safeParseUser() {
  try {
    const raw = localStorage.getItem('user')
    if (!raw || raw === 'undefined' || raw === 'null') return null
    return JSON.parse(raw)
  } catch (e) {
    localStorage.removeItem('user')
    return null
  }
}

function safeGetToken() {
  try {
    const token = localStorage.getItem('token')
    if (!token || token === 'undefined' || token === 'null' || token === 'demo-token') {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      return null
    }
    return token
  } catch (e) {
    return null
  }
}

function persistUser(user) {
  try { localStorage.setItem('user', JSON.stringify(user)) } catch (e) {}
}

// Demo account credentials shown on the login page for convenience
export const DEMO_ACCOUNTS = [
  { key: 'admin',      label: 'System Admin',  email: 'admin@skillswap.com', password: 'admin123' },
  { key: 'tutor-john', label: 'John Tutor',    email: 'tutor@skillswap.com', password: '123456'   },
  { key: 'tutor-sarah',label: 'Sarah Lim',     email: 'sarah@skillswap.com', password: '123456'   },
  { key: 'tutee',      label: 'Demo Student',  email: 'demo@skillswap.com',  password: 'password123' },
]

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user:    safeParseUser(),
    token:   safeGetToken(),
    loading: false,
    error:   null,
    approvalNotification: localStorage.getItem('ss_approval_notif') || null
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
    isTutor:    (state) => state.user?.role === 'tutor',
    isTutee:    (state) => state.user?.role === 'tutee',
    isAdmin:    (state) => state.user?.role === 'admin',
    needsTutorSetup: (state) =>
      state.user?.role === 'tutor' && !state.user?.approved
  },

  actions: {

    async login(email, password) {
      this.loading = true
      this.error   = null

      try {
        const res = await api.post('/login', { email, password })
        const { token, user } = res.data
        this.token = token
        this.user  = user
        persistUser(user)
        localStorage.setItem('token', token)
        return true

      } catch (err) {
        this.error = err.response?.data?.error || 'Invalid email or password.'
        return false

      } finally {
        this.loading = false
      }
    },

    async register(userData) {
      this.loading = true
      this.error   = null

      try {
        const res = await api.post('/register', userData)
        const { token, user } = res.data
        this.token = token
        this.user  = user
        persistUser(user)
        localStorage.setItem('token', token)
        return true

      } catch (err) {
        this.error = err.response?.data?.error || 'Registration failed. Please try again.'
        return false

      } finally {
        this.loading = false
      }
    },

    async updateProfile(profileData) {
      try {
        const res = await api.put('/profile', profileData)
        if (res.data?.user) {
          const serverUser = { ...this.user, ...res.data.user }
          this.user = serverUser
          persistUser(serverUser)
        }
      } catch (err) {
        // Keep existing user data on failure
      }
    },

    notifyApproval(tutorName) {
      const msg = `✅ Your tutor account has been approved! You can now appear in Discover.`
      this.approvalNotification = msg
      try { localStorage.setItem('ss_approval_notif', msg) } catch(e) {}
    },

    dismissApprovalNotification() {
      this.approvalNotification = null
      try { localStorage.removeItem('ss_approval_notif') } catch(e) {}
    },

    applyAsTutor(profileData) {
      const updated = {
        ...this.user,
        role: 'tutor',
        approved: false,
        needsTutorSetup: true,
        ...profileData
      }
      this.user = updated
      persistUser(updated)
    },

    logout() {
      this.user  = null
      this.token = null
      this.approvalNotification = null
      try {
        localStorage.removeItem('user')
        localStorage.removeItem('token')
        localStorage.removeItem('ss_approval_notif')
        localStorage.removeItem('ss_bookings')
        localStorage.removeItem('ss_wallet')
      } catch (e) {}
    }
  }
})
