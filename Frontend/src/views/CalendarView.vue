<script setup>
import { ref, computed } from 'vue'
import { useBookingStore } from '../stores/booking'

const bookingStore = useBookingStore()

const currentDate = ref(new Date())
const selectedDay = ref(null)

const monthName = computed(() =>
  currentDate.value.toLocaleString('default', {
    month: 'long',
    year: 'numeric'
  })
)

const daysInMonth = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()

  return new Date(year, month + 1, 0).getDate()
})

const firstDay = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()

  return new Date(year, month, 1).getDay()
})

const calendarDays = computed(() => {
  const days = []

  for (let i = 0; i < firstDay.value; i++) {
    days.push(null)
  }

  for (let i = 1; i <= daysInMonth.value; i++) {
    days.push(i)
  }

  return days
})

function previousMonth() {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() - 1,
    1
  )
}

function nextMonth() {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() + 1,
    1
  )
}

function selectDay(day) {
  selectedDay.value = day
}

const sessionsForSelectedDay = computed(() => {
  if (!selectedDay.value) return []

  return bookingStore.bookings.filter(booking => {
    const bookingDay = parseInt(
      booking.date.split(' ')[0]
    )

    return bookingDay === selectedDay.value
  })
})

function hasSession(day) {
  return bookingStore.bookings.some(booking => {
    const bookingDay = parseInt(
      booking.date.split(' ')[0]
    )

    return bookingDay === day
  })
}
</script>

<template>

<div>

  <div class="header">

    <h1>Calendar</h1>

    <p class="subtitle">
      Manage your tutoring schedule
    </p>

  </div>

  <div class="calendar-wrapper">

    <!-- Calendar -->

    <div class="card calendar-main">

      <div class="calendar-header">

        <button
          class="cal-nav-btn"
          @click="previousMonth"
        >
          ←
        </button>

        <h2>
          {{ monthName }}
        </h2>

        <button
          class="cal-nav-btn"
          @click="nextMonth"
        >
          →
        </button>

      </div>

      <!-- Weekdays -->

      <div class="calendar-weekdays">

        <div>Sun</div>
        <div>Mon</div>
        <div>Tue</div>
        <div>Wed</div>
        <div>Thu</div>
        <div>Fri</div>
        <div>Sat</div>

      </div>

      <!-- Days -->

      <div class="calendar-days-grid">

        <div
          v-for="(day,index) in calendarDays"
          :key="index"
          class="day-cell"
          :class="{
            empty: !day,
            selected: selectedDay === day,
            'has-session': day && hasSession(day)
          }"
          @click="day && selectDay(day)"
        >
          {{ day }}
        </div>

      </div>

    </div>

    <!-- Details Panel -->

    <div class="card calendar-details-panel">

      <h3>
        Session Details
      </h3>

      <template v-if="selectedDay">

        <div class="details-date-header">

          Selected Day

        </div>

        <h2 style="margin-bottom:20px;">
          {{ selectedDay }}
          {{ currentDate.toLocaleString('default',{month:'long'}) }}
        </h2>

        <div
          v-if="sessionsForSelectedDay.length"
        >

          <div
            v-for="session in sessionsForSelectedDay"
            :key="session.id"
            class="session-detail-card"
          >

            <h4>
              📘 {{ session.subject }}
            </h4>

            <p>
              Tutor:
              <strong>
                {{ session.tutor }}
              </strong>
            </p>

            <p>
              Price:
              <strong>
                RM {{ session.price }}
              </strong>
            </p>

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

        <div
          v-else
          class="empty-state"
        >

          <i class="fa-solid fa-calendar-xmark"></i>

          <p>
            No sessions scheduled.
          </p>

        </div>

      </template>

      <div
        v-else
        class="empty-state"
      >

        <i class="fa-solid fa-calendar-days"></i>

        <p>
          Select a day to view sessions.
        </p>

      </div>

    </div>

  </div>

</div>

</template>