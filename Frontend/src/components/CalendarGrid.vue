<script setup>
defineProps({
  days: Array,
  selected: Number
})

const emit = defineEmits([
  'select'
])
</script>

<template>

<div class="calendar-days-grid">

  <div
    v-for="day in days"
    :key="day.date"
    class="day-cell"
    :class="{
      selected: selected===day.date,
      'has-session': day.hasSession
    }"
    @click="$emit('select', day)"
  >
    {{ day.day }}
  </div>

</div>

</template>