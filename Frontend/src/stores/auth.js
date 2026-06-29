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
    if (!token || token === 'undefined' || token === 'null') return null
    return token
  } catch (e) {
    return null
  }
}

function persistUser(user) {
  try { localStorage.setItem('user', JSON.stringify(user)) } catch (e) {}
}

// All demo accounts — used by both login fallback and the account switcher
export const DEMO_ACCOUNTS = [
  {
    key: 'admin',
    label: 'System Admin', email: 'admin@skillswap.com', password: 'admin123',
    user: { id: 1, name: 'System Admin', email: 'admin@skillswap.com', role: 'admin',
            faculty: 'Administration', bio: 'Platform administrator.',
            course: 'N/A', year: 0, skills: [], hourlyRate: '', availability: '',
            approved: true, needsTutorSetup: false }
  },
  {
    key: 'tutor-john',
    label: 'John Tutor', email: 'tutor@skillswap.com', password: '123456',
    user: { id: 6, name: 'John Tutor', email: 'tutor@skillswap.com', role: 'tutor',
            faculty: 'Faculty of Computing', bio: 'Full-stack developer teaching Java, Python and Data Structures.',
            course: 'Software Engineering', year: 3, skills: ['Java','Python','Data Structures'],
            hourlyRate: 35, availability: 'Weekdays 8PM-11PM',
            approved: true, needsTutorSetup: false }
  },
  {
    key: 'tutor-sarah',
    label: 'Sarah Lim', email: 'sarah@skillswap.com', password: '123456',
    user: { id: 2, name: 'Sarah Lim', email: 'sarah@skillswap.com', role: 'tutor',
            faculty: 'Faculty of Computing', bio: 'Passionate Vue.js & web dev tutor with 3 years experience.',
            course: 'Computer Science', year: 4, skills: ['Vue.js','React.js'],
            hourlyRate: 40, availability: 'Weekends',
            approved: true, needsTutorSetup: false }
  },
  {
    key: 'tutee',
    label: 'Demo Student', email: 'student@skillswap.com', password: '123456',
    user: { id: 7, name: 'Demo Student', email: 'student@skillswap.com', role: 'tutee',
            faculty: 'Faculty of Computing', bio: '',
            course: 'Information Systems', year: 2, skills: [],
            hourlyRate: '', availability: '',
            approved: true, needsTutorSetup: false }
  },
]

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user:    safeParseUser(),
    token:   safeGetToken(),
    loading: false,
    error:   null,
    // Notification shown after admin approves a tutor account
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

      } catch {
        const match = DEMO_ACCOUNTS.find(a => a.email === email && a.password === password)

        if (match) {
          this.token = 'demo-token'
          this.user  = { ...match.user }
          persistUser(this.user)
          localStorage.setItem('token', 'demo-token')
          return true
        }

        // Generic fallback for any credentials
        if (email && password) {
          const user = {
            id: Date.now(), name: email.split('@')[0], email,
            role: 'tutee', faculty: '', bio: '',
            course: '', year: 1, skills: [], hourlyRate: '', availability: '',
            approved: true, needsTutorSetup: false
          }
          this.token = 'demo-token'
          this.user  = user
          persistUser(user)
          localStorage.setItem('token', 'demo-token')
          return true
        }

        this.error = 'Login failed. Please check your credentials.'
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

      } catch {
        const isNewTutor = userData.role === 'tutor'
        const user = {
          id:              Date.now(),
          name:            userData.name      || 'New User',
          email:           userData.email     || '',
          role:            userData.role      || 'tutee',
          faculty:         userData.faculty   || '',
          course:          userData.course    || '',
          year:            userData.year      || 1,
          bio:             '',
          skills:          [],
          hourlyRate:      '',
          availability:    '',
          // New tutors need admin approval before appearing in Discover
          approved:        !isNewTutor,
          needsTutorSetup: isNewTutor
        }
        this.token = 'demo-token'
        this.user  = user
        persistUser(user)
        localStorage.setItem('token', 'demo-token')
        return true

      } finally {
        this.loading = false
      }
    },

    async updateProfile(profileData) {
      const updated = { ...this.user, ...profileData }
      this.user = updated
      persistUser(updated)

      try {
        const res = await api.put('/profile', profileData)
        if (res.data?.user) {
          const serverUser = { ...updated, ...res.data.user }
          this.user = serverUser
          persistUser(serverUser)
        }
      } catch {
        // Keep localStorage update
      }
    },

    // Instant account switcher — switches without full logout/login
    switchToDemo(email) {
      const match = DEMO_ACCOUNTS.find(a => a.email === email)
      if (!match) return false
      this.user  = { ...match.user }
      this.token = 'demo-token'
      this.error = null
      persistUser(this.user)
      localStorage.setItem('token', 'demo-token')
      return true
    },

    // Called by admin when approving a tutor registration
    notifyApproval(tutorName) {
      const msg = `✅ Your tutor account has been approved! You can now appear in Discover.`
      this.approvalNotification = msg
      try { localStorage.setItem('ss_approval_notif', msg) } catch(e) {}
    },

    dismissApprovalNotification() {
      this.approvalNotification = null
      try { localStorage.removeItem('ss_approval_notif') } catch(e) {}
    },

    // A tutee who wants to become a tutor
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
      } catch (e) {}
    }
  }
})
