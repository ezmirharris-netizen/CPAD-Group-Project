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

// Accounts created via the Register form are appended here (persisted in
// localStorage) so they also show up in the "Switch Demo Account" list.
function loadCustomAccounts() {
  try {
    const raw = localStorage.getItem('ss_custom_accounts')
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch (e) {
    return []
  }
}

function saveCustomAccounts(list) {
  try { localStorage.setItem('ss_custom_accounts', JSON.stringify(list)) } catch (e) {}
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user:    safeParseUser(),
    token:   safeGetToken(),
    loading: false,
    error:   null,
<<<<<<< HEAD
    approvalNotification: localStorage.getItem('ss_approval_notif') || null,
    customAccounts: loadCustomAccounts()
=======
    approvalNotification: localStorage.getItem('ss_approval_notif') || null
>>>>>>> 7f3a5899a67c3a5276f68b25c51b09c2f7360438
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
    isTutor:    (state) => state.user?.role === 'tutor',
    isTutee:    (state) => state.user?.role === 'tutee',
    isAdmin:    (state) => state.user?.role === 'admin',
    // Combined list for the "Switch Demo Account" / login-page credentials UI.
    allDemoAccounts: (state) => [...DEMO_ACCOUNTS, ...state.customAccounts],
    needsTutorSetup: (state) =>
      state.user?.role === 'tutor' && state.user?.approved === false
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
        this.addCustomAccount({
          key:      `user-${user.id}`,
          label:    user.name,
          email:    user.email,
          password: userData.password
        })
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

<<<<<<< HEAD
    addCustomAccount(acc) {
      const exists = this.customAccounts.some(a => a.email === acc.email)
      if (exists) return
      this.customAccounts = [...this.customAccounts, acc]
      saveCustomAccounts(this.customAccounts)
    },

=======
>>>>>>> 7f3a5899a67c3a5276f68b25c51b09c2f7360438
    notifyApproval(tutorName) {
      const msg = `✅ Your tutor account has been approved! You can now appear in Discover.`
      this.approvalNotification = msg
      try { localStorage.setItem('ss_approval_notif', msg) } catch(e) {}
    },

    dismissApprovalNotification() {
      this.approvalNotification = null
      try { localStorage.removeItem('ss_approval_notif') } catch(e) {}
    },

<<<<<<< HEAD
    async applyAsTutor(profileData) {
      // Persist the role change to the backend so it survives subsequent
      // profile saves (previously this was local-only and got overwritten
      // by the server's stale 'tutee' role on the next updateProfile call).
      try {
        await api.put('/profile', { role: 'tutor', bio: profileData.bio })
      } catch (err) {
        // Fall back to local-only update if the backend call fails
      }
=======
    applyAsTutor(profileData) {
>>>>>>> 7f3a5899a67c3a5276f68b25c51b09c2f7360438
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

    // Mark the currently logged-in user as an unapproved tutor. Used right
    // after registering directly as a tutor (separate from applyAsTutor,
    // which is for tutees upgrading from the profile page).
    markTutorPending() {
      if (!this.user) return
      const updated = { ...this.user, approved: false }
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
