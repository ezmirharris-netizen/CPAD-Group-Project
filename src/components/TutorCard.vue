<script setup>
import RatingStars from './RatingStars.vue'

defineProps({
  tutor: Object
})

const emit = defineEmits([
  'view-profile'
])
</script>

<template>
  <div class="tutor-card">

    <div class="avatar">
      {{ tutor.name.charAt(0) }}
    </div>

    <h3>{{ tutor.name }}</h3>

    <div class="faculty">
      {{ tutor.faculty }}
    </div>

    <RatingStars
      :rating="tutor.rating"
    />

    <div class="price">
      RM {{ tutor.price }}/hour
    </div>

    <button
      @click="$emit('view-profile', tutor)"
    >
      View Profile
    </button>

  </div>
</template>