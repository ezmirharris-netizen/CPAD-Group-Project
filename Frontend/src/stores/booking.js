import { defineStore } from 'pinia'
import api from '../api.js'

// Scope locally-cached booking data (paid flags) per account, same as the
// wallet store, so switching accounts doesn't mix up "paid" state.
function currentUserId() {
  try {
    const raw = localStorage.getItem('user')
    if (!raw || raw === 'undefined' || raw === 'null') return 'guest'
    return JSON.parse(raw)?.id ?? 'guest'
  } catch (e) {
    return 'guest'
  }
}
function storageKey() { return `ss_bookings_${currentUserId()}` }

function save(data) { try { localStorage.setItem(storageKey(), JSON.stringify(data)) } catch(e) {} }
function load(key, fallback) {
  try {
    const s = localStorage.getItem(storageKey())
    if (!s || s === 'undefined') return fallback
    return JSON.parse(s)?.[key] ?? fallback
  } catch { return fallback }
}

function fmtDate(dt) {
  if (!dt) return ''
  const d = new Date(dt)
  if (isNaN(d)) return dt
  return d.toLocaleString('en-MY', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function normalise(list) {
  return list.map(b => ({ ...b, tutor: b.counterpart_name, subject: b.skill_name, date: fmtDate(b.schedule_time) }))
}

export const useBookingStore = defineStore('booking', {
  state: () => ({
    bookings:       [],
    loading:        false,
    error:          null,
    paidBookingIds: load('paidBookingIds', [])
  }),

  getters: {
    isPaid: (state) => (id) => state.paidBookingIds.includes(id)
  },

  actions: {
    _persist() {
      save({ bookings: this.bookings, paidBookingIds: this.paidBookingIds })
    },

    // Re-read the paid-booking flags for whichever account is currently
    // logged in. Call after login/register/logout.
    reload() {
      this.paidBookingIds = load('paidBookingIds', [])
      this.bookings = []
    },

    async fetchBookings(role = 'learner') {
      this.loading = true
      this.error   = null
      try {
        const res = await api.get('/bookings', { params: { role } })
        const data = Array.isArray(res.data) ? res.data : []
        this.bookings = normalise(data)
        this._persist()
      } catch (err) {
        this.error = 'Could not load bookings.'
        this.bookings = []
      } finally {
        this.loading = false
      }
    },

    // Fetch bookings for BOTH roles a person can hold at once (as a learner
    // booking sessions, and as a tutor teaching them) and merge them.
    // A tutee who becomes a tutor keeps their old learner bookings instead
    // of losing them just because their account role changed.
    async fetchAllMyBookings() {
      this.loading = true
      this.error   = null
      try {
        const [learnerRes, tutorRes] = await Promise.all([
          api.get('/bookings', { params: { role: 'learner' } }),
          api.get('/bookings', { params: { role: 'tutor' } })
        ])
        const learnerData = Array.isArray(learnerRes.data) ? learnerRes.data : []
        const tutorData   = Array.isArray(tutorRes.data) ? tutorRes.data : []

        const merged = new Map()
        for (const b of normalise(learnerData)) merged.set(b.id, b)
        for (const b of normalise(tutorData))   merged.set(b.id, b)

        this.bookings = Array.from(merged.values())
        this._persist()
      } catch (err) {
        this.error = 'Could not load bookings.'
        this.bookings = []
      } finally {
        this.loading = false
      }
    },

    async createBooking(data) {
      try {
        const res = await api.post('/bookings', data)
        const newBooking = {
          id:               res.data.booking_id ?? Date.now(),
          tutor:            data.tutor_name || 'Tutor',
          subject:          data.skill_name || 'Session',
          date:             fmtDate(data.schedule_time),
          status:           'pending',
          price:            data.price || 0,
          schedule_time:    data.schedule_time || '',
          counterpart_name: data.tutor_name || 'Tutor',
          skill_name:       data.skill_name || 'Session'
        }
        this.bookings.unshift(newBooking)
        this._persist()
        return { success: true }
      } catch (err) {
        this.error = err.response?.data?.error || 'Failed to create booking.'
        return { success: false, error: this.error }
      }
    },

    async updateStatus(id, status) {
      const booking = this.bookings.find(b => b.id === id)
      if (!booking) return
      booking.status = status

      if (status === 'accepted') {
        const { useWalletStore } = await import('./wallet.js')
        useWalletStore().addPendingPayment(booking)
      }

      this._persist()
      try { await api.patch(`/bookings/${id}/status`, { status }) } catch {}
    },

    async payBooking(id) {
      const booking = this.bookings.find(b => b.id === id)
      if (!booking || this.paidBookingIds.includes(id)) return

      const { useWalletStore } = await import('./wallet.js')
      useWalletStore().deductForBooking(booking)

      this.paidBookingIds.push(id)
      this._persist()
      try { await api.patch(`/bookings/${id}/status`, { status: 'paid' }) } catch {}
    },

    async completeSession(id) {
      const booking = this.bookings.find(b => b.id === id)
      if (!booking) return
      booking.status = 'completed'
      this.paidBookingIds = this.paidBookingIds.filter(pid => pid !== id)
      this._persist()
      try { await api.patch(`/bookings/${id}/status`, { status: 'completed' }) } catch {}
    },

    async cancelBooking(id) {
      const { useWalletStore } = await import('./wallet.js')
      const ws = useWalletStore()
      ws.pendingPayments = ws.pendingPayments.filter(p => p.bookingId !== id)
      ws._persist()

      try { await api.delete(`/bookings/${id}`) } catch {}
      this.bookings = this.bookings.filter(b => b.id !== id)
      this._persist()
    }
  }
})
