<script setup>
defineProps({
  rating: {
    type: Number,
    default: 5
  }
})
</script>

<template>
  <span class="review-stars">
    <i
      v-for="n in 5"
      :key="n"
      class="fa-solid fa-star"
    ></i>

    ({{ rating }})
  </span>
</template>