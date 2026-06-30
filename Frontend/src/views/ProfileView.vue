<script setup>
import { ref, watch, computed, onMounted } from 'vue'
import { useAuthStore }   from '../stores/auth'
import { useBookingStore } from '../stores/booking'
import { useReviewStore } from '../stores/review'
import { useTutorStore }  from '../stores/tutor'

const authStore    = useAuthStore()
const bookingStore = useBookingStore()
const reviewStore  = useReviewStore()
const tutorStore   = useTutorStore()

function buildProfile(user) {
  return {
    name:         user?.name         || '',
    email:        user?.email        || '',
    faculty:      user?.faculty      || '',
    course:       user?.course       || '',
    year:         user?.year         || '',
    bio:          user?.bio          || '',
    skills:       user?.skills ? [...user.skills] : [],
    hourlyRate:   user?.hourlyRate   || '',
    availability: user?.availability || '',
    role:         user?.role         || 'tutee',
  }
}

const profile     = ref(buildProfile(authStore.user))
const newSkill    = ref('')
const saving      = ref(false)
const saved       = ref(false)
const saveError   = ref('')

// Tutor application modal
const showApplyModal = ref(false)
const applyForm = ref({ bio: '', skills: [], hourlyRate: '', availability: '' })
const applyNewSkill = ref('')
const applying = ref(false)
const applyError = ref('')

watch(
  () => authStore.user,
  (newUser) => { profile.value = buildProfile(newUser) },
  { deep: true }
)

onMounted(() => {
  bookingStore.fetchBookings(authStore.isTutor ? 'tutor' : 'learner')
  if (authStore.user?.id) {
    reviewStore.fetchForTutor(authStore.user.id)
  }
})

const currentRole = computed(() => authStore.user?.role || 'tutee')
const isPendingApproval = computed(() => authStore.user?.role === 'tutor' && !authStore.user?.approved)

const completedSessions = computed(() =>
  bookingStore.bookings.filter(b => b.status === 'completed').length
)

// Live average rating from review store
const myAvgRating = computed(() => {
  const uid = authStore.user?.id
  if (!uid) return '—'
  return reviewStore.avgRatingForUser(uid) ?? '—'
})

// All reviews I've received
const myReviews = computed(() => {
  const uid = authStore.user?.id
  if (!uid) return []
  return reviewStore.reviewsForUser(uid)
})

function addSkill() {
  const s = newSkill.value.trim()
  if (!s || profile.value.skills.includes(s)) return
  profile.value.skills.push(s)
  newSkill.value = ''
}
function removeSkill(index) { profile.value.skills.splice(index, 1) }

async function saveProfile() {
  saveError.value = ''
  if (!profile.value.name.trim()) { saveError.value = 'Name cannot be empty.'; return }
  saving.value = true; saved.value = false
  await authStore.updateProfile({ ...profile.value })
  saving.value = false; saved.value = true
  setTimeout(() => { saved.value = false }, 3000)
}

// Apply as tutor
function openApplyModal() {
  applyForm.value = {
    bio:          authStore.user?.bio          || '',
    skills:       authStore.user?.skills ? [...authStore.user.skills] : [],
    hourlyRate:   authStore.user?.hourlyRate   || '',
    availability: authStore.user?.availability || ''
  }
  applyNewSkill.value = ''
  applyError.value    = ''
  showApplyModal.value = true
}

function addApplySkill() {
  const s = applyNewSkill.value.trim()
  if (!s || applyForm.value.skills.includes(s)) return
  applyForm.value.skills.push(s)
  applyNewSkill.value = ''
}
function removeApplySkill(i) { applyForm.value.skills.splice(i, 1) }

async function submitApply() {
  applyError.value = ''
  if (!applyForm.value.bio.trim() || !applyForm.value.hourlyRate || !applyForm.value.skills.length) {
    applyError.value = 'Please fill in bio, hourly rate and at least one skill.'
    return
  }
  applying.value = true
  authStore.applyAsTutor({ ...applyForm.value })
  tutorStore.addPendingTutor(authStore.user)
  applying.value = false
  showApplyModal.value = false
}

function stars(n) {
  const r = Math.round(n)
  return '★'.repeat(r) + '☆'.repeat(5 - r)
}
</script>

<template>
<div>

  <div class="header">
    <h1>My Profile</h1>
    <p class="subtitle">Manage your account information</p>
  </div>

  <!-- Pending approval banner -->
  <div v-if="isPendingApproval" class="info-banner">
    <i class="fa-solid fa-clock"></i>
    <div>
      <strong>Your tutor account is pending admin approval.</strong>
      <p>You won't appear in Discover until an admin approves your profile.</p>
    </div>
  </div>

  <!-- Main info card -->
  <div class="card" style="margin-bottom:25px">

    <div class="profile-cover"></div>

    <div class="profile-hero">
      <div class="profile-avatar large">{{ profile.name?.charAt(0)?.toUpperCase() || '?' }}</div>
      <div class="profile-hero-info">
        <h2 class="profile-hero-name">{{ profile.name || 'User' }}</h2>
        <p class="profile-hero-email">{{ profile.email }}</p>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:6px">
          <span class="badge badge-primary">{{ currentRole }}</span>
          <span v-if="isPendingApproval" class="badge badge-warning">Awaiting Approval</span>
        </div>
      </div>
    </div>

    <!-- Tutor stats -->
    <div v-if="currentRole === 'tutor'" class="profile-stats">
      <div class="profile-stat"><h3>{{ myAvgRating }}</h3><p>Rating</p></div>
      <div class="profile-stat"><h3>{{ bookingStore.bookings.length }}</h3><p>Bookings</p></div>
      <div class="profile-stat"><h3>{{ completedSessions }}</h3><p>Completed</p></div>
    </div>

    <!-- Form fields -->
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:20px;margin-top:30px">
      <div class="form-group">
        <label>Full Name <span style="color:var(--danger)">*</span></label>
        <input v-model="profile.name" type="text" placeholder="e.g. Ahmad bin Ali">
      </div>
      <div class="form-group">
        <label>Email</label>
        <input v-model="profile.email" type="text" placeholder="you@example.com">
      </div>
      <div class="form-group">
        <label>Faculty</label>
        <input v-model="profile.faculty" type="text" placeholder="e.g. Faculty of Computing">
      </div>
      <div class="form-group">
        <label>Course / Programme</label>
        <input v-model="profile.course" type="text" placeholder="e.g. Computer Science">
      </div>
      <div class="form-group">
        <label>Year of Study</label>
        <input v-model="profile.year" type="number" placeholder="e.g. 2" min="1" max="6">
      </div>
    </div>

    <!-- Tutor-only fields -->
    <template v-if="currentRole === 'tutor'">
      <div class="form-group" style="margin-top:20px">
        <label>Bio</label>
        <textarea rows="4" v-model="profile.bio" placeholder="Tell students about yourself..."></textarea>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:20px;margin-top:4px">
        <div class="form-group">
          <label>Hourly Rate (RM)</label>
          <input type="number" v-model="profile.hourlyRate" min="0" placeholder="e.g. 40">
        </div>
        <div class="form-group">
          <label>Availability</label>
          <input v-model="profile.availability" type="text" placeholder="e.g. Weekdays 8PM–11PM">
        </div>
      </div>
      <div class="form-group" style="margin-top:4px">
        <label>Skills You Teach</label>
        <div style="display:flex;gap:10px;margin-bottom:12px">
          <input v-model="newSkill" placeholder="e.g. Vue.js" @keyup.enter="addSkill" style="flex:1">
          <button @click="addSkill">Add</button>
        </div>
        <div class="skills-container" style="min-height:36px">
          <span
            v-for="(skill, idx) in profile.skills" :key="idx"
            class="badge badge-primary" style="cursor:pointer" title="Click to remove"
            @click="removeSkill(idx)"
          >{{ skill }} ✕</span>
          <span v-if="!profile.skills.length" style="color:var(--text-muted);font-size:.85rem">No skills added yet</span>
        </div>
      </div>
    </template>

    <!-- Feedback messages -->
    <div v-if="saveError" style="color:var(--danger);font-weight:600;margin-top:15px">⚠ {{ saveError }}</div>
    <div v-if="saved"     style="color:var(--success);font-weight:600;margin-top:15px">✓ Profile saved successfully!</div>

    <button class="btn-large" @click="saveProfile" :disabled="saving" style="margin-top:20px">
      {{ saving ? 'Saving…' : 'Save Profile' }}
    </button>

    <!-- Tutee: apply to become tutor -->
    <div v-if="currentRole === 'tutee'" style="margin-top:20px;padding-top:20px;border-top:1px solid var(--border)">
      <h3 style="margin-bottom:8px">Want to teach?</h3>
      <p style="color:var(--text-muted);font-size:.9rem;margin-bottom:14px">Apply to become a tutor and earn by sharing your knowledge.</p>
      <button class="btn-outline" @click="openApplyModal">
        🎓 Apply as Tutor
      </button>
    </div>

  </div>

  <!-- Review section (separate card below) -->
  <div class="card">
    <div style="margin-bottom:20px">
      <h2>⭐ My Reviews</h2>
      <p class="subtitle">Feedback you've received from sessions</p>
    </div>

    <div v-if="myReviews.length" style="display:flex;flex-direction:column;gap:14px">
      <div
        v-for="r in myReviews" :key="r.id"
        class="review-card-item"
      >
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px">
          <div>
            <span class="badge badge-primary" style="margin-right:8px">{{ r.reviewerName }}</span>
            <small style="color:var(--text-muted)">{{ r.date }}</small>
          </div>
          <div style="color:#f59e0b;font-size:1.1rem">{{ stars(r.rating) }}</div>
        </div>
        <p style="color:var(--text-muted);line-height:1.5">{{ r.comment || 'No comment left.' }}</p>
      </div>
    </div>

    <div v-else class="empty-state">
      <i class="fa-solid fa-star"></i>
      <h3>No reviews yet</h3>
      <p>Reviews from completed sessions will appear here.</p>
    </div>
  </div>

</div>

<!-- Apply as Tutor Modal -->
<div v-if="showApplyModal" class="modal-backdrop" @click.self="showApplyModal=false">
  <div class="modal-window">
    <button class="modal-close" @click="showApplyModal=false">✕</button>
    <h2 style="margin-bottom:6px">Apply as Tutor</h2>
    <p style="color:var(--text-muted);margin-bottom:22px">Your application will be reviewed by an admin before you go live.</p>

    <div class="form-group">
      <label>Bio / About You <span style="color:var(--danger)">*</span></label>
      <textarea rows="3" v-model="applyForm.bio" placeholder="Describe your expertise..."></textarea>
    </div>

    <div class="form-group">
      <label>Hourly Rate (RM) <span style="color:var(--danger)">*</span></label>
      <input type="number" v-model="applyForm.hourlyRate" min="0" placeholder="e.g. 40">
    </div>

    <div class="form-group">
      <label>Availability</label>
      <input v-model="applyForm.availability" placeholder="e.g. Weekdays 8PM–11PM">
    </div>

    <div class="form-group">
      <label>Skills You'll Teach <span style="color:var(--danger)">*</span></label>
      <div style="display:flex;gap:10px;margin-bottom:10px">
        <input v-model="applyNewSkill" placeholder="e.g. Python" @keyup.enter="addApplySkill" style="flex:1">
        <button @click="addApplySkill">Add</button>
      </div>
      <div class="skills-container">
        <span
          v-for="(sk,i) in applyForm.skills" :key="i"
          class="badge badge-primary" style="cursor:pointer" @click="removeApplySkill(i)"
        >{{ sk }} ✕</span>
        <span v-if="!applyForm.skills.length" style="color:var(--text-muted);font-size:.85rem">No skills added</span>
      </div>
    </div>

    <div v-if="applyError" style="color:var(--danger);font-size:.88rem;margin-top:10px">⚠ {{ applyError }}</div>

    <div style="display:flex;gap:12px;margin-top:20px">
      <button class="btn-outline" style="flex:1" @click="showApplyModal=false">Cancel</button>
      <button style="flex:1" :disabled="applying" @click="submitApply">
        {{ applying ? 'Submitting…' : 'Submit Application' }}
      </button>
    </div>
  </div>
</div>

</template>

<style scoped>
.info-banner {
  display: flex; align-items: flex-start; gap: 14px;
  background: #fef3c7; border: 1px solid #fde68a;
  border-radius: 12px; padding: 16px 18px;
  margin-bottom: 20px; color: #92400e;
}
.info-banner i { margin-top: 2px; flex-shrink: 0; }
.profile-hero { display: flex; align-items: flex-end; gap: 20px; margin-top: -50px; flex-wrap: wrap; }
.profile-hero-info { padding-bottom: 12px; }
.profile-hero-name { font-size: 1.5rem; margin-bottom: 4px; }
.profile-hero-email { color: var(--text-muted); font-size: .9rem; }
.review-card-item {
  background: var(--bg-main); border: 1px solid var(--border);
  border-radius: 12px; padding: 16px;
  transition: box-shadow 0.2s;
}
.review-card-item:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.06); }
</style>
