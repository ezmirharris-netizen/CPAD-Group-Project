import { defineStore } from 'pinia'

export const useReviewStore = defineStore('review', {
  state: () => ({
    reviews: [
      {
        id: 1,
        user: 'Sarah',
        rating: 5,
        comment: 'Very helpful tutor.'
      },

      {
        id: 2,
        user: 'John',
        rating: 4,
        comment: 'Good explanation.'
      }
    ]
  }),

  actions: {
    addReview(review) {
      this.reviews.push({
        id: Date.now(),
        ...review
      })
    }
  }
})