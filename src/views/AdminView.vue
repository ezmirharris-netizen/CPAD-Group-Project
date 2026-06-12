<script setup>
import StatCard from '../components/StatCard.vue'
</script>

<template>

<div>

  <div class="header">
    <h1>Admin Dashboard</h1>
  </div>

  <div class="stats">

    <StatCard
      title="Total Tutors"
      value="52"
      icon="fa-solid fa-users"
      type="primary"
    />

    <StatCard
      title="Bookings"
      value="180"
      icon="fa-solid fa-calendar"
      type="bookings"
    />

    <StatCard
      title="Revenue"
      value="RM 2,500"
      icon="fa-solid fa-wallet"
      type="earnings"
    />

  </div>

</div>

</template>