import { defineStore } from 'pinia'
import api from '../api.js'

function safeGetUserId() {
  try {
    const raw = localStorage.getItem('user')
    if (!raw || raw === 'undefined' || raw === 'null') return null
    return JSON.parse(raw)?.id || null
  } catch (e) {
    return null
  }
}

export const useChatStore = defineStore('chat', {
  state: () => ({
    conversations: [],
    messages:      [],
    loading:       false,
    myId:          null
  }),

  actions: {
    async fetchConversations() {
      this.loading = true
      this.myId = safeGetUserId()
      try {
        const res  = await api.get('/messages/conversations')
        const data = Array.isArray(res.data) ? res.data : []
        this.conversations = data.map(u => ({
          id:          u.other_id,
          name:        u.other_name,
          role:        u.other_role,
          lastMessage: u.last_message || ''
        }))
      } catch (err) {
        this.conversations = []
      } finally {
        this.loading = false
      }
    },

    async fetchMessages(otherUserId) {
      this.myId = safeGetUserId()
      try {
        const res  = await api.get(`/messages/${otherUserId}`)
        const data = Array.isArray(res.data) ? res.data : []

        const fetched = data.map(m => ({
          id:             m.id,
          conversationId: otherUserId,
          sender:         m.sender_id === this.myId ? 'You' : m.sender_name,
          sender_id:      m.sender_id,
          role:           m.sender_id === this.myId ? 'self' : m.sender_role,
          text:           m.body
        }))
        this.messages = [
          ...this.messages.filter(m => m.conversationId !== otherUserId),
          ...fetched
        ]
      } catch (err) {
        // keep existing messages on error
      }
    },

    async sendMessage(msg) {
      this.messages.push({ id: Date.now(), ...msg })

      const conv = this.conversations.find(c => c.id === msg.conversationId)
      if (conv) conv.lastMessage = msg.text

      try {
        await api.post('/messages', {
          receiver_id: msg.conversationId,
          body:        msg.text
        })
      } catch (err) {
        // keep local message even if backend fails
      }
    },

    ensureConversation(tutorId, tutorName, tutorRole, tutorFaculty) {
      const exists = this.conversations.find(c => c.id === tutorId)
      if (!exists) {
        this.conversations.unshift({
          id:          tutorId,
          name:        tutorName,
          role:        tutorRole   || 'tutor',
          faculty:     tutorFaculty || '',
          lastMessage: 'Booking confirmed! Chat opened.'
        })
        this.messages.push({
          id:             Date.now(),
          conversationId: tutorId,
          sender:         tutorName,
          sender_id:      tutorId,
          role:           'tutor',
          text:           'Hi! Your booking has been confirmed. Feel free to message me here.'
        })
      }
    }
  }
})
