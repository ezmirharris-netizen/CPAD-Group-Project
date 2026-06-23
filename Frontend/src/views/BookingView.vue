<script setup>
import { computed } from 'vue'
import { useBookingStore } from '../stores/booking'

const bookingStore = useBookingStore()

const pendingBookings = computed(() =>
  bookingStore.bookings.filter(
    b => b.status === 'pending'
  )
)

const acceptedBookings = computed(() =>
  bookingStore.bookings.filter(
    b => b.status === 'accepted'
  )
)

const completedBookings = computed(() =>
  bookingStore.bookings.filter(
    b => b.status === 'completed'
  )
)

function acceptBooking(id) {
  bookingStore.updateStatus(id, 'accepted')
}

function declineBooking(id) {
  bookingStore.updateStatus(id, 'declined')
}

function completeBooking(id) {
  bookingStore.updateStatus(id, 'completed')
}
</script>

<template>

<div>

  <!-- Header -->

  <div class="header">

    <h1>Bookings</h1>

    <p class="subtitle">
      Manage all tutoring sessions
    </p>

  </div>

  <!-- Stats -->

  <div class="stats">

    <div class="card stat-card">

      <div class="stat-icon bookings">
        📅
      </div>

      <div>
        <h3>Pending</h3>
        <p>{{ pendingBookings.length }}</p>
      </div>

    </div>

    <div class="card stat-card">

      <div class="stat-icon rating">
        ⏳
      </div>

      <div>
        <h3>Accepted</h3>
        <p>{{ acceptedBookings.length }}</p>
      </div>

    </div>

    <div class="card stat-card">

      <div class="stat-icon earnings">
        ✅
      </div>

      <div>
        <h3>Completed</h3>
        <p>{{ completedBookings.length }}</p>
      </div>

    </div>

  </div>

  <!-- Booking List -->

  <div class="booking-list">

    <div
      v-for="booking in bookingStore.bookings"
      :key="booking.id"
      class="card booking-item"
      :class="booking.status"
    >

      <div class="booking-info">

        <h3>
          {{ booking.subject }}
        </h3>

        <p>
          👨‍🏫 {{ booking.tutor }}
        </p>

        <p>
          📅 {{ booking.date }}
        </p>

        <p>
          💰 RM {{ booking.price }}
        </p>

      </div>

      <div class="booking-actions">

        <span
          class="badge"
          :class="{
            'badge-primary': booking.status === 'pending',
            'badge-warning': booking.status === 'accepted',
            'badge-success': booking.status === 'completed',
            'badge-danger': booking.status === 'declined'
          }"
        >
          {{ booking.status }}
        </span>

        <button
          v-if="booking.status === 'pending'"
          @click="acceptBooking(booking.id)"
        >
          Accept
        </button>

        <button
          v-if="booking.status === 'pending'"
          class="btn-outline"
          @click="declineBooking(booking.id)"
        >
          Decline
        </button>

        <button
          v-if="booking.status === 'accepted'"
          @click="completeBooking(booking.id)"
        >
          Complete
        </button>

      </div>

    </div>

  </div>

  <!-- Empty State -->

  <div
    v-if="!bookingStore.bookings.length"
    class="card empty-state"
  >

    <i class="fa-solid fa-calendar-days"></i>

    <h3>
      No Bookings Yet
    </h3>

    <p>
      Your bookings will appear here.
    </p>

  </div>

</div>

</template>