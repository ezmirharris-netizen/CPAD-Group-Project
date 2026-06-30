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

export const useTutorStore = defineStore('tutor', {
  state: () => ({
    tutors:          [],
    liveSessions:    [],
    pendingTutors:   load('ss_pending_tutors', []),
    pendingSessions: load('ss_pending_sessions', []),
    loading: false,
    error:   null
  }),

  getters: {
    approvedTutors: (state) => state.tutors.filter(t => t.approved !== false)
  },

  actions: {
    reloadFromStorage() {
      this.pendingTutors   = load('ss_pending_tutors', [])
      this.pendingSessions = load('ss_pending_sessions', [])
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
        this.tutors = data.map(t => ({ ...t, approved: true }))
      } catch (err) {
        this.error = 'Could not load tutors. Please check your connection.'
        this.tutors = []
      } finally {
        this.loading = false
      }
    },

    addPendingTutor(user) {
      this.pendingTutors = load('ss_pending_tutors', [])
      const already = this.pendingTutors.some(t => t.id === user.id || t.email === user.email)
      if (already) {
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
          id:         user.id,
          name:       user.name,
          email:      user.email,
          faculty:    user.faculty || '',
          bio:        user.bio || '',
          skills:     Array.isArray(user.skills) ? [...user.skills] : [],
          hourlyRate: user.hourlyRate || 0,
          appliedAt:  new Date().toISOString().slice(0, 10)
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
