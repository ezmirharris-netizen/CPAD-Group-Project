<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const router = useRouter()

const email = ref('')
const password = ref('')

async function login() {
  const success = await authStore.login(
    email.value,
    password.value
  )

  if (success) {
    router.push('/dashboard')
  }
}
</script>

<template>

<div class="auth-container">

  <div class="card auth-card">

    <h1>SkillSwap</h1>

    <p class="subtitle">
      Learn. Teach. Earn.
    </p>

    <div class="form-group">
      <label>Email</label>
      <input v-model="email" type="text" />
    </div>

    <div class="form-group">
      <label>Password</label>
      <input
        v-model="password"
        type="password"
      />
    </div>

    <button @click="login">
      Login
    </button>

  </div>

</div>

</template>