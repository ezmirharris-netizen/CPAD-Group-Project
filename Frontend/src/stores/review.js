import { defineStore } from 'pinia'

function save(reviews) {
  try { localStorage.setItem('ss_reviews', JSON.stringify(reviews)) } catch(e) {}
}
function load() {
  try {
    const r = localStorage.getItem('ss_reviews')
    if (!r || r === 'undefined') return null
    return JSON.parse(r)
  } catch { return null }
}

const SEED_REVIEWS = [
  { id: 1, reviewerId: 1, revieweeId: 2, reviewerRole: 'admin', revieweeRole: 'tutor', bookingId: null, rating: 5, comment: 'Very helpful tutor.', date: '2026-06-10' },
  { id: 2, reviewerId: 2, revieweeId: 7, reviewerRole: 'tutor', revieweeRole: 'tutee', bookingId: null, rating: 4, comment: 'Good student, well prepared.', date: '2026-06-10' },
  { id: 3, reviewerId: 7, revieweeId: 2, reviewerRole: 'tutee', revieweeRole: 'tutor', bookingId: null, rating: 5, comment: 'Sarah explained everything clearly. Highly recommended!', date: '2026-06-15' },
  { id: 4, reviewerId: 7, revieweeId: 6, reviewerRole: 'tutee', revieweeRole: 'tutor', bookingId: null, rating: 4, comment: 'Great at Java fundamentals, very patient.', date: '2026-06-18' },
]

export const useReviewStore = defineStore('review', {
  state: () => ({
    reviews: load() || [...SEED_REVIEWS]
  }),

  getters: {
    avgRatingForUser: (state) => (userId) => {
      const list = state.reviews.filter(r => r.revieweeId === userId)
      if (!list.length) return null
      return (list.reduce((s, r) => s + r.rating, 0) / list.length).toFixed(1)
    },
    reviewsForUser: (state) => (userId) =>
      state.reviews.filter(r => r.revieweeId === userId)
  },

  actions: {
    addReview({ reviewerId, revieweeId, reviewerRole, revieweeRole, bookingId, rating, comment }) {
      this.reviews.push({
        id: Date.now(),
        reviewerId,
        revieweeId,
        reviewerRole,
        revieweeRole,
        bookingId,
        rating:  Number(rating),
        comment: comment || '',
        date:    new Date().toISOString().slice(0, 10)
      })
      save(this.reviews)
    }
  }
})
