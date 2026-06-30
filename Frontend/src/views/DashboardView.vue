<script setup>
import { computed, onMounted } from 'vue'
import { RouterLink }        from 'vue-router'
import { useAuthStore }      from '../stores/auth'
import { useBookingStore }   from '../stores/booking'
import { useWalletStore }    from '../stores/wallet'
import { useReviewStore }    from '../stores/review'

const authStore    = useAuthStore()
const bookingStore = useBookingStore()
const walletStore  = useWalletStore()
const reviewStore  = useReviewStore()

onMounted(() => {
  if (authStore.isAdmin) {
    bookingStore.fetchBookings('admin')
  } else {
    // Merge learner-side and tutor-side bookings so becoming a tutor
    // doesn't hide sessions booked while still a tutee.
    bookingStore.fetchAllMyBookings()
  }
  if (authStore.user?.id) {
    reviewStore.fetchForTutor(authStore.user.id)
  }
})

const upcomingBookings = computed(() =>
  bookingStore.bookings.filter(b => b.status === 'pending' || b.status === 'accepted')
)

// Tutor / Admin: earnings from completed sessions
const totalEarnings = computed(() =>
  bookingStore.bookings
    .filter(b => b.status === 'completed')
    .reduce((sum, b) => sum + Number(b.price), 0)
    .toFixed(2)
)

const totalBookings  = computed(() => bookingStore.bookings.length)
const activeSessions = computed(() => bookingStore.bookings.filter(b => b.status === 'accepted').length)

// Live average rating from the review store
const avgRating = computed(() => {
  const uid = authStore.user?.id
  if (!uid) return '—'
  const avg = reviewStore.avgRatingForUser(uid)
  return avg !== null ? avg : '—'
})

// Tutee: wallet balance from walletStore (stays in sync with Wallet page)
const walletBalance = computed(() => walletStore.balance.toFixed(2))

// Tutor earnings from walletStore (updated when tutee pays)
const tutorEarnings = computed(() => walletStore.tutorTotalEarnings.toFixed(2))
</script>

<template>
<div>

  <div class="header">
    <h1>Welcome Back, {{ authStore.user?.name }}</h1>
    <p class="subtitle">
      {{ authStore.isAdmin ? 'Platform overview' : authStore.isTutor ? 'Your teaching dashboard' : 'Manage your learning journey' }}
    </p>
    <span class="badge badge-primary">{{ authStore.user?.role }}</span>
  </div>

  <!-- ── Stats ──────────────────────────────────────────────────────── -->
  <div class="stats">

    <!-- TUTEE wallet balance: shown for everyone except admin, since a
         tutor can still hold a spending balance from before they became
         a tutor. -->
    <template v-if="!authStore.isAdmin">
      <div class="card stat-card">
        <div class="stat-icon earnings">💰</div>
        <div><h3>Wallet Balance</h3><p>RM {{ walletBalance }}</p></div>
      </div>
    </template>

    <!-- TUTOR: also show earnings from paid sessions -->
    <template v-if="authStore.isTutor">
      <div class="card stat-card">
        <div class="stat-icon earnings">💰</div>
        <div><h3>Total Earnings</h3><p>RM {{ tutorEarnings }}</p></div>
      </div>
    </template>

    <!-- ADMIN: show platform-wide earnings -->
    <template v-if="authStore.isAdmin">
      <div class="card stat-card">
        <div class="stat-icon earnings">💰</div>
        <div><h3>Total Earnings</h3><p>RM {{ totalEarnings }}</p></div>
      </div>
    </template>

    <div class="card stat-card">
      <div class="stat-icon bookings">📅</div>
      <div><h3>Bookings</h3><p>{{ totalBookings }}</p></div>
    </div>

    <div class="card stat-card">
      <div class="stat-icon rating">⭐</div>
      <div><h3>Rating</h3><p>{{ avgRating }}</p></div>
    </div>

    <div class="card stat-card">
      <div class="stat-icon bookings">👨‍🎓</div>
      <div><h3>Active Sessions</h3><p>{{ activeSessions }}</p></div>
    </div>

  </div>

  <!-- ── Quick Actions ────────────────────────────────────────────────── -->
  <div class="card" style="margin-bottom:25px">
    <h2 style="margin-bottom:20px">Quick Actions</h2>
    <div style="display:flex;gap:15px;flex-wrap:wrap">
      <RouterLink v-if="!authStore.isAdmin" to="/discover">
        <button>Find Tutors</button>
      </RouterLink>
      <RouterLink v-if="authStore.isAdmin" to="/admin">
        <button>Admin Panel</button>
      </RouterLink>
      <RouterLink to="/bookings"><button class="btn-outline">Bookings</button></RouterLink>
      <RouterLink to="/calendar"><button class="btn-outline">Open Calendar</button></RouterLink>
      <RouterLink to="/chat"><button class="btn-outline">Messages</button></RouterLink>
      <RouterLink to="/wallet"><button class="btn-outline">Wallet</button></RouterLink>
    </div>
  </div>

  <!-- ── Upcoming Sessions ─────────────────────────────────────────────── -->
  <div class="card">
    <div class="header">
      <h2>Upcoming Sessions</h2>
      <p class="subtitle">
        {{ authStore.isTutor ? 'Sessions you will be teaching' : authStore.isAdmin ? 'All upcoming sessions' : 'Your next learning appointments' }}
      </p>
    </div>

    <div v-if="upcomingBookings.length" class="booking-list upcoming-scroll">
      <div
        v-for="booking in upcomingBookings"
        :key="booking.id"
        class="card booking-item"
        :class="booking.status"
      >
        <div class="booking-info">
          <h3>{{ booking.subject }}</h3>
          <p>{{ authStore.isTutor ? 'Student' : 'Tutor' }}: {{ booking.tutor }}</p>
          <p>{{ booking.date }}</p>
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

    <div v-else class="empty-state">
      <i class="fa-solid fa-calendar-days"></i>
      <p v-if="!authStore.isAdmin">
        No upcoming bookings. <RouterLink to="/discover" style="color:var(--primary)">Find a tutor</RouterLink>!
      </p>
      <p v-else>No upcoming sessions.</p>
    </div>
  </div>

  <!-- ── Recent Activity ──────────────────────────────────────────────── -->
  <div class="card" style="margin-top:25px">
    <div class="header">
      <h2>Recent Activity</h2>
      <p class="subtitle">Latest updates from your account</p>
    </div>

    <div class="list-feed">
      <div
        v-for="booking in bookingStore.bookings.slice(0,5)"
        :key="booking.id"
        class="feed-item"
      >
        <div class="feed-info">
          <span>{{ booking.subject }}</span>
          <small>{{ booking.date }}</small>
        </div>
        <span
          class="badge"
          :class="{
            'badge-success': booking.status === 'completed',
            'badge-warning': booking.status === 'accepted',
            'badge-primary': booking.status === 'pending',
            'badge-danger':  booking.status === 'declined',
          }"
        >
          {{ booking.status }}
        </span>
      </div>

      <div v-if="!bookingStore.bookings.length" class="empty-state">
        <p>No recent activity.</p>
      </div>
    </div>
  </div>

</div>
</template>
