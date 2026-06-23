import { defineStore } from 'pinia'

export const useBookingStore = defineStore('booking', {

  state: () => ({
    bookings: [

      {
        id: 1,
        tutor: 'Sarah Lim',
        subject: 'Vue.js',
        date: '25 June 2026',
        status: 'accepted',
        price: 80
      },

      {
        id: 2,
        tutor: 'Jason Tan',
        subject: 'Database Design',
        date: '28 June 2026',
        status: 'completed',
        price: 100
      }

    ]
  })

})

