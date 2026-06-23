<script setup>
import ReviewCard from './ReviewCard.vue'

defineProps({
  tutor: Object
})

const emit = defineEmits([
  'close',
  'book'
])
</script>

<template>

<div class="modal">

  <div class="modal-content">

    <span
      class="close-button"
      @click="$emit('close')"
    >
      &times;
    </span>

    <div class="profile-header">

      <div class="profile-avatar">
        {{ tutor.name.charAt(0) }}
      </div>

      <div>
        <h2>{{ tutor.name }}</h2>
        <p>{{ tutor.skill }}</p>
      </div>

    </div>

    <div class="profile-details">

      <div class="detail-item">
        <i class="fa-solid fa-building"></i>
        {{ tutor.faculty }}
      </div>

      <div class="detail-item">
        <i class="fa-solid fa-money-bill"></i>
        RM {{ tutor.price }}/hour
      </div>

    </div>

    <p class="bio-text">
      {{ tutor.bio }}
    </p>

    <div class="reviews-section">

      <h3>
        Reviews
      </h3>

      <div class="reviews-list">

        <ReviewCard
          v-for="review in tutor.reviews"
          :key="review.id"
          :review="review"
        />

      </div>

    </div>

    <button
      class="btn-large"
      @click="$emit('book', tutor)"
    >
      Book Session
    </button>

  </div>

</div>

</template>