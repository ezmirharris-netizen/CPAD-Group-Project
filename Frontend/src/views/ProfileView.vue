<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()

const profile = ref({
  ...authStore.user,

  bio:
    authStore.user?.bio ||
    'Passionate tutor helping students succeed.',

  skills:
    authStore.user?.skills ||
    ['Web Development', 'Java', 'Database'],

  hourlyRate:
    authStore.user?.hourlyRate || 35,

  availability:
    authStore.user?.availability ||
    'Weekdays 8PM - 11PM'
})

const newSkill = ref('')

function addSkill() {

  if (!newSkill.value.trim()) return

  profile.value.skills.push(newSkill.value)

  newSkill.value = ''
}

function removeSkill(index) {
  profile.value.skills.splice(index, 1)
}

function saveProfile() {

  authStore.user = {
    ...authStore.user,
    ...profile.value
  }

  localStorage.setItem(
    'user',
    JSON.stringify(authStore.user)
  )

  alert('Profile Updated Successfully')
}
</script>

<template>

<div>

  <div class="header">

    <h1>My Profile</h1>

    <p class="subtitle">
      Manage your account information
    </p>

  </div>

  <div class="card">

    <!-- COVER -->

    <div class="profile-cover"></div>

    <!-- HEADER -->

    <div class="profile-header profile-modern">

      <div class="profile-avatar large">

        {{ profile.name?.charAt(0) }}

      </div>

      <div class="profile-main-info">

        <h2>{{ profile.name }}</h2>

        <p>{{ profile.email }}</p>

        <span class="badge badge-primary">

          {{ profile.role }}

        </span>

      </div>

    </div>

    <!-- STATS -->

    <div
      v-if="profile.role === 'tutor'"
      class="profile-stats"
    >

      <div class="profile-stat">

        <h3>4.9</h3>

        <p>Rating</p>

      </div>

      <div class="profile-stat">

        <h3>45</h3>

        <p>Students</p>

      </div>

      <div class="profile-stat">

        <h3>128</h3>

        <p>Sessions</p>

      </div>

    </div>

    <!-- FORM -->

    <div
      style="
      display:grid;
      grid-template-columns:
      repeat(auto-fit,minmax(250px,1fr));
      gap:20px;
      margin-top:30px;
    "
    >

      <div class="form-group">

        <label>Faculty</label>

        <input
          v-model="profile.faculty"
          type="text"
        >

      </div>

      <div class="form-group">

        <label>Course</label>

        <input
          v-model="profile.course"
          type="text"
        >

      </div>

      <div class="form-group">

        <label>Year</label>

        <input
          v-model="profile.year"
          type="number"
        >

      </div>

    </div>

    <!-- TUTOR SECTION -->

    <template v-if="profile.role === 'tutor'">

      <div class="form-group">

        <label>Bio</label>

        <textarea
          rows="4"
          v-model="profile.bio"
        ></textarea>

      </div>

      <div class="form-group">

        <label>Hourly Rate (RM)</label>

        <input
          type="number"
          v-model="profile.hourlyRate"
        >

      </div>

      <div class="form-group">

        <label>Availability</label>

        <input
          v-model="profile.availability"
          type="text"
        >

      </div>

      <!-- SKILLS -->

      <div class="form-group">

        <label>Skills</label>

        <div
          style="
          display:flex;
          gap:10px;
          margin-bottom:15px;
        "
        >

          <input
            v-model="newSkill"
            placeholder="Add Skill"
          >

          <button @click="addSkill">
            Add
          </button>

        </div>

        <div class="skills-container">

          <span
            v-for="(skill,index) in profile.skills"
            :key="index"
            class="badge badge-primary"
            @click="removeSkill(index)"
            style="cursor:pointer"
          >
            {{ skill }} ✕
          </span>

        </div>

      </div>

    </template>

    <button
      class="btn-large"
      @click="saveProfile"
    >
      Save Profile
    </button>

  </div>

</div>

</template>