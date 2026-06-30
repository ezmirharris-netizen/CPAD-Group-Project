<script setup>
import { ref, computed, onMounted } from 'vue'
import { useBookingStore } from '../stores/booking'
import { useAuthStore }    from '../stores/auth'

const bookingStore = useBookingStore()
const authStore    = useAuthStore()

const todayObj = new Date()

// Whether the current user is the tutor on a given booking (a single
// account's bookings list can now contain both tutor-side and learner-side
// sessions merged together).
function isMyTutorBooking(booking) {
  return Number(booking.tutor_id) === Number(authStore.user?.id)
}

onMounted(() => {
  if (authStore.isAdmin) {
    bookingStore.fetchBookings('admin')
  } else {
    // Merge learner-side and tutor-side bookings so becoming a tutor
    // doesn't hide sessions booked while still a tutee.
    bookingStore.fetchAllMyBookings()
  }
  selectedDay.value = todayObj.getDate()
})

const currentDate = ref(new Date())
const selectedDay = ref(todayObj.getDate())

const monthName = computed(() =>
  currentDate.value.toLocaleString('default', { month: 'long', year: 'numeric' })
)

const daysInMonth = computed(() => {
  const year  = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  return new Date(year, month + 1, 0).getDate()
})

const firstDay = computed(() => {
  const year  = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  return new Date(year, month, 1).getDay()
})

const calendarDays = computed(() => {
  const days = []
  for (let i = 0; i < firstDay.value; i++) days.push(null)
  for (let i = 1; i <= daysInMonth.value; i++) days.push(i)
  return days
})

const isToday = (day) => {
  return day &&
    day === todayObj.getDate() &&
    currentDate.value.getMonth() === todayObj.getMonth() &&
    currentDate.value.getFullYear() === todayObj.getFullYear()
}

function previousMonth() {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() - 1,
    1
  )
  selectedDay.value = null
}

function nextMonth() {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() + 1,
    1
  )
  selectedDay.value = null
}

function selectDay(day) {
  selectedDay.value = day
}

function bookingDateMatches(booking, day) {
  if (!booking.schedule_time) return false
  const d = new Date(booking.schedule_time)
  return (
    d.getDate()     === day &&
    d.getMonth()    === currentDate.value.getMonth() &&
    d.getFullYear() === currentDate.value.getFullYear()
  )
}

const sessionsForSelectedDay = computed(() => {
  if (!selectedDay.value) return []
  return bookingStore.bookings.filter(b => bookingDateMatches(b, selectedDay.value))
})

function hasSession(day) {
  return bookingStore.bookings.some(b => bookingDateMatches(b, day))
}

const calendarTitle = computed(() => {
  if (authStore.isAdmin) return 'All sessions across the platform'
  if (authStore.isTutor) return 'Your teaching schedule'
  return 'Manage your tutoring schedule'
})
</script>

<template>

<div>

  <div class="header">
    <h1>Calendar</h1>
    <p class="subtitle">{{ calendarTitle }}</p>
    <span class="badge badge-primary" style="margin-top:6px">{{ authStore.user?.role }}</span>
  </div>

  <div class="calendar-wrapper">

    <!-- Calendar -->
    <div class="card calendar-main">

      <div class="calendar-header">
        <button class="cal-nav-btn" @click="previousMonth">←</button>
        <h2>{{ monthName }}</h2>
        <button class="cal-nav-btn" @click="nextMonth">→</button>
      </div>

      <div class="calendar-weekdays">
        <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div>
        <div>Thu</div><div>Fri</div><div>Sat</div>
      </div>

      <div class="calendar-days-grid">
        <div
          v-for="(day, index) in calendarDays"
          :key="index"
          class="day-cell"
          :class="{
            empty:           !day,
            selected:        selectedDay === day,
            'has-session':   day && hasSession(day),
            'today-cell':    isToday(day)
          }"
          @click="day && selectDay(day)"
        >
          {{ day }}
        </div>
      </div>

    </div>

    <!-- Details Panel -->
    <div class="card calendar-details-panel">
      <h3>Session Details</h3>

      <template v-if="selectedDay">
        <div class="details-date-header">Selected Day</div>
        <h2 style="margin-bottom:20px">
          {{ selectedDay }} {{ currentDate.toLocaleString('default', { month: 'long' }) }}
          <span v-if="isToday(selectedDay)" class="badge badge-primary" style="font-size:.7rem;margin-left:8px">Today</span>
        </h2>

        <div v-if="sessionsForSelectedDay.length">
          <div
            v-for="session in sessionsForSelectedDay"
            :key="session.id"
            class="session-detail-card"
          >
            <h4>📘 {{ session.subject }}</h4>
            <p>{{ isMyTutorBooking(session) ? 'Student' : 'Tutor' }}: <strong>{{ session.tutor }}</strong></p>
            <p>Price: <strong>RM {{ session.price }}</strong></p>
            <span
              class="badge"
              :class="{
                'badge-primary': session.status === 'pending',
                'badge-warning': session.status === 'accepted',
                'badge-success': session.status === 'completed'
              }"
            >
              {{ session.status }}
            </span>
          </div>
        </div>

        <div v-else class="empty-state">
          <i class="fa-solid fa-calendar-xmark"></i>
          <p>No sessions scheduled for this day.</p>
        </div>
      </template>

      <div v-else class="empty-state">
        <i class="fa-solid fa-calendar-days"></i>
        <p>Select a day to view sessions.</p>
      </div>
    </div>

  </div>

</div>

</template>
