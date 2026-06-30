<script setup>
import { ref, watch, computed, onMounted } from 'vue'
import { useAuthStore }   from '../stores/auth'
import { useBookingStore } from '../stores/booking'
import { useReviewStore } from '../stores/review'
import { useTutorStore }  from '../stores/tutor'
import { useSkillStore }  from '../stores/skill'

const authStore    = useAuthStore()
const bookingStore = useBookingStore()
const reviewStore  = useReviewStore()
const tutorStore   = useTutorStore()
const skillStore   = useSkillStore()

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
const newSkill         = ref('')
const newSkillCategory = ref('')
const skillAddError    = ref('')
const skillAdding      = ref(false)
const saving      = ref(false)
const saved       = ref(false)
const saveError   = ref('')

// Tutor application modal
const showApplyModal = ref(false)
const applyForm = ref({ bio: '', skills: [], hourlyRate: '', availability: '' })
const applyNewSkill         = ref('')
const applyNewSkillCategory = ref('')
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
<<<<<<< HEAD
  // Pre-load skill categories for autocomplete / display
  skillStore.fetchAllSkills()
=======
>>>>>>> 7f3a5899a67c3a5276f68b25c51b09c2f7360438
})

const currentRole = computed(() => authStore.user?.role || 'tutee')
const isPendingApproval = computed(() => authStore.user?.role === 'tutor' && authStore.user?.approved === false)

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

/**
 * Add a skill to the tutor's profile.
 * Calls POST /api/skills so the skills table is updated in the database,
 * then reflects the addition in the local profile.skills array.
 */
async function addSkill() {
  const name     = newSkill.value.trim()
  const category = newSkillCategory.value.trim()
  skillAddError.value = ''

  if (!name) { skillAddError.value = 'Please enter a skill name.'; return }
  if (!category) { skillAddError.value = 'Please enter a category for this skill.'; return }

  const alreadyLocal = profile.value.skills.find(
    s => (typeof s === 'string' ? s : s.name).toLowerCase() === name.toLowerCase()
  )
  if (alreadyLocal) { skillAddError.value = 'This skill is already on your profile.'; return }

  skillAdding.value = true
  const result = await skillStore.addSkillToProfile(
    name,
    category,
    Number(profile.value.hourlyRate) || 0
  )
  skillAdding.value = false

  if (result) {
    // Store as an object so the template can show the category badge
    profile.value.skills.push({ id: result.skill.id, name: result.skill.name, category: result.skill.category })
    newSkill.value         = ''
    newSkillCategory.value = ''
  } else {
    skillAddError.value = skillStore.error || 'Failed to add skill. Try again.'
  }
}

async function removeSkill(index) {
  const skill = profile.value.skills[index]
  const skillId = typeof skill === 'object' ? skill.id : null
  profile.value.skills.splice(index, 1)
  if (skillId) await skillStore.removeSkillFromProfile(skillId)
}

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
  const c = applyNewSkillCategory.value.trim()
  if (!s) return
  const exists = applyForm.value.skills.find(sk => (typeof sk === 'string' ? sk : sk.name).toLowerCase() === s.toLowerCase())
  if (exists) return
  applyForm.value.skills.push({ name: s, category: c })
  applyNewSkill.value         = ''
  applyNewSkillCategory.value = ''
}
function removeApplySkill(i) { applyForm.value.skills.splice(i, 1) }

async function submitApply() {
  applyError.value = ''
  if (!applyForm.value.bio.trim() || !applyForm.value.hourlyRate || !applyForm.value.skills.length) {
    applyError.value = 'Please fill in bio, hourly rate and at least one skill.'
    return
  }
  applying.value = true

  // Persist the role change (tutee -> tutor) and bio to the backend.
  await authStore.applyAsTutor({ ...applyForm.value })

  // Persist each applied skill to the backend so the user actually has
  // rows in `user_skills`. Without this, the user would have role='tutor'
  // but no skills, and would never appear in /api/tutors (Discovery),
  // since that query requires a matching skill row.
  const hourlyRate = Number(applyForm.value.hourlyRate) || 0
  const savedSkills = []
  for (const sk of applyForm.value.skills) {
    const name     = typeof sk === 'string' ? sk : sk.name
    const category = typeof sk === 'string' ? '' : (sk.category || '')
    const result = await skillStore.addSkillToProfile(name, category, hourlyRate)
    if (result?.skill) savedSkills.push(result.skill)
  }
  if (savedSkills.length) {
    profile.value.skills = savedSkills
  }

  tutorStore.addPendingTutor({ ...authStore.user, skills: savedSkills.length ? savedSkills : applyForm.value.skills })
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

        <!-- Skill name + category inputs side by side -->
        <div style="display:grid;grid-template-columns:1fr 1fr auto;gap:20px;margin-bottom:8px;align-items:end">
          <div class="form-group" style="margin-bottom:0">
            <label>Skill Name</label>
            <input v-model="newSkill" placeholder="e.g. Vue.js" @keyup.enter="addSkill">
          </div>
          <div class="form-group" style="margin-bottom:0">
            <label>Category</label>
            <input v-model="newSkillCategory" placeholder="e.g. Technology" @keyup.enter="addSkill">
          </div>
          <button @click="addSkill" :disabled="skillAdding" style="white-space:nowrap">
            {{ skillAdding ? '…' : 'Add Skill' }}
          </button>
        </div>

        <div v-if="skillAddError" style="color:var(--danger);font-size:.85rem;margin-bottom:8px">⚠ {{ skillAddError }}</div>

        <div class="skills-container" style="min-height:36px">
          <span
            v-for="(skill, idx) in profile.skills" :key="idx"
            class="badge badge-primary skill-badge" title="Click to remove"
            @click="removeSkill(idx)"
          >
            <span>{{ typeof skill === 'object' ? skill.name : skill }}</span>
            <span v-if="typeof skill === 'object' && skill.category" class="skill-category-tag">{{ skill.category }}</span>
            <span style="margin-left:4px;opacity:.7"> ✕</span>
          </span>
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
      <div style="display:grid;grid-template-columns:1fr 1fr auto;gap:20px;margin-bottom:10px;align-items:end">
        <div class="form-group" style="margin-bottom:0">
          <label>Skill Name</label>
          <input v-model="applyNewSkill" placeholder="e.g. Python" @keyup.enter="addApplySkill">
        </div>
        <div class="form-group" style="margin-bottom:0">
          <label>Category</label>
          <input v-model="applyNewSkillCategory" placeholder="e.g. Technology" @keyup.enter="addApplySkill">
        </div>
        <button @click="addApplySkill">Add</button>
      </div>
      <div class="skills-container">
        <span
          v-for="(sk,i) in applyForm.skills" :key="i"
          class="badge badge-primary skill-badge" style="cursor:pointer" @click="removeApplySkill(i)"
        >
          <span>{{ typeof sk === 'object' ? sk.name : sk }}</span>
          <span v-if="typeof sk === 'object' && sk.category" class="skill-category-tag">{{ sk.category }}</span>
          <span style="margin-left:4px;opacity:.7"> ✕</span>
        </span>
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
.profile-hero { position: relative; padding-left: 130px; padding-top: 14px; min-height: 75px; }
.profile-avatar.large { position: absolute; left: 0; top: -55px; }
.profile-hero-info { padding-bottom: 0; }
@media (max-width: 480px) {
  .profile-hero { padding-left: 0; padding-top: 65px; }
  .profile-avatar.large { left: 0; }
}
.profile-hero-name { font-size: 1.5rem; margin-bottom: 4px; }
.profile-hero-email { color: var(--text-muted); font-size: .9rem; }
.review-card-item {
  background: var(--bg-main); border: 1px solid var(--border);
  border-radius: 12px; padding: 16px;
  transition: box-shadow 0.2s;
}
.review-card-item:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.06); }

.skill-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  padding: 4px 10px;
}
.skill-category-tag {
  display: inline-block;
  background: rgba(255,255,255,0.25);
  border-radius: 6px;
  padding: 0 6px;
  font-size: .75rem;
  font-weight: 500;
  letter-spacing: .02em;
}
</style>