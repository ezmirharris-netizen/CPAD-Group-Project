<script setup>
defineProps({
  balance: Number
})
</script>

<template>

<div class="card wallet-card">

  <div class="wallet-icon">
    <i class="fa-solid fa-wallet"></i>
  </div>

  <h2>Current Balance</h2>

  <h1>
    RM {{ balance }}
  </h1>

</div>

</template>