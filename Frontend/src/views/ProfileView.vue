<script setup>
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
</script>

<template>

<div>

  <div class="header">
    <h1>Profile</h1>
  </div>

  <div
    v-if="authStore.user"
    class="card"
  >

    <div class="profile-header">

      <div class="profile-avatar">
        {{ authStore.user.name?.charAt(0) }}
      </div>

      <div>
        <h2>{{ authStore.user.name }}</h2>
        <p>{{ authStore.user.email }}</p>
      </div>

    </div>

    <div class="profile-details">

      <div class="detail-item">
        <i class="fa-solid fa-building"></i>
        {{ authStore.user.faculty }}
      </div>

      <div class="detail-item">
        <i class="fa-solid fa-graduation-cap"></i>
        Year {{ authStore.user.year }}
      </div>

    </div>

  </div>

  <div
    v-else
    class="card"
  >
    <h3>No User Logged In</h3>
    <p>Please login first.</p>
  </div>

</div>

</template>