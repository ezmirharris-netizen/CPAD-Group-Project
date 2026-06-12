import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
    loading: false,
    error: null
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
    isTutor: (state) => state.user?.role === 'tutor',
    isLearner: (state) => state.user?.role === 'learner'
  },

  actions: {
    async login(email, password) {
      this.loading = true
      this.error = null

      try {
        // Demo mode
        const user = {
          id: 1,
          name: 'Mir Ting',
          email,
          role: 'learner',
          faculty: 'Faculty of Computing',
          year: 3
        }

        this.user = {
              id: 1,
              name: 'Mir Ting',
              email,
              role: 'learner',
              faculty: 'Faculty of Computing',
              year: 3
            }
        this.token = 'demo-token'

        localStorage.setItem('user', JSON.stringify(user))
        localStorage.setItem('token', this.token)

        return true
      } catch (err) {
        this.error = 'Login failed'
        return false
      } finally {
        this.loading = false
      }
    },

    logout() {
      this.user = null
      this.token = null

      localStorage.removeItem('user')
      localStorage.removeItem('token')
    }
  }
})