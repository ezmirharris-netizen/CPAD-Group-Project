<script setup>
import { computed } from 'vue'
import { useBookingStore } from '../stores/booking'

const bookingStore = useBookingStore()

const completedBookings = computed(() =>
  bookingStore.bookings.filter(
    b => b.status === 'completed'
  )
)

const totalEarnings = computed(() =>
  completedBookings.value.reduce(
    (sum, booking) => sum + booking.price,
    0
  )
)

const platformFee = computed(() =>
  (totalEarnings.value * 0.10).toFixed(2)
)

const availableBalance = computed(() =>
  (totalEarnings.value * 0.90).toFixed(2)
)

const pendingBookings = computed(() =>
  bookingStore.bookings.filter(
    b => b.status === 'accepted'
  )
)

const pendingAmount = computed(() =>
  pendingBookings.value.reduce(
    (sum, booking) => sum + booking.price,
    0
  )
)
</script>

<template>

<div>

  <div class="header">

    <h1>Wallet</h1>

    <p class="subtitle">
      Track earnings, payouts and platform fees
    </p>

  </div>

  <div class="wallet-layout">

    <!-- Balance Card -->

    <div class="card wallet-card">

      <div class="wallet-icon">
        💰
      </div>

      <h2>Available Balance</h2>

      <h1>
        RM {{ availableBalance }}
      </h1>

      <div style="margin-top:20px">

        <span class="badge badge-success">
          Ready To Withdraw
        </span>

      </div>

    </div>

    <!-- Records -->

    <div class="wallet-records">

      <!-- Earnings -->

      <div class="card record-card">

        <h3>
          📈 Earnings Summary
        </h3>

        <div class="list-feed">

          <div class="feed-item">

            <div class="feed-info">
              <span>Total Earnings</span>
              <small>All completed sessions</small>
            </div>

            <div class="feed-amount income">
              +RM {{ totalEarnings }}
            </div>

          </div>

          <div class="feed-item">

            <div class="feed-info">
              <span>Platform Fee (10%)</span>
              <small>SkillSwap commission</small>
            </div>

            <div class="feed-amount expense">
              -RM {{ platformFee }}
            </div>

          </div>

          <div class="feed-item">

            <div class="feed-info">
              <span>Pending Sessions</span>
              <small>Awaiting completion</small>
            </div>

            <div class="feed-amount">
              RM {{ pendingAmount }}
            </div>

          </div>

        </div>

      </div>

      <!-- Transaction History -->

      <div class="card record-card">

        <h3>
          🧾 Transaction History
        </h3>

        <div class="list-feed">

          <div
            v-for="booking in completedBookings"
            :key="booking.id"
            class="feed-item"
          >

            <div class="feed-info">

              <span>
                {{ booking.subject }}
              </span>

              <small>
                {{ booking.date }}
              </small>

            </div>

            <div class="feed-amount income">
              +RM {{ booking.price }}
            </div>

          </div>

          <div
            v-if="!completedBookings.length"
            class="empty-state"
          >

            <i class="fa-solid fa-wallet"></i>

            <p>
              No completed transactions yet.
            </p>

          </div>

        </div>

      </div>

      <!-- Pending Payments -->

      <div class="card record-card">

        <h3>
          ⏳ Pending Payments
        </h3>

        <div class="list-feed">

          <div
            v-for="booking in pendingBookings"
            :key="booking.id"
            class="feed-item"
          >

            <div class="feed-info">

              <span>
                {{ booking.subject }}
              </span>

              <small>
                {{ booking.date }}
              </small>

            </div>

            <div class="feed-amount due">
              RM {{ booking.price }}
            </div>

          </div>

          <div
            v-if="!pendingBookings.length"
            class="empty-state"
          >

            <i class="fa-solid fa-circle-check"></i>

            <p>
              No pending payments.
            </p>

          </div>

        </div>

      </div>

    </div>

  </div>

</div>

</template>