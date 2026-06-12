import { defineStore } from 'pinia'

export const useTutorStore = defineStore('tutor', {
  state: () => ({
    search: '',

    tutors: [
      {
        id: 1,
        name: 'Ali Ahmad',
        faculty: 'Computer Science',
        skill: 'Web Development',
        rating: 4.8,
        price: 30,
        bio: 'Experienced Vue and Laravel tutor.',
        reviews: [
          {
            id: 1,
            user: 'Sarah',
            rating: 5,
            comment: 'Excellent tutor!'
          }
        ]
      },

      {
        id: 2,
        name: 'Siti Nur',
        faculty: 'Software Engineering',
        skill: 'Database Systems',
        rating: 4.7,
        price: 25,
        bio: 'Specialized in MySQL and PostgreSQL.',
        reviews: []
      }
    ]
  }),

  getters: {
    filteredTutors(state) {
      return state.tutors.filter(t =>
        t.name.toLowerCase().includes(state.search.toLowerCase()) ||
        t.skill.toLowerCase().includes(state.search.toLowerCase())
      )
    }
  }
})