<script setup>
import { computed, onMounted } from 'vue'
import { useWalletStore }  from '../stores/wallet'
import { useBookingStore } from '../stores/booking'
import { useAuthStore }    from '../stores/auth'

const walletStore  = useWalletStore()
const bookingStore = useBookingStore()
const authStore    = useAuthStore()

onMounted(() => {
  if (authStore.isAdmin) {
    bookingStore.fetchBookings('admin')
  } else {
    // Merge learner-side and tutor-side bookings so becoming a tutor
    // doesn't hide sessions booked while still a tutee.
    bookingStore.fetchAllMyBookings()
  }
})

// Whether the current user is the tutor on a given booking (the bookings
// list now contains both tutor-side and learner-side sessions merged).
function isMyTutorBooking(booking) {
  return Number(booking.tutor_id) === Number(authStore.user?.id)
}

// ── TUTOR computed ────────────────────────────────────────────────────────────
const tutorCompletedBookings = computed(() =>
  bookingStore.bookings.filter(b => b.status === 'completed' && isMyTutorBooking(b))
)

const platformFee = computed(() =>
  (walletStore.tutorTotalEarnings * 0.10).toFixed(2)
)

// Bookings accepted by tutor but NOT yet paid by tutee
const tutorAwaitingPayment = computed(() =>
  bookingStore.bookings.filter(b => b.status === 'accepted' && isMyTutorBooking(b))
)

const tutorAwaitingAmount = computed(() =>
  tutorAwaitingPayment.value.reduce((sum, b) => sum + Number(b.price), 0)
)

// ── ADMIN computed ────────────────────────────────────────────────────────────
const adminCompleted = computed(() =>
  bookingStore.bookings.filter(b => b.status === 'completed')
)
const adminTotalRevenue = computed(() =>
  adminCompleted.value.reduce((sum, b) => sum + Number(b.price), 0).toFixed(2)
)
const adminPlatformFee = computed(() =>
  (adminCompleted.value.reduce((sum, b) => sum + Number(b.price), 0) * 0.10).toFixed(2)
)
const adminPending = computed(() =>
  bookingStore.bookings.filter(b => b.status === 'accepted')
)
const adminPendingAmount = computed(() =>
  adminPending.value.reduce((sum, b) => sum + Number(b.price), 0).toFixed(2)
)
</script>

<template>

<div>

  <div class="header">
    <h1>Wallet</h1>
    <p class="subtitle">
      {{ authStore.isAdmin
          ? 'Platform-wide financial overview'
          : authStore.isTutor
            ? 'Track earnings, payouts and platform fees'
            : 'Track your balance, payments and history' }}
    </p>
    <span class="badge badge-primary" style="margin-top:6px">{{ authStore.user?.role }}</span>
  </div>

  <!-- ══════════════════════  SPENDING WALLET  ══════════════════════════
       Shown for every non-admin account, tutor or tutee, so becoming a
       tutor never hides the balance/history you had as a tutee. -->
  <template v-if="!authStore.isAdmin">

    <h2 v-if="authStore.isTutor" style="margin-bottom:14px">💳 Spending Wallet</h2>

    <div class="wallet-layout" :style="authStore.isTutor ? 'margin-bottom:40px' : ''">

      <!-- Balance Card — bound to walletStore.balance (same source as Dashboard) -->
      <div class="card wallet-card">
        <div class="wallet-icon">💰</div>
        <h2>Wallet Balance</h2>
        <h1>RM {{ walletStore.balance.toFixed(2) }}</h1>
        <div style="margin-top:16px;display:flex;gap:10px;flex-wrap:wrap;justify-content:center">
          <span class="badge" :class="walletStore.balance > 0 ? 'badge-success' : 'badge-danger'">
            {{ walletStore.balance > 0 ? 'Sufficient' : 'Low Balance' }}
          </span>
          <span v-if="walletStore.pendingPayments.length" class="badge badge-warning">
            RM{{ walletStore.totalPending.toFixed(2) }} Pending
          </span>
        </div>
      </div>

      <div class="wallet-records">

        <!-- Transaction History -->
        <div class="card record-card">
          <h3>🧾 Transaction History</h3>
          <div class="list-feed">
            <div
              v-for="tx in walletStore.transactions"
              :key="tx.id"
              class="feed-item"
            >
              <div class="feed-info">
                <span>{{ tx.title }}</span>
                <small>{{ tx.date }}</small>
              </div>
              <div
                class="feed-amount"
                :class="{
                  income:  tx.type === 'income',
                  expense: tx.type === 'expense',
                  due:     tx.type === 'pending'
                }"
              >
                {{ tx.amount }}
              </div>
            </div>
            <div v-if="!walletStore.transactions.length" class="empty-state">
              <i class="fa-solid fa-wallet"></i>
              <p>No transactions yet.</p>
            </div>
          </div>
        </div>

        <!-- Pending Payments — only shows tutor-accepted bookings not yet paid -->
        <div class="card record-card">
          <h3>⏳ Pending Payments</h3>
          <p style="font-size:0.8rem;color:var(--text-muted);margin-bottom:12px">
            Sessions where the tutor has accepted your request. Pay via the Bookings page.
          </p>
          <div class="list-feed">
            <div
              v-for="p in walletStore.pendingPayments"
              :key="p.id"
              class="feed-item"
            >
              <div class="feed-info">
                <span>{{ p.title }}</span>
                <small>{{ p.date }}</small>
              </div>
              <div class="feed-amount due">RM{{ Number(p.amount).toFixed(2) }}</div>
            </div>
            <div v-if="!walletStore.pendingPayments.length" class="empty-state">
              <i class="fa-solid fa-circle-check"></i>
              <p>No pending payments. Tutor-accepted bookings will appear here.</p>
            </div>
          </div>
        </div>

      </div>

    </div>

  </template>

  <!-- ══════════════════════  TUTOR WALLET  ══════════════════════════ -->
  <template v-if="authStore.isTutor">

    <h2 style="margin-bottom:14px">📈 Teaching Earnings</h2>

    <div class="wallet-layout">

      <div class="card wallet-card">
        <div class="wallet-icon">💰</div>
        <h2>Available Balance</h2>
        <h1>RM {{ walletStore.tutorBalance.toFixed(2) }}</h1>
        <div style="margin-top:20px">
          <span class="badge badge-success">Ready To Withdraw</span>
        </div>
      </div>

      <div class="wallet-records">

        <!-- Earnings Summary -->
        <div class="card record-card">
          <h3>📈 Earnings Summary</h3>
          <div class="list-feed">
            <div class="feed-item">
              <div class="feed-info"><span>Total Earnings (Gross)</span><small>All paid sessions</small></div>
              <div class="feed-amount income">+RM {{ walletStore.tutorTotalEarnings.toFixed(2) }}</div>
            </div>
            <div class="feed-item">
              <div class="feed-info"><span>Platform Fee (10%)</span><small>SkillSwap commission</small></div>
              <div class="feed-amount expense">-RM {{ platformFee }}</div>
            </div>
            <div class="feed-item">
              <div class="feed-info"><span>Available Balance (Net)</span><small>Ready to withdraw</small></div>
              <div class="feed-amount income">RM {{ walletStore.tutorBalance.toFixed(2) }}</div>
            </div>
            <div class="feed-item">
              <div class="feed-info"><span>Awaiting Payment</span><small>Accepted but not yet paid</small></div>
              <div class="feed-amount due">RM {{ tutorAwaitingAmount.toFixed(2) }}</div>
            </div>
          </div>
        </div>

        <!-- Transaction History from wallet store -->
        <div class="card record-card">
          <h3>🧾 Transaction History</h3>
          <div class="list-feed">
            <div
              v-for="tx in walletStore.tutorTransactions"
              :key="tx.id"
              class="feed-item"
            >
              <div class="feed-info"><span>{{ tx.title }}</span><small>{{ tx.date }}</small></div>
              <div class="feed-amount income">{{ tx.amount }}</div>
            </div>
            <div v-if="!walletStore.tutorTransactions.length" class="empty-state">
              <i class="fa-solid fa-wallet"></i>
              <p>No transactions yet. Earnings appear here when a tutee pays.</p>
            </div>
          </div>
        </div>

        <!-- Awaiting Tutor Payment -->
        <div class="card record-card">
          <h3>⏳ Awaiting Tutee Payment</h3>
          <p style="font-size:0.8rem;color:var(--text-muted);margin-bottom:12px">
            Sessions you accepted — waiting for the tutee to pay.
          </p>
          <div class="list-feed">
            <div
              v-for="booking in tutorAwaitingPayment"
              :key="booking.id"
              class="feed-item"
            >
              <div class="feed-info"><span>{{ booking.subject }}</span><small>{{ booking.date }}</small></div>
              <div class="feed-amount due">RM {{ booking.price }}</div>
            </div>
            <div v-if="!tutorAwaitingPayment.length" class="empty-state">
              <i class="fa-solid fa-circle-check"></i>
              <p>No awaiting payments.</p>
            </div>
          </div>
        </div>

      </div>

    </div>

  </template>

  <!-- ══════════════════════  ADMIN WALLET  ══════════════════════════ -->
  <template v-if="authStore.isAdmin">

    <div class="wallet-layout">

      <div class="card wallet-card">
        <div class="wallet-icon">🏦</div>
        <h2>Platform Revenue</h2>
        <h1>RM {{ adminPlatformFee }}</h1>
        <div style="margin-top:20px">
          <span class="badge badge-success">10% Commission</span>
        </div>
      </div>

      <div class="wallet-records">

        <!-- Platform Summary -->
        <div class="card record-card">
          <h3>📊 Platform Summary</h3>
          <div class="list-feed">
            <div class="feed-item">
              <div class="feed-info"><span>Total Revenue (Gross)</span><small>All completed sessions</small></div>
              <div class="feed-amount income">RM {{ adminTotalRevenue }}</div>
            </div>
            <div class="feed-item">
              <div class="feed-info"><span>Platform Commission (10%)</span><small>SkillSwap fee</small></div>
              <div class="feed-amount income">RM {{ adminPlatformFee }}</div>
            </div>
            <div class="feed-item">
              <div class="feed-info"><span>Pending Payments</span><small>Accepted but unpaid sessions</small></div>
              <div class="feed-amount due">RM {{ adminPendingAmount }}</div>
            </div>
            <div class="feed-item">
              <div class="feed-info"><span>Completed Sessions</span><small>Total count</small></div>
              <div class="feed-amount">{{ adminCompleted.length }}</div>
            </div>
          </div>
        </div>

        <!-- Completed Transactions -->
        <div class="card record-card">
          <h3>🧾 Completed Transactions</h3>
          <div class="list-feed">
            <div
              v-for="booking in adminCompleted"
              :key="booking.id"
              class="feed-item"
            >
              <div class="feed-info"><span>{{ booking.subject }}</span><small>{{ booking.date }}</small></div>
              <div class="feed-amount income">+RM {{ booking.price }}</div>
            </div>
            <div v-if="!adminCompleted.length" class="empty-state">
              <i class="fa-solid fa-wallet"></i>
              <p>No completed transactions yet.</p>
            </div>
          </div>
        </div>

        <!-- Pending Payments -->
        <div class="card record-card">
          <h3>⏳ Pending Payments</h3>
          <div class="list-feed">
            <div
              v-for="booking in adminPending"
              :key="booking.id"
              class="feed-item"
            >
              <div class="feed-info"><span>{{ booking.subject }}</span><small>{{ booking.date }}</small></div>
              <div class="feed-amount due">RM {{ booking.price }}</div>
            </div>
            <div v-if="!adminPending.length" class="empty-state">
              <i class="fa-solid fa-circle-check"></i>
              <p>No pending payments.</p>
            </div>
          </div>
        </div>

      </div>

    </div>

  </template>

</div>

</template>
