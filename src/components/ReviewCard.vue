<script setup>
import RatingStars from './RatingStars.vue'

defineProps({
  review: Object
})
</script>

<template>
  <div class="review-item">
    <div class="review-meta">
      <span>{{ review.user }}</span>

      <RatingStars
        :rating="review.rating"
      />
    </div>

    <div class="review-comment">
      "{{ review.comment }}"
    </div>
  </div>
</template>