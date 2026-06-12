<script setup>
import WalletCard from '../components/WalletCard.vue'
import TransactionItem from '../components/TransactionItem.vue'

import { useWalletStore } from '../stores/wallet'

const walletStore = useWalletStore()
</script>

<template>

<div class="wallet-layout">

  <WalletCard
    :balance="walletStore.balance"
  />

  <div class="wallet-records">

    <div class="card record-card">

      <h3>
        <i class="fa-solid fa-clock-rotate-left"></i>
        Transactions
      </h3>

      <div class="list-feed">

        <TransactionItem
          v-for="transaction in walletStore.transactions"
          :key="transaction.id"
          :transaction="transaction"
        />

      </div>

    </div>

  </div>

</div>

</template>