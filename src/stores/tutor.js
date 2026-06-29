import { defineStore } from 'pinia'
import api from '../api.js'

function save(key, val) { try { localStorage.setItem(key, JSON.stringify(val)) } catch(e) {} }
function load(key, fallback) {
  try {
    const r = localStorage.getItem(key)
    if (!r || r === 'undefined' || r === 'null') return fallback
    return JSON.parse(r)
  } catch { return fallback }
}

const DEMO_TUTORS = [
  { id: 2,  name: 'Sarah Lim',   faculty: 'Faculty of Computing',   skill: 'Vue.js',         skills: ['Vue.js','React.js'],                  skill_id: 1, rating: 4.9, price: 40, hourlyRate: 40, bio: 'Passionate Vue.js & web dev tutor with 3 years experience.', level: 'Advanced', approved: true },
  { id: 2,  name: 'Sarah Lim',   faculty: 'Faculty of Computing',   skill: 'React.js',        skills: ['Vue.js','React.js'],                  skill_id: 2, rating: 4.9, price: 40, hourlyRate: 40, bio: 'Passionate Vue.js & web dev tutor with 3 years experience.', level: 'Advanced', approved: true },
  { id: 3,  name: 'Jason Tan',   faculty: 'Faculty of Engineering', skill: 'Mathematics',     skills: ['Mathematics'],                        skill_id: 3, rating: 4.8, price: 35, hourlyRate: 35, bio: 'Mathematics tutor specialising in calculus and linear algebra.', level: 'Advanced', approved: true },
  { id: 4,  name: 'Nur Aina',    faculty: 'Faculty of Science',     skill: 'Chemistry',       skills: ['Chemistry'],                          skill_id: 4, rating: 4.7, price: 50, hourlyRate: 50, bio: 'Chemistry and biology tutor, love making science fun.', level: 'Expert',   approved: true },
  { id: 5,  name: 'Alicia Wong', faculty: 'Faculty of Business',    skill: 'Accounting',      skills: ['Accounting'],                         skill_id: 5, rating: 5.0, price: 60, hourlyRate: 60, bio: 'Accounting & finance tutor helping students ace their exams.', level: 'Expert',   approved: true },
  { id: 6,  name: 'John Tutor',  faculty: 'Faculty of Computing',   skill: 'Java',            skills: ['Java','Python','Data Structures'],     skill_id: 6, rating: 4.6, price: 35, hourlyRate: 35, bio: 'Full-stack developer teaching Java, Python and Data Structures.', level: 'Advanced', approved: true },
  { id: 6,  name: 'John Tutor',  faculty: 'Faculty of Computing',   skill: 'Python',          skills: ['Java','Python','Data Structures'],     skill_id: 7, rating: 4.6, price: 35, hourlyRate: 35, bio: 'Full-stack developer teaching Java, Python and Data Structures.', level: 'Advanced', approved: true },
  { id: 6,  name: 'John Tutor',  faculty: 'Faculty of Computing',   skill: 'Data Structures', skills: ['Java','Python','Data Structures'],     skill_id: 8, rating: 4.6, price: 35, hourlyRate: 35, bio: 'Full-stack developer teaching Java, Python and Data Structures.', level: 'Advanced', approved: true },
]

const DEMO_SESSIONS = [
  { id: 101, tutorId: 2, tutorName: 'Sarah Lim', title: 'Vue 3 Masterclass', subject: 'Vue.js', cost: 55, description: 'Deep-dive into Vue 3 Composition API, Pinia and Vite.', faculty: 'Faculty of Computing', approved: true },
  { id: 102, tutorId: 6, tutorName: 'John Tutor', title: 'Java for Beginners', subject: 'Java', cost: 40, description: 'From zero to OOP hero — covers syntax, classes, and exceptions.', faculty: 'Faculty of Computing', approved: true },
]

export const useTutorStore = defineStore('tutor', {
  state: () => ({
    tutors:          [...DEMO_TUTORS],
    liveSessions:    load('ss_live_sessions', [...DEMO_SESSIONS]),
    pendingTutors:   load('ss_pending_tutors', []),
    pendingSessions: load('ss_pending_sessions', []),
    loading: false,
    error:   null
  }),

  getters: {
    approvedTutors: (state) => state.tutors.filter(t => t.approved !== false)
  },

  actions: {
    // Explicitly re-read from localStorage — call this in onMounted of pages
    // that need guaranteed fresh data (e.g. AdminView after an account switch)
    reloadFromStorage() {
      const pt = load('ss_pending_tutors', [])
      const ps = load('ss_pending_sessions', [])
      this.pendingTutors   = pt
      this.pendingSessions = ps
    },

    async fetchTutors(keyword = '', faculty = '') {
      this.loading = true
      this.error   = null
      try {
        const params = {}
        if (keyword) params.keyword = keyword
        if (faculty) params.faculty = faculty
        const url = keyword || faculty ? '/tutors/search' : '/tutors'
        const res = await api.get(url, { params })
        const data = Array.isArray(res.data) ? res.data : []
        if (data.length) this.tutors = data.map(t => ({ ...t, approved: true }))
      } catch {
        // Keep demo tutors on failure
      } finally {
        this.loading = false
      }
    },

    addPendingTutor(user) {
      // Always re-read from storage first to avoid duplicates across renders
      this.pendingTutors = load('ss_pending_tutors', [])
      const already = this.pendingTutors.some(t => t.id === user.id || t.email === user.email)
      if (already) {
        // Update the existing record with the latest profile data
        const idx = this.pendingTutors.findIndex(t => t.id === user.id || t.email === user.email)
        if (idx !== -1) {
          this.pendingTutors[idx] = {
            ...this.pendingTutors[idx],
            bio:        user.bio || this.pendingTutors[idx].bio,
            skills:     user.skills?.length ? user.skills : this.pendingTutors[idx].skills,
            hourlyRate: user.hourlyRate || this.pendingTutors[idx].hourlyRate,
          }
        }
      } else {
        this.pendingTutors.push({
          id:          user.id,
          name:        user.name,
          email:       user.email,
          faculty:     user.faculty || '',
          bio:         user.bio || '',
          skills:      Array.isArray(user.skills) ? [...user.skills] : [],
          hourlyRate:  user.hourlyRate || 0,
          appliedAt:   new Date().toISOString().slice(0, 10)
        })
      }
      save('ss_pending_tutors', this.pendingTutors)
    },

    approveTutor(tutorId) {
      const idx = this.pendingTutors.findIndex(t => t.id === tutorId)
      if (idx === -1) return
      const tutor = this.pendingTutors[idx]
      const skills = Array.isArray(tutor.skills) && tutor.skills.length ? tutor.skills : ['General Tutoring']
      skills.forEach((skill, i) => {
        this.tutors.push({
          id: tutor.id, name: tutor.name, faculty: tutor.faculty,
          skill, skills: tutor.skills, skill_id: Date.now() + i,
          rating: 0, price: Number(tutor.hourlyRate) || 0, hourlyRate: Number(tutor.hourlyRate) || 0,
          bio: tutor.bio, level: 'Beginner', approved: true
        })
      })
      this.pendingTutors.splice(idx, 1)
      save('ss_pending_tutors', this.pendingTutors)
    },

    rejectTutor(tutorId) {
      this.pendingTutors = this.pendingTutors.filter(t => t.id !== tutorId)
      save('ss_pending_tutors', this.pendingTutors)
    },

    addPendingSession(session) {
      this.pendingSessions = load('ss_pending_sessions', this.pendingSessions)
      this.pendingSessions.push({
        id: Date.now(), tutorId: session.tutorId, tutorName: session.tutorName,
        title: session.title, subject: session.subject, cost: Number(session.cost) || 0,
        description: session.description || '', faculty: session.faculty || '',
        submittedAt: new Date().toISOString().slice(0, 10), approved: false
      })
      save('ss_pending_sessions', this.pendingSessions)
    },

    approveSession(sessionId) {
      const idx = this.pendingSessions.findIndex(s => s.id === sessionId)
      if (idx === -1) return
      const session = { ...this.pendingSessions[idx], approved: true }
      this.tutors.push({
        id: session.tutorId, name: session.tutorName, faculty: session.faculty,
        skill: session.subject, skills: [session.subject], skill_id: session.id,
        rating: 0, price: session.cost, hourlyRate: session.cost,
        bio: session.description, level: 'Intermediate', approved: true, sessionTitle: session.title
      })
      this.liveSessions.push({ ...session })
      this.pendingSessions.splice(idx, 1)
      save('ss_pending_sessions', this.pendingSessions)
      save('ss_live_sessions', this.liveSessions)
    },

    rejectSession(sessionId) {
      this.pendingSessions = this.pendingSessions.filter(s => s.id !== sessionId)
      save('ss_pending_sessions', this.pendingSessions)
    },

    deleteTutor(tutorId) {
      this.tutors = this.tutors.filter(t => t.id !== tutorId)
      try { api.delete(`/tutors/${tutorId}`) } catch {}
    }
  }
})
