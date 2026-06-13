<script setup>
import BookingCard from '../components/BookingCard.vue'
import { useBookingStore } from '../stores/booking'

const bookingStore = useBookingStore()

function acceptBooking(booking) {
  bookingStore.acceptBooking(booking.id)
}

function completeBooking(booking) {
  bookingStore.completeBooking(booking.id)
}
</script>

<template>
  <div>

    <div class="header">
      <h1>Bookings</h1>
    </div>

    <div class="booking-list">

      <BookingCard
        v-for="booking in bookingStore.bookings"
        :key="booking.id"
        :booking="booking"
        @accept="acceptBooking"
        @complete="completeBooking"
      />

    </div>

  </div>
</template>