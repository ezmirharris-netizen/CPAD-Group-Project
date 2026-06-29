<script setup>
import { useAdminStore } from '../../stores/admin'

const adminStore = useAdminStore()
</script>

<template>

<div class="card">

  <h2>User Management</h2>

  <table class="admin-table">

    <thead>

      <tr>
        <th>Name</th>
        <th>Email</th>
        <th>Role</th>
        <th>Status</th>
        <th>Action</th>
      </tr>

    </thead>

    <tbody>

      <tr
        v-for="user in adminStore.users"
        :key="user.id"
      >

        <td>{{ user.name }}</td>
        <td>{{ user.email }}</td>
        <td>{{ user.role }}</td>
        <td>{{ user.status }}</td>

        <td>

          <button
            v-if="user.status==='active'"
            @click="adminStore.suspendUser(user.id)"
          >
            Suspend
          </button>

          <button
            v-else
            @click="adminStore.activateUser(user.id)"
          >
            Activate
          </button>

        </td>

      </tr>

    </tbody>

  </table>

</div>

</template>