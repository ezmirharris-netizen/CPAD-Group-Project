<script setup>
import { computed, onMounted } from 'vue'
import { useTutorStore }   from '../stores/tutor'
import { useAuthStore }    from '../stores/auth'
import { useBookingStore } from '../stores/booking'
import { useAdminStore }   from '../stores/admin'
import UserManagement    from '../components/admin/UserManagement.vue'
import ContentModeration from '../components/admin/ContentModeration.vue'
import AuditLog          from '../components/admin/AuditLog.vue'

const tutorStore   = useTutorStore()
const authStore    = useAuthStore()
const bookingStore = useBookingStore()
const adminStore   = useAdminStore()

onMounted(() => {
  tutorStore.reloadFromStorage()
  bookingStore.fetchBookings('admin')
  adminStore.fetchUsers()
  adminStore.fetchReports()
  adminStore.fetchLogs()
})

const totalUsers    = computed(() => adminStore.users.length + tutorStore.pendingTutors.length)
const totalBookings = computed(() => bookingStore.bookings.length)
const pendingCount  = computed(() => tutorStore.pendingTutors.length + tutorStore.pendingSessions.length)

function approveTutor(id) {
  tutorStore.approveTutor(id)
  authStore.notifyApproval()
}
function rejectTutor(id)    { tutorStore.rejectTutor(id) }
function approveSession(id) { tutorStore.approveSession(id) }
function rejectSession(id)  { tutorStore.rejectSession(id) }
</script>

<template>

<div>

  <div class="header">
    <h1>Admin Dashboard</h1>
    <p class="subtitle">Platform Administration Centre</p>
    <span class="badge badge-danger" style="margin-top:6px">admin</span>
  </div>

  <!-- Platform Stats -->
  <div class="stats">
    <div class="card stat-card">
      <div class="stat-icon bookings"><i class="fa-solid fa-users"></i></div>
      <div><h3>Total Users</h3><p>{{ totalUsers }}</p></div>
    </div>
    <div class="card stat-card">
      <div class="stat-icon rating"><i class="fa-solid fa-calendar-check"></i></div>
      <div><h3>Total Bookings</h3><p>{{ totalBookings }}</p></div>
    </div>
    <div class="card stat-card">
      <div class="stat-icon earnings" style="background:#fee2e2;color:#b91c1c">
        <i class="fa-solid fa-clock"></i>
      </div>
      <div><h3>Pending Reviews</h3><p>{{ pendingCount }}</p></div>
    </div>
  </div>

  <!-- ── PENDING TUTOR APPROVALS ──────────────────────────────── -->
  <div class="card" style="margin-bottom:25px">
    <div class="section-header">
      <div>
        <h2>👤 Pending Tutor Approvals</h2>
        <p class="subtitle">New registrations awaiting review</p>
      </div>
      <span v-if="tutorStore.pendingTutors.length" class="badge badge-warning">
        {{ tutorStore.pendingTutors.length }} pending
      </span>
    </div>

    <div v-if="!tutorStore.pendingTutors.length" class="empty-state" style="padding:30px">
      <i class="fa-solid fa-user-check"></i>
      <p>No pending tutor applications.</p>
    </div>

    <div v-for="tutor in tutorStore.pendingTutors" :key="tutor.id" class="approval-row">
      <div class="approval-avatar">{{ tutor.name?.charAt(0)?.toUpperCase() }}</div>
      <div style="flex:1;min-width:0">
        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
          <strong>{{ tutor.name }}</strong>
          <span class="badge badge-warning">Pending</span>
        </div>
        <p class="muted-sm">{{ tutor.email }} · {{ tutor.faculty }}</p>
        <p style="font-size:.85rem;margin-top:4px">{{ tutor.bio || 'No bio provided.' }}</p>
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px">
          <span v-for="sk in (tutor.skills||[])" :key="sk" class="badge badge-primary">{{ sk }}</span>
          <span v-if="tutor.hourlyRate" class="badge badge-success">RM{{ tutor.hourlyRate }}/hr</span>
        </div>
        <small class="muted-sm">Applied: {{ tutor.appliedAt }}</small>
      </div>
      <div class="action-btns">
        <button style="padding:8px 16px;font-size:.85rem" @click="approveTutor(tutor.id)">✓ Approve</button>
        <button class="btn-outline" style="padding:8px 16px;font-size:.85rem;color:var(--danger);border-color:var(--danger)" @click="rejectTutor(tutor.id)">✕ Reject</button>
      </div>
    </div>
  </div>

  <!-- ── PENDING SESSION APPROVALS ───────────────────────────── -->
  <div class="card" style="margin-bottom:25px">
    <div class="section-header">
      <div>
        <h2>📋 Pending Session Approvals</h2>
        <p class="subtitle">Tutor-created classes waiting for review</p>
      </div>
      <span v-if="tutorStore.pendingSessions.length" class="badge badge-warning">
        {{ tutorStore.pendingSessions.length }} pending
      </span>
    </div>

    <div v-if="!tutorStore.pendingSessions.length" class="empty-state" style="padding:30px">
      <i class="fa-solid fa-clipboard-check"></i>
      <p>No sessions pending review.</p>
    </div>

    <div v-for="s in tutorStore.pendingSessions" :key="s.id" class="approval-row">
      <div style="flex:1;min-width:0">
        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
          <strong>{{ s.title }}</strong>
          <span class="badge badge-primary">{{ s.subject }}</span>
          <span class="badge badge-success">RM{{ s.cost }}/hr</span>
        </div>
        <p class="muted-sm">by {{ s.tutorName }} · {{ s.faculty }}</p>
        <p style="font-size:.85rem;margin-top:4px">{{ s.description || 'No description.' }}</p>
        <small class="muted-sm">Submitted: {{ s.submittedAt }}</small>
      </div>
      <div class="action-btns">
        <button style="padding:8px 16px;font-size:.85rem" @click="approveSession(s.id)">✓ Approve</button>
        <button class="btn-outline" style="padding:8px 16px;font-size:.85rem;color:var(--danger);border-color:var(--danger)" @click="rejectSession(s.id)">✕ Reject</button>
      </div>
    </div>
  </div>

  <UserManagement />
  <br>
  <ContentModeration />
  <br>
  <AuditLog />

</div>

</template>

<style scoped>
.section-header {
  display: flex; justify-content: space-between; align-items: flex-start;
  margin-bottom: 20px; gap: 12px;
}
.approval-row {
  display: flex; align-items: flex-start; gap: 16px;
  padding: 16px; border: 1px solid var(--border);
  border-radius: 12px; margin-bottom: 12px;
  transition: background 0.15s;
}
.approval-row:hover { background: var(--bg-main); }
.approval-avatar {
  width: 44px; height: 44px; border-radius: 50%;
  background: linear-gradient(135deg, var(--primary), #8b5cf6);
  color: white; display: flex; align-items: center; justify-content: center;
  font-weight: 800; font-size: 1rem; flex-shrink: 0;
}
.action-btns {
  display: flex; flex-direction: column; gap: 8px; flex-shrink: 0;
}
.muted-sm { color: var(--text-muted); font-size: .83rem; margin-top: 2px; }
</style>
