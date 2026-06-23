<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useBookingStore } from '../stores/booking'

const authStore = useAuthStore()
const bookingStore = useBookingStore()

const upcomingBookings = computed(() =>
  bookingStore.bookings.slice(0, 5)
)

const totalEarnings = computed(() => {
  return bookingStore.bookings
    .filter(b => b.status === 'completed')
    .reduce((sum, b) => sum + b.price, 0)
})

const totalBookings = computed(() =>
  bookingStore.bookings.length
)

const activeSessions = computed(() =>
  bookingStore.bookings.filter(
    b => b.status === 'accepted'
  ).length
)
</script>

<template>
<div>

  <!-- Header -->

  <div class="header">

    <h1>
      Welcome Back,
      {{ authStore.user?.name }}
    </h1>

    <p class="subtitle">
      Manage your learning journey
    </p>

    <span class="badge badge-primary">
      {{ authStore.user?.role }}
    </span>

  </div>

  <!-- Statistics -->

  <div class="stats">

    <div class="card stat-card">

      <div class="stat-icon earnings">
        💰
      </div>

      <div>
        <h3>Total Earnings</h3>
        <p>RM {{ totalEarnings }}</p>
      </div>

    </div>

    <div class="card stat-card">

      <div class="stat-icon bookings">
        📅
      </div>

      <div>
        <h3>Bookings</h3>
        <p>{{ totalBookings }}</p>
      </div>

    </div>

    <div class="card stat-card">

      <div class="stat-icon rating">
        ⭐
      </div>

      <div>
        <h3>Rating</h3>
        <p>4.9</p>
      </div>

    </div>

    <div class="card stat-card">

      <div class="stat-icon bookings">
        👨‍🎓
      </div>

      <div>
        <h3>Active Sessions</h3>
        <p>{{ activeSessions }}</p>
      </div>

    </div>

  </div>

  <!-- Quick Actions -->

  <div
    class="card"
    style="margin-bottom:25px"
  >

    <h2 style="margin-bottom:20px">
      Quick Actions
    </h2>

    <div
      style="
        display:flex;
        gap:15px;
        flex-wrap:wrap;
      "
    >

      <RouterLink to="/discover">
        <button>
          Find Tutors
        </button>
      </RouterLink>

      <RouterLink to="/calendar">
        <button class="btn-outline">
          Open Calendar
        </button>
      </RouterLink>

      <RouterLink to="/messages">
        <button class="btn-outline">
          Messages
        </button>
      </RouterLink>

      <RouterLink to="/wallet">
        <button class="btn-outline">
          Wallet
        </button>
      </RouterLink>

    </div>

  </div>

  <!-- Upcoming Sessions -->

  <div class="card">

    <div class="header">

      <h2>
        Upcoming Sessions
      </h2>

      <p class="subtitle">
        Your next learning appointments
      </p>

    </div>

    <div
      v-if="upcomingBookings.length"
      class="booking-list"
    >

      <div
        v-for="booking in upcomingBookings"
        :key="booking.id"
        class="card booking-item"
        :class="booking.status"
      >

        <div class="booking-info">

          <h3>
            {{ booking.subject }}
          </h3>

          <p>
            Tutor:
            {{ booking.tutor }}
          </p>

          <p>
            {{ booking.date }}
          </p>

        </div>

        <div>

          <span
            class="badge"
            :class="{
              'badge-success': booking.status === 'completed',
              'badge-warning': booking.status === 'accepted',
              'badge-primary': booking.status === 'pending'
            }"
          >
            {{ booking.status }}
          </span>

        </div>

      </div>

    </div>

    <div
      v-else
      class="empty-state"
    >

      <i class="fa-solid fa-calendar-days"></i>

      <p>
        No bookings available.
      </p>

    </div>

  </div>

  <!-- Recent Activity -->

  <div
    class="card"
    style="margin-top:25px"
  >

    <div class="header">

      <h2>
        Recent Activity
      </h2>

      <p class="subtitle">
        Latest updates from your account
      </p>

    </div>

    <div class="list-feed">

      <div class="feed-item">

        <div class="feed-info">

          <span>
            Booking Completed
          </span>

          <small>
            Web Development Session
          </small>

        </div>

        <span class="feed-amount income">
          +RM35
        </span>

      </div>

      <div class="feed-item">

        <div class="feed-info">

          <span>
            New Review Received
          </span>

          <small>
            ★★★★★ Excellent Tutor
          </small>

        </div>

      </div>

      <div class="feed-item">

        <div class="feed-info">

          <span>
            Calendar Updated
          </span>

          <small>
            Session scheduled for tomorrow
          </small>

        </div>

      </div>

    </div>

  </div>

</div>
</template>