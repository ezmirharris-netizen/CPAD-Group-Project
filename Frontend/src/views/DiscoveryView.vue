<script setup>
import { ref } from 'vue'
import TutorCard from '../components/TutorCard.vue'
import TutorProfileModal from '../components/TutorProfileModal.vue'

import { useTutorStore } from '../stores/tutor'
import { useBookingStore } from '../stores/booking'

const tutorStore = useTutorStore()
const bookingStore = useBookingStore()

const selectedTutor = ref(null)

function openTutor(tutor) {
  selectedTutor.value = tutor
}

function bookTutor(tutor) {
  bookingStore.createBooking(tutor)
  selectedTutor.value = null
}
</script>

<template>
  <div>

    <div class="header">
      <h1>Discover Tutors</h1>
    </div>

    <div class="search-container card">
      <i class="fa-solid fa-search search-icon"></i>

      <input
        v-model="tutorStore.search"
        placeholder="Search by skill or tutor..."
      />
    </div>

    <div class="tutor-grid">

      <TutorCard
        v-for="tutor in tutorStore.filteredTutors"
        :key="tutor.id"
        :tutor="tutor"
        @view-profile="openTutor"
      />

    </div>

    <TutorProfileModal
      v-if="selectedTutor"
      :tutor="selectedTutor"
      @close="selectedTutor = null"
      @book="bookTutor"
    />

  </div>
</template>