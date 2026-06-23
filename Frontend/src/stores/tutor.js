import { defineStore } from 'pinia'

export const useTutorStore = defineStore('tutor', {

  state: () => ({

    tutors: [

      {
        id: 1,
        name: 'Sarah Lim',
        faculty: 'Faculty of Computing',
        skill: 'Vue.js',
        rating: 4.9,
        price: 40
      },

      {
        id: 2,
        name: 'Jason Tan',
        faculty: 'Faculty of Engineering',
        skill: 'Mathematics',
        rating: 4.8,
        price: 35
      },

      {
        id: 3,
        name: 'Nur Aina',
        faculty: 'Faculty of Science',
        skill: 'Chemistry',
        rating: 4.7,
        price: 50
      },

      {
        id: 4,
        name: 'Alicia Wong',
        faculty: 'Faculty of Business',
        skill: 'Accounting',
        rating: 5.0,
        price: 60
      }

    ]

  })

})