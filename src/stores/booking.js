import { defineStore } from 'pinia'
import api from '../api.js'

function save(data) { try { localStorage.setItem('ss_bookings', JSON.stringify(data)) } catch(e) {} }
function load(key, fallback) {
  try {
    const s = localStorage.getItem('ss_bookings')
    if (!s || s === 'undefined') return fallback
    return JSON.parse(s)?.[key] ?? fallback
  } catch { return fallback }
}

const DEMO_TUTEE_BOOKINGS = [
  { id: 1, counterpart_name: 'Sarah Lim',  skill_name: 'Vue.js',      schedule_time: '2026-06-25 20:00:00', status: 'accepted',  price: 80 },
  { id: 2, counterpart_name: 'Jason Tan',  skill_name: 'Mathematics', schedule_time: '2026-06-28 19:00:00', status: 'completed', price: 70 },
  { id: 3, counterpart_name: 'John Tutor', skill_name: 'Java',        schedule_time: '2026-06-30 21:00:00', status: 'pending',   price: 70 },
]
const DEMO_TUTOR_BOOKINGS = [
  { id: 10, counterpart_name: 'Demo Student', skill_name: 'Vue.js',   schedule_time: '2026-06-25 20:00:00', status: 'accepted',  price: 80 },
  { id: 11, counterpart_name: 'Ali Ahmad',    skill_name: 'React.js', schedule_time: '2026-06-27 18:00:00', status: 'pending',   price: 75 },
  { id: 12, counterpart_name: 'Priya Nair',   skill_name: 'Vue.js',   schedule_time: '2026-06-20 19:00:00', status: 'completed', price: 80 },
]
const DEMO_ADMIN_BOOKINGS = [
  ...DEMO_TUTEE_BOOKINGS,
  ...DEMO_TUTOR_BOOKINGS
]

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
    bookings:       load('bookings', normalise(DEMO_TUTEE_BOOKINGS)),
    loading:        false,
    error:          null,
    _demoLoaded:    true,
    paidBookingIds: load('paidBookingIds', [])
  }),

  getters: {
    isPaid: (state) => (id) => state.paidBookingIds.includes(id)
  },

  actions: {
    _persist() {
      save({ bookings: this.bookings, paidBookingIds: this.paidBookingIds })
    },

    async fetchBookings(role = 'learner') {
      this.loading = true
      this.error   = null
      try {
        const res = await api.get('/bookings', { params: { role } })
        if (Array.isArray(res.data) && res.data.length > 0) {
          this.bookings    = res.data.map(b => ({ ...b, tutor: b.counterpart_name, subject: b.skill_name, date: fmtDate(b.schedule_time) }))
          this._demoLoaded = false
          this._persist()
        }
      } catch {
        if (this._demoLoaded) {
          const demo = role === 'tutor' ? DEMO_TUTOR_BOOKINGS : role === 'admin' ? DEMO_ADMIN_BOOKINGS : DEMO_TUTEE_BOOKINGS
          const stored = load('bookings', null)
          if (!stored) { this.bookings = normalise(demo); this._persist() }
        }
      } finally {
        this.loading = false
      }
    },

    async createBooking(data) {
      const optimistic = {
        id: null, tutor: data.tutor_name || 'Tutor', subject: data.skill_name || 'Session',
        date: fmtDate(data.schedule_time), status: 'pending', price: data.price || 0,
        schedule_time: data.schedule_time || '', counterpart_name: data.tutor_name || 'Tutor', skill_name: data.skill_name || 'Session'
      }
      try {
        const res = await api.post('/bookings', data)
        optimistic.id = res.data.booking_id ?? Date.now()
      } catch { optimistic.id = Date.now() }

      this.bookings.unshift(optimistic)
      this._demoLoaded = false
      this._persist()
      return { success: true }
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
