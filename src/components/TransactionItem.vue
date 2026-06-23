<script setup>
defineProps({
  transaction: Object
})
</script>

<template>

<div class="feed-item">

  <div class="feed-info">

    <span>
      {{ transaction.title }}
    </span>

    <d>
      {{ transaction.date }}
    </d>

  </div>

  <div
    class="feed-amount"
    :class="transaction.type"
  >
    {{ transaction.amount }}
  </div>

</div>

</template>