import { defineStore } from 'pinia'

// Wallet data is kept per-account (keyed by user id) so that switching
// accounts — or a tutee becoming a tutor — never bleeds one person's
// balance into another's, and never appears to "reset" just because the
// account's role changed.
function currentUserId() {
  try {
    const raw = localStorage.getItem('user')
    if (!raw || raw === 'undefined' || raw === 'null') return 'guest'
    return JSON.parse(raw)?.id ?? 'guest'
  } catch (e) {
    return 'guest'
  }
}

function storageKey() {
  return `ss_wallet_${currentUserId()}`
}

function save(data) {
  try { localStorage.setItem(storageKey(), JSON.stringify(data)) } catch (e) {}
}
function load(key, fallback) {
  try {
    const s = localStorage.getItem(storageKey())
    if (!s || s === 'undefined') return fallback
    return JSON.parse(s)?.[key] ?? fallback
  } catch { return fallback }
}

const DEFAULT_TXS = [
  { id: 1, title: 'Top-up', amount: '+RM240', type: 'income', date: '2026-06-01' },
  { id: 2, title: 'Vue.js Tutoring Session', amount: '-RM45', type: 'expense', date: '2026-06-10' }
]

function freshState() {
  return {
    balance:            load('balance', 240),
    transactions:       load('transactions', DEFAULT_TXS),
    pendingPayments:    load('pendingPayments', []),
    tutorTotalEarnings: load('tutorTotalEarnings', 0),
    tutorBalance:       load('tutorBalance', 0),
    tutorTransactions:  load('tutorTransactions', [])
  }
}

export const useWalletStore = defineStore('wallet', {
  state: freshState,

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

    // Re-read wallet data for whichever account is currently logged in.
    // Call this right after login/register/logout so each account always
    // shows its own balance/history instead of whatever was last held in
    // memory for a previous account.
    reload() {
      Object.assign(this, freshState())
    },

    // One-time RM50 sign-up bonus for a brand-new account. Only call this
    // immediately after a successful registration — calling it again later
    // (e.g. on every login) would re-grant the bonus.
    grantSignupBonus(amount = 50) {
      const today = new Date().toISOString().slice(0, 10)
      this.balance = amount
      this.transactions = [
        { id: Date.now(), title: 'Welcome Bonus', amount: `+RM${amount}`, type: 'income', date: today }
      ]
      this.pendingPayments    = []
      this.tutorTotalEarnings = 0
      this.tutorBalance       = 0
      this.tutorTransactions  = []
      this._persist()
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
