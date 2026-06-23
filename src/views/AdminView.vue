<script setup>
import UserManagement from '../components/admin/UserManagement.vue'
import ContentModeration from '../components/admin/ContentModeration.vue'
import DisputeResolution from '../components/admin/DisputeResolution.vue'
import AuditLog from '../components/admin/AuditLog.vue'
</script>

<template>

<div>

  <div class="header">

    <h1>Admin Dashboard</h1>

    <p class="subtitle">
      Platform Administration Center
    </p>

  </div>

  <div class="stats">

    <div class="card stat-card">
      <div>
        <h3>Users</h3>
        <p>Manage Accounts</p>
      </div>
    </div>

    <div class="card stat-card">
      <div>
        <h3>Reports</h3>
        <p>Moderate Content</p>
      </div>
    </div>

    <div class="card stat-card">
      <div>
        <h3>Disputes</h3>
        <p>Resolve Cases</p>
      </div>
    </div>

  </div>

  <UserManagement />

  <br>

  <ContentModeration />

  <br>

  <DisputeResolution />

  <br>

  <AuditLog />

</div>

</template>