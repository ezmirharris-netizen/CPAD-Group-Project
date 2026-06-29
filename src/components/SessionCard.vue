<script setup>
defineProps({
  session: Object
})
</script>

<template>

<div class="session-detail-card">

  <h4>
    <i class="fa-solid fa-calendar"></i>
    {{ session.title }}
  </h4>

  <p>
    <strong>Tutor:</strong>
    {{ session.tutor }}
  </p>

  <p>
    <strong>Time:</strong>
    {{ session.time }}
  </p>

</div>

</template>