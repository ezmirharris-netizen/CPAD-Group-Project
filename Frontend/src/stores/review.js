import { defineStore } from 'pinia'
import api from '../api.js'

export const useReviewStore = defineStore('review', {
  state: () => ({
    // tutorId -> { reviews: [...], avg: number|null, loading: bool, loaded: bool }
    byTutor: {}
  }),

  getters: {
    avgRatingForUser: (state) => (tutorId) =>
      state.byTutor[tutorId]?.avg ?? null,

    reviewsForUser: (state) => (tutorId) =>
      state.byTutor[tutorId]?.reviews ?? []
  },

  actions: {
    // Pulls the real reviews for a tutor from the database (GET /api/tutors/{id}/reviews)
    async fetchForTutor(tutorId) {
      if (!tutorId) return
      if (!this.byTutor[tutorId]) {
        this.byTutor[tutorId] = { reviews: [], avg: null, loading: false, loaded: false }
      }
      const bucket = this.byTutor[tutorId]
      bucket.loading = true
      try {
        const res = await api.get(`/tutors/${tutorId}/reviews`)
        const rows = Array.isArray(res.data) ? res.data : []
        bucket.reviews = rows.map(r => ({
          id: r.id,
          bookingId: r.booking_id,
          rating: Number(r.rating),
          comment: r.comment || '',
          reviewerName: r.reviewer_name,
          skillName: r.skill_name,
          date: (r.created_at || '').slice(0, 10)
        }))
        bucket.avg = bucket.reviews.length
          ? (bucket.reviews.reduce((s, r) => s + r.rating, 0) / bucket.reviews.length).toFixed(1)
          : null
        bucket.loaded = true
      } catch (err) {
        // keep whatever was previously loaded; surface nothing fatal
      } finally {
        bucket.loading = false
      }
    },

    // Submits a tutee's review of a completed booking to the database (POST /api/reviews)
    async addReview({ bookingId, tutorId, rating, comment }) {
      const res = await api.post('/reviews', {
        booking_id: bookingId,
        rating: Number(rating),
        comment: comment || ''
      })
      // Re-fetch so the UI reflects exactly what's in the database
      if (tutorId) await this.fetchForTutor(tutorId)
      return res.data
    }
  }
})
