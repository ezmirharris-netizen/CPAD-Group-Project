import { defineStore } from 'pinia'
import api from '../api.js'

export const useSkillStore = defineStore('skill', {
  state: () => ({
    // All skills that exist in the database
    allSkills: [],
    // Skills attached to the current logged-in user's profile
    userSkills: [],
    loading: false,
    error: null,
  }),

  getters: {
    trendingSkills(state) {
      // Fall back to a count-based sort; real counts come from the tutor store
      return [...state.allSkills].slice(0, 5)
    },
    categoriesList(state) {
      const cats = [...new Set(state.allSkills.map(s => s.category).filter(Boolean))]
      return cats.sort()
    },
  },

  actions: {
    async fetchAllSkills() {
      try {
        const res = await api.get('/skills')
        this.allSkills = res.data
      } catch (err) {
        console.error('Failed to load skills', err)
      }
    },

    // Skills on the CURRENT logged-in user's own profile. Previously this
    // called a `/tutors/{id}/skills` route that didn't exist on the
    // backend (404, silently swallowed), so saved skills never reloaded
    // after a refresh/re-login even though they were in the database.
    async fetchUserSkills() {
      try {
        const res = await api.get('/profile/skills')
        this.userSkills = Array.isArray(res.data) ? res.data : []
      } catch (err) {
        this.userSkills = []
      }
    },

    /**
     * Add a skill to the logged-in user's profile.
     * Sends { name, category, hourly_rate, level } to POST /api/skills.
     * On success the skills table is updated and userSkills is refreshed.
     *
     * @param {string} name
     * @param {string} category
     * @param {number} hourlyRate
     * @param {string} level
     * @returns {{ skill, user_skill_id }|null}
     */
    async addSkillToProfile(name, category, hourlyRate = 0, level = 'Intermediate') {
      this.loading = true
      this.error = null
      try {
        const res = await api.post('/skills', {
          name,
          category,
          hourly_rate: hourlyRate,
          level,
        })
        // Keep allSkills in sync
        const exists = this.allSkills.find(s => s.id === res.data.skill.id)
        if (!exists) this.allSkills.push(res.data.skill)
        // Keep userSkills in sync
        const alreadyUser = this.userSkills.find(s => s.id === res.data.skill.id)
        if (!alreadyUser) this.userSkills.push(res.data.skill)
        return res.data
      } catch (err) {
        this.error = err.response?.data?.error || 'Failed to add skill'
        return null
      } finally {
        this.loading = false
      }
    },

    /**
     * Remove a skill from the logged-in user's profile.
     * @param {number} skillId
     */
    async removeSkillFromProfile(skillId) {
      try {
        await api.delete(`/skills/${skillId}`)
        this.userSkills = this.userSkills.filter(s => s.id !== skillId)
      } catch (err) {
        console.error('Failed to remove skill', err)
      }
    },
  },
})