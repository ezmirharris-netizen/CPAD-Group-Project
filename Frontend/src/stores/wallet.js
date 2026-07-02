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

function storageKeyFor(userId) {
  return `ss_wallet_${userId}`
}

function storageKey() {
  return storageKeyFor(currentUserId())
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

// Same as save()/load() above, but for an EXPLICIT account id rather than
// "whoever is currently logged in". Needed because paying for a booking
// has to credit the TUTOR's wallet even though the TUTEE is the one who
// is logged in and triggering the payment.
function loadForUser(userId, key, fallback) {
  try {
    const s = localStorage.getItem(storageKeyFor(userId))
    if (!s || s === 'undefined') return fallback
    return JSON.parse(s)?.[key] ?? fallback
  } catch { return fallback }
}
function saveForUser(userId, data) {
  try { localStorage.setItem(storageKeyFor(userId), JSON.stringify(data)) } catch (e) {}
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
    tutorBalance:       load('tutorBalance', 100), // <-- CHANGED FROM 0 TO 100 AS THE DEFAULT BASE AMOUNT
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
    reload() {
      Object.assign(this, freshState())
    },

    // One-time RM50 sign-up bonus for a brand-new account. Only call this
    // immediately after a successful registration
    grantSignupBonus(amount = 50) {
      const today = new Date().toISOString().slice(0, 10)
      this.balance = amount
      this.transactions = [
        { id: Date.now(), title: 'Welcome Bonus', amount: `+RM${amount}`, type: 'income', date: today }
      ]
      this.pendingPayments    = []
      this.tutorTotalEarnings = 0
      this.tutorBalance       = 100 // <-- CHANGED FROM 0 TO 100 TO SEED THE BASE WALLET AMOUNT ON SIGNUP
      this.tutorTransactions  = [
        { id: Date.now() + 5, title: 'Base Tutor Wallet Setup', amount: '+RM100', type: 'income', date: today } // Optional visual entry log
      ]
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

    // Same as addPendingPayment(), but for an EXPLICIT account id rather
// than "whoever is currently logged in". Needed because a booking gets
// accepted by the TUTOR, but it's the TUTEE who owes the payment and
// should see it show up in their own wallet's pending section.
addPendingPaymentForUser(userId, booking) {
  if (userId == null) return

  const tuteeWallet = {
    balance:            loadForUser(userId, 'balance', 240),
    transactions:       loadForUser(userId, 'transactions', DEFAULT_TXS),
    pendingPayments:    loadForUser(userId, 'pendingPayments', []),
    tutorTotalEarnings: loadForUser(userId, 'tutorTotalEarnings', 0),
    tutorBalance:       loadForUser(userId, 'tutorBalance', 100),
    tutorTransactions:  loadForUser(userId, 'tutorTransactions', [])
  }

  if (tuteeWallet.pendingPayments.some(p => p.bookingId === booking.id)) return

  tuteeWallet.pendingPayments = [
    ...tuteeWallet.pendingPayments,
    {
      id:        Date.now(),
      bookingId: booking.id,
      title:     `${booking.subject || booking.skill_name || 'Session'} — ${booking.tutor || booking.counterpart_name || 'Tutor'}`,
      amount:    Number(booking.price) || 0,
      date:      new Date().toISOString().slice(0, 10)
    }
  ]

  saveForUser(userId, tuteeWallet)

  // If the tutee happens to be the currently logged-in account (e.g.
  // testing both sides in the same browser), keep in-memory state in
  // sync too so the UI updates without needing a reload.
  if (String(userId) === String(currentUserId())) {
    this.pendingPayments = tuteeWallet.pendingPayments
  }
},

    deductForBooking(booking) {
      const amount = Number(booking.price) || 0
      if (amount <= 0) return

      const subject = booking.subject || 'Session'
      const today   = new Date().toISOString().slice(0, 10)

      // ── Tutee side ──
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

      this._persist()

      // ── Tutor side ──
      const tutorId = booking.tutor_id
      if (tutorId == null) return

      const tutorCut = +((amount * 0.9).toFixed(2))   // Platform Fee (10%) taken from earnings
      // REMOVED: flat bonus logic from here

      const tutorWallet = {
        balance:            loadForUser(tutorId, 'balance', 240),
        transactions:       loadForUser(tutorId, 'transactions', DEFAULT_TXS),
        pendingPayments:    loadForUser(tutorId, 'pendingPayments', []),
        tutorTotalEarnings: loadForUser(tutorId, 'tutorTotalEarnings', 0),
        tutorBalance:       loadForUser(tutorId, 'tutorBalance', 100), // <-- ENSURED FALLBACK MATCHES 100 BASE
        tutorTransactions:  loadForUser(tutorId, 'tutorTransactions', [])
      }

      // Teaching earnings increase by the full tuition fee paid by the tutee.
      tutorWallet.tutorTotalEarnings = +((tutorWallet.tutorTotalEarnings + amount).toFixed(2))

      // Available balance gets JUST the 90% cut. (No bonus added on top here)
      tutorWallet.tutorBalance = +((tutorWallet.tutorBalance + tutorCut).toFixed(2))

      tutorWallet.tutorTransactions = [
        { id: Date.now() + 1, title: `Payment received: ${subject}`, amount: `+RM${tutorCut}`, type: 'income', date: today },
        ...tutorWallet.tutorTransactions
      ]

      saveForUser(tutorId, tutorWallet)

      if (String(tutorId) === String(currentUserId())) {
        this.tutorTotalEarnings = tutorWallet.tutorTotalEarnings
        this.tutorBalance       = tutorWallet.tutorBalance
        this.tutorTransactions  = tutorWallet.tutorTransactions
      }
    },

    topUp(amount) {
      const n = Number(amount)
      if (!n || n <= 0) return
      this.balance = +((this.balance + n).toFixed(2))
      this.transactions.unshift({ id: Date.now(), title: 'Wallet Top-up', amount: `+RM${n}`, type: 'income', date: new Date().toISOString().slice(0, 10) })
      this._persist()
    },

    // Move money from a tutor's teaching earnings (tutorBalance) into
    // their own spending wallet (balance), so they can use what they've
    // earned to book other tutors. Returns {success, error} so the UI
    // can show a message without throwing.
    withdrawToSpending(amount) {
      const n = +Number(amount).toFixed(2)
      const today = new Date().toISOString().slice(0, 10)

      if (!n || n <= 0) {
        return { success: false, error: 'Enter an amount greater than RM0.' }
      }
      if (n > this.tutorBalance) {
        return { success: false, error: 'That is more than your available teaching balance.' }
      }

      this.tutorBalance = +((this.tutorBalance - n).toFixed(2))
      this.tutorTransactions = [
        { id: Date.now(), title: 'Withdrawn to Spending Wallet', amount: `-RM${n}`, type: 'expense', date: today },
        ...this.tutorTransactions
      ]

      this.balance = +((this.balance + n).toFixed(2))
      this.transactions.unshift({ id: Date.now() + 1, title: 'Withdrawal from Teaching Earnings', amount: `+RM${n}`, type: 'income', date: today })

      this._persist()
      return { success: true }
    }
  }
})