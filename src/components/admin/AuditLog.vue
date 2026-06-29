<script setup>
import { useAdminStore } from '../../stores/admin'

const adminStore = useAdminStore()
</script>

<template>

<div class="card">

  <h2>Audit Logs</h2>

  <div
    v-for="log in adminStore.logs"
    :key="log.id"
    class="admin-item"
  >

    <h3>{{ log.action }}</h3>

    <p>
      Admin:
      {{ log.admin }}
    </p>

    <small>
      {{ log.date }}
    </small>

  </div>

</div>

</template>