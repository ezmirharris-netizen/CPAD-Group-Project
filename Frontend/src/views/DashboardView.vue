<script setup>
import StatCard from '../components/StatCard.vue'
import { useWalletStore } from '../stores/wallet'
import { useBookingStore } from '../stores/booking'
import { useReviewStore } from '../stores/review'

const walletStore = useWalletStore()
const bookingStore = useBookingStore()
const reviewStore = useReviewStore()

const averageRating = (
  reviewStore.reviews.reduce((sum, r) => sum + r.rating, 0) /
  reviewStore.reviews.length
).toFixed(1)
</script>

<template>
  <div class="page">
    <div class="header">
      <h1>Dashboard</h1>
      <p class="subtitle">
        Learn from a senior. Teach a junior.
      </p>
    </div>

    <div class="stats">
      <StatCard
        title="Wallet Balance"
        :value="'RM ' + walletStore.balance"
        icon="fa-solid fa-wallet"
        type="earnings"
      />

      <StatCard
        title="Bookings"
        :value="bookingStore.bookings.length"
        icon="fa-solid fa-calendar"
        type="bookings"
      />

      <StatCard
        title="Average Rating"
        :value="averageRating"
        icon="fa-solid fa-star"
        type="rating"
      />
    </div>
  </div>
</template>