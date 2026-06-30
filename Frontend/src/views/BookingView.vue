<script setup>
import { computed, onMounted, ref } from 'vue'
import { useBookingStore } from '../stores/booking'
import { useAuthStore }    from '../stores/auth'
import { useReviewStore }  from '../stores/review'

const bookingStore = useBookingStore()
const authStore    = useAuthStore()
const reviewStore  = useReviewStore()

onMounted(() => {
  if (authStore.isAdmin) {
    bookingStore.fetchBookings('admin')
  } else if (authStore.isTutor) {
    bookingStore.fetchBookings('tutor')
  } else {
    bookingStore.fetchBookings('learner')
  }
})

const pendingBookings   = computed(() => bookingStore.bookings.filter(b => b.status === 'pending'))
const acceptedBookings  = computed(() => bookingStore.bookings.filter(b => b.status === 'accepted'))
const completedBookings = computed(() => bookingStore.bookings.filter(b => b.status === 'completed'))

// Read role from auth store reactively — safe localStorage fallback
const userRole = computed(() => {
  if (authStore.user?.role) return authStore.user.role
  try {
    const raw = localStorage.getItem('user')
    if (!raw || raw === 'undefined' || raw === 'null') return 'tutee'
    return JSON.parse(raw)?.role || 'tutee'
  } catch {
    return 'tutee'
  }
})

// ── Rating Modal ─────────────────────────────────────────────────────────────
const showRating    = ref(false)
const ratingBooking = ref(null)   // the booking being rated
const ratingScore   = ref(5)
const ratingComment = ref('')

function openRatingModal(booking) {
  ratingBooking.value  = booking
  ratingScore.value    = 5
  ratingComment.value  = ''
  showRating.value     = true
}

function closeRatingModal() {
  showRating.value    = false
  ratingBooking.value = null
}

const ratingError = ref('')

async function submitRating() {
  if (!ratingBooking.value) return
  ratingError.value = ''

  // The database only stores tutee → tutor reviews (the `reviews` table has no
  // "reviewee" column, it's tied to a booking and joined to bookings.tutor_id).
  // A tutor rating a tutee isn't supported by the schema yet.
  if (authStore.isTutor) {
    ratingError.value = 'Rating learners isn\'t supported yet.'
    return
  }

  try {
    await reviewStore.addReview({
      bookingId: ratingBooking.value.id,
      tutorId:   ratingBooking.value.tutor_id,
      rating:    ratingScore.value,
      comment:   ratingComment.value
    })
    closeRatingModal()
  } catch (err) {
    ratingError.value = err.response?.data?.error || 'Could not submit review. Please try again.'
  }
}

// ── Actions ───────────────────────────────────────────────────────────────────

// TUTOR / ADMIN: accept a pending booking request
async function acceptBooking(id) {
  await bookingStore.updateStatus(id, 'accepted')
}

// TUTEE: Step 1 — pay for an accepted booking (deducts wallet, marks paid locally)
async function payForBooking(id) {
  await bookingStore.payBooking(id)
}

// TUTEE / TUTOR: Step 2 — mark session as completed and open rating modal
async function completeSession(booking) {
  await bookingStore.completeSession(booking.id)
  openRatingModal(booking)
}

async function declineBooking(id) { await bookingStore.updateStatus(id, 'declined') }

// ── Recorded Session Uploads (links only) — tutors manage, tutees view-only ──
const linkDrafts = ref({}) // bookingId -> draft text while editing

function startEditLink(booking) {
  if (!authStore.isTutor) return
  linkDrafts.value[booking.id] = bookingStore.recordingLinks[booking.id] || ''
}
function cancelEditLink(booking) {
  delete linkDrafts.value[booking.id]
}
function saveLink(booking) {
  if (!authStore.isTutor) return
  const url = (linkDrafts.value[booking.id] || '').trim()
  if (!url) return
  bookingStore.setRecordingLink(booking.id, url)
  delete linkDrafts.value[booking.id]
}
function removeLink(booking) {
  if (!authStore.isTutor) return
  bookingStore.removeRecordingLink(booking.id)
}
</script>

<template>

<div>

  <div class="header">
    <h1>Bookings</h1>
    <p class="subtitle">Manage all tutoring sessions</p>
    <span class="badge badge-primary" style="margin-top:6px">{{ userRole }}</span>
  </div>

  <!-- Stats -->
  <div class="stats">
    <div class="card stat-card">
      <div class="stat-icon bookings">📅</div>
      <div><h3>Pending</h3><p>{{ pendingBookings.length }}</p></div>
    </div>
    <div class="card stat-card">
      <div class="stat-icon rating">⏳</div>
      <div><h3>Accepted</h3><p>{{ acceptedBookings.length }}</p></div>
    </div>
    <div class="card stat-card">
      <div class="stat-icon earnings">✅</div>
      <div><h3>Completed</h3><p>{{ completedBookings.length }}</p></div>
    </div>
  </div>

  <div v-if="bookingStore.loading" class="card" style="text-align:center;padding:40px">
    <p>Loading bookings...</p>
  </div>

  <div class="booking-list">
    <div
      v-for="booking in bookingStore.bookings"
      :key="booking.id"
      class="card booking-item"
      :class="booking.status"
    >
      <div class="booking-info">
        <h3>{{ booking.subject }}</h3>
        <p>{{ authStore.isTutor ? '👨‍🎓' : '👨‍🏫' }} {{ booking.tutor }}</p>
        <p>📅 {{ booking.date }}</p>
        <p>💰 RM {{ booking.price }}</p>
      </div>

      <div class="booking-actions">
        <span
          class="badge"
          :class="{
            'badge-primary': booking.status === 'pending',
            'badge-warning': booking.status === 'accepted',
            'badge-success': booking.status === 'completed',
            'badge-danger':  booking.status === 'declined'
          }"
        >
          {{ booking.status }}
        </span>

        <!-- ── TUTOR ───────────────────────────────────────────────── -->
        <template v-if="authStore.isTutor">
          <!-- Pending: accept or decline -->
          <button v-if="booking.status === 'pending'" @click="acceptBooking(booking.id)">Accept</button>
          <button v-if="booking.status === 'pending'" class="btn-outline" @click="declineBooking(booking.id)">Decline</button>

          <!-- Accepted but tutee hasn't paid yet -->
          <span
            v-if="booking.status === 'accepted' && !bookingStore.isPaid(booking.id)"
            style="font-size:0.82rem;color:var(--text-muted)"
          >
            ⏳ Awaiting tutee payment
          </span>

          <!-- Accepted AND tutee has paid → tutor can mark complete -->
          <button
            v-if="booking.status === 'accepted' && bookingStore.isPaid(booking.id)"
            @click="completeSession(booking)"
          >
            ✅ Complete Session
          </button>
        </template>

        <!-- ── ADMIN ──────────────────────────────────────────────── -->
        <template v-else-if="authStore.isAdmin">
          <button v-if="booking.status === 'pending'" @click="acceptBooking(booking.id)">Accept</button>
          <button v-if="booking.status === 'pending'" class="btn-outline" @click="declineBooking(booking.id)">Decline</button>
          <button v-if="booking.status === 'accepted'" @click="completeSession(booking)">Complete</button>
        </template>

        <!-- ── TUTEE ───────────────────────────────────────────────── -->
        <template v-else>
          <!-- Pending: waiting for tutor to accept -->
          <span
            v-if="booking.status === 'pending'"
            style="font-size:0.82rem;color:var(--text-muted);margin-right:8px"
          >
            ⏳ Awaiting tutor acceptance
          </span>
          <button
            v-if="booking.status === 'pending'"
            class="btn-outline"
            style="color:var(--danger);border-color:var(--danger)"
            @click="bookingStore.cancelBooking(booking.id)"
          >
            Cancel
          </button>

          <!-- Accepted: Step 1 — Pay Now -->
          <button
            v-if="booking.status === 'accepted' && !bookingStore.isPaid(booking.id)"
            @click="payForBooking(booking.id)"
          >
            💳 Pay Now (RM {{ booking.price }})
          </button>

          <!-- Accepted + Paid: Step 2 — Complete Session -->
          <span
            v-if="booking.status === 'accepted' && bookingStore.isPaid(booking.id)"
            class="badge badge-success"
            style="margin-right:8px"
          >
            ✓ Paid
          </span>
          <button
            v-if="booking.status === 'accepted' && bookingStore.isPaid(booking.id)"
            @click="completeSession(booking)"
          >
            ✅ Complete Session
          </button>
        </template>

      </div>
    </div>
  </div>

  <div v-if="!bookingStore.bookings.length && !bookingStore.loading" class="card empty-state">
    <i class="fa-solid fa-calendar-days"></i>
    <h3>No Bookings Yet</h3>
    <p>Your bookings will appear here.</p>
  </div>

  <!-- ── RECORDED SESSION UPLOADS (links only) ───────────────────────── -->
  <div class="card" style="margin-top:25px">
    <div class="section-header">
      <div>
        <h2>🎥 Recorded Session Uploads</h2>
        <p class="subtitle">Recording links from completed sessions, saved here for repeat reference</p>
      </div>
      <span v-if="completedBookings.length" class="badge badge-success">
        {{ completedBookings.length }} completed
      </span>
    </div>

    <div v-if="!completedBookings.length" class="empty-state" style="padding:30px">
      <i class="fa-solid fa-video"></i>
      <p>No completed sessions yet. Recording links can be added once a session is marked complete.</p>
    </div>

    <div class="recording-list">
      <div
        v-for="booking in completedBookings"
        :key="'rec-' + booking.id"
        class="recording-row"
      >
        <div style="flex:1;min-width:0">
          <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
            <strong>{{ booking.subject }}</strong>
            <span class="badge badge-success">completed</span>
          </div>
          <p class="muted-sm">{{ authStore.isTutor ? '👨‍🎓' : '👨‍🏫' }} {{ booking.tutor }} · 📅 {{ booking.date }}</p>

          <!-- Saved link (view mode) -->
          <div v-if="bookingStore.recordingLinks[booking.id] && linkDrafts[booking.id] === undefined" style="margin-top:8px">
            <a
              :href="bookingStore.recordingLinks[booking.id]"
              target="_blank"
              rel="noopener noreferrer"
              class="recording-link"
            >
              <i class="fa-solid fa-link"></i> {{ bookingStore.recordingLinks[booking.id] }}
            </a>
          </div>
          <p v-else-if="linkDrafts[booking.id] === undefined" class="muted-sm" style="margin-top:8px">
            No recording link added yet.
          </p>

          <!-- Edit mode -->
          <div v-if="authStore.isTutor && linkDrafts[booking.id] !== undefined" style="margin-top:8px">
            <input
              v-model="linkDrafts[booking.id]"
              type="url"
              placeholder="Paste recording link (e.g. Google Drive, YouTube, Zoom)..."
              style="width:100%;padding:8px 10px;border:1px solid var(--border);border-radius:8px;font-size:0.85rem"
            >
          </div>
        </div>

        <!-- ── TUTOR: can add/edit/remove the recording link ───────────── -->
        <div v-if="authStore.isTutor" class="action-btns">
          <template v-if="linkDrafts[booking.id] !== undefined">
            <button style="padding:8px 16px;font-size:.85rem" @click="saveLink(booking)">Save</button>
            <button class="btn-outline" style="padding:8px 16px;font-size:.85rem" @click="cancelEditLink(booking)">Cancel</button>
          </template>
          <template v-else>
            <button
              class="btn-outline"
              style="padding:8px 16px;font-size:.85rem"
              @click="startEditLink(booking)"
            >
              {{ bookingStore.recordingLinks[booking.id] ? '✎ Edit Link' : '+ Add Link' }}
            </button>
            <button
              v-if="bookingStore.recordingLinks[booking.id]"
              class="btn-outline"
              style="padding:8px 16px;font-size:.85rem;color:var(--danger);border-color:var(--danger)"
              @click="removeLink(booking)"
            >
              ✕ Remove
            </button>
          </template>
        </div>
      </div>
    </div>
  </div>

</div>

<!-- ══════════════════════  RATING MODAL  ══════════════════════════ -->
<div v-if="showRating" class="modal-overlay" @click.self="closeRatingModal">
  <div class="modal-card">
    <h2>⭐ Rate Your Session</h2>
    <p style="color:var(--text-muted);margin-bottom:20px">
      {{ authStore.isTutor ? 'How was your tutee?' : 'How was your tutor?' }}
      — <strong>{{ ratingBooking?.subject }}</strong>
    </p>

    <!-- Star selector -->
    <div class="star-row" style="margin-bottom:16px">
      <button
        v-for="n in 5"
        :key="n"
        class="star-btn"
        :class="{ active: n <= ratingScore }"
        @click="ratingScore = n"
      >
        ★
      </button>
    </div>
    <p style="text-align:center;margin-bottom:16px;font-size:0.9rem;color:var(--text-muted)">
      {{ ratingScore }} / 5
    </p>

    <!-- Comment -->
    <textarea
      v-model="ratingComment"
      placeholder="Leave a comment (optional)..."
      rows="3"
      style="width:100%;padding:10px;border:1px solid var(--border);border-radius:8px;resize:vertical;font-family:inherit;font-size:0.9rem"
    ></textarea>

    <p v-if="ratingError" style="color:#dc2626;font-size:0.85rem;margin-top:10px">{{ ratingError }}</p>

    <div style="display:flex;gap:12px;margin-top:18px;justify-content:flex-end">
      <button class="btn-outline" @click="closeRatingModal">Skip</button>
      <button @click="submitRating">Submit Rating</button>
    </div>
  </div>
</div>

</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal-card {
  background: var(--card-bg, #fff);
  border-radius: 16px;
  padding: 32px;
  width: 100%;
  max-width: 440px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
}
.star-row {
  display: flex;
  justify-content: center;
  gap: 8px;
}
.star-btn {
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: #d1d5db;
  padding: 0;
  transition: color 0.15s, transform 0.1s;
}
.star-btn.active,
.star-btn:hover {
  color: #f59e0b;
  transform: scale(1.15);
}

/* ── Recorded Session Uploads ── */
.section-header {
  display: flex; justify-content: space-between; align-items: flex-start;
  margin-bottom: 20px; gap: 12px;
}
.recording-list {
  display: flex; flex-direction: column; gap: 14px;
}
.recording-row {
  display: flex; align-items: flex-start; gap: 16px;
  padding: 18px 20px;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: var(--card-bg, #fff);
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
  transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
}
.recording-row:hover {
  border-color: var(--primary-light, var(--primary));
  box-shadow: 0 4px 14px rgba(15, 23, 42, 0.08);
}
.action-btns {
  display: flex; flex-direction: column; gap: 8px; flex-shrink: 0;
  padding-left: 16px;
  border-left: 1px solid var(--border);
}
.muted-sm { color: var(--text-muted); font-size: .83rem; margin-top: 2px; }
.recording-link {
  display: inline-flex; align-items: center; gap: 6px;
  color: var(--primary); font-size: .85rem; word-break: break-all;
  text-decoration: none;
  padding: 6px 10px;
  background: var(--bg-main);
  border-radius: 8px;
}
.recording-link:hover { text-decoration: underline; }
</style>
