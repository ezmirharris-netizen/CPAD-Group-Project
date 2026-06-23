<script setup>
import BookingStatusBadge from './BookingStatusBadge.vue'

defineProps({
  booking: Object
})

const emit = defineEmits([
  'accept',
  'decline',
  'complete'
])
</script>

<template>

<div
  class="card booking-item"
  :class="booking.status"
>

  <div class="booking-info">

    <h3>
      {{ booking.tutor }}
    </h3>

    <p>
      {{ booking.skill }}
    </p>

  </div>

  <div class="booking-actions">

    <BookingStatusBadge
      :status="booking.status"
    />

    <button
      v-if="booking.status==='pending'"
      @click="$emit('accept', booking)"
    >
      Accept
    </button>

    <button
      v-if="booking.status==='accepted'"
      @click="$emit('complete', booking)"
    >
      Complete
    </button>

  </div>

</div>

</template>