import { defineStore } from 'pinia'
import api from '../api.js'

export const useAdminStore = defineStore('admin', {

  state: () => ({
    users:    [],
    bookings: [],
    reports:  [],
    disputes: [],
    logs:     [],
    loading:  false,
    error:    null
  }),

  actions: {

    async fetchUsers() {
      this.loading = true
      this.error   = null
      try {
        const res = await api.get('/admin/users')
        this.users = Array.isArray(res.data) ? res.data.map(u => ({
          ...u,
          status: 'active'
        })) : []
      } catch (err) {
        this.error = 'Could not load users.'
        this.users = []
      } finally {
        this.loading = false
      }
    },

    async fetchBookings() {
      this.loading = true
      try {
        const res = await api.get('/bookings', { params: { role: 'admin' } })
        this.bookings = Array.isArray(res.data) ? res.data : []
      } catch {
        this.bookings = []
      } finally {
        this.loading = false
      }
    },

    suspendUser(id) {
      const user = this.users.find(u => u.id === id)
      if (user) {
        user.status = 'suspended'
        this.logs.unshift({
          id:     Date.now(),
          action: `User Suspended: ${user.name}`,
          admin:  'Admin',
          date:   new Date().toISOString().slice(0, 10)
        })
        try { api.patch(`/admin/users/${id}/status`, { action: 'suspend' }) } catch {}
      }
    },

    activateUser(id) {
      const user = this.users.find(u => u.id === id)
      if (user) {
        user.status = 'active'
        this.logs.unshift({
          id:     Date.now(),
          action: `User Activated: ${user.name}`,
          admin:  'Admin',
          date:   new Date().toISOString().slice(0, 10)
        })
        try { api.patch(`/admin/users/${id}/status`, { action: 'activate' }) } catch {}
      }
    },

    resolveReport(id) {
      const report = this.reports.find(r => r.id === id)
      if (report) {
        report.status = 'resolved'
        this.logs.unshift({
          id:     Date.now(),
          action: `Report Resolved: ${report.title}`,
          admin:  'Admin',
          date:   new Date().toISOString().slice(0, 10)
        })
      }
    },

    closeDispute(id) {
      const dispute = this.disputes.find(d => d.id === id)
      if (dispute) {
        dispute.status = 'closed'
        this.logs.unshift({
          id:     Date.now(),
          action: `Dispute Closed #${id}`,
          admin:  'Admin',
          date:   new Date().toISOString().slice(0, 10)
        })
      }
    }
  }
})
