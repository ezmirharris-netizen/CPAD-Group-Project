<script setup>
import { useAdminStore } from '../../stores/admin'

const adminStore = useAdminStore()
</script>

<template>

<div class="card">

  <h2>Content Moderation</h2>

  <div
    v-for="report in adminStore.reports"
    :key="report.id"
    class="admin-item"
  >

    <h3>{{ report.title }}</h3>

    <p>
      Reported By:
      {{ report.reportedBy }}
    </p>

    <span
      class="badge"
      :class="
        report.status === 'resolved'
        ? 'badge-success'
        : 'badge-warning'
      "
    >
      {{ report.status }}
    </span>

    <br><br>

    <button
      v-if="report.status==='pending'"
      @click="adminStore.resolveReport(report.id)"
    >
      Resolve
    </button>

  </div>

</div>

</template>