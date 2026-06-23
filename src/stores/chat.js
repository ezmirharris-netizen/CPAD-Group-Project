import { defineStore } from 'pinia'

export const useChatStore = defineStore('chat', {

  state: () => ({

    conversations: [

      {
        id: 1,
        name: 'John Tan',
        lastMessage: 'See you tomorrow!'
      },

      {
        id: 2,
        name: 'Sarah Lim',
        lastMessage: 'Thanks for booking.'
      }

    ],

    messages: [

      {
        id: 1,
        conversationId: 1,
        sender: 'John Tan',
        role: 'tutor',
        text: 'Hello! is Web Development class still available?'
      },

      {
        id: 2,
        conversationId: 1,
        sender: 'You',
        role: 'tutee',
        text: 'Yes, it is still available'
      },

      {
        id: 3,
        conversationId: 2,
        sender: 'Sarah Lim',
        role: 'tutor',
        text: 'Thank you for your booking.'
      }

    ]

  }),

  actions: {

    sendMessage(message) {

      this.messages.push({
        id: Date.now(),
        ...message
      })

      const conversation =
        this.conversations.find(
          c => c.id === message.conversationId
        )

      if (conversation) {
        conversation.lastMessage = message.text
      }
    }

  }

})