import { defineStore } from 'pinia'

export const useAdminStore = defineStore('admin', {

  state: () => ({

    users: [
      {
        id: 1,
        name: 'John Tan',
        email: 'john@utm.my',
        role: 'tutor',
        status: 'active'
      },
      {
        id: 2,
        name: 'Sarah Lee',
        email: 'sarah@utm.my',
        role: 'tutee',
        status: 'active'
      },
      {
        id: 3,
        name: 'Ali Ahmad',
        email: 'ali@utm.my',
        role: 'tutor',
        status: 'suspended'
      }
    ],

    reports: [
      {
        id: 1,
        title: 'Inappropriate Tutor Profile',
        reportedBy: 'Sarah Lee',
        status: 'pending'
      },
      {
        id: 2,
        title: 'Spam Messages',
        reportedBy: 'John Tan',
        status: 'resolved'
      }
    ],

    disputes: [
      {
        id: 1,
        tutor: 'John Tan',
        tutee: 'Sarah Lee',
        issue: 'Missed Session',
        status: 'open'
      }
    ],

    logs: [
      {
        id: 1,
        action: 'User Suspended',
        admin: 'Admin',
        date: '2026-06-22'
      },
      {
        id: 2,
        action: 'Report Resolved',
        admin: 'Admin',
        date: '2026-06-21'
      }
    ]
  }),

  actions: {

    suspendUser(id) {

      const user = this.users.find(u => u.id === id)

      if(user){
        user.status = 'suspended'
      }
    },

    activateUser(id) {

      const user = this.users.find(u => u.id === id)

      if(user){
        user.status = 'active'
      }
    },

    resolveReport(id){

      const report = this.reports.find(r => r.id === id)

      if(report){
        report.status = 'resolved'
      }
    },

    closeDispute(id){

      const dispute = this.disputes.find(d => d.id === id)

      if(dispute){
        dispute.status = 'closed'
      }
    }

  }

})