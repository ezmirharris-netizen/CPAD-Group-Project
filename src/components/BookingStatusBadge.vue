<script setup>
defineProps({
  status: String
})
</script>

<template>

<span
  class="badge"
  :class="{
    'badge-primary': status === 'pending',
    'badge-warning': status === 'accepted',
    'badge-success': status === 'completed'
  }"
>
  {{ status }}
</span>

</template>