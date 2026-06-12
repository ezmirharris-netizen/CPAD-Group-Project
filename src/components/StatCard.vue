<script setup>
defineProps({
  title: String,
  value: [String, Number],
  icon: String,
  type: String
})
</script>

<template>
  <div class="card stat-card">
    <div class="stat-icon" :class="type">
      <i :class="icon"></i>
    </div>

    <div>
      <h3>{{ title }}</h3>
      <p>{{ value }}</p>
    </div>
  </div>
</template>