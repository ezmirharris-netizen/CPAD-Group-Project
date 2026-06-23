<script setup>
import { useAdminStore } from '../../stores/admin'

const adminStore = useAdminStore()
</script>

<template>

<div class="card">

  <h2>Dispute Resolution</h2>

  <div
    v-for="dispute in adminStore.disputes"
    :key="dispute.id"
    class="admin-item"
  >

    <h3>
      {{ dispute.tutor }}
      vs
      {{ dispute.tutee }}
    </h3>

    <p>{{ dispute.issue }}</p>

    <span
      class="badge"
      :class="
        dispute.status==='closed'
        ? 'badge-success'
        : 'badge-danger'
      "
    >
      {{ dispute.status }}
    </span>

    <br><br>

    <button
      v-if="dispute.status==='open'"
      @click="adminStore.closeDispute(dispute.id)"
    >
      Close Case
    </button>

  </div>

</div>

</template>