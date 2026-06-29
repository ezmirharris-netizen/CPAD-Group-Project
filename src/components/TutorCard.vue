<script setup>
import { ref, computed } from 'vue'
import { useBookingStore } from '../stores/booking'
import { useAuthStore }    from '../stores/auth'
import { useTutorStore }   from '../stores/tutor'

const props = defineProps({ tutor: Object })

const bookingStore = useBookingStore()
const authStore    = useAuthStore()
const tutorStore   = useTutorStore()

/* ── helper: robust login check (Pinia + localStorage fallback) ────── */
function isUserLoggedIn() {
  if (authStore.token) return true
  return !!localStorage.getItem('token')
}
function getUserRole() {
  if (authStore.user?.role) return authStore.user.role
  try {
    const raw = localStorage.getItem('user')
    return raw ? JSON.parse(raw)?.role || 'tutee' : 'tutee'
  } catch { return 'tutee' }
}

/* ── admin check (reactive + localStorage fallback) ─────────────────── */
const isAdmin = computed(() => authStore.isAdmin || getUserRole() === 'admin')

/* ── admin delete ────────────────────────────────────────────────────── */
function handleDeleteTutor() {
  if (!confirm(`Remove ${props.tutor.name} from the listing?`)) return
  tutorStore.deleteTutor(props.tutor.id)
}

/* ── modal state ─────────────────────────────── */
const show      = ref(false)
const step      = ref(1)
const booking   = ref(false)
const booked    = ref(false)
const errorMsg  = ref('')

/* ── calendar state ──────────────────────────── */
const today       = new Date()
const viewYear    = ref(today.getFullYear())
const viewMonth   = ref(today.getMonth())
const selectedDay = ref(null)

const MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December']
const DOW    = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

const monthLabel = computed(() => `${MONTHS[viewMonth.value]}, ${viewYear.value}`)

const calDays = computed(() => {
  const first  = new Date(viewYear.value, viewMonth.value, 1)
  const last   = new Date(viewYear.value, viewMonth.value + 1, 0)
  const blanks = first.getDay()
  const days   = []
  for (let i = 0; i < blanks; i++) days.push(null)
  for (let d = 1; d <= last.getDate(); d++) {
    days.push(new Date(viewYear.value, viewMonth.value, d))
  }
  return days
})

function prevMonth() {
  if (viewMonth.value === 0) { viewMonth.value = 11; viewYear.value-- }
  else viewMonth.value--
}
function nextMonth() {
  if (viewMonth.value === 11) { viewMonth.value = 0; viewYear.value++ }
  else viewMonth.value++
}
function isToday(d)    { return d && d.toDateString() === today.toDateString() }
function isSelected(d) { return d && selectedDay.value && d.toDateString() === selectedDay.value.toDateString() }
function isPast(d)     { return d && d < new Date(today.getFullYear(), today.getMonth(), today.getDate()) }
function pickDay(d)    { if (!d || isPast(d)) return; selectedDay.value = d }

/* ── time state ──────────────────────────────── */
const hour   = ref('09')
const minute = ref('00')
const ampm   = ref('AM')

const HOURS   = Array.from({length:12}, (_,i) => String(i+1).padStart(2,'0'))
const MINUTES = Array.from({length:12}, (_,i) => String(i*5).padStart(2,'0'))

const clockHourAngle = computed(() => {
  let h = parseInt(hour.value) % 12
  return h * 30 + parseInt(minute.value) * 0.5
})
const clockMinAngle = computed(() => parseInt(minute.value) * 6)

/* ── open / close ────────────────────────────── */
function open() {
  // Use robust check — Pinia + localStorage fallback
  if (!isUserLoggedIn()) {
    errorMsg.value = 'Please log in to book a session.'
    return
  }
  errorMsg.value = ''
  show.value     = true
  step.value     = 1
  booked.value   = false
  selectedDay.value = null
  hour.value = '09'; minute.value = '00'; ampm.value = 'AM'
  viewYear.value  = today.getFullYear()
  viewMonth.value = today.getMonth()
}
function close() { show.value = false }

function goToTime() {
  if (!selectedDay.value) { errorMsg.value = 'Please select a date.'; return }
  errorMsg.value = ''
  step.value = 2
}

async function confirmBooking() {
  errorMsg.value = ''
  let h = parseInt(hour.value)
  if (ampm.value === 'PM' && h !== 12) h += 12
  if (ampm.value === 'AM' && h === 12) h = 0
  const pad = n => String(n).padStart(2,'0')
  const dateStr = `${selectedDay.value.getFullYear()}-${pad(selectedDay.value.getMonth()+1)}-${pad(selectedDay.value.getDate())}`
  const timeStr = `${pad(h)}:${minute.value}:00`

  booking.value = true
  await bookingStore.createBooking({
    tutor_id:      props.tutor.id,
    skill_id:      props.tutor.skill_id || 1,
    tutor_name:    props.tutor.name,
    skill_name:    props.tutor.skill || props.tutor.skills?.[0] || 'Tutoring',
    schedule_time: `${dateStr} ${timeStr}`,
    price:         props.tutor.price || props.tutor.rate_per_hour || 0,
  })
  booking.value = false
  booked.value  = true
  show.value    = false
}
</script>

<template>

<div class="tutor-card">
  <div class="avatar">{{ tutor.name.charAt(0) }}</div>
  <h3>{{ tutor.name }}</h3>
  <p class="faculty">{{ tutor.faculty }}</p>
  <div style="display:flex;flex-wrap:wrap;gap:4px;margin:6px 0;justify-content:center">
    <span v-for="s in (tutor.skills||[tutor.skill]).filter(Boolean)" :key="s" class="badge badge-primary">{{ s }}</span>
  </div>
  <div class="rating">⭐ {{ tutor.rating ?? '—' }}</div>
  <div class="price">RM {{ tutor.rate_per_hour ?? tutor.price ?? 0 }}/hour</div>

  <div v-if="booked" class="badge badge-success" style="margin-top:6px">✓ Booking Requested!</div>
  <div v-if="errorMsg && !show" style="color:var(--danger);font-size:.85rem;margin-top:4px">{{ errorMsg }}</div>

  <button v-if="!booked" @click="open" style="width:100%;margin-top:8px">Book Session</button>

  <!-- Admin-only delete button -->
  <button
    v-if="isAdmin"
    @click="handleDeleteTutor"
    style="width:100%;margin-top:6px;background:transparent;color:var(--danger);border:1px solid var(--danger);font-size:.82rem"
  >
    🗑 Delete Tutor
  </button>
</div>

<!-- ═══════════════════ BOOKING MODAL ═══════════════════ -->
<Teleport to="body">
<div v-if="show" class="dt-backdrop" @click.self="close">
  <div class="dt-card">

    <!-- STEP 1: SELECT DATE -->
    <template v-if="step === 1">

      <div class="dt-header">
        <div class="dt-header-left">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          <span class="dt-title">Book: {{ tutor.name }}</span>
        </div>
      </div>

      <div class="dt-month-nav">
        <button class="dt-nav-btn" @click="prevMonth">&#8249;</button>
        <span class="dt-month-label">{{ monthLabel }}</span>
        <button class="dt-nav-btn" @click="nextMonth">&#8250;</button>
      </div>

      <div class="dt-dow-row">
        <span v-for="d in DOW" :key="d">{{ d }}</span>
      </div>

      <div class="dt-grid">
        <button
          v-for="(day, i) in calDays"
          :key="i"
          class="dt-day"
          :class="{
            'dt-day--empty':    !day,
            'dt-day--past':     isPast(day),
            'dt-day--today':    isToday(day),
            'dt-day--selected': isSelected(day),
          }"
          :disabled="!day || isPast(day)"
          @click="pickDay(day)"
        >
          {{ day ? day.getDate() : '' }}
        </button>
      </div>

      <div v-if="errorMsg" class="dt-error">{{ errorMsg }}</div>
      <button class="dt-btn-primary" @click="goToTime">Select Time →</button>
      <button class="dt-btn-cancel"  @click="close">Cancel</button>

    </template>

    <!-- STEP 2: SET TIME -->
    <template v-if="step === 2">

      <div class="dt-header">
        <div class="dt-header-left">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          <span class="dt-title">Set Time</span>
        </div>
      </div>

      <div class="dt-clock-wrap">
        <svg class="dt-clock-svg" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="95" fill="white" stroke="#e2e8f0" stroke-width="3"/>
          <circle cx="100" cy="100" r="88" fill="white"/>
          <g v-for="n in 12" :key="n">
            <line
              :x1="100 + 78*Math.sin((n/12)*2*Math.PI)" :y1="100 - 78*Math.cos((n/12)*2*Math.PI)"
              :x2="100 + 88*Math.sin((n/12)*2*Math.PI)" :y2="100 - 88*Math.cos((n/12)*2*Math.PI)"
              stroke="#cbd5e1" stroke-width="2.5" stroke-linecap="round"
            />
          </g>
          <g v-for="n in 60" :key="'m'+n">
            <line v-if="n % 5 !== 0"
              :x1="100 + 82*Math.sin((n/60)*2*Math.PI)" :y1="100 - 82*Math.cos((n/60)*2*Math.PI)"
              :x2="100 + 88*Math.sin((n/60)*2*Math.PI)" :y2="100 - 88*Math.cos((n/60)*2*Math.PI)"
              stroke="#e2e8f0" stroke-width="1"
            />
          </g>
          <line x1="100" y1="100"
            :x2="100 + 50*Math.sin(clockHourAngle*(Math.PI/180))"
            :y2="100 - 50*Math.cos(clockHourAngle*(Math.PI/180))"
            stroke="#1e293b" stroke-width="4" stroke-linecap="round"
          />
          <line x1="100" y1="100"
            :x2="100 + 68*Math.sin(clockMinAngle*(Math.PI/180))"
            :y2="100 - 68*Math.cos(clockMinAngle*(Math.PI/180))"
            stroke="#475569" stroke-width="2.5" stroke-linecap="round"
          />
          <circle cx="100" cy="100" r="4" fill="#1e293b"/>
        </svg>
      </div>

      <div class="dt-time-row">
        <div class="dt-time-sel">
          <button class="dt-time-arrow" @click="hour = HOURS[(HOURS.indexOf(hour)-1+12)%12]">▲</button>
          <span class="dt-time-val">{{ hour }}</span>
          <button class="dt-time-arrow" @click="hour = HOURS[(HOURS.indexOf(hour)+1)%12]">▼</button>
        </div>
        <span class="dt-time-colon">:</span>
        <div class="dt-time-sel">
          <button class="dt-time-arrow" @click="minute = MINUTES[(MINUTES.indexOf(minute)-1+12)%12]">▲</button>
          <span class="dt-time-val">{{ minute }}</span>
          <button class="dt-time-arrow" @click="minute = MINUTES[(MINUTES.indexOf(minute)+1)%12]">▼</button>
        </div>
        <div class="dt-time-sel dt-ampm">
          <button class="dt-time-arrow" @click="ampm = ampm==='AM'?'PM':'AM'">▲</button>
          <span class="dt-time-val">{{ ampm }}</span>
          <button class="dt-time-arrow" @click="ampm = ampm==='AM'?'PM':'AM'">▼</button>
        </div>
      </div>

      <div v-if="errorMsg" class="dt-error">{{ errorMsg }}</div>
      <button class="dt-btn-primary" :disabled="booking" @click="confirmBooking">
        {{ booking ? 'Booking…' : '✓ Confirm Booking' }}
      </button>
      <button class="dt-btn-cancel" @click="step=1">← Back</button>

    </template>

  </div>
</div>
</Teleport>

</template>

<style scoped>
.dt-backdrop {
  position:fixed;inset:0;background:rgba(15,23,42,.45);backdrop-filter:blur(4px);
  display:flex;align-items:center;justify-content:center;z-index:9999;
}
.dt-card {
  background:#f1f5f9;border-radius:24px;padding:28px 28px 22px;width:340px;
  box-shadow:0 24px 60px rgba(0,0,0,.18);display:flex;flex-direction:column;gap:0;
}
.dt-header { display:flex;align-items:center;justify-content:space-between;margin-bottom:20px; }
.dt-header-left { display:flex;align-items:center;gap:8px;color:#1e293b; }
.dt-title { font-size:1.05rem;font-weight:700;color:#1e293b; }
.dt-month-nav { display:flex;align-items:center;justify-content:space-between;margin-bottom:14px; }
.dt-nav-btn {
  background:white;border:1px solid #e2e8f0;border-radius:50%;
  width:32px;height:32px;font-size:1.2rem;cursor:pointer;color:#64748b;
  display:flex;align-items:center;justify-content:center;transition:background .15s;
}
.dt-nav-btn:hover { background:#f8fafc; }
.dt-month-label { font-weight:600;font-size:.95rem;color:#1e293b; }
.dt-dow-row { display:grid;grid-template-columns:repeat(7,1fr);margin-bottom:6px;text-align:center; }
.dt-dow-row span { font-size:.7rem;font-weight:600;color:#94a3b8;padding:2px 0; }
.dt-grid { display:grid;grid-template-columns:repeat(7,1fr);gap:3px;margin-bottom:18px; }
.dt-day {
  aspect-ratio:1;border:none;background:none;border-radius:50%;
  font-size:.82rem;font-weight:500;color:#334155;cursor:pointer;
  transition:background .12s,color .12s;display:flex;align-items:center;justify-content:center;
}
.dt-day:hover:not(:disabled):not(.dt-day--selected) { background:#e2e8f0; }
.dt-day--empty   { pointer-events:none; }
.dt-day--past    { color:#cbd5e1;cursor:not-allowed; }
.dt-day--today   { font-weight:700;color:#6366f1; }
.dt-day--selected { background:#0ea5e9;color:white!important;font-weight:700; }
.dt-btn-primary {
  width:100%;padding:13px;background:#0ea5e9;color:white;
  border:none;border-radius:14px;font-size:.95rem;font-weight:600;cursor:pointer;
  margin-top:4px;transition:background .15s;
}
.dt-btn-primary:hover:not(:disabled) { background:#0284c7; }
.dt-btn-primary:disabled { opacity:.6;cursor:not-allowed; }
.dt-btn-cancel {
  width:100%;padding:10px;background:none;border:none;color:#64748b;
  font-size:.88rem;cursor:pointer;margin-top:6px;text-align:center;
}
.dt-btn-cancel:hover { color:#334155; }
.dt-error { color:#ef4444;font-size:.82rem;margin-bottom:8px;text-align:center; }
.dt-clock-wrap { display:flex;justify-content:center;margin:4px 0 20px; }
.dt-clock-svg  { width:180px;height:180px; }
.dt-time-row   { display:flex;align-items:center;justify-content:center;gap:6px;margin-bottom:20px; }
.dt-time-sel   {
  display:flex;flex-direction:column;align-items:center;
  background:white;border-radius:12px;padding:8px 16px;
  box-shadow:0 2px 8px rgba(0,0,0,.08);min-width:56px;
}
.dt-time-arrow { background:none;border:none;color:#94a3b8;font-size:.75rem;cursor:pointer;line-height:1;padding:2px 4px; }
.dt-time-arrow:hover { color:#334155; }
.dt-time-val  { font-size:1.1rem;font-weight:700;color:#1e293b;padding:4px 0; }
.dt-time-colon { font-size:1.3rem;font-weight:700;color:#334155;margin-bottom:2px; }
.dt-ampm .dt-time-val { font-size:.95rem; }
.tutor-card {
  background:var(--card-bg,white);border-radius:var(--radius-md,12px);
  padding:20px 16px;text-align:center;border:1px solid var(--border,#e2e8f0);
  transition:box-shadow .2s;
}
.tutor-card:hover { box-shadow:var(--shadow-hover,0 10px 30px rgba(0,0,0,.08)); }
.avatar {
  width:56px;height:56px;border-radius:50%;background:var(--primary-light,#eef2ff);
  color:var(--primary,#6366f1);font-size:1.4rem;font-weight:700;
  display:flex;align-items:center;justify-content:center;margin:0 auto 10px;
}
.faculty { font-size:.82rem;color:var(--text-muted,#64748b);margin:2px 0 6px; }
.rating  { font-size:.9rem;margin:6px 0 2px; }
.price   { font-size:.9rem;font-weight:600;color:var(--primary,#6366f1); }
</style>
