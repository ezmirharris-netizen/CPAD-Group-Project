<script setup>
import { ref, computed } from 'vue'
import TutorCard from '../components/TutorCard.vue'
import { useTutorStore } from '../stores/tutor'

const tutorStore = useTutorStore()

const search = ref('')
const facultyFilter = ref('')

const filteredTutors = computed(() => {
  return tutorStore.tutors.filter(tutor => {

    const keyword = search.value.toLowerCase()

    const matchesSearch =
      tutor.name.toLowerCase().includes(keyword) ||
      tutor.skill.toLowerCase().includes(keyword) ||
      tutor.course?.toLowerCase().includes(keyword)

    const matchesFaculty =
      !facultyFilter.value ||
      tutor.faculty === facultyFilter.value

    return matchesSearch && matchesFaculty
  })
})

const totalTutors = computed(() => filteredTutors.value.length)

const averageRating = computed(() => {
  if (!filteredTutors.value.length) return 0

  const total = filteredTutors.value.reduce(
    (sum, tutor) => sum + tutor.rating,
    0
  )

  return (total / filteredTutors.value.length).toFixed(1)
})

const averagePrice = computed(() => {
  if (!filteredTutors.value.length) return 0

  const total = filteredTutors.value.reduce(
    (sum, tutor) => sum + tutor.price,
    0
  )

  return (total / filteredTutors.value.length).toFixed(0)
})

const trendingSkills = computed(() => {
  const skills = {}

  tutorStore.tutors.forEach(tutor => {
    skills[tutor.skill] = (skills[tutor.skill] || 0) + 1
  })

  return Object.entries(skills)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
})
</script>

<template>

<div>

  <!-- Header -->

  <div class="header">

    <h1>Find Tutors</h1>

    <p class="subtitle">
      Discover talented students ready to teach and learn from.
    </p>

  </div>

  <!-- Stats -->

  <div class="stats">

    <div class="card stat-card">

      <div class="stat-icon bookings">
        👨‍🏫
      </div>

      <div>
        <h3>Total Tutors</h3>
        <p>{{ totalTutors }}</p>
      </div>

    </div>

    <div class="card stat-card">

      <div class="stat-icon rating">
        ⭐
      </div>

      <div>
        <h3>Average Rating</h3>
        <p>{{ averageRating }}</p>
      </div>

    </div>

    <div class="card stat-card">

      <div class="stat-icon earnings">
        💰
      </div>

      <div>
        <h3>Average Price</h3>
        <p>RM {{ averagePrice }}</p>
      </div>

    </div>

  </div>

  <!-- Search -->

  <div class="card search-container">

    <i class="fa-solid fa-magnifying-glass search-icon"></i>

    <input
      v-model="search"
      type="text"
      placeholder="Search tutor, skill or course..."
    >

  </div>

  <!-- Filters -->

  <div
    class="card"
    style="
      margin-bottom:25px;
      display:flex;
      justify-content:space-between;
      align-items:center;
      flex-wrap:wrap;
      gap:15px;
    "
  >

    <div>

      <strong>
        Tutors Found:
      </strong>

      {{ totalTutors }}

    </div>

    <select
      v-model="facultyFilter"
      style="max-width:250px"
    >
      <option value="">
        All Faculties
      </option>

      <option>
        Faculty of Computing
      </option>

      <option>
        Faculty of Engineering
      </option>

      <option>
        Faculty of Science
      </option>

      <option>
        Faculty of Business
      </option>

      <option>
        Faculty of Education
      </option>
    </select>

  </div>

  <!-- Trending Skills -->

  <div
    class="card"
    style="margin-bottom:25px"
  >

    <h3 style="margin-bottom:15px">
      🔥 Trending Skills
    </h3>

    <div
      style="
        display:flex;
        flex-wrap:wrap;
        gap:10px;
      "
    >

      <span
        v-for="skill in trendingSkills"
        :key="skill[0]"
        class="badge badge-primary"
      >
        {{ skill[0] }} ({{ skill[1] }})
      </span>

    </div>

  </div>

  <!-- Tutors -->

  <div
    v-if="filteredTutors.length"
    class="tutor-grid"
  >

    <TutorCard
      v-for="tutor in filteredTutors"
      :key="tutor.id"
      :tutor="tutor"
    />

  </div>

  <!-- Empty State -->

  <div
    v-else
    class="card empty-state"
  >

    <i
      class="fa-solid fa-user-group"
      style="font-size:3rem;margin-bottom:15px"
    ></i>

    <h3>
      No Tutors Found
    </h3>

    <p>
      Try changing your search term or faculty filter.
    </p>

  </div>

</div>

</template>