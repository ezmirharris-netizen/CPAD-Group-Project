<script setup>
import { ref } from 'vue'
import CalendarGrid from '../components/CalendarGrid.vue'
import SessionCard from '../components/SessionCard.vue'

const selectedDate = ref(null)

const days = Array.from({ length: 30 }, (_, i) => ({
  date: i + 1,
  day: i + 1,
  hasSession: [5, 10, 15, 22].includes(i + 1)
}))

const sessions = [
  {
    title: 'Vue.js Session',
    tutor: 'Ali Ahmad',
    time: '2:00 PM'
  }
]

function selectDay(day) {
  selectedDate.value = day.date
}
</script>

<template>

<div class="calendar-wrapper">

  <div class="card calendar-main">

    <div class="calendar-header">
      <h2>June 2026</h2>
    </div>

    <CalendarGrid
      :days="days"
      :selected="selectedDate"
      @select="selectDay"
    />

  </div>

  <div class="card calendar-details-panel">

    <h3>Schedule Details</h3>

    <SessionCard
      v-for="session in sessions"
      :key="session.title"
      :session="session"
    />

  </div>

</div>

</template>