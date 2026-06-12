<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from './stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const isLoginPage = computed(() => {
  return route.path === '/login'
})

function logout() {
  authStore.logout()
  router.push('/login')
}
</script>

<template>

  <router-view v-if="isLoginPage" />

  <div
    v-else
    class="app"
  >

    <aside class="sidebar">

      <div class="logo">
        <i class="fa-solid fa-graduation-cap"></i>
        <h2>SkillSwap</h2>
      </div>

      <nav>

        <router-link to="/dashboard">
          <button
            :class="{ active: route.path === '/dashboard' }"
          >
            <i class="fa-solid fa-chart-line"></i>
            Dashboard
          </button>
        </router-link>

        <router-link to="/discover">
          <button
            :class="{ active: route.path === '/discover' }"
          >
            <i class="fa-solid fa-magnifying-glass"></i>
            Discover
          </button>
        </router-link>

        <router-link to="/bookings">
          <button
            :class="{ active: route.path === '/bookings' }"
          >
            <i class="fa-solid fa-calendar-check"></i>
            Bookings
          </button>
        </router-link>

        <router-link to="/calendar">
          <button
            :class="{ active: route.path === '/calendar' }"
          >
            <i class="fa-solid fa-calendar-days"></i>
            Calendar
          </button>
        </router-link>

        <router-link to="/chat">
          <button
            :class="{ active: route.path === '/chat' }"
          >
            <i class="fa-solid fa-comments"></i>
            Chat
          </button>
        </router-link>

        <router-link to="/wallet">
          <button
            :class="{ active: route.path === '/wallet' }"
          >
            <i class="fa-solid fa-wallet"></i>
            Wallet
          </button>
        </router-link>

        <router-link to="/profile">
          <button
            :class="{ active: route.path === '/profile' }"
          >
            <i class="fa-solid fa-user"></i>
            Profile
          </button>
        </router-link>

      </nav>

      <div style="margin-top:auto">

        <button
          style="width:100%"
          @click="logout"
        >
          <i class="fa-solid fa-right-from-bracket"></i>
          Logout
        </button>

      </div>

    </aside>

    <main class="content">
      <router-view />
    </main>

  </div>

</template>