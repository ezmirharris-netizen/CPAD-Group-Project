import { defineStore } from 'pinia'

export const useChatStore = defineStore('chat', {
  state: () => ({
    conversations: [
      {
        id: 1,
        name: 'Ali Ahmad',
        lastMessage: 'See you tomorrow!'
      }
    ],

    messages: {
      1: [
        {
          id: 1,
          sender: 'tutor',
          content: 'Hi, how can I help you?'
        },
        {
          id: 2,
          sender: 'tutee',
          content: 'Need help with Vue.js.'
        }
      ]
    }
  }),

  actions: {
    sendMessage(conversationId, text) {
      if (!this.messages[conversationId]) {
        this.messages[conversationId] = []
      }

      this.messages[conversationId].push({
        id: Date.now(),
        sender: 'tutee',
        content: text
      })
    }
  }
})