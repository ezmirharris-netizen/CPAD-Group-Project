<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore, DEMO_ACCOUNTS } from './stores/auth'

const route     = useRoute()
const router    = useRouter()
const authStore = useAuthStore()

const isLoginPage  = computed(() => route.path === '/login')
const showSwitcher = ref(false)

function logout() {
  showSwitcher.value = false
  authStore.logout()
  router.push('/login')
}

function switchAccount(email) {
  const ok = authStore.switchToDemo(email)
  if (!ok) return
  showSwitcher.value = false
  router.push(authStore.user?.role === 'admin' ? '/admin' : '/dashboard')
}

const isActive = (path) => route.path === path
</script>

<template>
  <router-view v-if="isLoginPage" />

  <div v-else class="app">

    <!--
      KEY FIX: The sidebar has position:sticky + z-index:90 from main.css.
      We override with z-index:300 (via inline style) so it stacks above the
      overlay backdrop (z-index:199). Without this the overlay covered the
      switcher button making it unclickable.
    -->
    <aside class="sidebar" style="z-index: 300; position: relative;">

      <!-- Logo row + switcher toggle -->
      <div class="sidebar-top">
        <div class="logo">
          <i class="fa-solid fa-graduation-cap"></i>
          <h2>SkillSwap</h2>
        </div>

        <button
          class="switcher-btn"
          @click.stop="showSwitcher = !showSwitcher"
          title="Switch demo account"
        >
          <i class="fa-solid fa-repeat"></i>
        </button>
      </div>

      <!-- Switcher popup — lives INSIDE the sidebar so it inherits z-index:300 -->
      <div v-if="showSwitcher" class="switcher-popup">
        <p class="switcher-heading">Switch Demo Account</p>
        <div
          v-for="acc in DEMO_ACCOUNTS"
          :key="acc.email"
          class="switcher-row"
          :class="{ 'switcher-active': authStore.user?.email === acc.email }"
          @click="switchAccount(acc.email)"
        >
          <div class="switcher-avatar">{{ acc.label.charAt(0) }}</div>
          <div class="switcher-info">
            <span>{{ acc.label }}</span>
            <small>{{ acc.user.role }}</small>
          </div>
          <span v-if="authStore.user?.email === acc.email" class="switcher-check">✓</span>
        </div>
      </div>

      <!-- Approval notification (green banner for approved tutors) -->
      <div v-if="authStore.approvalNotification" class="approval-banner">
        <p>{{ authStore.approvalNotification }}</p>
        <button class="close-banner" @click="authStore.dismissApprovalNotification()">✕</button>
      </div>

      <!-- Current user pill -->
      <div class="user-pill">
        <div class="user-pill-avatar">{{ authStore.user?.name?.charAt(0) || '?' }}</div>
        <div class="user-pill-info">
          <span>{{ authStore.user?.name }}</span>
          <small>{{ authStore.user?.role }}</small>
        </div>
      </div>

      <nav>
        <router-link to="/dashboard">
          <button :class="{ active: isActive('/dashboard') }">
            <i class="fa-solid fa-chart-line"></i> Dashboard
          </button>
        </router-link>

        <router-link to="/discover">
          <button :class="{ active: isActive('/discover') }">
            <i class="fa-solid fa-magnifying-glass"></i> Discover
          </button>
        </router-link>

        <router-link to="/bookings">
          <button :class="{ active: isActive('/bookings') }">
            <i class="fa-solid fa-calendar-check"></i> Bookings
          </button>
        </router-link>

        <router-link to="/calendar">
          <button :class="{ active: isActive('/calendar') }">
            <i class="fa-solid fa-calendar-days"></i> Calendar
          </button>
        </router-link>

        <router-link to="/chat">
          <button :class="{ active: isActive('/chat') }">
            <i class="fa-solid fa-comments"></i> Messages
          </button>
        </router-link>

        <router-link to="/wallet">
          <button :class="{ active: isActive('/wallet') }">
            <i class="fa-solid fa-wallet"></i> Wallet
          </button>
        </router-link>

        <router-link to="/profile">
          <button :class="{ active: isActive('/profile') }">
            <i class="fa-solid fa-user"></i> Profile
          </button>
        </router-link>

        <router-link v-if="authStore.isAdmin" to="/admin">
          <button :class="{ active: isActive('/admin') }">
            <i class="fa-solid fa-shield-halved"></i> Admin
          </button>
        </router-link>
      </nav>

      <div style="margin-top:auto;padding-top:16px;border-top:1px solid var(--border)">
        <button class="logout-btn" @click="logout">
          <i class="fa-solid fa-right-from-bracket"></i> Logout
        </button>
      </div>

    </aside>

    <!--
      Backdrop overlay — closes the switcher popup when user clicks outside.
      z-index:199 is BELOW sidebar (300), so the sidebar button stays clickable.
    -->
    <div
      v-if="showSwitcher"
      class="switcher-overlay"
      @click="showSwitcher = false"
    />

    <main class="content">
      <router-view />
    </main>

  </div>
</template>

<style scoped>
.sidebar-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding: 0 4px;
}
.switcher-btn {
  width: 34px; height: 34px; padding: 0;
  background: var(--bg-main);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text-muted);
  font-size: 0.85rem;
  flex-shrink: 0;
}
.switcher-btn:hover { background: var(--primary-light); color: var(--primary); box-shadow: none; }

/* Popup sits inside the sidebar, inheriting its z-index:300 stacking context */
.switcher-popup {
  background: white;
  border: 1px solid var(--border);
  border-radius: 14px;
  box-shadow: 0 16px 48px rgba(0,0,0,0.14);
  padding: 12px;
  margin-bottom: 14px;
}
.switcher-heading {
  font-size: 0.7rem; font-weight: 800; text-transform: uppercase;
  letter-spacing: 0.07em; color: var(--text-muted);
  margin-bottom: 10px; padding: 0 4px;
}
.switcher-row {
  display: flex; align-items: center; gap: 10px;
  padding: 9px 10px; border-radius: 10px; cursor: pointer;
  transition: background 0.15s;
}
.switcher-row:hover { background: var(--bg-main); }
.switcher-active { background: var(--primary-light) !important; }
.switcher-avatar {
  width: 32px; height: 32px; border-radius: 50%;
  background: linear-gradient(135deg, var(--primary), #8b5cf6);
  color: white; display: flex; align-items: center; justify-content: center;
  font-weight: 800; font-size: 0.82rem; flex-shrink: 0;
}
.switcher-info { flex: 1; min-width: 0; }
.switcher-info span { font-size: 0.86rem; font-weight: 600; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.switcher-info small { color: var(--text-muted); font-size: 0.72rem; text-transform: capitalize; }
.switcher-check { color: var(--primary); font-weight: 800; flex-shrink: 0; }

/* Overlay — below sidebar (199 < 300) so button stays clickable */
.switcher-overlay {
  position: fixed; inset: 0; z-index: 199; cursor: default;
}

.approval-banner {
  background: #d1fae5; border: 1px solid #6ee7b7;
  border-radius: 10px; padding: 10px 12px;
  font-size: 0.82rem; color: #065f46;
  margin-bottom: 14px;
  display: flex; align-items: flex-start; gap: 8px;
}
.approval-banner p { flex: 1; }
.close-banner {
  background: none; border: none; color: #065f46;
  font-size: 0.88rem; padding: 0; cursor: pointer; width: auto; flex-shrink: 0;
}
.user-pill {
  display: flex; align-items: center; gap: 10px;
  padding: 9px 12px; background: var(--bg-main);
  border-radius: 12px; margin-bottom: 18px;
}
.user-pill-avatar {
  width: 34px; height: 34px; border-radius: 50%;
  background: linear-gradient(135deg, var(--primary), #8b5cf6);
  color: white; display: flex; align-items: center; justify-content: center;
  font-weight: 800; font-size: 0.88rem; flex-shrink: 0;
}
.user-pill-info span { font-size: 0.86rem; font-weight: 600; display: block; color: var(--text-main); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.user-pill-info small { color: var(--text-muted); font-size: 0.72rem; text-transform: capitalize; }
.logout-btn {
  width: 100%; background: transparent; color: var(--danger);
  border: 1px solid #fecaca; border-radius: 10px; font-weight: 600;
}
.logout-btn:hover { background: #fee2e2; box-shadow: none; }
</style>
