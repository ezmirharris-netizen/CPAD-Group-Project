import { defineStore } from 'pinia'

function save(data) {
  try { localStorage.setItem('ss_wallet', JSON.stringify(data)) } catch(e) {}
}
function load(key, fallback) {
  try {
    const s = localStorage.getItem('ss_wallet')
    if (!s || s === 'undefined') return fallback
    return JSON.parse(s)?.[key] ?? fallback
  } catch { return fallback }
}

const DEFAULT_TXS = [
  { id: 1, title: 'Top-up', amount: '+RM240', type: 'income', date: '2026-06-01' },
  { id: 2, title: 'Vue.js Tutoring Session', amount: '-RM45', type: 'expense', date: '2026-06-10' }
]

export const useWalletStore = defineStore('wallet', {
  state: () => ({
    balance:            load('balance', 240),
    transactions:       load('transactions', DEFAULT_TXS),
    pendingPayments:    load('pendingPayments', []),
    tutorTotalEarnings: load('tutorTotalEarnings', 0),
    tutorBalance:       load('tutorBalance', 0),
    tutorTransactions:  load('tutorTransactions', [])
  }),

  getters: {
    totalPending: (state) =>
      state.pendingPayments.reduce((sum, p) => sum + Number(p.amount), 0),
    tutorAvailable: (state) => parseFloat((state.tutorBalance).toFixed(2))
  },

  actions: {
    _persist() {
      save({
        balance: this.balance,
        transactions: this.transactions,
        pendingPayments: this.pendingPayments,
        tutorTotalEarnings: this.tutorTotalEarnings,
        tutorBalance: this.tutorBalance,
        tutorTransactions: this.tutorTransactions
      })
    },

    addPendingPayment(booking) {
      if (this.pendingPayments.some(p => p.bookingId === booking.id)) return
      this.pendingPayments.push({
        id:        Date.now(),
        bookingId: booking.id,
        title:     `${booking.subject || 'Session'} — ${booking.tutor || 'Tutor'}`,
        amount:    Number(booking.price) || 0,
        date:      new Date().toISOString().slice(0, 10)
      })
      this._persist()
    },

    deductForBooking(booking) {
      const amount = Number(booking.price) || 0
      if (amount <= 0) return

      const subject = booking.subject || 'Session'
      const today   = new Date().toISOString().slice(0, 10)

      this.pendingPayments = this.pendingPayments.filter(p => p.bookingId !== booking.id)

      if (this.balance >= amount) {
        this.balance = +((this.balance - amount).toFixed(2))
        this.transactions.unshift({ id: Date.now(), title: `Booking: ${subject}`, amount: `-RM${amount}`, type: 'expense', date: today })
      } else {
        const paid = +this.balance.toFixed(2)
        this.balance = 0
        if (paid > 0) {
          this.transactions.unshift({ id: Date.now(), title: `Booking: ${subject} (partial)`, amount: `-RM${paid}`, type: 'expense', date: today })
        }
      }

      const tutorCut = +((amount * 0.9).toFixed(2))
      this.tutorTotalEarnings = +((this.tutorTotalEarnings + amount).toFixed(2))
      this.tutorBalance       = +((this.tutorBalance + tutorCut).toFixed(2))
      this.tutorTransactions.unshift({ id: Date.now() + 1, title: `Payment received: ${subject}`, amount: `+RM${tutorCut}`, type: 'income', date: today })

      this._persist()
    },

    topUp(amount) {
      const n = Number(amount)
      if (!n || n <= 0) return
      this.balance = +((this.balance + n).toFixed(2))
      this.transactions.unshift({ id: Date.now(), title: 'Wallet Top-up', amount: `+RM${n}`, type: 'income', date: new Date().toISOString().slice(0, 10) })
      this._persist()
    }
  }
})
