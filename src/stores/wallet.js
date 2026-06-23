import { defineStore } from 'pinia'

export const useWalletStore = defineStore('wallet', {
  state: () => ({
    balance: 240,

    transactions: [
      {
        id: 1,
        title: 'Vue.js Tutoring Session',
        amount: '+RM45',
        type: 'income',
        date: '2026-06-10'
      },

      {
        id: 2,
        title: 'Database Tutoring Session',
        amount: '-RM30',
        type: 'expense',
        date: '2026-06-09'
      }
    ]
  })
})