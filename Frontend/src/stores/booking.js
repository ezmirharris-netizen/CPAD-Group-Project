import { defineStore } from 'pinia'

export const useBookingStore = defineStore('booking', {
  state: () => ({
    bookings: [
      {
        id: 1,
        tutor: 'Ali Ahmad',
        skill: 'Web Development',
        date: '2026-06-20',
        time: '2:00 PM',
        status: 'pending'
      }
    ]
  }),

  getters: {
    pendingBookings(state) {
      return state.bookings.filter(b => b.status === 'pending')
    },

    completedBookings(state) {
      return state.bookings.filter(b => b.status === 'completed')
    }
  },

  actions: {
    createBooking(tutor) {
      this.bookings.push({
        id: Date.now(),
        tutor: tutor.name,
        skill: tutor.skill,
        date: '2026-06-25',
        time: '3:00 PM',
        status: 'pending'
      })
    },

    acceptBooking(id) {
      const booking = this.bookings.find(b => b.id === id)

      if (booking) {
        booking.status = 'accepted'
      }
    },

    completeBooking(id) {
      const booking = this.bookings.find(b => b.id === id)

      if (booking) {
        booking.status = 'completed'
      }
    },

    declineBooking(id) {
      const booking = this.bookings.find(b => b.id === id)

      if (booking) {
        booking.status = 'declined'
      }
    }
  }
})