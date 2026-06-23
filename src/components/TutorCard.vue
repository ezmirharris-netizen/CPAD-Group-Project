<script setup>
defineProps({
  tutor: Object
})

function bookTutor() {
  alert('Booking request sent!')
}
</script>

<template>

<div class="tutor-card">

  <div class="avatar">
    {{ tutor.name.charAt(0) }}
  </div>

  <h3>
    {{ tutor.name }}
  </h3>

  <p class="faculty">
    {{ tutor.faculty }}
  </p>

  <span class="badge badge-primary">
    {{ tutor.skill }}
  </span>

  <div class="rating">
    ⭐ {{ tutor.rating }}
  </div>

  <div class="price">
    RM {{ tutor.price }}/hour
  </div>

  <button @click="bookTutor">
    Book Session
  </button>

</div>

</template>