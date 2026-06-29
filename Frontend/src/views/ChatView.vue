<script setup>
import { ref, computed, onMounted } from 'vue'
import { useChatStore } from '../stores/chat'
import { useAuthStore } from '../stores/auth'

const chatStore = useChatStore()
const authStore = useAuthStore()

const selectedConversation = ref(null)
const messageText          = ref('')

onMounted(async () => {
  await chatStore.fetchConversations()
  if (chatStore.conversations.length) {
    await selectConversation(chatStore.conversations[0])
  }
})

const messages = computed(() => {
  if (!selectedConversation.value) return []
  return chatStore.messages.filter(m => m.conversationId === selectedConversation.value.id)
})

async function selectConversation(conv) {
  selectedConversation.value = conv
  await chatStore.fetchMessages(conv.id)
}

async function sendMessage() {
  if (!messageText.value.trim() || !selectedConversation.value) return

  await chatStore.sendMessage({
    conversationId: selectedConversation.value.id,
    sender:         'You',
    role:           'tutee',
    text:           messageText.value.trim()
  })

  messageText.value = ''
}
</script>

<template>

<div>

  <div class="header">
    <h1>Messages</h1>
    <p class="subtitle">Communicate with tutors and students</p>
  </div>

  <div class="card chat-wrapper">

    <!-- Sidebar -->
    <div class="chat-sidebar">
      <h3>Conversations</h3>

      <div
        v-if="chatStore.loading"
        style="padding:20px;color:var(--text-muted);text-align:center"
      >
        Loading...
      </div>

      <div class="conversation-list">
        <div
          v-for="conv in chatStore.conversations"
          :key="conv.id"
          class="conversation-item"
          :class="{ active: selectedConversation?.id === conv.id }"
          @click="selectConversation(conv)"
        >
          <div class="conversation-avatar">
            {{ conv.name.charAt(0) }}
          </div>
          <div class="conversation-details">
            <h4>{{ conv.name }}</h4>
            <p>{{ conv.lastMessage || '...' }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Chat Window -->
    <div class="chat-area">

      <div v-if="selectedConversation" class="chat-window-header">
        <div style="display:flex;align-items:center;gap:15px">
          <div class="conversation-avatar">
            {{ selectedConversation.name.charAt(0) }}
          </div>
          <div>
            <h3>{{ selectedConversation.name }}</h3>
            <p style="color:var(--text-muted);font-size:.9rem">
              {{ selectedConversation.role }} · {{ selectedConversation.faculty }}
            </p>
          </div>
        </div>
      </div>

      <div v-if="!selectedConversation" class="empty-state">
        <i class="fa-solid fa-comments" style="font-size:3rem;margin-bottom:15px"></i>
        <h3>No Conversation Selected</h3>
        <p>Choose a tutor or student to begin chatting.</p>
      </div>

      <template v-else>
        <div class="chat-messages">
          <div
            v-for="msg in messages"
            :key="msg.id"
            class="message"
            :class="msg.sender === 'You' ? 'tutee' : 'tutor'"
          >
            <strong>{{ msg.sender }}</strong>
            {{ msg.text }}
          </div>
        </div>

        <div class="chat-input-area">
          <input
            v-model="messageText"
            type="text"
            placeholder="Type a message..."
            @keyup.enter="sendMessage"
          >
          <button class="btn-icon" @click="sendMessage">
            <i class="fa-solid fa-paper-plane"></i>
          </button>
        </div>
      </template>

    </div>

  </div>

</div>

</template>
