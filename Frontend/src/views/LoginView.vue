<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore, DEMO_ACCOUNTS } from '../stores/auth'

const router    = useRouter()
const authStore = useAuthStore()

const isLogin         = ref(true)
const showCredentials = ref(false)

const loginForm = ref({ email: '', password: '' })
const registerForm = ref({
  name: '', email: '', password: '',
  role: 'tutee', faculty: '', course: '', year: 1
})

const errorMsg = ref('')

function fillCredentials(acc) {
  loginForm.value.email    = acc.email
  loginForm.value.password = acc.password
  showCredentials.value    = false
}

async function login() {
  errorMsg.value = ''
  if (!loginForm.value.email || !loginForm.value.password) {
    errorMsg.value = 'Please enter your email and password.'
    return
  }
  const success = await authStore.login(loginForm.value.email, loginForm.value.password)
  if (!success) {
    errorMsg.value = authStore.error || 'Login failed. Please check your credentials.'
    return
  }
  const role = authStore.user?.role
  if (role === 'admin') router.push('/admin')
  else router.push('/dashboard')
}

async function register() {
  errorMsg.value = ''
  if (!registerForm.value.name || !registerForm.value.email || !registerForm.value.password) {
    errorMsg.value = 'Please fill in all required fields.'
    return
  }
  const success = await authStore.register({ ...registerForm.value })
  if (!success) {
    errorMsg.value = authStore.error || 'Registration failed.'
    return
  }
  // New tutors → mandatory setup wall (profile page)
  if (registerForm.value.role === 'tutor') {
    const { useTutorStore } = await import('../stores/tutor.js')
    useTutorStore().addPendingTutor(authStore.user)
    router.push('/profile')
  } else {
    router.push('/dashboard')
  }
}
</script>

<template>
<div class="auth-container" style="position:relative">

  <!-- Top-right demo accounts panel -->
  <div style="position:fixed;top:16px;right:16px;z-index:999">
    <button
      @click="showCredentials = !showCredentials"
      style="background:rgba(255,255,255,0.18);backdrop-filter:blur(8px);color:white;padding:9px 16px;border-radius:10px;font-size:.83rem;font-weight:700;border:1px solid rgba(255,255,255,0.3);box-shadow:0 4px 14px rgba(0,0,0,0.15)"
    >
      🔑 Demo Accounts
    </button>

    <div
      v-if="showCredentials"
      style="
        position:absolute;right:0;top:48px;
        background:#fff;border:1px solid var(--border);border-radius:16px;
        padding:14px;min-width:290px;
        box-shadow:0 16px 48px rgba(0,0,0,0.16);
        z-index:1000;
      "
    >
      <p style="font-size:.7rem;font-weight:800;color:var(--text-muted);margin-bottom:10px;text-transform:uppercase;letter-spacing:.07em">
        Click to auto-fill
      </p>
      <div
        v-for="acc in DEMO_ACCOUNTS"
        :key="acc.email"
        @click="fillCredentials(acc)"
        style="
          display:flex;align-items:center;gap:10px;
          padding:10px 11px;border-radius:10px;cursor:pointer;margin-bottom:4px;
          border:1px solid var(--border);transition:background .15s;
        "
        @mouseenter="$event.currentTarget.style.background='var(--primary-light)'"
        @mouseleave="$event.currentTarget.style.background=''"
      >
        <div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,var(--primary),#8b5cf6);color:white;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:.85rem;flex-shrink:0">
          {{ acc.label.charAt(0) }}
        </div>
        <div style="flex:1">
          <span
            class="badge"
            :class="{
              'badge-danger':  acc.user.role === 'admin',
              'badge-warning': acc.user.role === 'tutor',
              'badge-primary': acc.user.role === 'tutee'
            }"
            style="margin-right:6px"
          >{{ acc.user.role }}</span>
          <span style="font-size:.83rem;font-weight:600">{{ acc.label }}</span>
        </div>
        <code style="font-size:.78rem;color:var(--text-muted)">{{ acc.password }}</code>
      </div>
    </div>
  </div>

  <div class="auth-card">

    <div style="text-align:center;margin-bottom:8px">
      <div style="width:52px;height:52px;border-radius:14px;background:linear-gradient(135deg,var(--primary),#8b5cf6);display:flex;align-items:center;justify-content:center;margin:0 auto 14px;box-shadow:0 8px 20px rgba(99,102,241,.3)">
        <i class="fa-solid fa-graduation-cap" style="font-size:1.4rem;color:white"></i>
      </div>
      <h2>{{ isLogin ? 'Welcome Back' : 'Create Account' }}</h2>
      <p class="auth-subtitle">{{ isLogin ? 'Sign in to SkillSwap' : 'Join SkillSwap today' }}</p>
    </div>

    <!-- Tabs -->
    <div class="auth-tabs">
      <button class="auth-tab" :class="{ active: isLogin }"  @click="isLogin = true">Login</button>
      <button class="auth-tab" :class="{ active: !isLogin }" @click="isLogin = false">Register</button>
    </div>

    <!-- Error -->
    <div v-if="errorMsg" style="background:var(--danger-light);color:#991b1b;padding:11px 15px;border-radius:10px;margin-bottom:15px;font-size:.88rem;font-weight:500">
      ⚠ {{ errorMsg }}
    </div>

    <!-- LOGIN FORM -->
    <div v-if="isLogin" class="auth-form">
      <div class="form-group">
        <label>Email</label>
        <input type="text" v-model="loginForm.email" placeholder="student@utm.my">
      </div>
      <div class="form-group">
        <label>Password</label>
        <input type="password" v-model="loginForm.password" placeholder="Enter password" @keyup.enter="login">
      </div>
      <button class="auth-btn" :disabled="authStore.loading" @click="login">
        {{ authStore.loading ? 'Signing in…' : 'Sign In' }}
      </button>
    </div>

    <!-- REGISTER FORM -->
    <div v-else class="auth-form">
      <div class="form-group">
        <label>Full Name</label>
        <input type="text" v-model="registerForm.name" placeholder="e.g. Ahmad bin Ali">
      </div>
      <div class="form-group">
        <label>Email</label>
        <input type="text" v-model="registerForm.email" placeholder="you@student.utm.my">
      </div>
      <div class="form-group">
        <label>Password</label>
        <input type="password" v-model="registerForm.password" placeholder="Min. 6 characters">
      </div>

      <label style="font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--text-muted);margin-bottom:8px">Choose Your Role</label>
      <div class="role-selector">
        <div class="role-card" :class="{ active: registerForm.role === 'tutee' }" @click="registerForm.role = 'tutee'">
          <h4>📚 Tutee</h4><p>Learn from others</p>
        </div>
        <div class="role-card" :class="{ active: registerForm.role === 'tutor' }" @click="registerForm.role = 'tutor'">
          <h4>🎓 Tutor</h4><p>Teach & Earn</p>
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
          <label>Year of Study</label>
          <select v-model="registerForm.year">
            <option :value="1">Year 1</option>
            <option :value="2">Year 2</option>
            <option :value="3">Year 3</option>
            <option :value="4">Year 4</option>
          </select>
        </div>
      </div>

      <div class="form-group">
        <label>Course / Programme</label>
        <input type="text" v-model="registerForm.course" placeholder="e.g. Software Engineering">
      </div>

      <!-- Tutor note -->
      <div v-if="registerForm.role === 'tutor'" style="background:var(--warning-light);border:1px solid #fde68a;border-radius:10px;padding:12px 14px;font-size:.85rem;color:#92400e">
        <strong>ℹ️ Note:</strong> After registering, you'll complete your tutor profile. An admin must approve your account before you appear in Discover.
      </div>

      <button class="auth-btn" :disabled="authStore.loading" @click="register">
        {{ authStore.loading ? 'Creating account…' : 'Create Account' }}
      </button>
    </div>

  </div>
</div>
</template>
