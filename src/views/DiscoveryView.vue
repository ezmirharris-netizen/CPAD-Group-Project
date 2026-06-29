<script setup>
import { ref, computed, onMounted } from 'vue'
import { useTutorStore }   from '../stores/tutor'
import { useAuthStore }    from '../stores/auth'
import { useReviewStore }  from '../stores/review'
import { useBookingStore } from '../stores/booking'

const tutorStore   = useTutorStore()
const authStore    = useAuthStore()
const reviewStore  = useReviewStore()
const bookingStore = useBookingStore()

const search         = ref('')
const facultyFilter  = ref('')
const showAdminPanel = ref(false)

// ── Tutor detail modal ───────────────────────────────────────────
const selectedTutor = ref(null)

// ── New session form (for tutors) ────────────────────────────────
const showNewSession = ref(false)
const sessionForm    = ref({ title: '', subject: '', cost: '', description: '' })

// ══════════════════════════════════════════════════════════════════
//  BOOKING WIZARD STATE
//  Step 1: tutor detail modal  →  "Book This Tutor" button
//  Step 2: date + time-slot picker
//  Step 3: confirm → createBooking
// ══════════════════════════════════════════════════════════════════
const showBookingWizard = ref(false)
const bookingTutor      = ref(null)

// Calendar state
const today       = new Date()
const calYear     = ref(today.getFullYear())
const calMonth    = ref(today.getMonth())         // 0-indexed
const selectedDay = ref(today.getDate())

// Time slots
const TIME_SLOTS = [
  { id: 'morning',   label: 'Morning',   time: '09:00',  icon: '🌅' },
  { id: 'afternoon', label: 'Afternoon', time: '14:00',  icon: '☀️'  },
  { id: 'evening',   label: 'Evening',   time: '19:00',  icon: '🌙'  },
]
const selectedSlot = ref(TIME_SLOTS[0])

// Duration
const DURATIONS = [1, 1.5, 2, 3]
const duration   = ref(1)

// Notes
const bookingNote = ref('')

// Booking submit state
const bookingSubmitting = ref(false)
const bookingSuccess    = ref(false)

// ── Calendar computed helpers ────────────────────────────────────
const MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December']
const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

const calMonthLabel = computed(() => `${MONTHS[calMonth.value]} ${calYear.value}`)

const calDays = computed(() => {
  const firstDow = new Date(calYear.value, calMonth.value, 1).getDay()
  const daysInMonth = new Date(calYear.value, calMonth.value + 1, 0).getDate()
  const cells = []
  for (let i = 0; i < firstDow; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  return cells
})

function prevMonth() {
  if (calMonth.value === 0) { calMonth.value = 11; calYear.value-- }
  else calMonth.value--
  selectedDay.value = 1
}
function nextMonth() {
  if (calMonth.value === 11) { calMonth.value = 0; calYear.value++ }
  else calMonth.value++
  selectedDay.value = 1
}

function isPast(day) {
  if (!day) return false
  const d = new Date(calYear.value, calMonth.value, day)
  const t = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  return d < t
}
function isToday(day) {
  return day === today.getDate() &&
         calMonth.value === today.getMonth() &&
         calYear.value  === today.getFullYear()
}

const selectedDateLabel = computed(() => {
  if (!selectedDay.value) return ''
  const d = new Date(calYear.value, calMonth.value, selectedDay.value)
  return d.toLocaleDateString('en-MY', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
})

const totalCost = computed(() => {
  const rate = bookingTutor.value?.price || bookingTutor.value?.hourlyRate || 0
  return (Number(rate) * duration.value).toFixed(2)
})

const scheduleString = computed(() => {
  const pad = n => String(n).padStart(2, '0')
  const d = new Date(calYear.value, calMonth.value, selectedDay.value)
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${selectedSlot.value.time}:00`
})

// ── Actions ──────────────────────────────────────────────────────
onMounted(() => {
  tutorStore.fetchTutors()
})

const filteredTutors = computed(() => {
  return tutorStore.approvedTutors.filter(tutor => {
    const kw = search.value.toLowerCase()
    const matchSearch =
      tutor.name.toLowerCase().includes(kw) ||
      (tutor.skills || []).join(' ').toLowerCase().includes(kw) ||
      (tutor.skill || '').toLowerCase().includes(kw) ||
      (tutor.bio   || '').toLowerCase().includes(kw)
    const matchFaculty = !facultyFilter.value || tutor.faculty === facultyFilter.value
    return matchSearch && matchFaculty
  })
})

const totalTutors   = computed(() => filteredTutors.value.length)
const averageRating = computed(() => {
  if (!filteredTutors.value.length) return '—'
  const sum = filteredTutors.value.reduce((s, t) => s + Number(t.rating || 0), 0)
  return (sum / filteredTutors.value.length).toFixed(1)
})
const averagePrice = computed(() => {
  if (!filteredTutors.value.length) return 0
  const sum = filteredTutors.value.reduce((s, t) => s + Number(t.price || t.hourlyRate || 0), 0)
  return (sum / filteredTutors.value.length).toFixed(0)
})
const trendingSkills = computed(() => {
  const counts = {}
  tutorStore.approvedTutors.forEach(t => {
    const arr = Array.isArray(t.skills) ? t.skills : [t.skill].filter(Boolean)
    arr.forEach(s => { if (s) counts[s] = (counts[s] || 0) + 1 })
  })
  return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 6)
})

const tutorReviews = computed(() => {
  if (!selectedTutor.value) return []
  return reviewStore.reviewsForUser(selectedTutor.value.id)
})

function openTutorModal(tutor)  { selectedTutor.value = tutor }
function closeTutorModal()      { selectedTutor.value = null  }

// ── Open the booking wizard ──────────────────────────────────────
function openBookingWizard(tutor) {
  bookingTutor.value   = tutor
  // Reset wizard state to today
  calYear.value        = today.getFullYear()
  calMonth.value       = today.getMonth()
  selectedDay.value    = today.getDate()
  selectedSlot.value   = TIME_SLOTS[0]
  duration.value       = 1
  bookingNote.value    = ''
  bookingSuccess.value = false
  closeTutorModal()
  showBookingWizard.value = true
}

function closeBookingWizard() {
  showBookingWizard.value = false
  bookingTutor.value      = null
  bookingSuccess.value    = false
}

// ── Confirm and create booking ───────────────────────────────────
async function confirmBooking() {
  if (!selectedDay.value || !selectedSlot.value) return
  bookingSubmitting.value = true
  await bookingStore.createBooking({
    tutor_name:    bookingTutor.value.name,
    skill_name:    bookingTutor.value.skill,
    schedule_time: scheduleString.value,
    price:         Number(totalCost.value),
    tutor_id:      bookingTutor.value.id,
    duration:      duration.value,
    note:          bookingNote.value
  })
  bookingSubmitting.value = false
  bookingSuccess.value    = true
}

// ── Tutor: create new session ────────────────────────────────────
function openNewSession() {
  sessionForm.value = {
    title:       '',
    subject:     (authStore.user?.skills || [])[0] || '',
    cost:        authStore.user?.hourlyRate || '',
    description: authStore.user?.bio || ''
  }
  showNewSession.value = true
}
function submitNewSession() {
  if (!sessionForm.value.title || !sessionForm.value.subject || !sessionForm.value.cost) {
    alert('Please fill in all required fields.')
    return
  }
  tutorStore.addPendingSession({
    tutorId:   authStore.user?.id,
    tutorName: authStore.user?.name,
    faculty:   authStore.user?.faculty || '',
    ...sessionForm.value
  })
  showNewSession.value = false
  alert('Session submitted for admin review!')
}

// ── Admin: approve / reject sessions ────────────────────────────
function approveSession(id) { tutorStore.approveSession(id) }
function rejectSession(id)  { tutorStore.rejectSession(id)  }

function stars(n) { return '★'.repeat(Math.round(n)) + '☆'.repeat(5 - Math.round(n)) }
</script>

<template>
<div>

  <!-- Page Header -->
  <div class="page-header-row">
    <div class="header">
      <h1>Find Tutors</h1>
      <p class="subtitle">Discover talented students ready to teach and learn.</p>
    </div>
    <div style="display:flex;gap:10px;align-items:flex-start;flex-wrap:wrap">
      <button v-if="authStore.isTutor" @click="openNewSession">
        <i class="fa-solid fa-plus"></i> New Class
      </button>
      <button
        v-if="authStore.isAdmin"
        class="btn-outline"
        style="position:relative;white-space:nowrap"
        @click="showAdminPanel = !showAdminPanel"
      >
        <i class="fa-solid fa-shield-halved"></i> Review
        <span v-if="tutorStore.pendingSessions.length + tutorStore.pendingTutors.length > 0" class="notif-dot">
          {{ tutorStore.pendingSessions.length + tutorStore.pendingTutors.length }}
        </span>
      </button>
    </div>
  </div>

  <!-- Admin Review Panel -->
  <div v-if="showAdminPanel && authStore.isAdmin" class="admin-review-panel">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
      <h3>⏳ Pending Approvals</h3>
      <button class="btn-outline" style="padding:6px 12px;font-size:.8rem" @click="showAdminPanel=false">Close</button>
    </div>
    <div v-if="!tutorStore.pendingSessions.length && !tutorStore.pendingTutors.length" class="empty-state" style="padding:20px">
      <p>Nothing pending right now.</p>
    </div>
    <div v-for="s in tutorStore.pendingSessions" :key="s.id" class="review-row">
      <div style="flex:1">
        <strong>{{ s.title }}</strong> — {{ s.subject }}
        <small style="display:block;color:var(--text-muted)">by {{ s.tutorName }} · RM{{ s.cost }}/hr</small>
        <p style="font-size:.84rem;margin-top:4px">{{ s.description }}</p>
      </div>
      <div style="display:flex;gap:8px;flex-shrink:0">
        <button style="padding:7px 14px;font-size:.83rem" @click="approveSession(s.id)">Approve</button>
        <button class="btn-outline" style="padding:7px 14px;font-size:.83rem;color:var(--danger);border-color:var(--danger)" @click="rejectSession(s.id)">Reject</button>
      </div>
    </div>
    <div v-for="t in tutorStore.pendingTutors" :key="t.id" class="review-row">
      <div style="flex:1">
        <strong>{{ t.name }}</strong>
        <small style="display:block;color:var(--text-muted)">{{ t.email }} · {{ t.faculty }}</small>
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px">
          <span v-for="sk in (t.skills||[])" :key="sk" class="badge badge-primary">{{ sk }}</span>
        </div>
      </div>
      <div style="display:flex;gap:8px;flex-shrink:0">
        <button style="padding:7px 14px;font-size:.83rem" @click="tutorStore.approveTutor(t.id)">Approve</button>
        <button class="btn-outline" style="padding:7px 14px;font-size:.83rem;color:var(--danger);border-color:var(--danger)" @click="tutorStore.rejectTutor(t.id)">Reject</button>
      </div>
    </div>
  </div>

  <!-- Stats -->
  <div class="stats">
    <div class="card stat-card"><div class="stat-icon bookings">👨‍🏫</div><div><h3>Tutors</h3><p>{{ totalTutors }}</p></div></div>
    <div class="card stat-card"><div class="stat-icon rating">⭐</div><div><h3>Avg Rating</h3><p>{{ averageRating }}</p></div></div>
    <div class="card stat-card"><div class="stat-icon earnings">💰</div><div><h3>Avg Price</h3><p>RM {{ averagePrice }}/hr</p></div></div>
  </div>

  <!-- Search -->
  <div class="card search-container">
    <i class="fa-solid fa-magnifying-glass search-icon"></i>
    <input v-model="search" type="text" placeholder="Search tutor, skill or subject...">
  </div>

  <!-- Filter bar -->
  <div class="card filter-bar">
    <div><strong>{{ totalTutors }}</strong> tutors found</div>
    <select v-model="facultyFilter" style="max-width:240px">
      <option value="">All Faculties</option>
      <option>Faculty of Computing</option>
      <option>Faculty of Engineering</option>
      <option>Faculty of Science</option>
      <option>Faculty of Business</option>
      <option>Faculty of Education</option>
    </select>
  </div>

  <!-- Trending Skills -->
  <div class="card" style="margin-bottom:25px">
    <h3 style="margin-bottom:12px">🔥 Trending Skills</h3>
    <div style="display:flex;flex-wrap:wrap;gap:8px">
      <span v-for="sk in trendingSkills" :key="sk[0]" class="badge badge-primary skill-chip" @click="search = sk[0]">
        {{ sk[0] }} ({{ sk[1] }})
      </span>
    </div>
  </div>

  <!-- Loading -->
  <div v-if="tutorStore.loading" class="card" style="text-align:center;padding:40px"><p>Loading tutors…</p></div>

  <!-- Tutor Grid -->
  <div v-else-if="filteredTutors.length" class="tutor-grid">
    <div
      v-for="(tutor, idx) in filteredTutors"
      :key="`${tutor.id}-${tutor.skill_id}-${idx}`"
      class="tutor-card"
      @click="openTutorModal(tutor)"
    >
      <div class="avatar">{{ tutor.name?.charAt(0)?.toUpperCase() }}</div>
      <h3 style="margin:0">{{ tutor.name }}</h3>
      <p class="faculty">{{ tutor.faculty }}</p>
      <span class="badge badge-primary" style="margin:0 auto">{{ tutor.skill }}</span>
      <div class="tutor-rating"><span style="color:#f59e0b">{{ stars(tutor.rating) }}</span> <small>{{ tutor.rating || '—' }}</small></div>
      <div class="price">RM {{ tutor.price || tutor.hourlyRate || 0 }}/hr</div>
      <button style="margin-top:auto;width:100%" @click.stop="openTutorModal(tutor)">View Profile</button>
    </div>
  </div>

  <!-- Empty -->
  <div v-else class="card empty-state">
    <i class="fa-solid fa-user-group" style="font-size:3rem;margin-bottom:15px"></i>
    <h3>No Tutors Found</h3>
    <p>Try changing your search term or faculty filter.</p>
  </div>

</div>

<!-- ══════════════  TUTOR DETAIL MODAL  ══════════════ -->
<div v-if="selectedTutor" class="modal-backdrop" @click.self="closeTutorModal">
  <div class="modal-window tutor-modal">
    <button class="modal-close" @click="closeTutorModal">✕</button>

    <div class="tutor-modal-header">
      <div class="avatar avatar-lg">{{ selectedTutor.name?.charAt(0)?.toUpperCase() }}</div>
      <div>
        <h2>{{ selectedTutor.name }}</h2>
        <p style="color:var(--text-muted)">{{ selectedTutor.faculty }}</p>
        <div style="display:flex;gap:8px;margin-top:6px;flex-wrap:wrap">
          <span class="badge badge-primary">{{ selectedTutor.skill }}</span>
          <span v-if="selectedTutor.level" class="badge badge-success">{{ selectedTutor.level }}</span>
        </div>
      </div>
    </div>

    <div class="modal-section">
      <div class="modal-stat-row">
        <div class="modal-stat">
          <span style="color:#f59e0b;font-size:1.15rem">{{ stars(selectedTutor.rating) }}</span>
          <small>{{ selectedTutor.rating || '—' }} Rating</small>
        </div>
        <div class="modal-stat">
          <strong style="color:var(--primary);font-size:1.25rem">RM {{ selectedTutor.price || selectedTutor.hourlyRate || 0 }}</strong>
          <small>per hour</small>
        </div>
      </div>
    </div>

    <div class="modal-section" v-if="selectedTutor.bio">
      <h4>About</h4>
      <p style="color:var(--text-muted);line-height:1.6;margin-top:6px">{{ selectedTutor.bio }}</p>
    </div>

    <div class="modal-section" v-if="(selectedTutor.skills||[]).length">
      <h4>Skills</h4>
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px">
        <span v-for="sk in selectedTutor.skills" :key="sk" class="badge badge-primary">{{ sk }}</span>
      </div>
    </div>

    <div class="modal-section">
      <h4>Reviews ({{ tutorReviews.length }})</h4>
      <div v-if="tutorReviews.length" style="display:flex;flex-direction:column;gap:10px;margin-top:10px">
        <div v-for="r in tutorReviews" :key="r.id" class="review-item">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
            <strong style="font-size:.86rem">{{ r.reviewerRole }}</strong>
            <span style="color:#f59e0b">{{ '★'.repeat(r.rating) }}{{ '☆'.repeat(5-r.rating) }}</span>
          </div>
          <p style="color:var(--text-muted);font-size:.86rem">{{ r.comment }}</p>
          <small style="color:var(--text-subtle)">{{ r.date }}</small>
        </div>
      </div>
      <p v-else style="color:var(--text-muted);font-size:.86rem;margin-top:8px">No reviews yet.</p>
    </div>

    <!-- Book button opens the wizard -->
    <button
      v-if="!authStore.isTutor && !authStore.isAdmin"
      style="width:100%;padding:14px;margin-top:4px"
      @click="openBookingWizard(selectedTutor)"
    >
      📅 Book This Tutor
    </button>
  </div>
</div>

<!-- ══════════════  BOOKING WIZARD MODAL  ══════════════ -->
<div v-if="showBookingWizard" class="modal-backdrop" @click.self="closeBookingWizard">
  <div class="modal-window booking-wizard">
    <button class="modal-close" @click="closeBookingWizard">✕</button>

    <!-- Success screen -->
    <div v-if="bookingSuccess" class="booking-success">
      <div class="success-icon">✅</div>
      <h2>Booking Confirmed!</h2>
      <p>Your session with <strong>{{ bookingTutor?.name }}</strong> has been requested.</p>
      <div class="booking-summary-box">
        <div class="summary-row"><span>Date</span><strong>{{ selectedDateLabel }}</strong></div>
        <div class="summary-row"><span>Time</span><strong>{{ selectedSlot.icon }} {{ selectedSlot.label }} ({{ selectedSlot.time }})</strong></div>
        <div class="summary-row"><span>Duration</span><strong>{{ duration }}h</strong></div>
        <div class="summary-row"><span>Total</span><strong style="color:var(--primary)">RM {{ totalCost }}</strong></div>
      </div>
      <button style="width:100%;margin-top:20px;padding:13px" @click="closeBookingWizard">Done</button>
    </div>

    <!-- Wizard form -->
    <div v-else>
      <div class="wizard-header">
        <div class="avatar" style="width:48px;height:48px;font-size:1.2rem;flex-shrink:0">{{ bookingTutor?.name?.charAt(0) }}</div>
        <div>
          <h2 style="font-size:1.2rem;margin-bottom:2px">Book {{ bookingTutor?.name }}</h2>
          <p style="color:var(--text-muted);font-size:.85rem">{{ bookingTutor?.skill }} · RM{{ bookingTutor?.price || bookingTutor?.hourlyRate }}/hr</p>
        </div>
      </div>

      <!-- ─── Calendar ─── -->
      <div class="wizard-section">
        <p class="wizard-label">Select Date</p>

        <div class="cal-nav">
          <button class="cal-arrow" @click="prevMonth">‹</button>
          <span class="cal-month-title">{{ calMonthLabel }}</span>
          <button class="cal-arrow" @click="nextMonth">›</button>
        </div>

        <div class="cal-weekdays">
          <span v-for="d in DAYS" :key="d">{{ d }}</span>
        </div>

        <div class="cal-grid">
          <div
            v-for="(day, i) in calDays"
            :key="i"
            class="cal-cell"
            :class="{
              'cal-empty':    !day,
              'cal-past':     isPast(day),
              'cal-today':    isToday(day) && day !== selectedDay,
              'cal-selected': day === selectedDay && !isPast(day),
            }"
            @click="day && !isPast(day) && (selectedDay = day)"
          >
            {{ day || '' }}
          </div>
        </div>

        <p v-if="selectedDay" class="cal-selected-label">
          📅 {{ selectedDateLabel }}
        </p>
      </div>

      <!-- ─── Time Slots ─── -->
      <div class="wizard-section">
        <p class="wizard-label">Select Time Slot</p>
        <div class="time-slot-row">
          <div
            v-for="slot in TIME_SLOTS"
            :key="slot.id"
            class="time-slot"
            :class="{ 'time-slot-active': selectedSlot.id === slot.id }"
            @click="selectedSlot = slot"
          >
            <span class="time-slot-icon">{{ slot.icon }}</span>
            <span class="time-slot-label">{{ slot.label }}</span>
            <span class="time-slot-time">{{ slot.time }}</span>
          </div>
        </div>
      </div>

      <!-- ─── Duration ─── -->
      <div class="wizard-section">
        <p class="wizard-label">Duration</p>
        <div class="duration-row">
          <button
            v-for="d in DURATIONS"
            :key="d"
            class="dur-btn"
            :class="{ 'dur-btn-active': duration === d }"
            @click="duration = d"
          >
            {{ d }}h
          </button>
        </div>
      </div>

      <!-- ─── Notes ─── -->
      <div class="wizard-section">
        <p class="wizard-label">Notes (optional)</p>
        <textarea
          v-model="bookingNote"
          rows="2"
          placeholder="Any topics you'd like to focus on?"
          style="margin-top:6px"
        ></textarea>
      </div>

      <!-- ─── Price Summary ─── -->
      <div class="price-summary">
        <span>RM{{ bookingTutor?.price || bookingTutor?.hourlyRate || 0 }}/hr × {{ duration }}h</span>
        <strong style="color:var(--primary);font-size:1.15rem">RM {{ totalCost }}</strong>
      </div>

      <!-- ─── Actions ─── -->
      <div style="display:flex;gap:12px;margin-top:20px">
        <button class="btn-outline" style="flex:0 0 auto;padding:12px 20px" @click="closeBookingWizard">Cancel</button>
        <button
          style="flex:1;padding:13px"
          :disabled="!selectedDay || bookingSubmitting"
          @click="confirmBooking"
        >
          {{ bookingSubmitting ? 'Processing…' : 'Confirm Booking' }}
        </button>
      </div>
    </div>
  </div>
</div>

<!-- ══════════════  NEW SESSION MODAL (Tutor)  ══════════════ -->
<div v-if="showNewSession" class="modal-backdrop" @click.self="showNewSession=false">
  <div class="modal-window">
    <button class="modal-close" @click="showNewSession=false">✕</button>
    <h2 style="margin-bottom:6px">Create New Class</h2>
    <p style="color:var(--text-muted);margin-bottom:20px">Submit a new tutoring session for admin review.</p>
    <div class="form-group">
      <label>Class Title <span style="color:var(--danger)">*</span></label>
      <input v-model="sessionForm.title" placeholder="e.g. Vue 3 Masterclass">
    </div>
    <div class="form-group">
      <label>Subject / Skill <span style="color:var(--danger)">*</span></label>
      <input v-model="sessionForm.subject" placeholder="e.g. Vue.js">
    </div>
    <div class="form-group">
      <label>Cost per Hour (RM) <span style="color:var(--danger)">*</span></label>
      <input type="number" v-model="sessionForm.cost" placeholder="e.g. 45" min="0">
    </div>
    <div class="form-group">
      <label>Description</label>
      <textarea rows="3" v-model="sessionForm.description" placeholder="What will students learn?"></textarea>
    </div>
    <div style="display:flex;gap:12px;margin-top:20px">
      <button class="btn-outline" style="flex:1" @click="showNewSession=false">Cancel</button>
      <button style="flex:1" @click="submitNewSession">Submit for Review</button>
    </div>
  </div>
</div>

</template>

<style scoped>
/* ── Page layout ── */
.page-header-row {
  display: flex; justify-content: space-between; align-items: flex-start;
  margin-bottom: 30px; gap: 16px; flex-wrap: wrap;
}
.page-header-row .header { margin-bottom: 0; }
.filter-bar {
  display: flex; justify-content: space-between; align-items: center;
  flex-wrap: wrap; gap: 15px; margin-bottom: 25px;
}
.skill-chip { cursor: pointer; }
.skill-chip:hover { background: var(--primary-light); }
.tutor-rating { font-size: .88rem; color: var(--text-muted); }
.notif-dot {
  position: absolute; top: -6px; right: -6px;
  background: var(--danger); color: white;
  border-radius: 50%; width: 18px; height: 18px;
  font-size: .68rem; display: flex; align-items: center; justify-content: center;
}

/* ── Admin panel ── */
.admin-review-panel {
  background: white; border: 1px solid var(--border);
  border-radius: var(--radius-lg); padding: 22px;
  margin-bottom: 25px; box-shadow: 0 6px 24px rgba(0,0,0,0.05);
}
.review-row {
  display: flex; justify-content: space-between; align-items: flex-start; gap: 14px;
  padding: 12px; border: 1px solid var(--border); border-radius: 10px; margin-bottom: 10px;
}

/* ── Tutor detail modal ── */
.tutor-modal { max-width: 560px; }
.tutor-modal-header { display: flex; gap: 18px; align-items: flex-start; margin-bottom: 20px; }
.avatar-lg { width: 80px; height: 80px; font-size: 2rem; flex-shrink: 0; }
.modal-section { margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid var(--border); }
.modal-section:last-of-type { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
.modal-section h4 { font-size: .8rem; text-transform: uppercase; letter-spacing: .06em; color: var(--text-muted); margin-bottom: 6px; }
.modal-stat-row { display: flex; gap: 28px; }
.modal-stat { display: flex; flex-direction: column; gap: 2px; }
.review-item { background: var(--bg-main); padding: 11px 13px; border-radius: 10px; border: 1px solid var(--border); }

/* ══════════════════════════════════════
   BOOKING WIZARD
══════════════════════════════════════ */
.booking-wizard { max-width: 500px; }

.wizard-header {
  display: flex; align-items: center; gap: 14px;
  padding-bottom: 18px; margin-bottom: 18px;
  border-bottom: 1px solid var(--border);
}
.wizard-section { margin-bottom: 20px; }
.wizard-label {
  font-size: .72rem; font-weight: 800; text-transform: uppercase;
  letter-spacing: .07em; color: var(--text-muted); margin-bottom: 10px;
}

/* Calendar */
.cal-nav {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 10px;
}
.cal-month-title { font-weight: 700; font-size: .95rem; }
.cal-arrow {
  background: var(--bg-main); border: 1px solid var(--border); border-radius: 8px;
  width: 32px; height: 32px; padding: 0; font-size: 1.1rem; color: var(--text-muted);
  display: flex; align-items: center; justify-content: center;
}
.cal-arrow:hover { background: var(--primary-light); color: var(--primary); box-shadow: none; }
.cal-weekdays {
  display: grid; grid-template-columns: repeat(7, 1fr);
  text-align: center; margin-bottom: 6px;
  font-size: .7rem; font-weight: 700; text-transform: uppercase;
  color: var(--text-muted); letter-spacing: .04em;
}
.cal-grid {
  display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px;
}
.cal-cell {
  aspect-ratio: 1; display: flex; align-items: center; justify-content: center;
  border-radius: 8px; cursor: pointer; font-size: .88rem; font-weight: 500;
  transition: background .12s, color .12s; border: 1.5px solid transparent;
  user-select: none;
}
.cal-cell:hover:not(.cal-empty):not(.cal-past) { background: var(--primary-light); color: var(--primary); }
.cal-empty  { cursor: default; }
.cal-past   { color: var(--text-subtle); cursor: not-allowed; opacity: .45; }
.cal-today  { border-color: var(--primary); color: var(--primary); font-weight: 700; }
.cal-selected { background: var(--primary) !important; color: white !important; font-weight: 800; border-color: var(--primary); }
.cal-selected-label {
  font-size: .82rem; color: var(--primary); font-weight: 600;
  margin-top: 10px; text-align: center;
}

/* Time slots */
.time-slot-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.time-slot {
  display: flex; flex-direction: column; align-items: center; gap: 3px;
  padding: 12px 8px; border: 1.5px solid var(--border);
  border-radius: 12px; cursor: pointer; transition: all .15s;
  text-align: center;
}
.time-slot:hover { border-color: var(--primary); background: var(--primary-light); }
.time-slot-active { border-color: var(--primary); background: var(--primary-light); }
.time-slot-icon  { font-size: 1.4rem; }
.time-slot-label { font-size: .82rem; font-weight: 700; }
.time-slot-time  { font-size: .75rem; color: var(--text-muted); }

/* Duration buttons */
.duration-row { display: flex; gap: 8px; }
.dur-btn {
  flex: 1; padding: 9px 4px; border-radius: 10px;
  background: var(--bg-main); border: 1.5px solid var(--border);
  color: var(--text-muted); font-weight: 600; font-size: .88rem;
  cursor: pointer; transition: all .15s;
}
.dur-btn:hover { border-color: var(--primary); color: var(--primary); background: var(--primary-light); box-shadow: none; }
.dur-btn-active { border-color: var(--primary); background: var(--primary); color: white !important; }

/* Price summary */
.price-summary {
  display: flex; justify-content: space-between; align-items: center;
  background: var(--bg-main); border: 1px solid var(--border);
  border-radius: 12px; padding: 14px 18px; margin-top: 4px;
  font-size: .9rem; color: var(--text-muted);
}

/* Booking success */
.booking-success { text-align: center; padding: 10px 0; }
.success-icon { font-size: 3.5rem; margin-bottom: 14px; }
.booking-success h2 { margin-bottom: 8px; }
.booking-success p { color: var(--text-muted); margin-bottom: 20px; }
.booking-summary-box {
  background: var(--bg-main); border: 1px solid var(--border);
  border-radius: 14px; padding: 16px; text-align: left;
}
.summary-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: 8px 0; border-bottom: 1px solid var(--border-light); font-size: .88rem;
  color: var(--text-muted);
}
.summary-row:last-child { border-bottom: none; }
.summary-row strong { color: var(--text-main); }
</style>
