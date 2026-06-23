<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const isLogin = ref(true)

const loginForm = ref({
  email: '',
  password: ''
})

const registerForm = ref({
  name: '',
  email: '',
  password: '',
  role: 'tutee',
  faculty: '',
  course: '',
  year: 1
})

async function login() {

  const success = await authStore.login(
    loginForm.value.email,
    loginForm.value.password
  )

  if (!success) return

  if (authStore.user?.role === 'admin') {

    router.push('/admin')

  } else {

    router.push('/dashboard')

  }

}

function register() {

  const success = authStore.register(
    registerForm.value
  )

  if (!success) return

  if (authStore.user?.role === 'admin') {

    router.push('/admin')

  } else {

    router.push('/dashboard')

  }

}
</script>

<template>
<div class="auth-container">

    <div class="auth-card">

      <h2>
        {{ isLogin ? 'Welcome Back' : 'Create Account' }}
      </h2>

      <p class="auth-subtitle">
        {{ isLogin
          ? 'Login to continue'
          : 'Join SkillSwap today'
        }}
      </p>

      <!-- Tabs -->

      <div class="auth-tabs">

        <button
          class="auth-tab"
          :class="{ active: isLogin }"
          @click="isLogin = true"
        >
          Login
        </button>

        <button
          class="auth-tab"
          :class="{ active: !isLogin }"
          @click="isLogin = false"
        >
          Register
        </button>

      </div>

      <!-- LOGIN -->

      <div
        v-if="isLogin"
        class="auth-form"
      >

        <div class="form-group">
          <label>Email</label>

          <input
            type="text"
            v-model="loginForm.email"
            placeholder="student@utm.my"
          >
        </div>

        <div class="form-group">
          <label>Password</label>

          <input
            type="password"
            v-model="loginForm.password"
            placeholder="Enter password"
          >
        </div>

        <button
          class="auth-btn"
          @click="login"
        >
          Login
        </button>

      </div>

      <!-- REGISTER -->

      <div
        v-else
        class="auth-form"
      >

        <div class="form-group">
          <label>Full Name</label>

          <input
            type="text"
            v-model="registerForm.name"
          >
        </div>

        <div class="form-group">
          <label>Email</label>

          <input
            type="text"
            v-model="registerForm.email"
          >
        </div>

        <div class="form-group">
          <label>Password</label>

          <input
            type="password"
            v-model="registerForm.password"
          >
        </div>

        <!-- ROLE -->

        <label style="margin-bottom:10px">
          Choose Your Role
        </label>

        <div class="role-selector">

          <div
            class="role-card"
            :class="{ active: registerForm.role === 'tutee' }"
            @click="registerForm.role = 'tutee'"
          >
            <h4>Tutee</h4>
            <p>Learn from others</p>
          </div>

          <div
            class="role-card"
            :class="{ active: registerForm.role === 'tutor' }"
            @click="registerForm.role = 'tutor'"
          >
            <h4>Tutor</h4>
            <p>Teach & Earn</p>
          </div>

        </div>

        <div class="register-grid">

          <div class="form-group">
            <label>Faculty</label>

            <select v-model="registerForm.faculty">
              <option value="">Select Faculty</option>
              <option>Faculty of Computing</option>
              <option>Faculty of Engineering</option>
              <option>Faculty of Science</option>
              <option>Faculty of Business</option>
              <option>Faculty of Education</option>
            </select>
          </div>

          <div class="form-group">
            <label>Year</label>

            <select v-model="registerForm.year">
              <option :value="1">Year 1</option>
              <option :value="2">Year 2</option>
              <option :value="3">Year 3</option>
              <option :value="4">Year 4</option>
            </select>
          </div>

        </div>

        <div class="form-group">
          <label>Course</label>

          <input
            type="text"
            v-model="registerForm.course"
            placeholder="Software Engineering"
          >
        </div>

        <button
          class="auth-btn"
          @click="register"
        >
          Create Account
        </button>

      </div>

    </div>

  </div>

</template>