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
    isTutee: (state) => state.user?.role === 'tutee',
    isAdmin: (state) => state.user?.role === 'admin'
  },

  actions: {

    async login(email, password) {

      this.loading = true
      this.error = null

      try {

        let user

        // ADMIN ACCOUNT

        if (
          email === 'admin@skillswap.com' &&
          password === 'admin123'
        ) {

          user = {
            id: 999,
            name: 'System Admin',
            email,
            role: 'admin',
            faculty: 'Administration',
            course: 'Management',
            year: 0
          }

        }

        // TUTOR ACCOUNT

        else if (
          email === 'tutor@skillswap.com' &&
          password === '123456'
        ) {

          user = {
            id: 2,
            name: 'John Tutor',
            email,
            role: 'tutor',
            faculty: 'Faculty of Computing',
            course: 'Software Engineering',
            year: 3,
            bio: 'Experienced tutor',
            hourlyRate: 35
          }

        }

        // TUTEE ACCOUNT

        else {

          user = {
            id: 1,
            name: 'Demo User',
            email,
            role: 'tutee',
            faculty: 'Faculty of Computing',
            course: 'Software Engineering',
            year: 3
          }

        }

        this.user = user
        this.token = 'demo-token'

        localStorage.setItem(
          'user',
          JSON.stringify(user)
        )

        localStorage.setItem(
          'token',
          this.token
        )

        return true

      } catch (err) {

        this.error = 'Login failed'
        return false

      } finally {

        this.loading = false

      }
    },

    register(userData) {

      const user = {
        id: Date.now(),
        name: userData.name,
        email: userData.email,
        role: userData.role,
        faculty: userData.faculty,
        course: userData.course,
        year: userData.year
      }

      this.user = user
      this.token = 'demo-token'

      localStorage.setItem(
        'user',
        JSON.stringify(user)
      )

      localStorage.setItem(
        'token',
        this.token
      )

      return true
    },

    logout() {

      this.user = null
      this.token = null

      localStorage.removeItem('user')
      localStorage.removeItem('token')
    }
  }
})