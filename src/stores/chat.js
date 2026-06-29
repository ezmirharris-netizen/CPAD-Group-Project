import { defineStore } from 'pinia'
import api from '../api.js'

const DEMO_CONVERSATIONS = [
  { id: 2,  name: 'Sarah Lim',  role: 'tutor', faculty: 'Faculty of Computing',  lastMessage: 'Yes! I have slots on Thursday 8PM. Does that work?' },
  { id: 6,  name: 'John Tutor', role: 'tutor', faculty: 'Faculty of Computing',  lastMessage: 'Sure! I can help. When are you free?' },
]

const DEMO_MESSAGES = [
  { id: 1, conversationId: 2, sender: 'You',        sender_id: 7, role: 'tutee', text: 'Hi Sarah! Is your Vue.js session still available?'        },
  { id: 2, conversationId: 2, sender: 'Sarah Lim',  sender_id: 2, role: 'tutor', text: 'Yes! I have slots on Thursday 8PM. Does that work?'       },
  { id: 3, conversationId: 2, sender: 'You',        sender_id: 7, role: 'tutee', text: 'Perfect, I will book that slot. Thanks!'                  },
  { id: 4, conversationId: 6, sender: 'You',        sender_id: 7, role: 'tutee', text: 'Hello John, I need help with Data Structures for my exam.' },
  { id: 5, conversationId: 6, sender: 'John Tutor', sender_id: 6, role: 'tutor', text: 'Sure! I can help. When are you free?'                     },
  { id: 6, conversationId: 6, sender: 'You',        sender_id: 7, role: 'tutee', text: 'How about this Friday at 9PM?'                            },
]

function safeGetUserId() {
  try {
    const raw = localStorage.getItem('user')
    if (!raw || raw === 'undefined' || raw === 'null') return 7
    return JSON.parse(raw)?.id || 7
  } catch (e) {
    return 7
  }
}

export const useChatStore = defineStore('chat', {
  state: () => ({
    conversations: [...DEMO_CONVERSATIONS],
    messages:      [...DEMO_MESSAGES],
    loading:       false,
    myId:          null
  }),

  actions: {
    async fetchConversations() {
      this.loading = true
      try {
        const res = await api.get('/messages/conversations')
        this.myId  = safeGetUserId()

        const data = Array.isArray(res.data) ? res.data : []
        if (data.length) {
          this.conversations = data.map(u => ({
            id:          u.id,
            name:        u.name,
            role:        u.role,
            faculty:     u.faculty,
            lastMessage: u.lastMessage || ''
          }))
        } else {
          this.conversations = [...DEMO_CONVERSATIONS]
        }
      } catch (err) {
        this.conversations = [...DEMO_CONVERSATIONS]
      } finally {
        this.loading = false
      }
    },

    async fetchMessages(otherUserId) {
      this.myId = safeGetUserId()
      try {
        const res  = await api.get(`/messages/${otherUserId}`)
        const data = Array.isArray(res.data) ? res.data : []

        if (data.length) {
          const fetched = data.map(m => ({
            id:             m.id,
            conversationId: otherUserId,
            sender:         m.sender_id === this.myId ? 'You' : m.sender_name,
            sender_id:      m.sender_id,
            role:           m.sender_id === this.myId ? 'tutee' : 'tutor',
            text:           m.body
          }))
          this.messages = [
            ...this.messages.filter(m => m.conversationId !== otherUserId),
            ...fetched
          ]
        }
      } catch (err) {
        // Keep demo messages on error
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
        // Keep local message even if backend fails
      }
    },

    // Called when a booking is accepted — ensures a conversation with the tutor exists
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
        // Seed an opening message in the conversation
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
